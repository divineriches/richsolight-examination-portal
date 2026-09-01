/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SchoolProfile, ClassRoom, Subject, Student, ScoreRecord } from './types';
import { 
  initialSchoolProfile, 
  initialClasses, 
  initialSubjects, 
  initialStudents, 
  initialScores 
} from './data/initialData';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ScoreEntryMatrix } from './components/ScoreEntryMatrix';
import { ReportCardView } from './components/ReportCardView';
import { BroadsheetView } from './components/BroadsheetView';
import { StudentManager } from './components/StudentManager';
import { ClassSubjectManager } from './components/ClassSubjectManager';
import { SettingsManager } from './components/SettingsManager';

const STORAGE_KEY_PROFILE = 'richsolight_school_profile_v2';
const STORAGE_KEY_CLASSES = 'richsolight_classes_v2';
const STORAGE_KEY_SUBJECTS = 'richsolight_subjects_v2';
const STORAGE_KEY_STUDENTS = 'richsolight_students_v2';
const STORAGE_KEY_SCORES = 'richsolight_scores_v2';

export default function App() {
  // 1. App State with LocalStorage Persistence
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.examMax === 40 || !parsed.examMax)) {
          parsed.examMax = 60;
        }
        return parsed;
      }
      return initialSchoolProfile;
    } catch {
      return initialSchoolProfile;
    }
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLASSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clear any leftover sample teacher names and exclude Nursery 3 / Primary 6
          return parsed
            .filter((c: ClassRoom) => {
              const nameLower = (c.name || '').toLowerCase();
              const idLower = (c.id || '').toLowerCase();
              const isNur3 = idLower === 'cls-nur3' || nameLower.includes('nursery 3') || nameLower.includes('nursery3');
              const isPri6 = idLower === 'cls-pri6' || nameLower.includes('primary 6') || nameLower.includes('basic 6');
              return !isNur3 && !isPri6;
            })
            .map((c: ClassRoom) => ({ ...c, classTeacher: '' }));
        }
      }
      return initialClasses;
    } catch {
      return initialClasses;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBJECTS);
      return saved ? JSON.parse(saved) : initialSubjects;
    } catch {
      return initialSubjects;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [scores, setScores] = useState<ScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCORES);
      return saved ? JSON.parse(saved) : initialScores;
    } catch {
      return initialScores;
    }
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(schoolProfile));
    } catch (e) {
      console.error(e);
    }
  }, [schoolProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
    } catch (e) {
      console.error(e);
    }
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
    } catch (e) {
      console.error(e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
    } catch (e) {
      console.error(e);
    }
  }, [scores]);

  // Handlers for updating session & term
  const handleUpdateTerm = (term: 'First Term' | 'Second Term' | 'Third Term') => {
    setSchoolProfile(prev => ({ ...prev, currentTerm: term }));
  };

  const handleUpdateSession = (session: string) => {
    setSchoolProfile(prev => ({ ...prev, currentSession: session }));
  };

  // Student Actions
  const handleSaveStudent = (student: Student) => {
    setStudents(prev => {
      const index = prev.findIndex(s => s.id === student.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = student;
        return updated;
      } else {
        return [student, ...prev];
      }
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setScores(prev => prev.filter(s => s.studentId !== studentId));
  };

  const handleUpdateStudentRemark = (studentId: string, teacherRemark: string, principalRemark: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            teacherRemark,
            principalRemark,
          };
        }
        return s;
      })
    );
  };

  // Class Actions
  const handleSaveClass = (cls: ClassRoom) => {
    setClasses(prev => {
      const index = prev.findIndex(c => c.id === cls.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = cls;
        return updated;
      }
      return [...prev, cls];
    });
  };

  const handleDeleteClass = (classId: string) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
  };

  const handleClearAllTeacherNames = () => {
    setClasses(prev => prev.map(c => ({ ...c, classTeacher: '' })));
  };

  // Subject Actions
  const handleSaveSubject = (sub: Subject) => {
    setSubjects(prev => {
      const index = prev.findIndex(s => s.id === sub.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = sub;
        return updated;
      }
      return [...prev, sub];
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  };

  // Scores Action
  const handleSaveScores = (newScores: ScoreRecord[]) => {
    setScores(newScores);
  };

  // Navigation Helpers
  const handleNavigate = (tab: ActiveTab, classId?: string, studentId?: string) => {
    if (classId) setSelectedClassId(classId);
    if (studentId) setSelectedStudentId(studentId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickPrint = () => {
    setActiveTab('reports');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleRestoreAllData = (data: {
    schoolProfile: SchoolProfile;
    classes: ClassRoom[];
    subjects: Subject[];
    students: Student[];
    scores: ScoreRecord[];
  }) => {
    setSchoolProfile(data.schoolProfile);
    setClasses(data.classes);
    setSubjects(data.subjects);
    setStudents(data.students);
    setScores(data.scores);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        schoolProfile={schoolProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickPrint={handleQuickPrint}
        onUpdateTerm={handleUpdateTerm}
        onUpdateSession={handleUpdateSession}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            schoolProfile={schoolProfile}
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'scores' && (
          <ScoreEntryMatrix
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            schoolProfile={schoolProfile}
            onSaveScores={handleSaveScores}
            onNavigateToReports={(classId, studentId) => handleNavigate('reports', classId, studentId)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportCardView
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            schoolProfile={schoolProfile}
            initialClassId={selectedClassId || classes[0]?.id}
            initialStudentId={selectedStudentId}
            onUpdateStudentRemark={handleUpdateStudentRemark}
          />
        )}

        {activeTab === 'broadsheet' && (
          <BroadsheetView
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            schoolProfile={schoolProfile}
            onNavigateToStudentReport={(classId, studentId) => handleNavigate('reports', classId, studentId)}
          />
        )}

        {activeTab === 'students' && (
          <StudentManager
            students={students}
            classes={classes}
            subjects={subjects}
            scores={scores}
            schoolProfile={schoolProfile}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onNavigateToScores={(classId) => handleNavigate('scores', classId)}
            onNavigateToReport={(classId, studentId) => handleNavigate('reports', classId, studentId)}
          />
        )}

        {activeTab === 'classes-subjects' && (
          <ClassSubjectManager
            classes={classes}
            subjects={subjects}
            students={students}
            onSaveClass={handleSaveClass}
            onDeleteClass={handleDeleteClass}
            onSaveSubject={handleSaveSubject}
            onDeleteSubject={handleDeleteSubject}
            onPopulateDefaultClasses={() => setClasses(initialClasses)}
            onClearAllTeacherNames={handleClearAllTeacherNames}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManager
            schoolProfile={schoolProfile}
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            onSaveProfile={setSchoolProfile}
            onRestoreAllData={handleRestoreAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-white">{schoolProfile.name}</span> • Exam Reporting & Terminal Assessment Portal
          </div>
          <div>
            {schoolProfile.address} • Tel: {schoolProfile.phones}
          </div>
        </div>
      </footer>
    </div>
  );
}
