import React, { useState, useMemo } from 'react';
import { SchoolProfile, ClassRoom, Student, ScoreRecord, Subject, StudentTerminalReport } from '../types';
import { computeClassReports, getOrdinalSuffix, buildPlainTextReportCardSummary } from '../utils/gradeCalculator';
import { SchoolBadge } from './SchoolBadge';
import { 
  Printer, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  GraduationCap, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Sparkles,
  Edit3,
  Check,
  Mail,
  Copy,
  ExternalLink,
  Share2,
  X,
  Send,
  Zap,
  Globe
} from 'lucide-react';

interface ReportCardViewProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: ScoreRecord[];
  schoolProfile: SchoolProfile;
  initialClassId?: string;
  initialStudentId?: string;
  onUpdateStudentRemark: (studentId: string, teacherRemark: string, principalRemark: string) => void;
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({
  classes,
  subjects,
  students,
  scores,
  schoolProfile,
  initialClassId,
  initialStudentId,
  onUpdateStudentRemark,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [isBulkPrintMode, setIsBulkPrintMode] = useState<boolean>(false);
  const [editingRemarks, setEditingRemarks] = useState<boolean>(false);

  const currentClass = useMemo(() => classes.find(c => c.id === selectedClassId) || classes[0], [classes, selectedClassId]);

  // Compute all terminal reports for this class
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

  // If no student selected or invalid, default to first report
  const currentReport = useMemo(() => {
    if (classReports.length === 0) return null;
    if (!selectedStudentId) return classReports[0];
    const found = classReports.find(r => r.student.id === selectedStudentId);
    return found || classReports[0];
  }, [classReports, selectedStudentId]);

  // Temporary state for remarks editing
  const [tempTeacherRemark, setTempTeacherRemark] = useState<string>('');
  const [tempPrincipalRemark, setTempPrincipalRemark] = useState<string>('');

  const handleStartEditRemarks = () => {
    if (!currentReport) return;
    setTempTeacherRemark(currentReport.student.teacherRemark || '');
    setTempPrincipalRemark(currentReport.student.principalRemark || '');
    setEditingRemarks(true);
  };

  const handleSaveRemarks = () => {
    if (!currentReport) return;
    onUpdateStudentRemark(currentReport.student.id, tempTeacherRemark, tempPrincipalRemark);
    setEditingRemarks(false);
  };

  const handlePrint = (bulk: boolean = false) => {
    setIsBulkPrintMode(bulk);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Quick Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailNote, setEmailNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenEmailModal = () => {
    if (!currentReport) return;
    setEmailRecipient(currentReport.student.guardianEmail || '');
    setEmailNote('');
    setIsEmailModalOpen(true);
  };

  const handleSendViaMailApp = () => {
    if (!currentReport) return;
    if (!emailRecipient || !emailRecipient.includes('@')) {
      alert('Please enter a valid recipient email address.');
      return;
    }

    const plainText = buildPlainTextReportCardSummary({
      student: currentReport.student,
      report: currentReport,
      schoolProfile,
      customNote: emailNote.trim() || undefined,
    });

    const subject = `Official Report Card: ${currentReport.student.fullName} (${schoolProfile.currentTerm} ${schoolProfile.currentSession})`;
    const mailto = `mailto:${encodeURIComponent(emailRecipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;

    window.open(mailto, '_blank');
    setIsEmailModalOpen(false);
    showToast(`Opened email composer for ${emailRecipient}`);
  };

  const handleCopyReportText = async () => {
    if (!currentReport) return;
    const plainText = buildPlainTextReportCardSummary({
      student: currentReport.student,
      report: currentReport,
      schoolProfile,
      customNote: emailNote.trim() || undefined,
    });

    try {
      await navigator.clipboard.writeText(plainText);
      showToast('Report card summary copied to clipboard!');
    } catch {
      showToast('Please copy text manually');
    }
  };

  const handleShareReport = async () => {
    if (!currentReport) return;
    const plainText = buildPlainTextReportCardSummary({
      student: currentReport.student,
      report: currentReport,
      schoolProfile,
      customNote: emailNote.trim() || undefined,
    });
    const subject = `Official Report Card: ${currentReport.student.fullName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: subject,
          text: plainText,
        });
        showToast('Shared successfully!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.log('Share canceled');
        }
      }
    } else {
      handleCopyReportText();
    }
  };

  const studentIndex = classReports.findIndex(r => r.student.id === currentReport?.student.id);
  const handlePrevStudent = () => {
    if (studentIndex > 0) {
      setSelectedStudentId(classReports[studentIndex - 1].student.id);
      setEditingRemarks(false);
    }
  };
  const handleNextStudent = () => {
    if (studentIndex < classReports.length - 1) {
      setSelectedStudentId(classReports[studentIndex + 1].student.id);
      setEditingRemarks(false);
    }
  };

  // Render a single complete printable report card
  const renderReportCard = (report: StudentTerminalReport, indexKey: string | number) => {
    const student = report.student;
    const maxScorePerSubject = schoolProfile.ca1Max + schoolProfile.ca2Max + schoolProfile.midtermMax + schoolProfile.examMax;

    return (
      <div
        key={indexKey}
        className="report-card-page bg-white text-slate-900 border-2 border-slate-900 shadow-md rounded-none sm:rounded-lg p-4 sm:p-6 mb-8 max-w-4xl mx-auto relative overflow-hidden"
      >
        {/* Subtle Watermark in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <SchoolBadge 
            logoUrl={schoolProfile.logoUrl} 
            badgeStyle={schoolProfile.badgeStyle} 
            schoolName={schoolProfile.name}
            size="xl" 
            className="w-[380px] h-[380px]" 
          />
        </div>

        {/* 1. Official Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-3 text-center relative">
          <div className="flex items-center justify-between gap-3">
            {/* Left Crest */}
            <div className="shrink-0">
              <SchoolBadge 
                logoUrl={schoolProfile.logoUrl} 
                badgeStyle={schoolProfile.badgeStyle} 
                schoolName={schoolProfile.name}
                size="lg" 
                className="w-16 h-16 sm:w-20 sm:h-20" 
              />
            </div>

            {/* School Name & Official Details */}
            <div className="flex-1 text-center px-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-blue-950 font-serif leading-none">
                {schoolProfile.name}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-widest mt-1">
                MOTTO: "{schoolProfile.motto}"
              </p>
              <p className="text-[11px] sm:text-xs text-slate-700 font-medium mt-0.5 leading-tight">
                {schoolProfile.address}
              </p>
              <div className="text-[10px] sm:text-xs text-slate-600 font-medium flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 mt-0.5">
                <span><strong>TEL:</strong> {schoolProfile.phones}</span>
                <span>•</span>
                <span><strong>EMAIL:</strong> {schoolProfile.email}</span>
              </div>
            </div>

            {/* Right Passport Box */}
            <div className="shrink-0 w-16 h-20 sm:w-20 sm:h-24 border border-dashed border-slate-400 bg-slate-50 flex flex-col items-center justify-center text-[10px] text-slate-400 text-center p-1 rounded">
              <span className="font-bold text-slate-600">STUDENT PASSPORT</span>
            </div>
          </div>

          {/* Banner Title */}
          <div className="mt-2.5 bg-blue-950 text-white font-extrabold py-1 px-3 text-xs sm:text-sm uppercase tracking-wider rounded flex items-center justify-between">
            <span>TERMLY CONTINUOUS ASSESSMENT & EXAMINATION REPORT SHEET</span>
            <span className="text-amber-400">{schoolProfile.currentSession} ACADEMIC SESSION</span>
          </div>
        </div>

        {/* 2. Student Biodata / Academic Profile Grid */}
        <div className="bg-slate-50 border border-slate-300 rounded p-2.5 mb-3 text-xs leading-relaxed">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1.5">
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">STUDENT NAME:</span>
              <span className="font-bold text-slate-900 text-sm uppercase">{student.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">ADMISSION NUMBER:</span>
              <span className="font-mono font-bold text-slate-800">{student.admissionNo}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">CLASS:</span>
              <span className="font-bold text-blue-900">{report.classRoom.name}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">GENDER:</span>
              <span className="font-semibold text-slate-800">{student.gender}</span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">TERM:</span>
              <span className="font-bold text-amber-700 uppercase">{report.term}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">NUMBER IN CLASS:</span>
              <span className="font-bold text-slate-800">{report.totalStudentsInClass} Pupils</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">ATTENDANCE:</span>
              <span className="font-semibold text-slate-800">
                {student.timesPresent} / {student.timesSchoolOpened} days present
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">NEXT TERM RESUMPTION:</span>
              <span className="font-bold text-emerald-800">{schoolProfile.nextTermResumption}</span>
            </div>
          </div>
        </div>

        {/* 3. Academic Performance Table */}
        <div className="mb-3 overflow-hidden border border-slate-900 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-blue-950 text-white text-[11px] font-bold uppercase text-center">
                <th className="py-1.5 px-2 text-left w-36 border-r border-blue-900">SUBJECT</th>
                <th className="py-1.5 px-1 w-12 border-r border-blue-900">
                  1ST CA<br /><span className="text-[9px] text-amber-300 font-normal">({schoolProfile.ca1Max})</span>
                </th>
                <th className="py-1.5 px-1 w-12 border-r border-blue-900">
                  2ND CA<br /><span className="text-[9px] text-amber-300 font-normal">({schoolProfile.ca2Max})</span>
                </th>
                <th className="py-1.5 px-1 w-14 border-r border-blue-900">
                  MID-TERM<br /><span className="text-[9px] text-sky-300 font-normal">({schoolProfile.midtermMax})</span>
                </th>
                <th className="py-1.5 px-1 w-14 border-r border-blue-900">
                  EXAM<br /><span className="text-[9px] text-emerald-300 font-normal">({schoolProfile.examMax})</span>
                </th>
                <th className="py-1.5 px-1 w-14 border-r border-blue-900 bg-blue-900">
                  TOTAL<br /><span className="text-[9px] text-white font-normal">({maxScorePerSubject})</span>
                </th>
                <th className="py-1.5 px-1 w-12 border-r border-blue-900">
                  %<br /><span className="text-[9px] text-slate-300 font-normal">(100%)</span>
                </th>
                <th className="py-1.5 px-1 w-12 border-r border-blue-900">GRADE</th>
                <th className="py-1.5 px-1 w-12 border-r border-blue-900">POS</th>
                <th className="py-1.5 px-1 w-12 border-r border-blue-900">CLASS AVG</th>
                <th className="py-1.5 px-2 text-left">REMARK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {report.subjects.map((sub, sIdx) => {
                return (
                  <tr
                    key={sub.subjectId}
                    className={`text-[11px] text-center ${sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}`}
                  >
                    <td className="py-1 px-2 text-left font-bold text-slate-900 border-r border-slate-300">
                      {sub.subjectName}
                    </td>
                    <td className="py-1 px-1 font-semibold text-slate-700 border-r border-slate-300">
                      {sub.ca1 || '-'}
                    </td>
                    <td className="py-1 px-1 font-semibold text-slate-700 border-r border-slate-300">
                      {sub.ca2 || '-'}
                    </td>
                    <td className="py-1 px-1 font-semibold text-slate-700 border-r border-slate-300">
                      {sub.midterm || '-'}
                    </td>
                    <td className="py-1 px-1 font-semibold text-slate-700 border-r border-slate-300">
                      {sub.exam || '-'}
                    </td>
                    <td className="py-1 px-1 font-extrabold text-blue-950 bg-blue-50/50 border-r border-slate-300">
                      {sub.total}
                    </td>
                    <td className="py-1 px-1 font-bold text-slate-800 border-r border-slate-300">
                      {sub.percentage}%
                    </td>
                    <td className="py-1 px-1 font-black border-r border-slate-300">
                      <span className={sub.grade === 'A1' ? 'text-emerald-700' : sub.grade === 'F9' ? 'text-red-600' : 'text-blue-900'}>
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-1 px-1 font-semibold text-slate-700 border-r border-slate-300">
                      {getOrdinalSuffix(sub.positionInSubject)}
                    </td>
                    <td className="py-1 px-1 text-slate-600 border-r border-slate-300">
                      {sub.classAverage}
                    </td>
                    <td className="py-1 px-2 text-left font-medium text-slate-700 text-[10px]">
                      {sub.remark}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Terminal Performance Summary Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 bg-amber-50/70 border border-amber-300 rounded p-2.5 text-xs text-center">
          <div>
            <span className="block text-[10px] uppercase font-bold text-amber-900">Total Marks Obtained</span>
            <span className="text-base sm:text-lg font-black text-blue-950">
              {report.totalScoreObtained} <span className="text-xs font-normal text-slate-600">/ {report.totalScoreObtainable}</span>
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-amber-900">Student Average</span>
            <span className="text-base sm:text-lg font-black text-emerald-700">
              {report.overallAverage}%
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-amber-900">Position in Class</span>
            <span className="text-base sm:text-lg font-black text-amber-800">
              {getOrdinalSuffix(report.classPosition)} <span className="text-xs font-normal text-slate-600">out of {report.totalStudentsInClass}</span>
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-amber-900">Academic Standing</span>
            <span className="text-sm sm:text-base font-black text-blue-900 uppercase">
              {report.decision}
            </span>
          </div>
        </div>

        {/* 5. Affective & Psychomotor Domains + Grading Scale Key */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-3 text-[10px]">
          {/* Affective Traits */}
          <div className="border border-slate-300 rounded p-2 bg-slate-50">
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-1.5 text-center bg-slate-200/70">
              AFFECTIVE DOMAIN (1 - 5)
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Punctuality:</span> <span className="font-bold text-blue-950">{student.affectiveTraits?.punctuality || 5}/5</span></div>
              <div className="flex justify-between"><span>Neatness & Cleanliness:</span> <span className="font-bold text-blue-950">{student.affectiveTraits?.neatness || 5}/5</span></div>
              <div className="flex justify-between"><span>Politeness & Manners:</span> <span className="font-bold text-blue-950">{student.affectiveTraits?.politeness || 5}/5</span></div>
              <div className="flex justify-between"><span>Honesty & Integrity:</span> <span className="font-bold text-blue-950">{student.affectiveTraits?.honesty || 5}/5</span></div>
              <div className="flex justify-between"><span>Attentiveness in Class:</span> <span className="font-bold text-blue-950">{student.affectiveTraits?.attentiveness || 4}/5</span></div>
              <div className="flex justify-between"><span>Leadership Qualities:</span> <span className="font-bold text-blue-950">{student.affectiveTraits?.leadership || 4}/5</span></div>
            </div>
          </div>

          {/* Psychomotor Skills */}
          <div className="border border-slate-300 rounded p-2 bg-slate-50">
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-1.5 text-center bg-slate-200/70">
              PSYCHOMOTOR SKILLS (1 - 5)
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Handwriting / Legibility:</span> <span className="font-bold text-blue-950">{student.psychomotorSkills?.handwriting || 4}/5</span></div>
              <div className="flex justify-between"><span>Sports & Athletic Games:</span> <span className="font-bold text-blue-950">{student.psychomotorSkills?.sportsAndGames || 4}/5</span></div>
              <div className="flex justify-between"><span>Drawing & Craft:</span> <span className="font-bold text-blue-950">{student.psychomotorSkills?.drawingAndCraft || 4}/5</span></div>
              <div className="flex justify-between"><span>Musical & Creative Skills:</span> <span className="font-bold text-blue-950">{student.psychomotorSkills?.musicalSkill || 4}/5</span></div>
              <div className="flex justify-between"><span>Verbal Fluency & Speech:</span> <span className="font-bold text-blue-950">{student.psychomotorSkills?.verbalFluency || 5}/5</span></div>
              <div className="flex justify-between"><span>Handling Tools & Equipment:</span> <span className="font-bold text-blue-950">{student.psychomotorSkills?.handlingTools || 4}/5</span></div>
            </div>
          </div>

          {/* Grading System Key */}
          <div className="border border-slate-300 rounded p-2 bg-slate-50">
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-1.5 text-center bg-slate-200/70">
              GRADING SCALE KEY
            </h4>
            <div className="space-y-0.5">
              {schoolProfile.gradingScale.map(g => (
                <div key={g.grade} className="flex justify-between items-center text-[9.5px]">
                  <span className="font-bold text-slate-800">{g.grade} ({g.minPercent}% - {Math.floor(g.maxPercent)}%):</span>
                  <span className="font-semibold text-slate-600">{g.remark}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Remarks & Signatures */}
        <div className="border-t-2 border-slate-900 pt-2.5 mt-2 space-y-2 text-xs">
          {/* Class Teacher Remark */}
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <span className="font-bold text-slate-900 uppercase text-[10px]">
                CLASS TEACHER'S REMARK ({report.classRoom.classTeacher || 'Teacher'}):
              </span>
            </div>
            <p className="font-serif italic text-slate-800 text-[11px] leading-snug">
              "{student.teacherRemark || 'A diligent and dedicated pupil with good academic conduct.'}"
            </p>
            <div className="mt-1 flex justify-end">
              <span className="font-serif text-[10px] text-slate-500 border-t border-slate-400 pt-0.5 px-3">
                Teacher's Signature
              </span>
            </div>
          </div>

          {/* Principal's Remark & Stamp */}
          <div className="bg-slate-50 p-2 rounded border border-slate-200 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <span className="font-bold text-slate-900 uppercase text-[10px]">
                PRINCIPAL'S / HEAD OF SCHOOL'S REMARK:
              </span>
            </div>
            <p className="font-serif italic text-slate-800 text-[11px] leading-snug">
              "{student.principalRemark || 'Satisfactory terminal results. Recommended to keep improving next term.'}"
            </p>

            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-300 gap-2">
              <div className="text-[10px] text-slate-700">
                <span className="font-bold block">{schoolProfile.principalName}</span>
                <span className="text-[9px] text-slate-500">Principal / Head of School</span>
              </div>

              {schoolProfile.directorName && (
                <div className="text-[10px] text-slate-700 text-center hidden sm:block">
                  <span className="font-bold block">{schoolProfile.directorName}</span>
                  <span className="text-[9px] text-slate-500">Director / Proprietor</span>
                </div>
              )}

              {/* Official Stamp Watermark */}
              <div className="border-2 border-blue-900/40 text-blue-900/60 rounded-full px-2.5 py-1 text-[8px] font-black uppercase text-center rotate-[-6deg] tracking-wider">
                RICHSOLIGHT INT'L SCHOOL<br />
                ★ OFFICIAL STAMP ★
              </div>

              <div className="text-right">
                <div className="w-24 border-b border-slate-500 mb-0.5"></div>
                <span className="text-[9px] text-slate-500">Date & Signature</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[9px] text-slate-400 mt-2 border-t border-slate-200 pt-1">
          Official Report Sheet • RICHSOLIGHT INTERNATIONAL SCHOOL • Port Harcourt, Rivers State • System Generated
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar (Hidden during actual print) */}
      <div className="no-print bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-600" />
              <span>Result Sheets & Report Cards</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Generate, customize, and print official terminal report cards for {schoolProfile.name}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="edit-remarks-btn"
              onClick={handleStartEditRemarks}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border border-slate-300"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Remarks & Comments</span>
            </button>

            <button
              id="email-report-btn"
              onClick={handleOpenEmailModal}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
              title="Dispatch Report Card via Email to Parent"
            >
              <Mail className="w-3.5 h-3.5 text-rose-600" />
              <span>Email Result</span>
            </button>

            <button
              id="print-single-report-btn"
              onClick={() => handlePrint(false)}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print This Student Result</span>
            </button>

            <button
              id="print-all-reports-btn"
              onClick={() => handlePrint(true)}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Print All Class Results ({classReports.length})</span>
            </button>
          </div>
        </div>

        {/* Selection Dropdowns & Student Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100">
          {/* Class Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Class
            </label>
            <select
              id="report-class-select"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId('');
                setEditingRemarks(false);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.section})
                </option>
              ))}
            </select>
          </div>

          {/* Student Select */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Student ({classReports.length} enrolled)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevStudent}
                disabled={studentIndex <= 0}
                className="p-2 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                title="Previous Student"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                id="report-student-select"
                value={currentReport?.student.id || ''}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setEditingRemarks(false);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
              >
                {classReports.map((rep, idx) => (
                  <option key={rep.student.id} value={rep.student.id}>
                    {getOrdinalSuffix(rep.classPosition)}: {rep.student.fullName} ({rep.student.admissionNo}) — Avg: {rep.overallAverage}%
                  </option>
                ))}
              </select>
              <button
                onClick={handleNextStudent}
                disabled={studentIndex >= classReports.length - 1}
                className="p-2 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                title="Next Student"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Remarks Editor Modal / Expandable Panel */}
        {editingRemarks && currentReport && (
          <div className="mt-5 p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" />
                <span>Customize Remarks for {currentReport.student.fullName}</span>
              </h4>
              <button
                onClick={() => setEditingRemarks(false)}
                className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Teacher's Remark
                </label>
                <textarea
                  rows={2}
                  value={tempTeacherRemark}
                  onChange={(e) => setTempTeacherRemark(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Enter custom class teacher comment..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Principal's / Head of School's Remark
                </label>
                <textarea
                  rows={2}
                  value={tempPrincipalRemark}
                  onChange={(e) => setTempPrincipalRemark(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Enter principal's observation & decision..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleSaveRemarks}
                className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Remarks</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screen Preview Container */}
      <div className="no-print">
        {classes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No classes registered</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              All class records have been cleared. Please create class arms in the Classes & Subjects tab before generating report cards.
            </p>
          </div>
        ) : classReports.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No student records found in {currentClass?.name || 'this class'}</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Add students and enter their CA1 (10), CA2 (10), Midterm (20), and Exam (40) scores to generate report cards.
            </p>
          </div>
        ) : (
          currentReport && renderReportCard(currentReport, 'preview-single')
        )}
      </div>

      {/* Dedicated Print Media Viewport Container */}
      <div className="print-only">
        {isBulkPrintMode ? (
          // Bulk Print All Students in Selected Class
          classReports.map((report, idx) => renderReportCard(report, `bulk-${idx}`))
        ) : (
          // Print Just the Currently Active Student
          currentReport && renderReportCard(currentReport, 'print-single')
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-amber-300 px-4 py-2.5 rounded-xl shadow-xl border border-amber-500/30 flex items-center gap-2 text-xs font-bold animate-fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Email Dispatch Modal */}
      {isEmailModalOpen && currentReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fade-in my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Email Terminal Report Card</h4>
                  <p className="text-[11px] text-slate-300">{currentReport.student.fullName} ({currentReport.student.admissionNo})</p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recipient Email Address: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="parent.email@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter parent, guardian, sponsor, or student email for instant dispatch.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Optional Note / Remarks:
                </label>
                <textarea
                  rows={2}
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  placeholder="e.g. Please find attached the terminal results for this academic session."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Choose Sending Method:
                </span>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleSendViaMailApp}
                    disabled={!emailRecipient}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-3.5 py-2.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                    <span>Open in Default Mail App</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyReportText}
                    type="button"
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border border-slate-300"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy Text Summary</span>
                  </button>

                  <button
                    onClick={handleShareReport}
                    type="button"
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border border-slate-300"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Share via Device</span>
                  </button>

                  <button
                    onClick={() => setIsEmailModalOpen(false)}
                    type="button"
                    className="ml-auto text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
