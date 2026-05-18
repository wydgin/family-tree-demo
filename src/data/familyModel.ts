import type { PersonGender } from './graphTypes';

export type PersonDef = {
  id: string;
  label: string;
  gender: PersonGender;
};

function p(id: string, label: string, gender: PersonGender): PersonDef {
  return { id, label, gender };
}

/** Spouse lives on the couple hub only — never on the grandparents’ sibling ring. */
export type MarriedChild = {
  hubId: string;
  sibling: PersonDef;
  spouse: PersonDef;
  exSpouse?: PersonDef;
};

export type GrandparentUnit = {
  hubId: string;
  grandparents: PersonDef[];
  /** Siblings only (uncles, aunties, mother, father, …). */
  offspring: PersonDef[];
  marriedChildren?: MarriedChild[];
};

export type NuclearFamily = {
  hubId: string;
  parents: PersonDef[];
  /** Children only — not their spouses. */
  children: PersonDef[];
  marriedChildren?: MarriedChild[];
};

export const maternalGrandparents: GrandparentUnit = {
  hubId: 'hub-gp-maternal',
  grandparents: [
    p('grandmother-1', 'Grandmother 1', 'female'),
    p('grandfather-1', 'Grandfather 1', 'male'),
  ],
  offspring: [
    p('uncle-1', 'Uncle 1', 'male'),
    p('uncle-2', 'Uncle 2', 'male'),
    p('uncle-3', 'Uncle 3', 'male'),
    p('auntie-1', 'Auntie 1', 'female'),
    p('auntie-2', 'Auntie 2', 'female'),
    p('auntie-3', 'Auntie 3', 'female'),
    p('auntie-4', 'Auntie 4', 'female'),
    p('auntie-5', 'Auntie 5', 'female'),
    p('mother', 'Mother', 'female'),
  ],
  marriedChildren: [
    {
      hubId: 'hub-uncle-1',
      sibling: p('uncle-1', 'Uncle 1', 'male'),
      spouse: p('uncle-1-wife', 'Uncle 1 Wife', 'female'),
    },
    {
      hubId: 'hub-uncle-2',
      sibling: p('uncle-2', 'Uncle 2', 'male'),
      spouse: p('uncle-2-wife', 'Uncle 2 Wife', 'female'),
      exSpouse: p('uncle-2-ex-wife', 'Uncle 2 Ex-Wife', 'female'),
    },
    {
      hubId: 'hub-auntie-1',
      sibling: p('auntie-1', 'Auntie 1', 'female'),
      spouse: p('auntie-1-husband', 'Auntie 1 Husband', 'male'),
    },
    {
      hubId: 'hub-uncle-3',
      sibling: p('uncle-3', 'Uncle 3', 'male'),
      spouse: p('uncle-3-wife', 'Uncle 3 Wife', 'female'),
    },
    {
      hubId: 'hub-auntie-2',
      sibling: p('auntie-2', 'Auntie 2', 'female'),
      spouse: p('auntie-2-husband', 'Auntie 2 Husband', 'male'),
    },
    {
      hubId: 'hub-auntie-3',
      sibling: p('auntie-3', 'Auntie 3', 'female'),
      spouse: p('auntie-3-husband', 'Auntie 3 Husband', 'male'),
    },
    {
      hubId: 'hub-auntie-4',
      sibling: p('auntie-4', 'Auntie 4', 'female'),
      spouse: p('auntie-4-husband', 'Auntie 4 Husband', 'male'),
    },
    {
      hubId: 'hub-auntie-5',
      sibling: p('auntie-5', 'Auntie 5', 'female'),
      spouse: p('auntie-5-husband', 'Auntie 5 Husband', 'male'),
    },
  ],
};

export const paternalGrandparentsA: GrandparentUnit = {
  hubId: 'hub-gp-paternal-a',
  grandparents: [
    p('grandmother-2', 'Grandmother 2', 'female'),
    p('grandfather-2', 'Grandfather 2', 'male'),
  ],
  offspring: [
    p('tiyong-1', 'Tiyong 1', 'male'),
    p('tiyang-1', 'Tiyang 1', 'female'),
    p('tiyang-2', 'Tiyang 2', 'female'),
    p('tiyang-3', 'Tiyang 3', 'female'),
    p('tiyong-2', 'Tiyong 2', 'male'),
    p('tiyong-3', 'Tiyong 3', 'male'),
    p('father', 'Father', 'male'),
  ],
  marriedChildren: [
    {
      hubId: 'hub-tiyong-1',
      sibling: p('tiyong-1', 'Tiyong 1', 'male'),
      spouse: p('tiyong-1-wife', 'Tiyong 1 Wife', 'female'),
    },
    {
      hubId: 'hub-tiyang-1',
      sibling: p('tiyang-1', 'Tiyang 1', 'female'),
      spouse: p('tiyang-1-husband', 'Tiyang 1 Husband', 'male'),
    },
    {
      hubId: 'hub-tiyang-2',
      sibling: p('tiyang-2', 'Tiyang 2', 'female'),
      spouse: p('tiyang-2-husband', 'Tiyang 2 Husband', 'male'),
    },
    {
      hubId: 'hub-tiyang-3',
      sibling: p('tiyang-3', 'Tiyang 3', 'female'),
      spouse: p('tiyang-3-husband', 'Tiyang 3 Husband', 'male'),
    },
    {
      hubId: 'hub-tiyong-3',
      sibling: p('tiyong-3', 'Tiyong 3', 'male'),
      spouse: p('tiyong-3-wife', 'Tiyong 3 Wife', 'female'),
    },
  ],
};

export const paternalGrandparentsB: GrandparentUnit = {
  hubId: 'hub-gp-paternal-b',
  grandparents: [
    p('grandmother-2', 'Grandmother 2', 'female'),
    p('grandfather-3', 'Grandfather 3', 'male'),
  ],
  offspring: [p('tiyong-4', 'Tiyong 4', 'male')],
  marriedChildren: [
    {
      hubId: 'hub-tiyong-4',
      sibling: p('tiyong-4', 'Tiyong 4', 'male'),
      spouse: p('tiyong-4-wife', 'Tiyong 4 Wife', 'female'),
    },
  ],
};

export const myFamily: NuclearFamily = {
  hubId: 'hub-parents',
  parents: [p('mother', 'Mother', 'female'), p('father', 'Father', 'male')],
  children: [
    p('me', 'Me', 'male'),
    p('brother-1', 'Brother 1', 'male'),
    p('brother-2', 'Brother 2', 'male'),
  ],
  marriedChildren: [
    {
      hubId: 'hub-brother-2',
      sibling: p('brother-2', 'Brother 2', 'male'),
      spouse: p('sister-in-law', 'Sister in Law', 'female'),
    },
  ],
};
