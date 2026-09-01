import React, { useState, useMemo } from 'react';
import { Student, ClassRoom, Subject, ScoreRecord, SchoolProfile } from '../types';
import { StudentEditModal } from './StudentEditModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  GraduationCap, 
  Phone,
  CheckCircle2,
  Mail
} from 'lucide-react';

interface StudentManagerProps {
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  scores: ScoreRecord[];
  schoolProfile: SchoolProfile;
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onNavigateToScores: (classId: string) => void;
  onNavigateToReport: (classId: string, studentId: string) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  classes,
  subjects,
  scores,
  schoolProfile,
  onSaveStudent,
  onDeleteStudent,
  onNavigateToScores,
  onNavigateToReport,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(stu => {
      const matchClass = selectedClassFilter === 'all' || stu.classId === selectedClassFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        stu.fullName.toLowerCase().includes(query) || 
        stu.admissionNo.toLowerCase().includes(query) ||
        stu.guardianName?.toLowerCase().includes(query);
      return matchClass && matchSearch;
    });
  }, [students, selectedClassFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setIsModalOpen(true);
  };

  const handleDelete = (stu: Student) => {
    if (window.confirm(`Are you sure you want to remove ${stu.fullName} (${stu.admissionNo}) from the student register?`)) {
      onDeleteStudent(stu.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Student Register & Management</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Enrol students, manage admission numbers, attendance, and behavioral traits.
            </p>
          </div>

          <button
            id="add-student-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enrol New Student</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student full name or admission number (e.g. RIS/2025/001)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">All Classes ({students.length} students)</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Showing {filteredStudents.length} Students
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Active Session: {schoolProfile.currentSession}
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No students match your criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search query or class filter, or click "Enrol New Student" above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-32">Adm Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.map((student, idx) => {
                  const studentClass = classes.find(c => c.id === student.classId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-xs font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-800">
                        {student.admissionNo}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-extrabold text-xs shrink-0">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900">{student.fullName}</span>
                            <span className="text-[11px] text-slate-400 font-normal">DOB: {student.dob || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-900 text-xs">
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                          {studentClass?.name || 'Unknown Class'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {student.gender}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">{student.timesPresent}</span> / {student.timesSchoolOpened} days
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <span className="font-medium text-slate-800 block">{student.guardianName || 'N/A'}</span>
                        <div className="flex flex-col gap-0.5 text-[11px] text-slate-500">
                          {student.guardianPhone && <span>{student.guardianPhone}</span>}
                          {student.guardianEmail && <span className="font-mono text-amber-700">{student.guardianEmail}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onNavigateToReport(student.classId, student.id)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md border border-amber-200 transition-colors cursor-pointer"
                            title="View / Print Result"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigateToScores(student.classId)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
                            title="Input Scores"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
                            title="Edit Student Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md border border-red-200 transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <StudentEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={editingStudent}
        classes={classes}
        onSave={onSaveStudent}
      />
    </div>
  );
};
