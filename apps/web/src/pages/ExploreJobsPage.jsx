import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  SlidersHorizontal, 
  Filter, 
  Sparkles,
  Layers,
  CheckCircle2,
  X,
  RefreshCw,
  TrendingUp,
  LayoutGrid,
  List,
  IndianRupee,
  ShieldCheck,
  Check,
  Zap,
  ArrowUpDown,
  Plus,
  Link as LinkIcon,
  Calendar,
  Clock
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import JobCard from '../components/jobs/JobCard';
import MatchExplanationModal from '../components/jobs/MatchExplanationModal';
import JobImportModal from '../components/jobs/JobImportModal';

export default function ExploreJobsPage() {
  const { 
    jobs, 
    searchQuery, 
    setSearchQuery,
    selectedLocation,
    setSelectedLocation,
    selectedWorkMode,
    setSelectedWorkMode,
    selectedSource,
    setSelectedSource,
    selectedExperience,
    setSelectedExperience,
    activeJobForAnalysis,
    setActiveJobForAnalysis,
    refreshData
  } = useCareer();

  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL'); // 'ALL', 'TODAY', 'PAST_3_DAYS', 'PAST_WEEK', 'PAST_MONTH'
  const [visibleLimit, setVisibleLimit] = useState(24);
  const [minSalary, setMinSalary] = useState('0');
  const [selectedSkill, setSelectedSkill] = useState('ALL');
  const [sortBy, setSortBy] = useState('match'); // 'match', 'salary', 'recent'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const locations = ['All', 'Hyderabad', 'Bangalore', 'Pune', 'Delhi NCR', 'Remote'];
  const workModes = ['ALL', 'REMOTE', 'HYBRID', 'ON_SITE'];
  const sources = ['ALL', 'Company Careers', 'LinkedIn', 'Naukri', 'Indeed', 'Wellfound'];
  const experiences = ['ALL', 'fresher', 'experienced'];
  const salaryTiers = [
    { label: 'Any Salary', value: '0' },
    { label: '₹6L+ PA', value: '600000' },
    { label: '₹8L+ PA', value: '800000' },
    { label: '₹10L+ PA', value: '1000000' },
    { label: '₹12L+ PA', value: '1200000' },
    { label: '₹15L+ PA', value: '1500000' }
  ];
  const dateOptions = [
    { id: 'ALL', label: 'All Dates' },
    { id: 'TODAY', label: 'Posted Today (24h)' },
    { id: 'PAST_3_DAYS', label: 'Past 3 Days' },
    { id: 'PAST_WEEK', label: 'Past Week' },
    { id: 'PAST_MONTH', label: 'Past Month' }
  ];
  const popularSkills = ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Python', 'Docker', 'Redis', 'Tailwind CSS'];

  // Parse salary string to numeric for sorting / filtering
  const parseSal = (s) => {
    if (!s) return 0;
    const clean = s.replace(/[₹,\s]/g, '');
    const m = clean.match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  };

  // Helper: Match date posted
  const matchesDate = (postedAt, filterKey) => {
    if (!filterKey || filterKey === 'ALL' || filterKey === 'all') return true;
    if (!postedAt) return false;
    const postedDate = new Date(postedAt);
    const now = new Date();
    const diffMs = now.getTime() - postedDate.getTime();
    const diffHours = diffMs / (1000 * 3600);
    const diffDays = diffMs / (1000 * 3600 * 24);

    if (/^\d{4}-\d{2}-\d{2}$/.test(filterKey)) {
      const jobDateStr = postedDate.toISOString().split('T')[0];
      const localJobDateStr = postedDate.toLocaleDateString('en-CA');
      return jobDateStr === filterKey || localJobDateStr === filterKey;
    }

    const key = String(filterKey).toUpperCase().trim();
    if (key === 'TODAY' || key === 'PAST_24H' || key === '24H') {
      const isTodayCalendar = postedDate.toDateString() === now.toDateString() ||
                              postedDate.toISOString().split('T')[0] === now.toISOString().split('T')[0];
      return (diffHours >= 0 && diffHours <= 24) || isTodayCalendar;
    }
    if (key === 'PAST_3_DAYS' || key === '3D') {
      return diffDays >= 0 && diffDays <= 3;
    }
    if (key === 'PAST_WEEK' || key === '7D' || key === 'WEEK') {
      return diffDays >= 0 && diffDays <= 7;
    }
    if (key === 'PAST_MONTH' || key === '30D' || key === 'MONTH') {
      return diffDays >= 0 && diffDays <= 30;
    }
    return true;
  };

  // Filter & Sort Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 1. CRITICAL: Date Posted Filter
      if (selectedDateFilter !== 'ALL') {
        if (!matchesDate(job.posted_at, selectedDateFilter)) return false;
      }

      // 2. Query filter (Supports role, company, skill, or "today" / calendar date)
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        if (q === 'today' || q === 'posted today') {
          if (!matchesDate(job.posted_at, 'TODAY')) return false;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(q)) {
          if (!matchesDate(job.posted_at, q)) return false;
        } else {
          const matchesQuery = 
            job.title.toLowerCase().includes(q) || 
            job.company.toLowerCase().includes(q) ||
            (job.required_skills || []).some(s => s.toLowerCase().includes(q)) ||
            (job.preferred_skills || []).some(s => s.toLowerCase().includes(q)) ||
            job.location.toLowerCase().includes(q);
          if (!matchesQuery) return false;
        }
      }

      // 3. Location filter
      if (selectedLocation !== 'All') {
        if (!job.location.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
      }

      // 4. Work Mode filter
      if (selectedWorkMode !== 'ALL') {
        if (job.work_mode !== selectedWorkMode) return false;
      }

      // 5. Source filter
      if (selectedSource !== 'ALL') {
        if (selectedSource === 'Company Careers') {
          if (job.source !== 'Company Careers' && !job.source?.toLowerCase().includes('career')) return false;
        } else if (job.source.toLowerCase() !== selectedSource.toLowerCase()) {
          return false;
        }
      }

      // 6. Experience filter
      if (selectedExperience === 'fresher') {
        if (job.experience_min !== 0) return false;
      } else if (selectedExperience === 'experienced') {
        if (job.experience_min === 0) return false;
      }

      // 7. Minimum Salary filter
      if (Number(minSalary) > 0) {
        const minVal = Number(minSalary);
        const salMax = job.salary_numeric_max || parseSal(job.salary_max);
        const salMin = job.salary_numeric_min || parseSal(job.salary_min);
        if (salMax < minVal && salMin < minVal) return false;
      }

      // 8. Skill filter
      if (selectedSkill !== 'ALL') {
        const sk = selectedSkill.toLowerCase();
        const hasSkill = 
          (job.required_skills || []).some(s => s.toLowerCase().includes(sk)) ||
          (job.preferred_skills || []).some(s => s.toLowerCase().includes(sk));
        if (!hasSkill) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'salary') {
        const salB = b.salary_numeric_max || parseSal(b.salary_max);
        const salA = a.salary_numeric_max || parseSal(a.salary_max);
        return salB - salA;
      }
      if (sortBy === 'recent') {
        return new Date(b.posted_at || 0) - new Date(a.posted_at || 0);
      }
      return (b.matchScore || 0) - (a.matchScore || 0);
    });
  }, [jobs, searchQuery, selectedDateFilter, selectedLocation, selectedWorkMode, selectedSource, selectedExperience, minSalary, selectedSkill, sortBy]);

  // Display subset for pagination / Load More
  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(0, visibleLimit);
  }, [filteredJobs, visibleLimit]);

  // Source Counts for Quick Pills
  const sourceCounts = useMemo(() => {
    return {
      'Company Careers': jobs.filter(j => j.source === 'Company Careers' || j.source?.toLowerCase().includes('career')).length,
      LinkedIn: jobs.filter(j => j.source === 'LinkedIn').length,
      Naukri: jobs.filter(j => j.source === 'Naukri').length,
      Indeed: jobs.filter(j => j.source === 'Indeed').length,
      Wellfound: jobs.filter(j => j.source === 'Wellfound').length
    };
  }, [jobs]);

  // Date Counts for Quick Pills
  const dateCounts = useMemo(() => {
    return {
      ALL: jobs.length,
      TODAY: jobs.filter(j => matchesDate(j.posted_at, 'TODAY')).length,
      PAST_3_DAYS: jobs.filter(j => matchesDate(j.posted_at, 'PAST_3_DAYS')).length,
      PAST_WEEK: jobs.filter(j => matchesDate(j.posted_at, 'PAST_WEEK')).length,
      PAST_MONTH: jobs.filter(j => matchesDate(j.posted_at, 'PAST_MONTH')).length
    };
  }, [jobs]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDateFilter('ALL');
    setSelectedLocation('All');
    setSelectedWorkMode('ALL');
    setSelectedSource('ALL');
    setSelectedExperience('ALL');
    setMinSalary('0');
    setSelectedSkill('ALL');
    setSortBy('match');
    setVisibleLimit(24);
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedDateFilter !== 'ALL' ||
    selectedLocation !== 'All' || 
    selectedWorkMode !== 'ALL' || 
    selectedSource !== 'ALL' || 
    selectedExperience !== 'ALL' ||
    minSalary !== '0' ||
    selectedSkill !== 'ALL';

  // Trigger Multi-Source Ingestion Sync Feed
  const handleSyncFeed = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/jobs/sync-candidate-feed', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: selectedSource !== 'ALL' ? selectedSource : undefined, count: 12 })
      }).then(r => r.json());

      if (res.success) {
        setSyncNotice({
          ingested: res.data.newlyIngestedCount,
          duplicates: res.data.duplicatesBlockedCount
        });
        await refreshData();
      }
    } catch (e) {
      console.warn("Sync fallback, refreshing data:", e);
      await refreshData();
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Title & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Explore Verified Tech Jobs
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                {filteredJobs.length} Available
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real opportunities from LinkedIn, Naukri, Indeed & Wellfound with direct application links, date filtering, and AI match scoring.
            </p>
          </div>

          {/* Ingestion Actions Bar */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Import Job URL Button */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 shadow-sm"
              title="Paste a job link from Google, Microsoft, Amazon, Razorpay, LinkedIn, Naukri, etc. to extract and score"
            >
              <Plus className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Import Job URL</span>
            </button>

            {/* Sync Live Sources Button */}
            <button
              onClick={handleSyncFeed}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:opacity-95 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 active:scale-95"
              title="Ingests fresh batches through multi-source adapters stamped with today's date"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Sources...' : 'Sync Live Sources'}</span>
            </button>
          </div>
        </div>

        {/* Sync Success Notice */}
        {syncNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Adapter Sync Complete: Ingested <strong>{syncNotice.ingested} new jobs</strong> stamped with today's date. 
                Blocked <strong>{syncNotice.duplicates} duplicates</strong> via fingerprinting.
              </span>
            </div>
            <button onClick={() => setSyncNotice(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search Input Container */}
        <div className="glass-panel p-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-2xl">
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5 text-brand-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, companies, skills, or type 'today' (e.g. Software Engineer, React, Razorpay, today)..."
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-slate-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Pills: Portal Source & Date Posted */}
      <div className="space-y-2">
        {/* Portal Source Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] whitespace-nowrap">Source:</span>
          <button
            onClick={() => setSelectedSource('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedSource === 'ALL'
                ? 'bg-brand-600 text-white shadow-glow-primary'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            All Sources ({jobs.length})
          </button>

          {[
            { id: 'Company Careers', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-600/15' },
            { id: 'LinkedIn', color: 'border-[#0077b5]/40 text-[#38bdf8] bg-[#0077b5]/15' },
            { id: 'Naukri', color: 'border-blue-500/40 text-blue-400 bg-blue-600/15' },
            { id: 'Indeed', color: 'border-indigo-500/40 text-indigo-300 bg-indigo-600/15' },
            { id: 'Wellfound', color: 'border-rose-500/40 text-rose-300 bg-rose-500/15' }
          ].map(src => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(selectedSource === src.id ? 'ALL' : src.id)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedSource === src.id
                  ? `${src.color} ring-2 ring-brand-500/50 shadow-glow-primary`
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span>{src.id}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                {sourceCounts[src.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Date Posted Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] whitespace-nowrap flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-accent-cyan" /> Date:
          </span>
          {dateOptions.map(df => {
            const isSelected = selectedDateFilter === df.id;
            const isToday = df.id === 'TODAY';
            return (
              <button
                key={df.id}
                onClick={() => {
                  setSelectedDateFilter(df.id);
                  setVisibleLimit(24);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? isToday 
                      ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300 shadow-glow-emerald ring-2 ring-emerald-500/40'
                      : 'bg-indigo-600 text-white border-indigo-500 shadow-glow-primary'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {isToday && <Sparkles className="w-3 h-3 text-emerald-400" />}
                <span>{df.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                  {dateCounts[df.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-facet Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-accent-cyan" />
            Advanced Criteria & Multi-Facet Filters
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 hover:underline"
              >
                Reset All Filters
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          
          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
              ))}
            </select>
          </div>

          {/* Work Mode Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Work Mode</label>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Modes</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site</option>
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Experience</label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Levels</option>
              <option value="fresher">Fresher (0-1 YOE)</option>
              <option value="experienced">Early Career (1-3 YOE)</option>
            </select>
          </div>

          {/* Minimum Salary Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min Salary</label>
            <select
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {salaryTiers.map(tier => (
                <option key={tier.value} value={tier.value}>{tier.label}</option>
              ))}
            </select>
          </div>

          {/* Date Posted Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date Posted</label>
            <select
              value={selectedDateFilter}
              onChange={(e) => {
                setSelectedDateFilter(e.target.value);
                setVisibleLimit(24);
              }}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-medium"
            >
              {dateOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="match">Highest Match %</option>
              <option value="recent">Most Recently Posted</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>

        </div>

        {/* Skill Filter Chips */}
        <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">Filter Skill:</span>
          <button
            onClick={() => setSelectedSkill('ALL')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
              selectedSkill === 'ALL'
                ? 'bg-brand-500/30 text-brand-300 border border-brand-500/50'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            All
          </button>
          {popularSkills.map(sk => (
            <button
              key={sk}
              onClick={() => setSelectedSkill(selectedSkill === sk ? 'ALL' : sk)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition whitespace-nowrap ${
                selectedSkill === sk
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 font-bold'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
              }`}
            >
              {sk}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header: Count & Pagination Controls */}
      {filteredJobs.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white font-bold">{displayedJobs.length}</strong> of{' '}
              <strong className="text-white font-bold">{filteredJobs.length}</strong> opportunities
            </span>
            {filteredJobs.length > 20 && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold">
                More than 20 available
              </span>
            )}
            {selectedDateFilter === 'TODAY' && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Today's Posts Only
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">View capacity:</span>
            <select
              value={visibleLimit >= filteredJobs.length ? 'ALL' : visibleLimit}
              onChange={(e) => setVisibleLimit(e.target.value === 'ALL' ? filteredJobs.length : Number(e.target.value))}
              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="20">20 jobs</option>
              <option value="40">40 jobs</option>
              <option value="60">60 jobs</option>
              <option value="ALL">All ({filteredJobs.length})</option>
            </select>
          </div>
        </div>
      )}

      {/* Jobs Grid or List View */}
      {filteredJobs.length === 0 ? (
        jobs.length === 0 ? (
          <div className="glass-panel p-10 sm:p-14 rounded-3xl text-center border border-white/10 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500/20 via-purple-500/20 to-accent-cyan/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-300 shadow-glow-primary">
              <Sparkles className="w-8 h-8 text-accent-cyan animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-extrabold text-white">No Ingested Jobs in Repository</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your candidate repository currently has no active listings. Ingest live opportunities from Company Career Portals, LinkedIn, Naukri, Indeed & Wellfound tailored directly to your profile.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSyncFeed}
                disabled={isSyncing}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:opacity-95 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing Adapters...' : 'Fetch Jobs from LinkedIn, Naukri & Indeed'}</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Import Job by URL</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No jobs match your active filters</h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedDateFilter === 'TODAY' 
                  ? "No jobs match today's date with the current criteria. Try selecting 'Past 3 Days' or 'All Dates'."
                  : "Try broadening your salary range, location, or search query."}
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs"
            >
              Reset All Filters
            </button>
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-4"
          }>
            {displayedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onAnalyze={(j) => setActiveJobForAnalysis(j)}
              />
            ))}
          </div>

          {/* Load More (+20) and Show All Pagination Controls */}
          {filteredJobs.length > visibleLimit && (
            <div className="p-6 rounded-2xl glass-panel border border-white/10 text-center flex flex-col sm:flex-row items-center justify-center gap-3 animate-fadeIn">
              <button
                onClick={() => setVisibleLimit(prev => Math.min(filteredJobs.length, prev + 20))}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:opacity-95 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Load More Jobs (+20)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
                  +{Math.min(20, filteredJobs.length - visibleLimit)} more
                </span>
              </button>
              
              <button
                onClick={() => setVisibleLimit(filteredJobs.length)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all active:scale-95"
              >
                <span>Show All {filteredJobs.length} Jobs</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Match Explanation Modal */}
      {activeJobForAnalysis && (
        <MatchExplanationModal
          job={activeJobForAnalysis}
          onClose={() => setActiveJobForAnalysis(null)}
        />
      )}

      {/* Job URL / Text Ingestion Modal */}
      <JobImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onJobIngested={() => refreshData()}
      />

    </div>
  );
}
