import type { Edge } from '@xyflow/react';

import { EXPLICIT_PROFILES, inferProfileDefaults } from './familyProfileData';
import type { LifeMilestones, MaritalStatus } from './familyProfileTypes';
import type { PersonGender } from './graphTypes';
import type { PersonDef } from './familyModel';

export type { LifeMilestones, MaritalStatus } from './familyProfileTypes';

export const CURRENT_YEAR = 2026;

export type PersonProfile = {
  id: string;
  name: string;
  sex: 'M' | 'F';
  birthYear: number;
  deceased: boolean;
  /** Age shown on the node; for deceased, age at death. */
  age: number;
  maritalStatus: MaritalStatus;
  education: string;
  occupation: string;
  milestones: LifeMilestones;
};

/** Deceased persons (grandparents except Grandmother 1, plus named relatives). */
const DECEASED_IDS = new Set([
  'grandfather-1',
  'grandmother-2',
  'grandfather-2',
  'grandfather-3',
  'brother-1',
  'cousin-6',
  'tiyong-4',
  'auntie-1',
  'tiyong-1',
  'tiyang-1-husband',
  'cousin-29-husband',
  'uncle-2-ex-wife',
  'tiyang-2',
  'tiyang-2-husband',
]);

const profiles = new Map<string, PersonProfile>();
const spouseOf = new Map<string, string>();
const hasExPartner = new Set<string>();

function isCoupleHub(id: string) {
  return id.startsWith('hub-');
}

function inferSex(id: string, gender: PersonGender): 'M' | 'F' {
  if (id === 'me') return 'F';
  if (
    id === 'mother' ||
    id.startsWith('grandmother') ||
    id.startsWith('auntie') ||
    id.startsWith('tiyang') ||
    id.endsWith('-wife') ||
    id.includes('sister-in-law')
  ) {
    return 'F';
  }
  if (
    id === 'father' ||
    id.startsWith('grandfather') ||
    id.startsWith('uncle') ||
    id.startsWith('tiyong') ||
    id.endsWith('-husband')
  ) {
    return 'M';
  }
  return gender === 'male' ? 'M' : 'F';
}

function defaultBirthYear(id: string): number {
  if (id.startsWith('grandmother') || id.startsWith('grandfather')) return 1936;
  if (id.startsWith('uncle') || id.startsWith('auntie')) return 1962;
  if (id.startsWith('tiyong') || id.startsWith('tiyang')) return 1964;
  if (id === 'mother' || id === 'father') return 1966;
  if (id === 'me' || id.startsWith('brother')) return 1994;
  if (id.startsWith('cousin')) {
    const n = Number.parseInt(id.replace('cousin-', ''), 10);
    if (!Number.isNaN(n)) return n >= 24 ? 1988 + (n % 14) : 1984 + (n % 16);
    return 1990;
  }
  if (id.endsWith('-wife') || id.endsWith('-husband') || id.endsWith('-ex-wife') || id.endsWith('-ex-husband')) {
    return 1968;
  }
  return 1970;
}

function indexMaritalFromEdges(edges: Edge[]) {
  spouseOf.clear();
  hasExPartner.clear();
  const hubPartners = new Map<string, Set<string>>();

  for (const e of edges) {
    const kind = (e.data as { kind?: string })?.kind;
    if (kind === 'faint') {
      hasExPartner.add(e.target);
      hasExPartner.add(e.source);
      continue;
    }
    if (kind !== 'branch') continue;

    const hub = isCoupleHub(e.source) ? e.source : isCoupleHub(e.target) ? e.target : null;
    if (!hub) continue;
    const person = hub === e.source ? e.target : e.source;
    if (isCoupleHub(person)) continue;
    const set = hubPartners.get(hub) ?? new Set<string>();
    set.add(person);
    hubPartners.set(hub, set);
  }

  for (const partners of hubPartners.values()) {
    if (partners.size < 2) continue;
    const list = [...partners];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        spouseOf.set(list[i], list[j]);
        spouseOf.set(list[j], list[i]);
      }
    }
  }
}

