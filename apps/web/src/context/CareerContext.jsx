import React, { createContext, useContext, useState, useEffect } from 'react';

const CareerContext = createContext();

export function CareerProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activePersona, setActivePersona] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [learningResources, setLearningResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedExperience, setSelectedExperience] = useState('ALL');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [activeJobForAnalysis, setActiveJobForAnalysis] = useState(null);

  // Load initial profile, jobs, applications from backend API or fallback
  const refreshData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('careerlens_token');
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [profRes, jobsRes, appsRes, resRes] = await Promise.all([
        fetch('/api/v1/profile', { headers: authHeaders }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/v1/jobs', { headers: authHeaders }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/v1/applications', { headers: authHeaders }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/v1/learning/resources', { headers: authHeaders }).then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (profRes.success) setCurrentUser(profRes.data || null);
      else setCurrentUser(null);
      if (jobsRes.success && jobsRes.data?.jobs) setJobs(jobsRes.data.jobs);
      else setJobs([]);
      if (appsRes.success && Array.isArray(appsRes.data)) setApplications(appsRes.data);
      else setApplications([]);
      if (resRes.success && Array.isArray(resRes.data)) setLearningResources(resRes.data);
      else setLearningResources([]);
    } catch (err) {
      console.warn("Backend API sync notice:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activePersona]);

  // Switch persona (Fresher vs Junior Dev)
  const switchPersona = async (personaId) => {
    try {
      const res = await fetch('/api/v1/auth/switch-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: personaId })
      }).then(r => r.json());

      if (res.success) {
        setActivePersona(personaId);
        await refreshData();
      }
    } catch (e) {
      setActivePersona(personaId);
    }
  };

  // Toggle Save Job
  const toggleSaveJob = async (jobId) => {
    try {
      const isSaved = (jobs.find(j => j.id === jobId) || {}).isSaved;
      if (isSaved) {
        await fetch(`/api/v1/saved-jobs/${jobId}`, { method: 'DELETE' });
      } else {
        await fetch('/api/v1/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId })
        });
      }
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: !j.isSaved } : j));
    } catch (e) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSaved: !j.isSaved } : j));
    }
  };

  // Add to Application Tracker
  const trackApplication = async (jobId, status = 'APPLIED', notes = '') => {
    try {
      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status, notes })
      }).then(r => r.json());

      if (res.success) {
        setApplications(prev => [res.data, ...prev]);
        return res.data;
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update Application Status
  const updateApplicationStatus = async (appId, newStatus, notes) => {
    try {
      await fetch(`/api/v1/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...(notes ? { notes } : {}) })
      });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus, ...(notes ? { notes } : {}) } : a));
    } catch (e) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    }
  };

  return (
    <CareerContext.Provider value={{
      currentUser,
      setCurrentUser,
      activePersona,
      switchPersona,
      jobs,
      savedJobs,
      applications,
      learningResources,
      loading,
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
      toggleSaveJob,
      trackApplication,
      updateApplicationStatus,
      isAIChatOpen,
      setIsAIChatOpen,
      activeJobForAnalysis,
      setActiveJobForAnalysis,
      refreshData
    }}>
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) throw new Error('useCareer must be used within CareerProvider');
  return context;
}
