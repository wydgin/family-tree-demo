import type { PersonProfile } from '../data/familyProfiles';

export type Generation = 1 | 2 | 3;

export const GENERATION_LABELS: Record<Generation, string> = {
  1: '1st generation (grandparents)',
  2: '2nd generation (parents’ generation)',
  3: '3rd generation (cousins & siblings)',
};

/** Blood-line generation for fertility / nuptiality stats. */
export function profileGeneration(id: string): Generation | null {
  if (/^grand(mother|father)-/.test(id)) return 1;
  if (
    id === 'mother' ||
    id === 'father' ||
    /^uncle-\d+$/.test(id) ||
    /^auntie-\d+$/.test(id) ||
    /^tiyong-\d+$/.test(id) ||
    /^tiyang-\d+$/.test(id)
  ) {
    return 2;
  }
  if (id === 'me' || /^brother-\d+$/.test(id) || /^cousin-\d+$/.test(id)) return 3;
  return null;
}

function childCount(profile: PersonProfile): number | null {
  const { childrenLiving, childrenDeceased } = profile.milestones;
  if (childrenLiving === undefined && childrenDeceased === undefined) return null;
  return (childrenLiving ?? 0) + (childrenDeceased ?? 0);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export type ChildCountRecord = {
  id: string;
  name: string;
  generation: Generation;
  count: number;
};

export type GenerationInsights = {
  generation: Generation;
  label: string;
  averageChildren: number | null;
  highestChildren: ChildCountRecord | null;
  lowestChildren: ChildCountRecord | null;
  childrenSampleSize: number;
  averageAgeFirstMarriage: number | null;
  marriageSampleSize: number;
  averageAgeFirstBirth: number | null;
  birthSampleSize: number;
};

export type FamilyInsights = {
  byGeneration: GenerationInsights[];
};

function buildGenerationInsights(
  generation: Generation,
  profiles: PersonProfile[],
): GenerationInsights {
  const genProfiles = profiles.filter((p) => profileGeneration(p.id) === generation);

  const childRecords: ChildCountRecord[] = [];
  for (const profile of genProfiles) {
    const count = childCount(profile);
    if (count === null) continue;
    childRecords.push({
      id: profile.id,
      name: profile.name,
      generation,
      count,
    });
  }

  const marriageAges = genProfiles
    .map((p) => p.milestones.ageAtFirstMarriage)
    .filter((n): n is number => n !== undefined);

  const birthAges = genProfiles
    .filter((p) => p.sex === 'F')
    .map((p) => p.milestones.ageAtFirstBirth)
    .filter((n): n is number => n !== undefined);

  const counts = childRecords.map((r) => r.count);

  return {
    generation,
    label: GENERATION_LABELS[generation],
    averageChildren: average(counts),
    highestChildren:
      childRecords.length > 0
        ? childRecords.reduce((a, b) => (b.count > a.count ? b : a))
        : null,
    lowestChildren:
      childRecords.length > 0
        ? childRecords.reduce((a, b) => (b.count < a.count ? b : a))
        : null,
    childrenSampleSize: childRecords.length,
    averageAgeFirstMarriage: average(marriageAges),
    marriageSampleSize: marriageAges.length,
    averageAgeFirstBirth: average(birthAges),
    birthSampleSize: birthAges.length,
  };
}

export function computeFamilyInsights(allProfiles: PersonProfile[]): FamilyInsights {
  return {
    byGeneration: ([1, 2, 3] as Generation[]).map((g) => buildGenerationInsights(g, allProfiles)),
  };
}
