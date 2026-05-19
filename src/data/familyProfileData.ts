import type { LifeMilestones, MaritalStatus, ProfileOverride } from './familyProfileTypes';

/** Primary, factual overrides — user report + explicit instructions. */
export const EXPLICIT_PROFILES: Record<string, ProfileOverride> = {
  me: {
    sex: 'F',
    birthYear: 2002,
    education: 'Senior high school graduate',
    occupation: 'Student',
    maritalStatus: 'Single',
    milestones: {
      migrationType: 'Internal, urban to urban',
      lifetimeMigration: 'Internal',
      currentResidence: 'Manila City',
      firstMigrationYear: 2007,
      firstMigrationAge: 5,
      firstMigrationDescription: 'Relocated within Metro Manila',
    },
  },
  mother: {
    sex: 'F',
    birthYear: 1968,
    education: 'College graduate',
    occupation: 'Homemaker',
    maritalStatus: 'Married',
    milestones: {
      migrationType: 'Internal, urban to urban',
      lifetimeMigration: 'Internal',
      currentResidence: 'Manila City',
      firstMigrationYear: 1989,
      firstMigrationAge: 21,
      ageAtFirstMarriage: 17,
      ageAtFirstBirth: 17,
      firstBirthYear: 1985,
      marriageYear: 1985,
      childrenLiving: 2,
      childrenDeceased: 1,
    },
  },
  father: {
    sex: 'M',
    birthYear: 1964,
    education: 'College graduate',
    occupation: 'On-call driver',
    maritalStatus: 'Married',
    milestones: {
      migrationType: 'Internal, urban to urban',
      lifetimeMigration: 'Internal',
      currentResidence: 'Manila City',
      firstMigrationYear: 1989,
      firstMigrationAge: 25,
      ageAtFirstMarriage: 21,
      marriageYear: 1985,
      childrenLiving: 2,
      childrenDeceased: 1,
    },
  },
  'brother-1': {
    sex: 'M',
    birthYear: 1986,
    age: 0,
    deceased: true,
    education: '—',
    occupation: '—',
    maritalStatus: 'Single',
    milestones: {
      deathYear: 1986,
      causeOfDeath: 'Heart disease',
      childrenLiving: 0,
      childrenDeceased: 0,
    },
  },
  'brother-2': {
    sex: 'M',
    birthYear: 1988,
    education: 'College graduate',
    occupation: 'Solutions architect',
    maritalStatus: 'Married',
    milestones: {
      migrationType: 'International',
      lifetimeMigration: 'Calgary, Alberta, Canada',
      currentResidence: 'Calgary, Alberta, Canada',
      marriageYear: 2018,
      ageAtFirstMarriage: 30,
      childrenLiving: 2,
      childrenDeceased: 0,
    },
  },
  'sister-in-law': {
    sex: 'F',
    birthYear: 1987,
    education: 'College graduate',
    occupation: 'Homemaker',
    maritalStatus: 'Married',
    milestones: {
      migrationType: 'International',
      lifetimeMigration: 'Calgary, Alberta, Canada',
      currentResidence: 'Calgary, Alberta, Canada',
      firstMigrationYear: 2015,
      firstMigrationAge: 28,
      firstMigrationDescription: 'Quezon City to Manila City',
      marriageYear: 2018,
      ageAtFirstMarriage: 31,
      ageAtFirstBirth: 33,
      firstBirthYear: 2020,
      childrenLiving: 2,
      childrenDeceased: 0,
    },
  },
  'grandmother-1': {
    sex: 'F',
    birthYear: 1931,
    education: 'College graduate',
    occupation: 'Retired teacher',
    maritalStatus: 'Widowed',
    milestones: {
      migrationType: 'Urban to rural (wartime displacement), then rural to urban',
      lifetimeMigration: 'Iloilo → Tarlac → Manila → Pulilan, Bulacan',
      currentResidence: 'Pulilan, Bulacan',
      firstMigrationYear: 1945,
      firstMigrationAge: 14,
      firstMigrationDescription: 'Iloilo to Tarlac (Japanese Occupation)',
      marriageYear: 1954,
      ageAtFirstMarriage: 23,
      ageAtFirstBirth: 25,
      firstBirthYear: 1956,
      childrenLiving: 9,
      childrenDeceased: 0,
      notes: 'WWII displacement Iloilo→Tarlac; later hosted relatives at Dos Castillas near UST',
    },
  },
  'grandfather-1': {
    sex: 'M',
    birthYear: 1930,
    age: 76,
    deceased: true,
    education: 'College graduate',
    occupation: 'Retired nuclear engineer',
    maritalStatus: 'Married',
    milestones: {
      migrationType: 'International (professional)',
      lifetimeMigration: 'Tarlac → United States (1954) → Manila',
      firstMigrationYear: 1954,
      firstMigrationAge: 24,
      firstMigrationDescription: 'International migration to the United States',
      marriageYear: 1954,
      ageAtFirstMarriage: 24,
      firstBirthYear: 1956,
      deathYear: 2006,
      causeOfDeath: 'Stroke',
      childrenLiving: 9,
      childrenDeceased: 0,
    },
  },
  'grandmother-2': {
    sex: 'F',
    birthYear: 1930,
    age: 80,
    deceased: true,
    education: 'High school graduate',
    occupation: 'Homemaker',
    maritalStatus: 'Widowed',
    milestones: {
      migrationType: 'Rural to urban (internal)',
      lifetimeMigration: 'Bulacan → Manila City',
      currentResidence: 'Manila City (at death)',
      firstMigrationAge: 16,
      firstMigrationDescription: 'Provincial Bulacan to Manila as a teenager',
      marriageYear: 1945,
      ageAtFirstMarriage: 15,
      ageAtFirstBirth: 17,
      firstBirthYear: 1947,
      deathYear: 2010,
      childrenLiving: 8,
      childrenDeceased: 0,
    },
  },
  'grandfather-2': {
    sex: 'M',
    birthYear: 1927,
    age: 41,
    deceased: true,
    education: 'College graduate',
    occupation: 'Government employee',
    maritalStatus: 'Married',
    milestones: {
      migrationType: 'None (lifetime resident)',
      lifetimeMigration: 'Born, raised, and died in Manila City',
      currentResidence: 'Manila City',
      marriageYear: 1945,
      ageAtFirstMarriage: 18,
      deathYear: 1968,
      causeOfDeath: 'Accident',
      childrenLiving: 7,
      childrenDeceased: 1,
    },
  },
  'grandfather-3': {
    sex: 'M',
    birthYear: 1932,
    age: 78,
    deceased: true,
    education: 'College graduate',
    occupation: 'Retired businessman',
    maritalStatus: 'Married',
    milestones: {
      migrationType: 'Internal, urban to urban',
      lifetimeMigration: 'Manila City',
      currentResidence: 'Manila City',
      marriageYear: 1970,
      ageAtFirstMarriage: 38,
      deathYear: 2010,
      childrenLiving: 1,
      childrenDeceased: 0,
    },
  },
};

