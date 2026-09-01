import React, { useState } from 'react';
import { ClassRoom, Subject, Student } from '../types';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  GraduationCap, 
  Users, 
  Check, 
  X,
  Layers
} from 'lucide-react';

interface ClassSubjectManagerProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  onSaveClass: (cls: ClassRoom) => void;
  onDeleteClass: (classId: string) => void;
  onSaveSubject: (sub: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onPopulateDefaultClasses?: () => void;
  onClearAllTeacherNames?: () => void;
}

export const ClassSubjectManager: React.FC<ClassSubjectManagerProps> = ({
  classes,
  subjects,
  students,
  onSaveClass,
  onDeleteClass,
  onSaveSubject,
  onDeleteSubject,
  onPopulateDefaultClasses,
  onClearAllTeacherNames,
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');

  // Class Form State
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classSection, setClassSection] = useState<ClassRoom['section']>('Junior Secondary');
  const [classTeacher, setClassTeacher] = useState('');

  // Subject Form State
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectCategory, setSubjectCategory] = useState<Subject['category']>('General');

  // Class Handlers
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassName('');
    setClassSection('Junior Secondary');
    setClassTeacher('');
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setClassSection(cls.section);
    setClassTeacher(cls.classTeacher || '');
    setIsClassModalOpen(true);
  };

  const handleSaveClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    const newClass: ClassRoom = {
      id: editingClass ? editingClass.id : `cls-${Date.now()}`,
      name: className.trim(),
      section: classSection,
      classTeacher: classTeacher.trim(),
    };
    onSaveClass(newClass);
    setIsClassModalOpen(false);
  };

  const handleDeleteClassClick = (cls: ClassRoom) => {
    const enrolled = students.filter(s => s.classId === cls.id).length;
    if (enrolled > 0) {
      if (!window.confirm(`Warning: ${cls.name} has ${enrolled} enrolled student(s). Deleting this class may affect these records. Proceed?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Delete class ${cls.name}?`)) return;
    }
    onDeleteClass(cls.id);
  };

  // Subject Handlers
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectCode('');
    setSubjectCategory('General');
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setSubjectCode(sub.code);
    setSubjectCategory(sub.category || 'General');
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectCode.trim()) return;
    const newSubject: Subject = {
      id: editingSubject ? editingSubject.id : `sub-${Date.now()}`,
      name: subjectName.trim(),
      code: subjectCode.trim().toUpperCase(),
      category: subjectCategory,
    };
    onSaveSubject(newSubject);
    setIsSubjectModalOpen(false);
  };

  const handleDeleteSubjectClick = (sub: Subject) => {
    if (window.confirm(`Are you sure you want to delete ${sub.name} [${sub.code}] from subjects?`)) {
      onDeleteSubject(sub.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Academic Curriculum Management</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure class arms, sections, assign class teachers, and configure subjects.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onPopulateDefaultClasses && (
              <button
                onClick={() => {
                  if (classes.length > 0 && !window.confirm('Reset/load all standard Nigerian school classes (Nursery, Primary, JSS, SSS)?')) {
                    return;
                  }
                  onPopulateDefaultClasses();
                }}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer border border-slate-300"
                title="Populate complete standard Nigerian curriculum classes"
              >
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Populate Standard Classes</span>
                <span className="sm:hidden">Standard Classes</span>
              </button>
            )}

            {onClearAllTeacherNames && classes.some(c => c.classTeacher) && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all teacher names across all classes?')) {
                    onClearAllTeacherNames();
                  }
                }}
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer border border-rose-200"
                title="Clear assigned teacher names for all classes"
              >
                <span>Clear Teacher Names</span>
              </button>
            )}

            {activeTab === 'classes' ? (
              <button
                onClick={handleOpenAddClass}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class Arm</span>
              </button>
            ) : (
              <button
                onClick={handleOpenAddSubject}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Subject</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Class Arms ({classes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Subjects ({subjects.length})</span>
          </button>
        </div>
      </div>

      {/* Classes List View */}
      {activeTab === 'classes' && (
        classes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-12 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No classes registered yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Register classes manually or click below to populate the complete set of standard Nursery, Primary, JSS, and SSS classes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {onPopulateDefaultClasses && (
                <button
                  onClick={onPopulateDefaultClasses}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Populate Standard Classes</span>
                </button>
              )}
              <button
                onClick={handleOpenAddClass}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class Arm Manually</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const enrolled = students.filter(s => s.classId === cls.id).length;

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {cls.section}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditClass(cls)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Class"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClassClick(cls)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-1">{cls.name}</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Class Teacher: <span className="font-semibold text-slate-800">{cls.classTeacher || 'Not Assigned'}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{enrolled} Students Enrolled</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Subjects List View */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-28">Subject Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjects.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-900">
                      <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
                        {sub.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">{sub.category || 'General'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditSubject(sub)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                          title="Edit Subject"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubjectClick(sub)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md cursor-pointer"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{editingClass ? 'Edit Class Arm' : 'Add New Class Arm'}</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveClassSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. JSS 1 Gold, SSS 2 Sapphire"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Section</label>
                <select
                  value={classSection}
                  onChange={(e) => setClassSection(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Nursery">Nursery Section</option>
                  <option value="Primary">Primary Section</option>
                  <option value="Junior Secondary">Junior Secondary (JSS)</option>
                  <option value="Senior Secondary">Senior Secondary (SSS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Class Teacher Name</label>
                <input
                  type="text"
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  placeholder="e.g. Mr. Emmanuel Okon"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  {editingClass ? 'Update Class' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSubjectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics, English Language, Physics"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MTH, ENG, PHY, BST"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={subjectCategory}
                  onChange={(e) => setSubjectCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Arts & Humanities">Arts & Humanities</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Vocation">Vocation</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
