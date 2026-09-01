export interface SchoolProfile {
  name: string;
  motto: string;
  address: string;
  phones: string;
  email: string;
  currentSession: string;
  currentTerm: 'First Term' | 'Second Term' | 'Third Term';
  principalName: string;
  directorName?: string;
  adminName?: string;
  nextTermResumption: string;
  website?: string;
  logoUrl?: string;
  badgeStyle?: 'default' | 'royal' | 'torch' | 'globe';
  ca1Max: number;
  ca2Max: number;
  midtermMax: number;
  examMax: number;
  gradingScale: GradeRange[];
}

export interface GradeRange {
  grade: string;
  minPercent: number;
  maxPercent: number;
  remark: string;
  gpaPoint: number;
  color: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  section: 'Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary';
  classTeacher: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  category?: 'General' | 'Sciences' | 'Arts & Humanities' | 'Commercial' | 'Vocation';
}

export interface Student {
  id: string;
  admissionNo: string;
  fullName: string;
  gender: 'Male' | 'Female';
  classId: string;
  dob?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  timesSchoolOpened: number;
  timesPresent: number;
  avatarUrl?: string;
  affectiveTraits: {
    punctuality: number; // 1 to 5
    neatness: number;
    politeness: number;
    honesty: number;
    attentiveness: number;
    relationshipWithPeers: number;
    leadership: number;
  };
  psychomotorSkills: {
    handwriting: number;
    sportsAndGames: number;
    drawingAndCraft: number;
    musicalSkill: number;
    verbalFluency: number;
    handlingTools: number;
  };
  teacherRemark?: string;
  principalRemark?: string;
}

export interface ScoreRecord {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  session: string;
  term: 'First Term' | 'Second Term' | 'Third Term';
  ca1: number | null; // max 10
  ca2: number | null; // max 10
  midterm: number | null; // max 20
  exam: number | null; // max 60
}

export interface ComputedSubjectResult {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  ca1: number;
  ca2: number;
  midterm: number;
  exam: number;
  total: number; // out of 100
  percentage: number; // out of 100%
  grade: string;
  remark: string;
  classAverage: number;
  highestInClass: number;
  lowestInClass: number;
  positionInSubject: number;
}

export interface StudentTerminalReport {
  student: Student;
  classRoom: ClassRoom;
  session: string;
  term: string;
  subjects: ComputedSubjectResult[];
  totalScoreObtained: number;
  totalScoreObtainable: number;
  overallAverage: number;
  classPosition: number;
  totalStudentsInClass: number;
  gradeCounts: Record<string, number>;
  decision: 'PROMOTED' | 'PROMOTED ON TRIAL' | 'REPEAT' | 'PASS' | 'DISTINCTION';
}


