import type { PersonGender } from './graphTypes';

export type PersonDef = {
  id: string;
  label: string;
  gender: PersonGender;
};

function p(id: string, label: string, gender: PersonGender): PersonDef {
  return { id, label, gender };
}

/** Cousins sharing one co-parent with the sibling on the couple hub. */
export type CousinGroup = {
  /** Spouse or ex-spouse id these cousins belong with */
  withCoParentId: string;
  children: PersonDef[];
};

/** Spouse lives on the couple hub only — never on the grandparents’ sibling ring. */
export type MarriedChild = {
  hubId: string;
  sibling: PersonDef;
  spouse?: PersonDef;
  exSpouse?: PersonDef;
  /** Cousins with the primary spouse (most aunts/uncles) */
  children?: PersonDef[];
  /** Split cousins by co-parent (e.g. Uncle 2 ex-wife vs wife) */
  childrenByCoParent?: CousinGroup[];
  /** 4th gen — married cousins on this branch */
  marriedChildren?: MarriedChild[];
};

function cousins(...defs: PersonDef[]): PersonDef[] {
  return defs;
}

/** Paternal/maternal cousin label; odd ids default male to match Cousin 1–23. */
function c(n: number, gender?: PersonGender): PersonDef {
  return p(`cousin-${n}`, `Cousin ${n}`, gender ?? (n % 2 === 1 ? 'male' : 'female'));
}

