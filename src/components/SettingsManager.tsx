import React, { useState } from 'react';
import { SchoolProfile, ClassRoom, Subject, Student, ScoreRecord } from '../types';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Download, 
  Upload, 
  Building, 
  Sliders, 
  ShieldCheck
} from 'lucide-react';
import { initialSchoolProfile, initialClasses, initialSubjects, initialStudents, initialScores } from '../data/initialData';

interface SettingsManagerProps {
  schoolProfile: SchoolProfile;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: ScoreRecord[];
  onSaveProfile: (profile: SchoolProfile) => void;
  onRestoreAllData: (data: {
    schoolProfile: SchoolProfile;
    classes: ClassRoom[];
    subjects: Subject[];
    students: Student[];
    scores: ScoreRecord[];
  }) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  schoolProfile,
  classes,
  subjects,
  students,
  scores,
  onSaveProfile,
  onRestoreAllData,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>(schoolProfile);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSuccessMessage('School settings and configuration saved successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleExportAllBackup = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      schoolProfile: formData,
      classes,
      subjects,
      students,
      scores,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RICHSOLIGHT_EXAM_PORTAL_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.schoolProfile && parsed.classes && parsed.students) {
          onRestoreAllData(parsed);
          setFormData(parsed.schoolProfile);
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file format');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-600" />
              <span>School Settings & Exam Scheme Configuration</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Customize institution profile, grading scale, term dates, and assessment weightings.
            </p>
          </div>

          {successMessage && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
              {successMessage}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. School Information Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">1. Institution & Official Contacts</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Institution / School Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                School Motto *
              </label>
              <input
                type="text"
                required
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-amber-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              School Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Phone Contacts *
              </label>
              <input
                type="text"
                required
                value={formData.phones}
                onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Director / Proprietor Name
              </label>
              <input
                type="text"
                value={formData.directorName || ''}
                onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                placeholder="e.g. Sir Richman O. Nwosu"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Principal / Head of School *
              </label>
              <input
                type="text"
                required
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Admin / Exam Officer Name
              </label>
              <input
                type="text"
                value={formData.adminName || ''}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                placeholder="e.g. Exam Officer / Admin Name"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Next Term Resumption Date *
              </label>
              <input
                type="text"
                required
                value={formData.nextTermResumption}
                onChange={(e) => setFormData({ ...formData, nextTermResumption: e.target.value })}
                placeholder="5th September 2026"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                School Website / Portal URL
              </label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="www.richsolightschools.edu.ng"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Assessment Weighting Scheme */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">2. Assessment & Exam Score Weightings</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                1st CA Max Marks
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.ca1Max}
                onChange={(e) => setFormData({ ...formData, ca1Max: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                2nd CA Max Marks
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.ca2Max}
                onChange={(e) => setFormData({ ...formData, ca2Max: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Mid-Term Test Max Marks
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.midtermMax}
                onChange={(e) => setFormData({ ...formData, midtermMax: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Terminal Exam Max Marks
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.examMax}
                onChange={(e) => setFormData({ ...formData, examMax: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
            Total Continuous Assessment & Exam Total = <strong>{formData.ca1Max + formData.ca2Max + formData.midtermMax + formData.examMax} Marks</strong> (Scale: 100%)
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save School Configuration</span>
          </button>
        </div>
      </form>

      {/* 3. Database Backup & Migration Center */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-base text-slate-900">3. Database Backup & Migration Center</h3>
        </div>

        <p className="text-xs text-slate-500">
          Securely export your portal database as a JSON backup file or restore previously saved school records.
        </p>

        {/* Current Database Statistics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Class Arms:</span>
            <span className="font-bold text-slate-900 text-sm">{classes.length}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Active Subjects:</span>
            <span className="font-bold text-slate-900 text-sm">{subjects.length}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Enrolled Students:</span>
            <span className="font-bold text-slate-900 text-sm">{students.length}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Score Entries:</span>
            <span className="font-bold text-slate-900 text-sm">{scores.length}</span>
          </div>
        </div>

        {/* Backup & Import Options */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Backup & Migration</h4>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportAllBackup}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer border border-slate-300"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export Portal Database (JSON)</span>
            </button>

            <label className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer border border-slate-300">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Import Database Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
