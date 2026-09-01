import React, { useState, useEffect } from 'react';
import { Student, ClassRoom } from '../types';
import { X, Save, User, Calendar, Phone, Award } from 'lucide-react';

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classes: ClassRoom[];
  onSave: (student: Student) => void;
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({
  isOpen,
  onClose,
  student,
  classes,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    admissionNo: '',
    gender: 'Male',
    classId: classes[0]?.id || '',
    dob: '2013-01-01',
    guardianName: '',
    guardianPhone: '',
    timesSchoolOpened: 110,
    timesPresent: 108,
    affectiveTraits: {
      punctuality: 5,
      neatness: 5,
      politeness: 5,
      honesty: 5,
      attentiveness: 4,
      relationshipWithPeers: 5,
      leadership: 4,
    },
    psychomotorSkills: {
      handwriting: 4,
      sportsAndGames: 4,
      drawingAndCraft: 4,
      musicalSkill: 3,
      verbalFluency: 4,
      handlingTools: 4,
    },
    teacherRemark: '',
    principalRemark: '',
  });

  const [activeSubTab, setActiveSubTab] = useState<'biodata' | 'traits' | 'remarks'>('biodata');

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        id: `std-${Date.now()}`,
        fullName: '',
        admissionNo: `RIS/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        gender: 'Male',
        classId: classes[0]?.id || '',
        dob: '2013-01-01',
        guardianName: '',
        guardianPhone: '',
        timesSchoolOpened: 110,
        timesPresent: 108,
        affectiveTraits: {
          punctuality: 5,
          neatness: 5,
          politeness: 5,
          honesty: 5,
          attentiveness: 4,
          relationshipWithPeers: 5,
          leadership: 4,
        },
        psychomotorSkills: {
          handwriting: 4,
          sportsAndGames: 4,
          drawingAndCraft: 4,
          musicalSkill: 3,
          verbalFluency: 4,
          handlingTools: 4,
        },
        teacherRemark: 'Diligent and studious student with good academic conduct.',
        principalRemark: 'Commendable performance this term. Strive for higher honours.',
      });
    }
  }, [student, classes, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.admissionNo || !formData.classId) {
      alert('Please fill in Student Name, Admission Number, and Class');
      return;
    }
    onSave(formData as Student);
    onClose();
  };

  const handleAffectiveChange = (key: keyof Student['affectiveTraits'], val: number) => {
    setFormData(prev => ({
      ...prev,
      affectiveTraits: {
        ...(prev.affectiveTraits as Student['affectiveTraits']),
        [key]: val,
      },
    }));
  };

  const handlePsychomotorChange = (key: keyof Student['psychomotorSkills'], val: number) => {
    setFormData(prev => ({
      ...prev,
      psychomotorSkills: {
        ...(prev.psychomotorSkills as Student['psychomotorSkills']),
        [key]: val,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-fade-in my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">
              {student ? 'Edit Student Profile' : 'Register New Student'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('biodata')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'biodata'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            1. Biodata & Academic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('traits')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'traits'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            2. Behavioral & Skills Rating
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('remarks')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'remarks'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            3. Teacher & Principal Remarks
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Subtab 1: Biodata */}
          {activeSubTab === 'biodata' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Chiemeka Divine Favour"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Admission Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNo || ''}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    placeholder="e.g. RIS/2025/001"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.classId || ''}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender || 'Male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Guardian / Parent Name
                  </label>
                  <input
                    type="text"
                    value={formData.guardianName || ''}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="e.g. Mr. & Mrs. Favour"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Guardian Phone Contact
                  </label>
                  <input
                    type="text"
                    value={formData.guardianPhone || ''}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    placeholder="e.g. 08035678901"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Parent / Guardian Email
                  </label>
                  <input
                    type="email"
                    value={formData.guardianEmail || ''}
                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                    placeholder="parent@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Times School Opened
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.timesSchoolOpened || 110}
                    onChange={(e) => setFormData({ ...formData, timesSchoolOpened: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Times Present
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.timesSchoolOpened || 110}
                    value={formData.timesPresent || 108}
                    onChange={(e) => setFormData({ ...formData, timesPresent: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subtab 2: Behavioral & Skills */}
          {activeSubTab === 'traits' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">
                  Affective Domain Rating (Scale of 1 to 5)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  {Object.keys(formData.affectiveTraits || {}).map((trait) => (
                    <div key={trait} className="flex items-center justify-between">
                      <span className="capitalize text-slate-700 font-medium">
                        {trait.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <select
                        value={(formData.affectiveTraits as any)?.[trait] || 5}
                        onChange={(e) => handleAffectiveChange(trait as any, Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900 text-xs"
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">
                  Psychomotor Skills Rating (Scale of 1 to 5)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  {Object.keys(formData.psychomotorSkills || {}).map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="capitalize text-slate-700 font-medium">
                        {skill.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <select
                        value={(formData.psychomotorSkills as any)?.[skill] || 4}
                        onChange={(e) => handlePsychomotorChange(skill as any, Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900 text-xs"
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtab 3: Remarks */}
          {activeSubTab === 'remarks' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Class Teacher's Term Remark
                </label>
                <textarea
                  rows={3}
                  value={formData.teacherRemark || ''}
                  onChange={(e) => setFormData({ ...formData, teacherRemark: e.target.value })}
                  placeholder="Enter remarks on student conduct, diligence, and academic participation..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Principal / Head of School's Remark
                </label>
                <textarea
                  rows={3}
                  value={formData.principalRemark || ''}
                  onChange={(e) => setFormData({ ...formData, principalRemark: e.target.value })}
                  placeholder="Enter executive recommendation, promotion status, and advice..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-sm transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{student ? 'Update Student' : 'Save Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