/** Essay-informed defaults for 2nd generation (birth order + fertility notes). */
const MATERNAL_SIBLING_BIRTH: Record<string, number> = {
  'uncle-1': 1956,
  'uncle-2': 1958,
  'uncle-3': 1960,
  'auntie-1': 1962,
  'auntie-2': 1964,
  'auntie-3': 1966,
  'auntie-4': 1967,
  'auntie-5': 1969,
};

const PATERNAL_SIBLING_BIRTH: Record<string, number> = {
  'tiyong-1': 1955,
  'tiyang-1': 1957,
  'tiyang-2': 1959,
  'tiyang-3': 1961,
  'tiyong-2': 1963,
  'tiyong-3': 1965,
  'father': 1964,
  'tiyong-4': 1968,
};

const PATERNAL_CHILDREN: Record<string, { living: number; deceased?: number }> = {
  'tiyong-1': { living: 5 },
  'tiyang-1': { living: 7 },
  'tiyang-2': { living: 4 },
  'tiyang-3': { living: 3 },
  'tiyong-2': { living: 0 },
  'tiyong-3': { living: 5 },
  'father': { living: 2, deceased: 1 },
  'tiyong-4': { living: 3 },
};

const MATERNAL_CHILDREN: Record<string, number> = {
  'uncle-1': 3,
  'uncle-2': 3,
  'uncle-3': 3,
  'auntie-1': 3,
  'auntie-2': 3,
  'auntie-3': 3,
  'auntie-4': 3,
  'auntie-5': 3,
};

const DECEASED_EXTRA: Record<string, { age: number; deathYear?: number; cause?: string }> = {
  'auntie-1': { age: 62, deathYear: 2024, cause: 'Illness' },
  'tiyong-1': { age: 70, deathYear: 2025, cause: 'Natural causes' },
  'tiyang-1-husband': { age: 68, deathYear: 2023 },
  'cousin-29-husband': { age: 55, deathYear: 2022 },
  'uncle-2-ex-wife': { age: 64, deathYear: 2021 },
  'tiyang-2': { age: 66, deathYear: 2025 },
  'tiyang-2-husband': { age: 69, deathYear: 2024 },
  'cousin-6': { age: 38, deathYear: 2018 },
  'tiyong-4': { age: 57, deathYear: 2025 },
};

/** Cousins likely abroad per essay (professional migration). */
const INTERNATIONAL_COUSINS = new Set([
  'cousin-24',
  'cousin-24-husband',
  'cousin-28',
  'cousin-30',
]);

function manilaMilestones(extra?: Partial<LifeMilestones>): Partial<LifeMilestones> {
  return {
    migrationType: 'Internal, urban to urban',
    lifetimeMigration: 'Provincial or regional origins → Manila City',
    currentResidence: 'Manila City',
    firstMigrationYear: 1985,
    firstMigrationAge: 22,
    ...extra,
  };
}

