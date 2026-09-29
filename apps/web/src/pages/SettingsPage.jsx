import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import {
  Settings, User, Bell, Shield, Palette, Eye, LogOut,
  Mail, Phone, MapPin, Globe, ChevronRight, ToggleLeft, ToggleRight, CheckCircle, Save
} from 'lucide-react';

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette }
];

function Toggle({ enabled, onToggle, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={onToggle} className="flex-shrink-0">
        {enabled ? (
          <ToggleRight className="w-8 h-8 text-brand-400" />
        ) : (
          <ToggleLeft className="w-8 h-8 text-slate-500" />
        )}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser } = useCareer();
  const [activeTab, setActiveTab] = useState('account');
  const [saved, setSaved] = useState(false);

  const [accountForm, setAccountForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    website: currentUser?.portfolio_url || ''
  });

  const [notifications, setNotifications] = useState({
    emailJobAlerts: true,
    emailMatchUpdates: true,
    emailWeeklyDigest: false,
    pushNewJobs: true,
    pushApplicationUpdates: true,
    pushSkillReminders: false,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showMatchScores: true,
    showSkillGaps: true,
    dataCollection: true,
    thirdPartySharing: false
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark',
    compactMode: false,
    showAnimations: true,
    fontSize: 'default'
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotif = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  const togglePrivacy = (key) => setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-brand-400" />
            Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage your account, notifications, and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-semibold shadow-glow-primary hover:opacity-95 transition-all"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 hidden md:block">
          <div className="glass-panel rounded-2xl p-3 border border-white/10">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 last:mb-0 ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : ''}`} />
                  {tab.label}
                </button>
              );
            })}

            <div className="border-t border-white/10 mt-3 pt-3">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                  isActive ? 'bg-brand-500/15 text-brand-300 border-brand-500/30' : 'text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="flex-1">
          <div className="glass-panel rounded-2xl p-6 border border-white/10">

            {/* ─── Account ─── */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Account Information</h3>
                  <p className="text-xs text-slate-400">Update your personal details and contact information</p>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-xl font-bold text-white">
                    {(accountForm.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{accountForm.name || 'Your Name'}</p>
                    <p className="text-xs text-slate-400">{accountForm.email}</p>
                    <button className="text-xs text-brand-400 hover:text-brand-300 font-medium mt-1 transition-colors">
                      Change avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={accountForm.email}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={accountForm.phone}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={accountForm.location}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Portfolio / Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="url"
                      value={accountForm.website}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourportfolio.dev"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h4>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div>
                      <p className="text-sm font-medium text-white">Delete Account</p>
                      <p className="text-xs text-slate-400">Permanently remove all your data</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Notifications ─── */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Notification Preferences</h3>
                  <p className="text-xs text-slate-400">Choose how and when you want to be notified</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📧 Email Notifications</p>
                  <div className="glass-panel rounded-xl p-4 border border-white/10">
                    <Toggle enabled={notifications.emailJobAlerts} onToggle={() => toggleNotif('emailJobAlerts')} label="New Job Alerts" desc="Get notified when new high-match jobs are posted" />
                    <Toggle enabled={notifications.emailMatchUpdates} onToggle={() => toggleNotif('emailMatchUpdates')} label="Match Score Updates" desc="When your match scores change due to profile updates" />
                    <Toggle enabled={notifications.emailWeeklyDigest} onToggle={() => toggleNotif('emailWeeklyDigest')} label="Weekly Digest" desc="A weekly summary of new opportunities and insights" />
                    <Toggle enabled={notifications.marketingEmails} onToggle={() => toggleNotif('marketingEmails')} label="Product Updates" desc="Announcements about new features and improvements" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🔔 Push Notifications</p>
                  <div className="glass-panel rounded-xl p-4 border border-white/10">
                    <Toggle enabled={notifications.pushNewJobs} onToggle={() => toggleNotif('pushNewJobs')} label="New Job Matches" desc="Instant alerts for 85%+ match score jobs" />
                    <Toggle enabled={notifications.pushApplicationUpdates} onToggle={() => toggleNotif('pushApplicationUpdates')} label="Application Updates" desc="Status changes on your tracked applications" />
                    <Toggle enabled={notifications.pushSkillReminders} onToggle={() => toggleNotif('pushSkillReminders')} label="Learning Reminders" desc="Nudges to continue your skill gap courses" />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Privacy ─── */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Privacy & Data</h3>
                  <p className="text-xs text-slate-400">Control your data visibility and sharing preferences</p>
                </div>

                <div className="glass-panel rounded-xl p-4 border border-white/10">
                  <Toggle enabled={privacy.profileVisible} onToggle={() => togglePrivacy('profileVisible')} label="Profile Visibility" desc="Allow recruiters to discover your profile" />
                  <Toggle enabled={privacy.showMatchScores} onToggle={() => togglePrivacy('showMatchScores')} label="Show Match Scores" desc="Display match percentages on job cards" />
                  <Toggle enabled={privacy.showSkillGaps} onToggle={() => togglePrivacy('showSkillGaps')} label="Show Skill Gap Analysis" desc="Show detailed skill gap breakdowns" />
                  <Toggle enabled={privacy.dataCollection} onToggle={() => togglePrivacy('dataCollection')} label="Usage Analytics" desc="Help us improve by sharing anonymous usage data" />
                  <Toggle enabled={privacy.thirdPartySharing} onToggle={() => togglePrivacy('thirdPartySharing')} label="Third-Party Sharing" desc="Share profile data with partner job platforms" />
                </div>

                <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
                  <p className="text-sm font-medium text-white mb-1">📥 Download Your Data</p>
                  <p className="text-xs text-slate-400 mb-3">Get a copy of all data CareerLens has about you</p>
                  <button className="px-4 py-2 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold hover:bg-brand-500/20 transition-all">
                    Request Data Export
                  </button>
                </div>
              </div>
            )}

            {/* ─── Appearance ─── */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Appearance</h3>
                  <p className="text-xs text-slate-400">Customize your visual experience</p>
                </div>

                {/* Theme */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'dark', label: 'Dark', preview: 'bg-[#0b0f19]' },
                      { value: 'midnight', label: 'Midnight', preview: 'bg-[#0a0e1a]' },
                      { value: 'light', label: 'Light', preview: 'bg-slate-100', coming: true }
                    ].map(theme => (
                      <button
                        key={theme.value}
                        onClick={() => !theme.coming && setAppearance(prev => ({ ...prev, theme: theme.value }))}
                        className={`relative p-4 rounded-xl border transition-all ${
                          appearance.theme === theme.value
                            ? 'border-brand-500/50 bg-brand-500/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        } ${theme.coming ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-full h-12 rounded-lg mb-2 ${theme.preview} border border-white/10`} />
                        <p className="text-xs font-medium text-white">{theme.label}</p>
                        {theme.coming && (
                          <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-medium">Soon</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="glass-panel rounded-xl p-4 border border-white/10">
                  <Toggle
                    enabled={appearance.showAnimations}
                    onToggle={() => setAppearance(prev => ({ ...prev, showAnimations: !prev.showAnimations }))}
                    label="Animations & Effects"
                    desc="Micro-interactions, glows, and transitions"
                  />
                  <Toggle
                    enabled={appearance.compactMode}
                    onToggle={() => setAppearance(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                    label="Compact Mode"
                    desc="Reduce spacing for information-dense view"
                  />
                </div>

                {/* Font Size */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Font Size</p>
                  <div className="flex gap-2">
                    {['small', 'default', 'large'].map(size => (
                      <button
                        key={size}
                        onClick={() => setAppearance(prev => ({ ...prev, fontSize: size }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border capitalize transition-all ${
                          appearance.fontSize === size
                            ? 'bg-brand-500/15 border-brand-500/40 text-brand-200'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