function resolveMaritalStatus(id: string, override?: MaritalStatus): MaritalStatus {
  if (override) return override;
  if (spouseOf.has(id)) return 'Married';
  if (hasExPartner.has(id)) return 'Divorced';
  return 'Single';
}

function mergeMilestones(
  base: Partial<LifeMilestones>,
  extra?: Partial<LifeMilestones>,
): LifeMilestones {
  return { ...base, ...extra };
}

function buildProfile(person: PersonDef): PersonProfile {
  const explicit = EXPLICIT_PROFILES[person.id];
  const inferred = inferProfileDefaults(person.id);
  const merged = { ...inferred, ...explicit };
  const milestones = mergeMilestones(inferred?.milestones ?? {}, explicit?.milestones);

  const deceased = merged.deceased ?? DECEASED_IDS.has(person.id);
  const birthYear = merged.birthYear ?? defaultBirthYear(person.id);
  const livingAge = CURRENT_YEAR - birthYear;
  const age = merged.age ?? (deceased && milestones.deathYear
    ? milestones.deathYear - birthYear
    : livingAge);

  const sex = merged.sex ?? inferSex(person.id, person.gender);

  let maritalStatus = resolveMaritalStatus(person.id, merged.maritalStatus);
  if (
    !deceased &&
    maritalStatus === 'Married' &&
    spouseOf.has(person.id) &&
    DECEASED_IDS.has(spouseOf.get(person.id)!)
  ) {
    maritalStatus = 'Widowed';
  }

  return {
    id: person.id,
    name: person.label,
    sex,
    birthYear,
    deceased,
    age,
    maritalStatus,
    education: merged.education ?? 'Not recorded',
    occupation: merged.occupation ?? 'Not recorded',
    milestones,
  };
}

export function syncProfiles(persons: Iterable<PersonDef>, edges: Edge[]) {
  profiles.clear();
  indexMaritalFromEdges(edges);
  for (const person of persons) {
    profiles.set(person.id, buildProfile(person));
  }
}

export function getProfile(personId: string): PersonProfile | undefined {
  return profiles.get(personId);
}

export function formatNodeLabel(profile: PersonProfile): string {
  const line1 = profile.deceased
    ? `${profile.name}, ${profile.age} (†)`
    : `${profile.name}, ${profile.age}`;
  const occupation =
    profile.occupation === '—' || profile.occupation === 'Not recorded'
      ? profile.deceased
        ? '—'
        : profile.occupation
      : profile.occupation;
  return `${line1}\n${occupation}`;
}

export function getNodeLabel(personId: string): string {
  const p = profiles.get(personId);
  return p ? formatNodeLabel(p) : personId;
}

export function isDeceased(personId: string): boolean {
  return profiles.get(personId)?.deceased ?? DECEASED_IDS.has(personId);
}

export function milestoneFields(
  milestones: LifeMilestones,
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const add = (label: string, value: string | number | undefined) => {
    if (value === undefined || value === '') return;
    rows.push({ label, value: String(value) });
  };

  add('Migration type', milestones.migrationType);
  add('Lifetime migration', milestones.lifetimeMigration);
  add('Current residence', milestones.currentResidence);
  add('First migration (year)', milestones.firstMigrationYear);
  add('Age at first migration', milestones.firstMigrationAge);
  add('First migration', milestones.firstMigrationDescription);
  add('Marriage year', milestones.marriageYear);
  add('Age at first marriage', milestones.ageAtFirstMarriage);
  add('Age at first birth', milestones.ageAtFirstBirth);
  add('Year of first birth', milestones.firstBirthYear);
  if (milestones.childrenLiving !== undefined || milestones.childrenDeceased !== undefined) {
    const living = milestones.childrenLiving ?? 0;
    const deceased = milestones.childrenDeceased ?? 0;
    add(
      'Children',
      deceased > 0 ? `${living} living, ${deceased} deceased` : `${living} living`,
    );
  }
  add('Year of death', milestones.deathYear);
  add('Cause of death', milestones.causeOfDeath);
  add('Notes', milestones.notes);

  return rows;
}
