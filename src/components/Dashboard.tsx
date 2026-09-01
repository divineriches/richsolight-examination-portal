import React from 'react';
import { SchoolProfile, ClassRoom, Subject, Student, ScoreRecord } from '../types';
import { computeClassReports, getOrdinalSuffix } from '../utils/gradeCalculator';
import { SchoolBadge } from './SchoolBadge';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileSpreadsheet, 
  Printer, 
  Award, 
  TrendingUp, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface DashboardProps {
  schoolProfile: SchoolProfile;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: ScoreRecord[];
  onNavigate: (tab: ActiveTab, classId?: string, studentId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  schoolProfile,
  classes,
  subjects,
  students,
  scores,
  onNavigate,
}) => {
  // Aggregate statistics
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalSubjects = subjects.length;

  // Calculate scores completion
  const totalExpectedScores = totalStudents * totalSubjects;
  const recordedScoresCount = scores.filter(
    s => s.session === schoolProfile.currentSession && s.term === schoolProfile.currentTerm && (s.ca1 !== null || s.ca2 !== null || s.midterm !== null || s.exam !== null)
  ).length;
  const completionPercentage = totalExpectedScores > 0 ? Math.min(100, Math.round((recordedScoresCount / totalExpectedScores) * 100)) : 0;

  // Class analytics
  const classStats = classes.map(cls => {
    const reports = computeClassReports(
      cls,
      students,
      subjects,
      scores,
      schoolProfile,
      schoolProfile.currentSession,
      schoolProfile.currentTerm
    );
    const avg = reports.length > 0 ? (reports.reduce((sum, r) => sum + r.overallAverage, 0) / reports.length).toFixed(1) : '0.0';
    const topStudent = reports[0];
    return {
      class: cls,
      studentCount: reports.length,
      classAverage: avg,
      topStudent,
    };
  });

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Official School Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <SchoolBadge 
              logoUrl={schoolProfile.logoUrl} 
              badgeStyle={schoolProfile.badgeStyle} 
              schoolName={schoolProfile.name}
              size="lg" 
              className="shrink-0 ring-4 ring-amber-500/30 rounded-full p-1 bg-slate-800/90" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase bg-amber-500 text-slate-950 font-extrabold px-2.5 py-0.5 rounded tracking-wide">
                  Official Portal
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Session: <strong className="text-amber-300">{schoolProfile.currentSession}</strong> ({schoolProfile.currentTerm})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-1">
                {schoolProfile.name}
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/90 font-medium mt-0.5">
                "{schoolProfile.motto}"
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {schoolProfile.address}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Resumption: <strong>{schoolProfile.nextTermResumption}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Hub Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigate('scores')}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Input Assessment Scores</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Terminal Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Across {totalClasses} classes</span>
            <ArrowRight className="w-3 h-3 text-amber-600" />
          </p>
        </div>

        {/* Classes */}
        <div
          onClick={() => onNavigate('classes-subjects')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Arms</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-100 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalClasses}</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Primary & Secondary arms</span>
            <ArrowRight className="w-3 h-3 text-amber-600" />
          </p>
        </div>

        {/* Subjects */}
        <div
          onClick={() => onNavigate('classes-subjects')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Subjects</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalSubjects}</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Nigerian Standard Curriculum</span>
            <ArrowRight className="w-3 h-3 text-amber-600" />
          </p>
        </div>

        {/* Assessment Weighting Scheme */}
        <div
          onClick={() => onNavigate('scores')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Breakdown</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg group-hover:bg-purple-100 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs font-bold text-slate-800 space-y-0.5">
            <div>CA1: <span className="text-amber-700">10</span> | CA2: <span className="text-amber-700">10</span></div>
            <div>Midterm: <span className="text-blue-700">20</span> | Exam: <span className="text-emerald-700">40</span></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total: 80 Marks (100%)</p>
        </div>
      </div>

      {/* Class Performance & Broad Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Breakdown List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Class Performance & Score Records</h3>
              <p className="text-xs text-slate-500">Quick assessment status for {schoolProfile.currentTerm}</p>
            </div>
            <button
              onClick={() => onNavigate('broadsheet')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View Broadsheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {classStats.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No classes registered</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                  All previous data has been cleared. Add class arms to start enrolling pupils and logging assessment marks.
                </p>
                <button
                  onClick={() => onNavigate('classes-subjects')}
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <span>Go to Classes & Subjects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              classStats.map(({ class: cls, studentCount, classAverage, topStudent }) => (
                <div
                  key={cls.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition-colors gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{cls.name}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        {cls.section}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Teacher: <span className="text-slate-700 font-medium">{cls.classTeacher || 'Unassigned'}</span> • {studentCount} Students
                    </div>
                    {topStudent && (
                      <div className="text-xs text-amber-800 font-medium mt-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Top: <strong>{topStudent.student.fullName}</strong> ({topStudent.overallAverage}%)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right mr-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Average</span>
                      <span className="text-sm font-extrabold text-blue-950">{classAverage}%</span>
                    </div>
                    <button
                      onClick={() => onNavigate('scores', cls.id)}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 cursor-pointer"
                      title="Input Scores"
                    >
                      Enter Scores
                    </button>
                    <button
                      onClick={() => onNavigate('reports', cls.id)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold cursor-pointer"
                      title="Print Class Reports"
                    >
                      Reports
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* School Info & Quick Guide */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Grading Structure Key</h3>
            <p className="text-xs text-slate-500 mb-3">Continuous Assessment Scale Breakdown</p>
            <div className="space-y-1.5 text-xs">
              {schoolProfile.gradingScale.map(g => (
                <div key={g.grade} className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: g.color }}
                    ></span>
                    <span className="font-bold text-slate-800">{g.grade}</span>
                  </div>
                  <span className="text-slate-500">{g.minPercent}% - {Math.floor(g.maxPercent)}%</span>
                  <span className="font-semibold text-slate-700">{g.remark}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">School Contact</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{schoolProfile.phones}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{schoolProfile.email}</span>
              </p>
              {schoolProfile.directorName && (
                <p className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Director: {schoolProfile.directorName}</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Principal: {schoolProfile.principalName}</span>
              </p>
              {schoolProfile.adminName && (
                <p className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Admin / Exam Officer: {schoolProfile.adminName}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