function marriedCousin(n: number, role: 'husband' | 'wife'): MarriedChild {
  const label = role === 'husband' ? 'Husband' : 'Wife';
  return {
    hubId: `hub-cousin-${n}`,
    sibling: c(n),
    spouse: p(
      `cousin-${n}-${role}`,
      `Cousin ${n} ${label}`,
      role === 'husband' ? 'male' : 'female',
    ),
  };
}

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
      children: cousins(
        p('cousin-1', 'Cousin 1', 'male'),
        p('cousin-2', 'Cousin 2', 'female'),
        p('cousin-3', 'Cousin 3', 'male'),
        p('cousin-4', 'Cousin 4', 'female'),
        p('cousin-5', 'Cousin 5', 'male'),
      ),
      marriedChildren: [
        {
          hubId: 'hub-cousin-1',
          sibling: p('cousin-1', 'Cousin 1', 'male'),
          spouse: p('cousin-1-husband', 'Cousin 1 Husband', 'male'),
        },
        {
          hubId: 'hub-cousin-2',
          sibling: p('cousin-2', 'Cousin 2', 'female'),
          exSpouse: p('cousin-2-ex-husband', 'Cousin 2 Ex-Husband', 'male'),
        },
      ],
    },
    {
      hubId: 'hub-uncle-2',
      sibling: p('uncle-2', 'Uncle 2', 'male'),
      spouse: p('uncle-2-wife', 'Uncle 2 Wife', 'female'),
      exSpouse: p('uncle-2-ex-wife', 'Uncle 2 Ex-Wife', 'female'),
      childrenByCoParent: [
        {
          withCoParentId: 'uncle-2-ex-wife',
          children: cousins(
            p('cousin-6', 'Cousin 6', 'male'),
            p('cousin-7', 'Cousin 7', 'female'),
          ),
        },
        {
          withCoParentId: 'uncle-2-wife',
          children: cousins(p('cousin-8', 'Cousin 8', 'male')),
        },
      ],
      marriedChildren: [
        {
          hubId: 'hub-cousin-8',
          sibling: p('cousin-8', 'Cousin 8', 'male'),
          spouse: p('cousin-8-wife', 'Cousin 8 Wife', 'female'),
        },
      ],
    },
    {
      hubId: 'hub-auntie-1',
      sibling: p('auntie-1', 'Auntie 1', 'female'),
      spouse: p('auntie-1-husband', 'Auntie 1 Husband', 'male'),
      children: cousins(
        p('cousin-9', 'Cousin 9', 'female'),
        p('cousin-10', 'Cousin 10', 'male'),
      ),
      marriedChildren: [
        {
          hubId: 'hub-cousin-10',
          sibling: p('cousin-10', 'Cousin 10', 'male'),
          spouse: p('cousin-10-wife', 'Cousin 10 Wife', 'female'),
        },
      ],
    },
    {
      hubId: 'hub-uncle-3',
      sibling: p('uncle-3', 'Uncle 3', 'male'),
      spouse: p('uncle-3-wife', 'Uncle 3 Wife', 'female'),
      children: cousins(
        p('cousin-11', 'Cousin 11', 'male'),
        p('cousin-12', 'Cousin 12', 'female'),
        p('cousin-13', 'Cousin 13', 'male'),
      ),
      marriedChildren: [
        {
          hubId: 'hub-cousin-11',
          sibling: p('cousin-11', 'Cousin 11', 'male'),
          spouse: p('cousin-11-husband', 'Cousin 11 Husband', 'male'),
        },
      ],
    },
    {
      hubId: 'hub-auntie-2',
      sibling: p('auntie-2', 'Auntie 2', 'female'),
      spouse: p('auntie-2-husband', 'Auntie 2 Husband', 'male'),
      children: cousins(
        p('cousin-14', 'Cousin 14', 'female'),
        p('cousin-15', 'Cousin 15', 'male'),
      ),
      marriedChildren: [
        {
          hubId: 'hub-cousin-14',
          sibling: p('cousin-14', 'Cousin 14', 'female'),
          spouse: p('cousin-14-husband', 'Cousin 14 Husband', 'male'),
        },
        {
          hubId: 'hub-cousin-15',
          sibling: p('cousin-15', 'Cousin 15', 'male'),
          spouse: p('cousin-15-wife', 'Cousin 15 Wife', 'female'),
        },
      ],
    },
    {
      hubId: 'hub-auntie-3',
      sibling: p('auntie-3', 'Auntie 3', 'female'),
      spouse: p('auntie-3-husband', 'Auntie 3 Husband', 'male'),
      children: cousins(p('cousin-16', 'Cousin 16', 'female')),
    },
    {
      hubId: 'hub-auntie-4',
      sibling: p('auntie-4', 'Auntie 4', 'female'),
      spouse: p('auntie-4-husband', 'Auntie 4 Husband', 'male'),
      children: cousins(
        p('cousin-17', 'Cousin 17', 'female'),
        p('cousin-18', 'Cousin 18', 'male'),
        p('cousin-19', 'Cousin 19', 'female'),
        p('cousin-20', 'Cousin 20', 'male'),
      ),
      marriedChildren: [
        {
          hubId: 'hub-cousin-17',
          sibling: p('cousin-17', 'Cousin 17', 'female'),
          spouse: p('cousin-17-wife', 'Cousin 17 Wife', 'female'),
        },
      ],
    },
    {
      hubId: 'hub-auntie-5',
      sibling: p('auntie-5', 'Auntie 5', 'female'),
      spouse: p('auntie-5-husband', 'Auntie 5 Husband', 'male'),
      children: cousins(
        p('cousin-21', 'Cousin 21', 'female'),
        p('cousin-22', 'Cousin 22', 'male'),
        p('cousin-23', 'Cousin 23', 'female'),
      ),
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
      children: cousins(c(24), c(25), c(26), c(27), c(28)),
      marriedChildren: [
        marriedCousin(24, 'wife'),
        marriedCousin(25, 'husband'),
        marriedCousin(26, 'husband'),
        marriedCousin(27, 'wife'),
        marriedCousin(28, 'husband'),
      ],
    },
    {
      hubId: 'hub-tiyang-1',
      sibling: p('tiyang-1', 'Tiyang 1', 'female'),
      spouse: p('tiyang-1-husband', 'Tiyang 1 Husband', 'male'),
      children: cousins(c(29), c(30), c(31), c(32), c(33), c(34), c(35)),
      marriedChildren: [
        marriedCousin(29, 'husband'),
        marriedCousin(30, 'wife'),
        marriedCousin(31, 'wife'),
        marriedCousin(32, 'husband'),
        marriedCousin(33, 'husband'),
        marriedCousin(34, 'wife'),
        marriedCousin(35, 'husband'),
      ],
    },
    {
      hubId: 'hub-tiyang-2',
      sibling: p('tiyang-2', 'Tiyang 2', 'female'),
      spouse: p('tiyang-2-husband', 'Tiyang 2 Husband', 'male'),
      children: cousins(c(36), c(37), c(38), c(39)),
      marriedChildren: [
        marriedCousin(36, 'husband'),
        marriedCousin(37, 'wife'),
        marriedCousin(38, 'wife'),
        marriedCousin(39, 'husband'),
      ],
    },
    {
      hubId: 'hub-tiyang-3',
      sibling: p('tiyang-3', 'Tiyang 3', 'female'),
      spouse: p('tiyang-3-husband', 'Tiyang 3 Husband', 'male'),
      children: cousins(c(40), c(41), c(42), c(43)),
      marriedChildren: [
        marriedCousin(40, 'husband'),
        marriedCousin(41, 'wife'),
        marriedCousin(42, 'husband'),
        marriedCousin(43, 'husband'),
      ],
    },
    {
      hubId: 'hub-tiyong-3',
      sibling: p('tiyong-3', 'Tiyong 3', 'male'),
      spouse: p('tiyong-3-wife', 'Tiyong 3 Wife', 'female'),
      children: cousins(c(44), c(45), c(46), c(47), c(48)),
      marriedChildren: [marriedCousin(44, 'husband')],
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
      children: cousins(c(49), c(50), c(51)),
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
