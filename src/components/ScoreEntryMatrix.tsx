import React, { useState, useMemo } from 'react';
import { ClassRoom, Subject, Student, ScoreRecord, SchoolProfile } from '../types';
import { calculateGrade } from '../utils/gradeCalculator';
import { 
  FileSpreadsheet,
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  RotateCcw, 
  Download, 
  Upload, 
  Users, 
  BookOpen,
  Info
} from 'lucide-react';

interface ScoreEntryMatrixProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: ScoreRecord[];
  schoolProfile: SchoolProfile;
  onSaveScores: (newScores: ScoreRecord[]) => void;
  onNavigateToReports: (classId: string, studentId?: string) => void;
}

export const ScoreEntryMatrix: React.FC<ScoreEntryMatrixProps> = ({
  classes,
  subjects,
  students,
  scores,
  schoolProfile,
  onSaveScores,
  onNavigateToReports,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Local draft of scores for the current class/subject/session/term to allow snappy inputs
  const currentSession = schoolProfile.currentSession;
  const currentTerm = schoolProfile.currentTerm;

  const currentClass = useMemo(() => classes.find(c => c.id === selectedClassId) || classes[0], [classes, selectedClassId]);
  const currentSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId) || subjects[0], [subjects, selectedSubjectId]);
  const classStudents = useMemo(() => students.filter(s => s.classId === selectedClassId), [students, selectedClassId]);

  // Handler for individual student score changes
  const handleScoreChange = (
    studentId: string,
    field: 'ca1' | 'ca2' | 'midterm' | 'exam',
    valueStr: string
  ) => {
    let val: number | null = valueStr === '' ? null : Number(valueStr);
    
    // Bounds check
    if (val !== null) {
      if (isNaN(val)) return;
      if (val < 0) val = 0;
      if (field === 'ca1' && val > schoolProfile.ca1Max) val = schoolProfile.ca1Max;
      if (field === 'ca2' && val > schoolProfile.ca2Max) val = schoolProfile.ca2Max;
      if (field === 'midterm' && val > schoolProfile.midtermMax) val = schoolProfile.midtermMax;
      if (field === 'exam' && val > schoolProfile.examMax) val = schoolProfile.examMax;
    }

    const updated = [...scores];
    const existingIndex = updated.findIndex(
      s => s.studentId === studentId &&
           s.subjectId === selectedSubjectId &&
           s.classId === selectedClassId &&
           s.session === currentSession &&
           s.term === currentTerm
    );

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        [field]: val,
      };
    } else {
      updated.push({
        id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        studentId,
        subjectId: selectedSubjectId,
        classId: selectedClassId,
        session: currentSession,
        term: currentTerm,
        ca1: field === 'ca1' ? val : null,
        ca2: field === 'ca2' ? val : null,
        midterm: field === 'midterm' ? val : null,
        exam: field === 'exam' ? val : null,
      });
    }

    onSaveScores(updated);
    showSaveNotification();
  };

  const showSaveNotification = () => {
    setSaveSuccessMessage('Scores auto-saved to system');
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 2500);
  };

  // Quick fill sample scores for demo
  const handleQuickFillSample = () => {
    const updated = [...scores];
    classStudents.forEach(stu => {
      const existingIndex = updated.findIndex(
        s => s.studentId === stu.id &&
             s.subjectId === selectedSubjectId &&
             s.classId === selectedClassId &&
             s.session === currentSession &&
             s.term === currentTerm
      );

      const randomCa1 = Math.floor(Math.random() * 3) + 8; // 8 - 10
      const randomCa2 = Math.floor(Math.random() * 3) + 8; // 8 - 10
      const randomMidterm = Math.floor(Math.random() * 5) + 16; // 16 - 20
      const examCeiling = schoolProfile.examMax || 60;
      const randomExam = Math.floor(Math.random() * (examCeiling * 0.3)) + Math.floor(examCeiling * 0.7); // realistic upper range (e.g. 42 - 60)

      const record: ScoreRecord = {
        id: existingIndex >= 0 ? updated[existingIndex].id : `sc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        studentId: stu.id,
        subjectId: selectedSubjectId,
        classId: selectedClassId,
        session: currentSession,
        term: currentTerm,
        ca1: randomCa1,
        ca2: randomCa2,
        midterm: randomMidterm,
        exam: randomExam,
      };

      if (existingIndex >= 0) {
        updated[existingIndex] = record;
      } else {
        updated.push(record);
      }
    });

    onSaveScores(updated);
    setSaveSuccessMessage(`Populated realistic assessment marks for ${classStudents.length} students`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // CSV Export for class scores
  const handleExportCSV = () => {
    if (classStudents.length === 0) return;
    const maxScore = schoolProfile.ca1Max + schoolProfile.ca2Max + schoolProfile.midtermMax + schoolProfile.examMax;
    
    let csv = `Admission No,Student Name,CA1 (${schoolProfile.ca1Max}),CA2 (${schoolProfile.ca2Max}),Mid-Term (${schoolProfile.midtermMax}),Exam (${schoolProfile.examMax}),Total (${maxScore}),Percentage (%),Grade,Remark\n`;
    
    classStudents.forEach(stu => {
      const rec = scores.find(
        s => s.studentId === stu.id && s.subjectId === selectedSubjectId && s.classId === selectedClassId && s.session === currentSession && s.term === currentTerm
      );
      const ca1 = rec?.ca1 ?? '';
      const ca2 = rec?.ca2 ?? '';
      const mid = rec?.midterm ?? '';
      const exm = rec?.exam ?? '';
      const tot = (Number(ca1) || 0) + (Number(ca2) || 0) + (Number(mid) || 0) + (Number(exm) || 0);
      const pct = ((tot / maxScore) * 100).toFixed(1);
      const gradeInfo = calculateGrade(Number(pct), schoolProfile.gradingScale);

      csv += `"${stu.admissionNo}","${stu.fullName}",${ca1},${ca2},${mid},${exm},${tot},${pct}%,${gradeInfo.grade},"${gradeInfo.remark}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentClass?.name}_${currentSubject?.code}_${currentTerm.replace(' ', '_')}_Scores.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Next / Prev Subject navigation
  const currentSubIndex = subjects.findIndex(s => s.id === selectedSubjectId);
  const handlePrevSubject = () => {
    if (currentSubIndex > 0) {
      setSelectedSubjectId(subjects[currentSubIndex - 1].id);
    }
  };
  const handleNextSubject = () => {
    if (currentSubIndex < subjects.length - 1) {
      setSelectedSubjectId(subjects[currentSubIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Header & Filters */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-600" />
              <span>Score Entry & Assessment Input</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Input continuous assessment marks and examination scores for individual students.
            </p>
          </div>

          {/* Assessment Scheme Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-xs text-amber-900 font-medium">
              1st CA: <span className="font-bold text-amber-700">{schoolProfile.ca1Max} Mks</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-xs text-amber-900 font-medium">
              2nd CA: <span className="font-bold text-amber-700">{schoolProfile.ca2Max} Mks</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 text-xs text-blue-900 font-medium">
              Mid-Term: <span className="font-bold text-blue-700">{schoolProfile.midtermMax} Mks</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 text-xs text-emerald-900 font-medium">
              Exam: <span className="font-bold text-emerald-700">{schoolProfile.examMax} Mks</span>
            </div>
            <div className="bg-slate-900 text-amber-300 font-bold rounded-lg px-2.5 py-1 text-xs">
              Total: {schoolProfile.ca1Max + schoolProfile.ca2Max + schoolProfile.midtermMax + schoolProfile.examMax} Marks (100%)
            </div>
          </div>
        </div>

        {/* Dropdown Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Class Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Select Class</span>
            </label>
            <select
              id="score-class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.section})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Select Subject</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevSubject}
                disabled={currentSubIndex <= 0}
                className="p-2 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                title="Previous Subject"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                id="score-subject-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} [{sub.code}]
                  </option>
                ))}
              </select>
              <button
                onClick={handleNextSubject}
                disabled={currentSubIndex >= subjects.length - 1}
                className="p-2 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                title="Next Subject"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Academic Session */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Academic Session
            </label>
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800">
              {currentSession}
            </div>
          </div>

          {/* Current Term */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Term
            </label>
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800">
              {currentTerm}
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickFillSample}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Fill Sample Test Marks</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccessMessage && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                {saveSuccessMessage}
              </span>
            )}
            <button
              onClick={() => onNavigateToReports(selectedClassId)}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <span>View Report Cards for this Class</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Score Input Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>{currentClass?.name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-700">{currentSubject?.name}</span>
              <span className="text-xs bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">
                {currentSubject?.code}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Class Teacher: <span className="font-semibold text-slate-700">{currentClass?.classTeacher || 'Unassigned'}</span> | Total Enrolled: <span className="font-semibold text-slate-700">{classStudents.length} Students</span>
            </p>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-md text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Scores are automatically saved on input</span>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No classes registered</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              All class records have been cleared. Please add class arms in the Classes & Subjects tab before entering scores.
            </p>
          </div>
        ) : classStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No students found in {currentClass?.name || 'this class'}</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Add students to this class in the Students tab to start recording their Continuous Assessment and Exam scores.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">S/N</th>
                  <th className="py-3 px-4 w-32">Admission No</th>
                  <th className="py-3 px-4 min-w-[180px]">Student Full Name</th>
                  <th className="py-3 px-3 text-center bg-amber-50/50 w-24">
                    CA 1 <span className="block text-[10px] text-amber-700 font-normal">Max {schoolProfile.ca1Max}</span>
                  </th>
                  <th className="py-3 px-3 text-center bg-amber-50/50 w-24">
                    CA 2 <span className="block text-[10px] text-amber-700 font-normal">Max {schoolProfile.ca2Max}</span>
                  </th>
                  <th className="py-3 px-3 text-center bg-blue-50/50 w-28">
                    Mid-Term <span className="block text-[10px] text-blue-700 font-normal">Max {schoolProfile.midtermMax}</span>
                  </th>
                  <th className="py-3 px-3 text-center bg-emerald-50/50 w-28">
                    Exam <span className="block text-[10px] text-emerald-700 font-normal">Max {schoolProfile.examMax}</span>
                  </th>
                  <th className="py-3 px-3 text-center bg-slate-200/60 w-24">
                    Total <span className="block text-[10px] text-slate-600 font-normal">Max 80</span>
                  </th>
                  <th className="py-3 px-3 text-center bg-slate-200/60 w-24">
                    % Eqv <span className="block text-[10px] text-slate-600 font-normal">100%</span>
                  </th>
                  <th className="py-3 px-3 text-center w-20">Grade</th>
                  <th className="py-3 px-4 text-center w-28">Remark</th>
                  <th className="py-3 px-3 text-center w-24">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {classStudents.map((student, index) => {
                  const record = scores.find(
                    s => s.studentId === student.id &&
                         s.subjectId === selectedSubjectId &&
                         s.classId === selectedClassId &&
                         s.session === currentSession &&
                         s.term === currentTerm
                  );

                  const ca1Val = record?.ca1 ?? '';
                  const ca2Val = record?.ca2 ?? '';
                  const midtermVal = record?.midterm ?? '';
                  const examVal = record?.exam ?? '';

                  const numCa1 = Number(ca1Val) || 0;
                  const numCa2 = Number(ca2Val) || 0;
                  const numMid = Number(midtermVal) || 0;
                  const numExam = Number(examVal) || 0;

                  const total = numCa1 + numCa2 + numMid + numExam;
                  const maxTotal = schoolProfile.ca1Max + schoolProfile.ca2Max + schoolProfile.midtermMax + schoolProfile.examMax;
                  const percentage = Number(((total / maxTotal) * 100).toFixed(1));
                  const gradeData = calculateGrade(percentage, schoolProfile.gradingScale);
                  const isGraded = ca1Val !== '' || ca2Val !== '' || midtermVal !== '' || examVal !== '';

                  return (
                    <tr key={student.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-4 text-center text-xs font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-semibold text-slate-700">
                        {student.admissionNo}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="block text-slate-900 text-sm font-bold">{student.fullName}</span>
                            <span className="text-[11px] text-slate-400">{student.gender}</span>
                          </div>
                        </div>
                      </td>

                      {/* CA1 Input (Max 10) */}
                      <td className="py-2.5 px-2 text-center bg-amber-50/20">
                        <input
                          id={`score-ca1-${student.id}`}
                          type="number"
                          min="0"
                          max={schoolProfile.ca1Max}
                          step="0.5"
                          value={ca1Val}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(student.id, 'ca1', e.target.value)}
                          className="w-16 mx-auto text-center font-bold text-slate-800 bg-white border border-amber-300 rounded-md py-1.5 px-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-sm"
                        />
                      </td>

                      {/* CA2 Input (Max 10) */}
                      <td className="py-2.5 px-2 text-center bg-amber-50/20">
                        <input
                          id={`score-ca2-${student.id}`}
                          type="number"
                          min="0"
                          max={schoolProfile.ca2Max}
                          step="0.5"
                          value={ca2Val}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(student.id, 'ca2', e.target.value)}
                          className="w-16 mx-auto text-center font-bold text-slate-800 bg-white border border-amber-300 rounded-md py-1.5 px-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-sm"
                        />
                      </td>

                      {/* Midterm Input (Max 20) */}
                      <td className="py-2.5 px-2 text-center bg-blue-50/20">
                        <input
                          id={`score-midterm-${student.id}`}
                          type="number"
                          min="0"
                          max={schoolProfile.midtermMax}
                          step="0.5"
                          value={midtermVal}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(student.id, 'midterm', e.target.value)}
                          className="w-16 mx-auto text-center font-bold text-blue-900 bg-white border border-blue-300 rounded-md py-1.5 px-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm"
                        />
                      </td>

                      {/* Exam Input (Max 40) */}
                      <td className="py-2.5 px-2 text-center bg-emerald-50/20">
                        <input
                          id={`score-exam-${student.id}`}
                          type="number"
                          min="0"
                          max={schoolProfile.examMax}
                          step="0.5"
                          value={examVal}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                          className="w-18 mx-auto text-center font-extrabold text-emerald-900 bg-white border border-emerald-300 rounded-md py-1.5 px-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-sm"
                        />
                      </td>

                      {/* Calculated Total (Out of 80) */}
                      <td className="py-3 px-3 text-center font-extrabold text-slate-900 bg-slate-50">
                        {isGraded ? total : '-'}
                      </td>

                      {/* Calculated Percentage (%) */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50">
                        {isGraded ? `${percentage}%` : '-'}
                      </td>

                      {/* Grade Badge */}
                      <td className="py-3 px-3 text-center">
                        {isGraded ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-extrabold text-white"
                            style={{ backgroundColor: gradeData.color }}
                          >
                            {gradeData.grade}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>

                      {/* Remark */}
                      <td className="py-3 px-4 text-center">
                        {isGraded ? (
                          <span className="text-xs font-semibold text-slate-700">
                            {gradeData.remark}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>

                      {/* View Single Student Report */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onNavigateToReports(selectedClassId, student.id)}
                          className="text-xs text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                        >
                          Result
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
