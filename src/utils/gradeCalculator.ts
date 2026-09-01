import { SchoolProfile, ClassRoom, Student, ScoreRecord, ComputedSubjectResult, StudentTerminalReport, Subject } from '../types';

export function getOrdinalSuffix(i: number): string {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return i + 'st';
  }
  if (j === 2 && k !== 12) {
    return i + 'nd';
  }
  if (j === 3 && k !== 13) {
    return i + 'rd';
  }
  return i + 'th';
}

export function calculateGrade(percentage: number, gradingScale: SchoolProfile['gradingScale']): { grade: string; remark: string; color: string } {
  for (const item of gradingScale) {
    if (percentage >= item.minPercent && percentage <= item.maxPercent) {
      return { grade: item.grade, remark: item.remark, color: item.color };
    }
  }
  // Fallback
  return { grade: 'F9', remark: 'FAIL', color: '#dc2626' };
}

export function computeClassReports(
  classRoom: ClassRoom,
  students: Student[],
  subjects: Subject[],
  scores: ScoreRecord[],
  schoolProfile: SchoolProfile,
  session: string,
  term: 'First Term' | 'Second Term' | 'Third Term'
): StudentTerminalReport[] {
  const classStudents = students.filter(s => s.classId === classRoom.id);
  if (classStudents.length === 0) return [];

  // Filter scores for this class, session, term
  const classScores = scores.filter(
    sc => sc.classId === classRoom.id && sc.session === session && sc.term === term
  );

  // Pre-calculate per-subject class stats
  const subjectStats: Record<string, { scores: { studentId: string; total: number }[]; avg: number; max: number; min: number }> = {};

  subjects.forEach(sub => {
    const subScoresList: { studentId: string; total: number }[] = [];
    classStudents.forEach(stu => {
      const rec = classScores.find(s => s.studentId === stu.id && s.subjectId === sub.id);
      const ca1 = rec?.ca1 ?? 0;
      const ca2 = rec?.ca2 ?? 0;
      const mid = rec?.midterm ?? 0;
      const exm = rec?.exam ?? 0;
      const tot = ca1 + ca2 + mid + exm;
      subScoresList.push({ studentId: stu.id, total: tot });
    });

    const nonZeroTotals = subScoresList.map(s => s.total);
    const sum = nonZeroTotals.reduce((a, b) => a + b, 0);
    const avg = nonZeroTotals.length > 0 ? sum / nonZeroTotals.length : 0;
    const max = nonZeroTotals.length > 0 ? Math.max(...nonZeroTotals) : 0;
    const min = nonZeroTotals.length > 0 ? Math.min(...nonZeroTotals) : 0;

    // Rank within subject
    subScoresList.sort((a, b) => b.total - a.total);

    subjectStats[sub.id] = {
      scores: subScoresList,
      avg: Number(avg.toFixed(1)),
      max,
      min,
    };
  });

  const rawReports: {
    student: Student;
    subjects: ComputedSubjectResult[];
    totalScoreObtained: number;
    totalScoreObtainable: number;
    overallAverage: number;
    gradeCounts: Record<string, number>;
  }[] = [];

  const maxSubjectScore = (schoolProfile.ca1Max || 10) + (schoolProfile.ca2Max || 10) + (schoolProfile.midtermMax || 20) + (schoolProfile.examMax || 60);

  classStudents.forEach(student => {
    const computedSubjects: ComputedSubjectResult[] = [];
    let totalScoreObtained = 0;
    const gradeCounts: Record<string, number> = {};

    subjects.forEach(sub => {
      const rec = classScores.find(s => s.studentId === student.id && s.subjectId === sub.id);
      const ca1 = rec?.ca1 ?? 0;
      const ca2 = rec?.ca2 ?? 0;
      const midterm = rec?.midterm ?? 0;
      const exam = rec?.exam ?? 0;
      const total = ca1 + ca2 + midterm + exam;
      const percentage = Number(((total / maxSubjectScore) * 100).toFixed(1));
      const { grade, remark } = calculateGrade(percentage, schoolProfile.gradingScale);

      totalScoreObtained += total;
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;

      // Find position in subject
      const stat = subjectStats[sub.id];
      const positionInSubject = stat ? stat.scores.findIndex(s => s.studentId === student.id) + 1 : 1;

      computedSubjects.push({
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        ca1,
        ca2,
        midterm,
        exam,
        total,
        percentage,
        grade,
        remark,
        classAverage: stat?.avg ?? 0,
        highestInClass: stat?.max ?? 0,
        lowestInClass: stat?.min ?? 0,
        positionInSubject: positionInSubject || 1,
      });
    });

    const totalScoreObtainable = subjects.length * maxSubjectScore;
    const overallAverage = totalScoreObtainable > 0 ? Number(((totalScoreObtained / totalScoreObtainable) * 100).toFixed(1)) : 0;

    rawReports.push({
      student,
      subjects: computedSubjects,
      totalScoreObtained,
      totalScoreObtainable,
      overallAverage,
      gradeCounts,
    });
  });

  // Sort students by totalScoreObtained descending to assign class rank
  rawReports.sort((a, b) => b.totalScoreObtained - a.totalScoreObtained);

  return rawReports.map((item, index) => {
    let decision: StudentTerminalReport['decision'] = 'PASS';
    if (item.overallAverage >= 75) decision = 'DISTINCTION';
    else if (item.overallAverage >= 50) decision = 'PROMOTED';
    else if (item.overallAverage >= 40) decision = 'PROMOTED ON TRIAL';
    else decision = 'REPEAT';

    return {
      student: item.student,
      classRoom,
      session,
      term,
      subjects: item.subjects,
      totalScoreObtained: item.totalScoreObtained,
      totalScoreObtainable: item.totalScoreObtainable,
      overallAverage: item.overallAverage,
      classPosition: index + 1,
      totalStudentsInClass: classStudents.length,
      gradeCounts: item.gradeCounts,
      decision,
    };
  });
}

