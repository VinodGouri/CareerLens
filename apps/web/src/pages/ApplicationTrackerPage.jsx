import React, { useState } from 'react';
import { 
  CheckSquare, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  Edit3, 
  Trash2,
  List,
  Columns3,
  Award
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import MatchScoreBadge from '../components/ui/MatchScoreBadge';
import confetti from 'canvas-confetti';

const STAGES = [
  { id: 'SAVED', label: 'Saved', color: 'border-slate-500/40 text-slate-300' },
  { id: 'APPLIED', label: 'Applied', color: 'border-blue-500/40 text-blue-300' },
  { id: 'ASSESSMENT', label: 'Assessment', color: 'border-indigo-500/40 text-indigo-300' },
  { id: 'INTERVIEW', label: 'Interview', color: 'border-amber-500/40 text-amber-300' },
  { id: 'OFFER', label: 'Offer Received', color: 'border-emerald-500/40 text-emerald-300' },
  { id: 'REJECTED', label: 'Archived / Rejected', color: 'border-rose-500/40 text-rose-300' }
];

export default function ApplicationTrackerPage() {
  const { applications, updateApplicationStatus } = useCareer();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [editingAppId, setEditingAppId] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  const handleStatusChange = (appId, nextStatus) => {
    updateApplicationStatus(appId, nextStatus);
    if (nextStatus === 'OFFER') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSaveNotes = (appId) => {
    updateApplicationStatus(appId, applications.find(a => a.id === appId)?.status, editNotes);
    setEditingAppId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-brand-400" />
              Application Intelligence Tracker
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
              {applications.length} Tracked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your recruitment pipeline across LinkedIn, Indeed, Naukri, and company portals in one place.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl text-xs">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'kanban' ? 'bg-brand-600 text-white shadow-glow-primary' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" /> Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'list' ? 'bg-brand-600 text-white shadow-glow-primary' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Table List
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageApps = applications.filter(a => a.status === stage.id);
            return (
              <div key={stage.id} className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col min-h-[500px]">
                
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-bold">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards List in Stage */}
                <div className="flex-1 space-y-3">
                  {stageApps.map((app) => (
                    <div 
                      key={app.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-brand-500/40 transition-all space-y-2.5 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-semibold border border-white/5">
                          {app.source}
                        </span>
                        <MatchScoreBadge score={app.match_score || 85} size="sm" showLabel={false} />
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-xs line-clamp-1">{app.job_title}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {app.company}
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Applied: {app.applied_at}
                      </div>

                      {/* Notes Box */}
                      {editingAppId === app.id ? (
                        <div className="space-y-1.5 pt-1">
                          <textarea
                            rows={2}
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add notes..."
                            className="w-full bg-slate-950 border border-white/20 rounded-lg p-1.5 text-[11px] text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveNotes(app.id)}
                            className="w-full py-1 rounded bg-brand-600 text-[10px] font-bold text-white"
                          >
                            Save Notes
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => { setEditingAppId(app.id); setEditNotes(app.notes || ''); }}
                          className="p-2 rounded bg-black/30 border border-white/5 text-[11px] text-slate-300 italic cursor-pointer hover:bg-black/50 transition-colors"
                          title="Click to edit notes"
                        >
                          "{app.notes || 'Click to add status notes...'}"
                        </div>
                      )}

                      {/* Advance Stage Dropdown */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Move to:</span>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-slate-300 text-[10px] focus:outline-none"
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>

                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-[11px] text-slate-500">
                      Empty
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Table List View */}
      {viewMode === 'list' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 uppercase text-[10px] font-bold text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3">Role & Company</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Match</th>
                  <th className="px-5 py-3">Applied Date</th>
                  <th className="px-5 py-3">Current Status</th>
                  <th className="px-5 py-3">Interview / Screening Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-white text-xs">{app.job_title}</p>
                      <p className="text-[11px] text-slate-400">{app.company} · {app.location}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-semibold border border-white/5">
                        {app.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <MatchScoreBadge score={app.match_score || 85} size="sm" showLabel={false} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{app.applied_at}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px] max-w-xs truncate">
                      {app.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