function inferSecondGen(id: string, branch: 'maternal' | 'paternal'): ProfileOverride | null {
  const birthMap = branch === 'maternal' ? MATERNAL_SIBLING_BIRTH : PATERNAL_SIBLING_BIRTH;
  const baseId = id.replace(/-wife|-husband|-ex-wife|-ex-husband$/, '');
  const birthYear = birthMap[baseId];
  if (!birthYear) return null;

  const isSpouse = id !== baseId;
  const sex: 'M' | 'F' = id.includes('tiyang') || id.startsWith('auntie')
    ? 'F'
    : id.includes('tiyong') || id.startsWith('uncle')
      ? 'M'
      : id.endsWith('-wife')
        ? 'F'
        : id.endsWith('-husband')
          ? 'M'
          : 'M';

  const deceased = DECEASED_EXTRA[id] ?? DECEASED_EXTRA[baseId];
  const childInfo = branch === 'paternal' ? PATERNAL_CHILDREN[baseId] : null;
  const maternalKids = branch === 'maternal' ? MATERNAL_CHILDREN[baseId] : undefined;

  const maritalStatus: MaritalStatus =
    baseId === 'tiyong-2' ? 'Single' : isSpouse || id.includes('-wife') || id.includes('-husband') ? 'Married' : 'Married';

  const marriageYear = birthYear + 25;
  const firstBirthYear = sex === 'F' && !isSpouse ? birthYear + 27 : undefined;

  return {
    sex,
    birthYear: isSpouse ? birthYear - 2 : birthYear,
    deceased: Boolean(deceased),
    age: deceased?.age,
    education: 'College graduate',
    occupation: sex === 'F' && !id.includes('ex') ? (isSpouse ? 'Homemaker' : 'Professional') : 'Professional',
    maritalStatus: id.includes('ex') ? 'Divorced' : maritalStatus,
    milestones: {
      ...manilaMilestones(),
      marriageYear: id.includes('ex') ? undefined : marriageYear,
      ageAtFirstMarriage: id.includes('ex') ? undefined : 25,
      ageAtFirstBirth: sex === 'F' && !isSpouse && firstBirthYear ? 27 : undefined,
      firstBirthYear: sex === 'F' && !isSpouse ? firstBirthYear : undefined,
      childrenLiving: childInfo?.living ?? maternalKids,
      childrenDeceased: childInfo?.deceased,
      deathYear: deceased?.deathYear,
      causeOfDeath: deceased?.cause,
    },
  };
}

function inferCousin(id: string): ProfileOverride {
  const n = Number.parseInt(id.replace(/^cousin-(\d+).*$/, '$1'), 10);
  const isPaternal = n >= 24;
  const birthYear = isPaternal ? 1986 + ((n - 24) % 14) : 1982 + ((n - 1) % 16);
  const isSpouse = /-(husband|wife|ex-husband|ex-wife)$/.test(id);
  const sex: 'M' | 'F' = id.endsWith('-wife') || (id.startsWith('cousin-') && n % 2 === 0 && !id.endsWith('-husband'))
    ? 'F'
    : 'M';
  const international = INTERNATIONAL_COUSINS.has(id);
  const deceased = DECEASED_EXTRA[id];
  const married = id.endsWith('-husband') || id.endsWith('-wife');
  const divorced = id.includes('ex-');

  return {
    sex,
    birthYear: isSpouse ? birthYear - 1 : birthYear,
    deceased: Boolean(deceased),
    age: deceased?.age,
    education: birthYear >= 2000 ? 'College student' : 'College graduate',
    occupation:
      birthYear >= 2002 ? 'Student' : international ? 'Professional (abroad)' : 'Professional',
    maritalStatus: divorced ? 'Divorced' : married || (!isSpouse && n <= 5) ? 'Married' : 'Single',
    milestones: international
      ? {
          migrationType: 'International',
          lifetimeMigration: id.includes('28') ? 'Toronto, Canada' : 'California, USA',
          currentResidence: id.includes('28') ? 'Toronto, Canada' : 'California, USA',
          marriageYear: married ? 2019 : undefined,
          ageAtFirstMarriage: married ? 33 : undefined,
          ageAtFirstBirth: sex === 'F' && !isSpouse ? 35 : undefined,
          childrenLiving: married ? 1 : 0,
        }
      : {
          ...manilaMilestones({ firstMigrationYear: 2005, firstMigrationAge: 20 }),
          marriageYear: married ? 2020 : undefined,
          ageAtFirstMarriage: married ? 32 : undefined,
          childrenLiving: n % 7 === 0 ? 1 : 0,
        },
  };
}

export function inferProfileDefaults(id: string): ProfileOverride | null {
  if (EXPLICIT_PROFILES[id]) return null;

  if (id.startsWith('uncle-') || id.startsWith('auntie-')) {
    return inferSecondGen(id, 'maternal');
  }
  if (id.startsWith('tiyong-') || id.startsWith('tiyang-')) {
    return inferSecondGen(id, 'paternal');
  }
  if (id.startsWith('cousin-')) {
    return inferCousin(id);
  }

  return null;
}