export function buildPlainTextReportCardSummary(params: {
  student: Student;
  report: StudentTerminalReport;
  schoolProfile: SchoolProfile;
  customNote?: string;
}): string {
  const { student, report, schoolProfile, customNote } = params;

  let text = `=================================================\n`;
  text += `${schoolProfile.name.toUpperCase()}\n`;
  text += `${schoolProfile.motto}\n`;
  text += `${schoolProfile.address} | Tel: ${schoolProfile.phones}\n`;
  text += `=================================================\n\n`;
  text += `OFFICIAL TERMINAL REPORT CARD SUMMARY\n`;
  text += `Session: ${report.session}  |  Term: ${report.term}\n`;
  text += `Student Name: ${student.fullName}\n`;
  text += `Admission No: ${student.admissionNo}\n`;
  text += `Class: ${report.classRoom.name}\n`;
  text += `Position in Class: ${report.classPosition}${getOrdinalSuffix(report.classPosition)} out of ${report.totalStudentsInClass} students\n`;
  text += `Total Score: ${report.totalScoreObtained} / ${report.totalScoreObtainable} (${report.overallAverage}%)\n`;
  text += `Final Decision: ${report.decision}\n\n`;

  if (customNote) {
    text += `SCHOOL NOTE: ${customNote}\n\n`;
  }

  text += `-------------------------------------------------\n`;
  text += `SUBJECT PERFORMANCE BREAKDOWN:\n`;
  text += `-------------------------------------------------\n`;

  report.subjects.forEach((sub, idx) => {
    text += `${idx + 1}. ${sub.subjectName} (${sub.subjectCode}):\n`;
    text += `   CA1: ${sub.ca1} | CA2: ${sub.ca2} | Mid-Term: ${sub.midterm} | Exam: ${sub.exam} => Total: ${sub.total}/100 [Grade: ${sub.grade} - ${sub.remark}]\n`;
  });

  text += `\n-------------------------------------------------\n`;
  text += `REMARKS:\n`;
  text += `Teacher: "${student.teacherRemark || 'Good academic conduct.'}"\n`;
  text += `Principal: "${student.principalRemark || 'Promising result. Keep striving for excellence.'}"\n`;
  text += `-------------------------------------------------\n`;
  text += `Next Term Resumption: ${schoolProfile.nextTermResumption || 'To be communicated'}\n`;
  text += `=================================================\n`;

  return text;
}

