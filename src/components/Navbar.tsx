import React from 'react';
import { SchoolProfile } from '../types';
import { SchoolBadge } from './SchoolBadge';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Printer, 
  TableProperties, 
  Users, 
  BookOpen, 
  Settings, 
  Calendar, 
  GraduationCap,
  UserCheck
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'scores' | 'reports' | 'broadsheet' | 'students' | 'classes-subjects' | 'settings';

interface NavbarProps {
  schoolProfile: SchoolProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickPrint: () => void;
  onUpdateTerm: (term: 'First Term' | 'Second Term' | 'Third Term') => void;
  onUpdateSession: (session: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolProfile,
  activeTab,
  setActiveTab,
  onQuickPrint,
  onUpdateTerm,
  onUpdateSession,
}) => {
  const terms: ('First Term' | 'Second Term' | 'Third Term')[] = ['First Term', 'Second Term', 'Third Term'];

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Bar with School Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3.5">
            <SchoolBadge 
              logoUrl={schoolProfile.logoUrl} 
              badgeStyle={schoolProfile.badgeStyle} 
              schoolName={schoolProfile.name}
              size="md" 
              className="ring-2 ring-amber-500/40 rounded-full p-0.5 bg-slate-800" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-white flex items-center gap-2">
                  <span>{schoolProfile.name}</span>
                  <span className="hidden sm:inline-block text-xs uppercase bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                    Exam Portal
                  </span>
                </h1>
              </div>
              <p className="text-xs text-amber-400/90 font-medium tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{schoolProfile.motto}</span>
              </p>
            </div>
          </div>

          {/* Session & Term Switchers + Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Session Selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 mr-1.5 hidden sm:inline">Session:</span>
              <select
                value={schoolProfile.currentSession}
                onChange={(e) => onUpdateSession(e.target.value)}
                className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="2024/2025" className="bg-slate-800 text-white">2024/2025</option>
                <option value="2025/2026" className="bg-slate-800 text-white">2025/2026</option>
                <option value="2026/2027" className="bg-slate-800 text-white">2026/2027</option>
              </select>
            </div>

            {/* Term Selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-sky-400 shrink-0" />
              <span className="text-slate-400 mr-1.5 hidden sm:inline">Term:</span>
              <select
                value={schoolProfile.currentTerm}
                onChange={(e) => onUpdateTerm(e.target.value as any)}
                className="bg-transparent text-sky-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {terms.map((t) => (
                  <option key={t} value={t} className="bg-slate-800 text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin Indicator */}
            {schoolProfile.adminName && (
              <div 
                onClick={() => setActiveTab('settings')}
                title="Click to view/edit Admin settings"
                className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-lg px-2.5 py-1 text-xs text-slate-200 cursor-pointer transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400 shrink-0" />
                <span className="text-slate-400 mr-1 hidden lg:inline">Admin:</span>
                <span className="text-emerald-300 font-semibold truncate max-w-[130px]">{schoolProfile.adminName}</span>
              </div>
            )}

            {/* Print Results Quick Button */}
            <button
              id="navbar-quick-print-btn"
              onClick={onQuickPrint}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Results</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/80 text-xs font-medium">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-scores"
            onClick={() => setActiveTab('scores')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'scores'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Score Entry (CA1, CA2, Mid-Term, Exam)</span>
          </button>

          <button
            id="nav-tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Result Sheets & Report Cards</span>
          </button>

          <button
            id="nav-tab-broadsheet"
            onClick={() => setActiveTab('broadsheet')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'broadsheet'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5 text-purple-400" />
            <span>Master Broadsheet</span>
          </button>

          <button
            id="nav-tab-students"
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'students'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Students</span>
          </button>

          <button
            id="nav-tab-classes-subjects"
            onClick={() => setActiveTab('classes-subjects')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'classes-subjects'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Classes & Subjects</span>
          </button>

          <button
            id="nav-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500/15 text-amber-300 font-semibold border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>School Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
