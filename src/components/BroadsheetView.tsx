import React, { useState, useMemo } from 'react';
import { SchoolProfile, ClassRoom, Student, ScoreRecord, Subject, StudentTerminalReport } from '../types';
import { computeClassReports, getOrdinalSuffix } from '../utils/gradeCalculator';
import { SchoolBadge } from './SchoolBadge';
import { 
  TableProperties, 
  Printer, 
  Download, 
  Users, 
  BookOpen, 
  Award,
  Filter
} from 'lucide-react';

interface BroadsheetViewProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: ScoreRecord[];
  schoolProfile: SchoolProfile;
  onNavigateToStudentReport: (classId: string, studentId: string) => void;
}

export const BroadsheetView: React.FC<BroadsheetViewProps> = ({
  classes,
  subjects,
  students,
  scores,
  schoolProfile,
  onNavigateToStudentReport,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [displayMode, setDisplayMode] = useState<'total' | 'detailed'>('total');

  const currentClass = useMemo(() => classes.find(c => c.id === selectedClassId) || classes[0], [classes, selectedClassId]);

  const classReports: StudentTerminalReport[] = useMemo(() => {
    if (!currentClass) return [];
    return computeClassReports(
      currentClass,
      students,
      subjects,
      scores,
      schoolProfile,
      schoolProfile.currentSession,
      schoolProfile.currentTerm
    );
  }, [currentClass, students, subjects, scores, schoolProfile]);

  const handlePrintBroadsheet = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (classReports.length === 0) return;

    const maxScore = schoolProfile.ca1Max + schoolProfile.ca2Max + schoolProfile.midtermMax + schoolProfile.examMax;
    let header = 'Rank,Admission No,Student Name';
    subjects.forEach(sub => {
      header += `,"${sub.name} (Total ${maxScore})","${sub.code} Grade"`;
    });
    header += ',Total Marks,Average (%),Academic Decision\n';

    let rows = '';
    classReports.forEach(rep => {
      let row = `${rep.classPosition},"${rep.student.admissionNo}","${rep.student.fullName}"`;
      subjects.forEach(sub => {
        const subRes = rep.subjects.find(s => s.subjectId === sub.id);
        row += `,${subRes ? subRes.total : 0},"${subRes ? subRes.grade : 'F9'}"`;
      });
      row += `,${rep.totalScoreObtained},${rep.overallAverage}%,"${rep.decision}"\n`;
      rows += row;
    });

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentClass?.name}_Master_Broadsheet_${schoolProfile.currentTerm.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Class subject averages
  const subjectAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    subjects.forEach(sub => {
      let sum = 0;
      let count = 0;
      classReports.forEach(rep => {
        const sRes = rep.subjects.find(s => s.subjectId === sub.id);
        if (sRes) {
          sum += sRes.total;
          count++;
        }
      });
      avgs[sub.id] = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    });
    return avgs;
  }, [subjects, classReports]);

  return (
    <div className="space-y-6">
      {/* Top Filter Toolbar (no-print) */}
      <div className="no-print bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-amber-600" />
              <span>Master Grade Broadsheet</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive class-wide results master sheet for academic assessment review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setDisplayMode('total')}
                className={`px-3 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  displayMode === 'total' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Totals & Grades
              </button>
              <button
                onClick={() => setDisplayMode('detailed')}
                className={`px-3 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  displayMode === 'detailed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detailed (CA + Exam)
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border border-slate-300"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              id="print-broadsheet-btn"
              onClick={handlePrintBroadsheet}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Broadsheet</span>
            </button>
          </div>
        </div>

        {/* Class Selection */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Class:
            </label>
            <select
              id="broadsheet-class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.section})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Session: <span className="font-bold text-slate-700">{schoolProfile.currentSession}</span> | Term: <span className="font-bold text-amber-700">{schoolProfile.currentTerm}</span> | Total Enrolled: <span className="font-bold text-slate-700">{classReports.length}</span>
          </div>
        </div>
      </div>

      {/* Broadsheet Printable Sheet */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-300 p-4 sm:p-6 overflow-hidden">
        {/* Printable Official Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <SchoolBadge 
              logoUrl={schoolProfile.logoUrl} 
              badgeStyle={schoolProfile.badgeStyle} 
              schoolName={schoolProfile.name}
              size="md" 
              className="w-12 h-12" 
            />
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-blue-950 font-serif">
                {schoolProfile.name}
              </h2>
              <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">
                {schoolProfile.motto}
              </p>
            </div>
          </div>
          <div className="bg-slate-900 text-white text-xs font-bold py-1 px-3 rounded inline-block uppercase tracking-wider">
            MASTER RESULT BROADSHEET • {currentClass?.name} • {schoolProfile.currentTerm} ({schoolProfile.currentSession})
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No classes registered</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              All class records have been cleared. Please add class arms in the Classes & Subjects tab to generate the broadsheet.
            </p>
          </div>
        ) : classReports.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No students recorded in {currentClass?.name || 'this class'}.</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Enrol students and enter assessment scores to view the master broadsheet matrix.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-blue-950 text-white text-[11px] font-bold uppercase text-center">
                  <th className="py-2 px-2 w-10 border border-slate-700">POS</th>
                  <th className="py-2 px-3 text-left w-28 border border-slate-700">ADM NO</th>
                  <th className="py-2 px-3 text-left min-w-[160px] border border-slate-700">STUDENT NAME</th>
                  {subjects.map(sub => (
                    <th key={sub.id} className="py-2 px-1 border border-slate-700" colSpan={displayMode === 'detailed' ? 5 : 1}>
                      <span className="block font-bold">{sub.code}</span>
                      <span className="block text-[9px] font-normal text-amber-300">{sub.name.slice(0, 10)}</span>
                    </th>
                  ))}
                  <th className="py-2 px-2 w-16 border border-slate-700 bg-blue-900">TOTAL</th>
                  <th className="py-2 px-2 w-14 border border-slate-700 bg-blue-900">AVG %</th>
                  <th className="py-2 px-2 w-20 border border-slate-700">DECISION</th>
                </tr>
                {displayMode === 'detailed' && (
                  <tr className="bg-slate-200 text-slate-800 text-[9px] font-bold text-center">
                    <th className="border border-slate-300" colSpan={3}></th>
                    {subjects.map(sub => (
                      <React.Fragment key={`detail-hdr-${sub.id}`}>
                        <th className="py-1 px-0.5 border border-slate-300">CA1</th>
                        <th className="py-1 px-0.5 border border-slate-300">CA2</th>
                        <th className="py-1 px-0.5 border border-slate-300">MID</th>
                        <th className="py-1 px-0.5 border border-slate-300">EXM</th>
                        <th className="py-1 px-0.5 border border-slate-300 bg-slate-300">TOT</th>
                      </React.Fragment>
                    ))}
                    <th className="border border-slate-300" colSpan={3}></th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classReports.map((rep) => (
                  <tr key={rep.student.id} className="hover:bg-amber-50/20 text-center text-xs">
                    <td className="py-2 px-2 font-black text-amber-900 border border-slate-200 bg-amber-50/40">
                      {getOrdinalSuffix(rep.classPosition)}
                    </td>
                    <td className="py-2 px-3 text-left font-mono font-semibold text-slate-700 border border-slate-200">
                      {rep.student.admissionNo}
                    </td>
                    <td className="py-2 px-3 text-left font-bold text-slate-900 border border-slate-200">
                      <button
                        onClick={() => onNavigateToStudentReport(currentClass.id, rep.student.id)}
                        className="hover:text-amber-700 cursor-pointer text-left font-bold"
                        title="Click to view full report card"
                      >
                        {rep.student.fullName}
                      </button>
                    </td>

                    {/* Subject Scores */}
                    {subjects.map(sub => {
                      const subResult = rep.subjects.find(s => s.subjectId === sub.id);
                      if (displayMode === 'detailed') {
                        return (
                          <React.Fragment key={`res-${rep.student.id}-${sub.id}`}>
                            <td className="py-1.5 px-1 text-slate-600 border border-slate-200 text-[10px]">{subResult?.ca1 || '-'}</td>
                            <td className="py-1.5 px-1 text-slate-600 border border-slate-200 text-[10px]">{subResult?.ca2 || '-'}</td>
                            <td className="py-1.5 px-1 text-slate-600 border border-slate-200 text-[10px]">{subResult?.midterm || '-'}</td>
                            <td className="py-1.5 px-1 text-slate-600 border border-slate-200 text-[10px]">{subResult?.exam || '-'}</td>
                            <td className="py-1.5 px-1 font-bold text-blue-950 bg-slate-100/60 border border-slate-200 text-[11px]">{subResult?.total || '-'}</td>
                          </React.Fragment>
                        );
                      }

                      return (
                        <td key={`tot-${rep.student.id}-${sub.id}`} className="py-2 px-1 border border-slate-200">
                          <span className="font-bold text-slate-900 block">{subResult?.total ?? '-'}</span>
                          <span className={`text-[10px] font-black ${subResult?.grade === 'A1' ? 'text-emerald-700' : subResult?.grade === 'F9' ? 'text-red-600' : 'text-blue-700'}`}>
                            {subResult?.grade}
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-2 px-2 font-extrabold text-blue-950 bg-blue-50/40 border border-slate-200">
                      {rep.totalScoreObtained}
                    </td>
                    <td className="py-2 px-2 font-black text-emerald-800 bg-emerald-50/40 border border-slate-200">
                      {rep.overallAverage}%
                    </td>
                    <td className="py-2 px-2 text-[10px] font-bold uppercase text-slate-700 border border-slate-200">
                      {rep.decision}
                    </td>
                  </tr>
                ))}

                {/* Class Averages Row */}
                <tr className="bg-slate-100 font-bold text-slate-900 text-center">
                  <td colSpan={3} className="py-2 px-3 text-right uppercase text-[10px] tracking-wider border border-slate-300">
                    CLASS SUBJECT AVERAGE:
                  </td>
                  {subjects.map(sub => {
                    if (displayMode === 'detailed') {
                      return (
                        <td key={`avg-det-${sub.id}`} colSpan={5} className="py-2 px-1 border border-slate-300 font-extrabold text-amber-800">
                          {subjectAverages[sub.id]}
                        </td>
                      );
                    }
                    return (
                      <td key={`avg-${sub.id}`} className="py-2 px-1 border border-slate-300 font-extrabold text-amber-800">
                        {subjectAverages[sub.id]}
                      </td>
                    );
                  })}
                  <td colSpan={3} className="border border-slate-300"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Notes for Board Approval */}
        <div className="mt-6 pt-4 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-end text-xs text-slate-600 gap-4">
          <div>
            <p>Class Teacher: <span className="font-bold text-slate-800">{currentClass?.classTeacher || 'Unassigned'}</span></p>
            <p className="text-[10px] text-slate-500 mt-1">
              Compiled & Generated by: <span className="font-semibold text-slate-700">{schoolProfile.adminName || 'Portal Administrator'}</span> • {schoolProfile.name}
            </p>
          </div>
          
          <div className="flex items-center gap-8 text-right">
            {schoolProfile.directorName && (
              <div>
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <p className="font-semibold text-slate-800">{schoolProfile.directorName}</p>
                <p className="text-[10px] text-slate-500">Director / Proprietor</p>
              </div>
            )}
            <div>
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-800">{schoolProfile.principalName}</p>
              <p className="text-[10px] text-slate-500">Principal's Signature & Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
