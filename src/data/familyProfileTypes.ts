export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

export type LifeMilestones = {
  migrationType?: string;
  lifetimeMigration?: string;
  currentResidence?: string;
  firstMigrationYear?: number;
  firstMigrationAge?: number;
  firstMigrationDescription?: string;
  marriageYear?: number;
  ageAtFirstMarriage?: number;
  ageAtFirstBirth?: number;
  firstBirthYear?: number;
  childrenLiving?: number;
  childrenDeceased?: number;
  deathYear?: number;
  causeOfDeath?: string;
  notes?: string;
};

export type ProfileOverride = {
  sex?: 'M' | 'F';
  birthYear?: number;
  age?: number;
  deceased?: boolean;
  education?: string;
  occupation?: string;
  maritalStatus?: MaritalStatus;
  milestones?: Partial<LifeMilestones>;
};
