import { SchoolProfile, ClassRoom, Subject, Student, ScoreRecord } from '../types';

export const initialSchoolProfile: SchoolProfile = {
  name: 'RICHSOLIGHT INTERNATIONAL SCHOOL',
  motto: 'DEVOTED TO EXCELLENCE AND CREATIVITY',
  address: 'OZUOBA NTA ROAD, BY GLO HOUSE BUS STOP PORT HARCOURT, RIVERS STATE',
  phones: '08063453425, 08030891653, 07086514241',
  email: 'richsolightintlschool@gmail.com',
  currentSession: '2025/2026',
  currentTerm: 'First Term',
  principalName: 'Dr. (Mrs.) Blessing K. Nwosu',
  directorName: 'Sir Richman O. Nwosu',
  adminName: 'Exam Officer / Portal Admin',
  nextTermResumption: '5th September 2026',
  website: 'www.richsolightschools.edu.ng',
  logoUrl: '',
  badgeStyle: 'default',
  ca1Max: 10,
  ca2Max: 10,
  midtermMax: 20,
  examMax: 60,
  gradingScale: [
    { grade: 'A1', minPercent: 75, maxPercent: 100, remark: 'EXCELLENT', gpaPoint: 5, color: '#16a34a' },
    { grade: 'B2', minPercent: 65, maxPercent: 74.99, remark: 'VERY GOOD', gpaPoint: 4, color: '#2563eb' },
    { grade: 'B3', minPercent: 60, maxPercent: 64.99, remark: 'GOOD', gpaPoint: 3, color: '#0284c7' },
    { grade: 'C4', minPercent: 55, maxPercent: 59.99, remark: 'CREDIT', gpaPoint: 2, color: '#d97706' },
    { grade: 'C5', minPercent: 50, maxPercent: 54.99, remark: 'PASS', gpaPoint: 2, color: '#ca8a04' },
    { grade: 'D7', minPercent: 45, maxPercent: 49.99, remark: 'FAIR', gpaPoint: 1, color: '#ea580c' },
    { grade: 'F9', minPercent: 0, maxPercent: 44.99, remark: 'FAIL', gpaPoint: 0, color: '#dc2626' },
  ],
};

export const initialClasses: ClassRoom[] = [
  // Nursery Section
  { id: 'cls-creche', name: 'Creche / Reception', section: 'Nursery', classTeacher: '' },
  { id: 'cls-nur1', name: 'Nursery 1', section: 'Nursery', classTeacher: '' },
  { id: 'cls-nur2', name: 'Nursery 2', section: 'Nursery', classTeacher: '' },
  
  // Primary Section
  { id: 'cls-pri1', name: 'Primary 1 (Basic 1)', section: 'Primary', classTeacher: '' },
  { id: 'cls-pri2', name: 'Primary 2 (Basic 2)', section: 'Primary', classTeacher: '' },
  { id: 'cls-pri3', name: 'Primary 3 (Basic 3)', section: 'Primary', classTeacher: '' },
  { id: 'cls-pri4', name: 'Primary 4 (Basic 4)', section: 'Primary', classTeacher: '' },
  { id: 'cls-pri5', name: 'Primary 5 (Basic 5)', section: 'Primary', classTeacher: '' },
  
  // Junior Secondary Section
  { id: 'cls-jss1', name: 'JSS 1 (Basic 7)', section: 'Junior Secondary', classTeacher: '' },
  { id: 'cls-jss2', name: 'JSS 2 (Basic 8)', section: 'Junior Secondary', classTeacher: '' },
  { id: 'cls-jss3', name: 'JSS 3 (Basic 9)', section: 'Junior Secondary', classTeacher: '' },
  
  // Senior Secondary Section
  { id: 'cls-sss1', name: 'SSS 1 (Science & Arts)', section: 'Senior Secondary', classTeacher: '' },
  { id: 'cls-sss2', name: 'SSS 2 (Science & Arts)', section: 'Senior Secondary', classTeacher: '' },
  { id: 'cls-sss3', name: 'SSS 3 (Graduating Class)', section: 'Senior Secondary', classTeacher: '' },
];

export const initialSubjects: Subject[] = [
  { id: 'sub-eng', name: 'English Language', code: 'ENG', category: 'General' },
  { id: 'sub-mth', name: 'Mathematics', code: 'MTH', category: 'General' },
  { id: 'sub-bst', name: 'Basic Science & Technology', code: 'BST', category: 'Sciences' },
  { id: 'sub-cve', name: 'Civic Education', code: 'CVE', category: 'General' },
  { id: 'sub-agr', name: 'Agricultural Science', code: 'AGR', category: 'Sciences' },
  { id: 'sub-bus', name: 'Business Studies', code: 'BUS', category: 'Commercial' },
  { id: 'sub-ict', name: 'Computer Studies / ICT', code: 'ICT', category: 'Sciences' },
  { id: 'sub-crs', name: 'Christian Religious Studies', code: 'CRS', category: 'Arts & Humanities' },
  { id: 'sub-sos', name: 'Social Studies', code: 'SOS', category: 'Arts & Humanities' },
  { id: 'sub-cca', name: 'Cultural & Creative Arts', code: 'CCA', category: 'Vocation' },
  { id: 'sub-phe', name: 'Physical & Health Education', code: 'PHE', category: 'General' },
];

export const initialStudents: Student[] = [];

export const initialScores: ScoreRecord[] = [];
