'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './jobs.module.css';
import Toast from '@/components/UI/Toast/Toast';
import JobForm from '@/components/Career/JobForm';

export default function CareerOfficeJobs() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    featured: 'all'
  });
  const [sortBy, setSortBy] = useState('newest');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isAddingJob, setIsAddingJob] = useState(true);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [applicationsList, setApplicationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  // Form state for add/edit
  const [formState, setFormState] = useState({
    title: '', company: '', location: '', type: 'Full-time', salary: '', deadline: '', description: '', requirements: '', featured: false, status: 'Active'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  // Real-time listener for jobs from Firestore
  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      return;
    }
    
    const jobsQuery = query(
      collection(firebaseDb, 'jobs')
    );
    
    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          applications: doc.data().applications || 0
        }))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
      setJobs(jobsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Real-time listener for applications from Firestore
  useEffect(() => {
    if (!firebaseDb) return;
    
    const appsQuery = query(
      collection(firebaseDb, 'applications')
    );
    
    const unsubscribe = onSnapshot(appsQuery, (snapshot) => {
      const appsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
      setApplicationsList(appsData);
    }, (error) => {
      console.error('Error fetching applications:', error);
    });
    
    return () => unsubscribe();
  }, []);

  // Handle add new job - quick POST of a minimal example job for admin convenience
  const handleAddNewJob = async () => {
    const newJob = {
      title: 'New Job Title',
      company: 'New Company',
  location: 'Manila, Philippines (Remote)',
      type: 'Full-time',
      salary: '',
      posted: new Date().toISOString().slice(0,10),
      deadline: '',
      status: 'Active',
      applications: 0,
      description: 'New job description...',
      requirements: [],
      featured: false
    };
    try {
      const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newJob) });
      if (res.ok) {
        const created = await res.json();
        setJobs(prev => [...prev, created]);
        setSelectedJob(created);
        setIsAddingJob(false);
      }
    } catch (err) {
      console.error('Failed to post job', err);
    }
    }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    // Search term filter
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = filters.status === 'all' || job.status.toLowerCase() === filters.status.toLowerCase();
    
    // Type filter
    const matchesType = filters.type === 'all' || job.type.toLowerCase() === filters.type.toLowerCase();
    
    // Featured filter
    const matchesFeatured = filters.featured === 'all' || 
                           (filters.featured === 'featured' && job.featured) ||
                           (filters.featured === 'regular' && !job.featured);
    
    return matchesSearch && matchesStatus && matchesType && matchesFeatured;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.posted) - new Date(a.posted);
      case 'oldest':
        return new Date(a.posted) - new Date(b.posted);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'applications':
        return b.applications - a.applications;
      default:
        return 0;
    }
  });

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return styles.statusActive;
      case 'closed': return styles.statusClosed;
      case 'draft': return styles.statusDraft;
      default: return '';
    }
  };

  // Handle job selection
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setIsEditingJob(false);
  };

  // When opening add/edit form, populate formState
  useEffect(() => {
    if (isAddingJob) {
      setFormState({ title: '', company: '', location: '', type: 'Full-time', salary: '', deadline: '', description: '', requirements: '', featured: false, status: 'Active' });
      setFormError(''); setFormSuccess('');
    }
    if (isEditingJob && selectedJob) {
      setFormState({
        title: selectedJob.title || '',
        company: selectedJob.company || '',
        location: selectedJob.location || '',
        type: selectedJob.type || 'Full-time',
        salary: selectedJob.salary || '',
        deadline: selectedJob.deadline || '',
        description: selectedJob.description || '',
        requirements: (selectedJob.requirements || []).join('\n'),
        featured: !!selectedJob.featured,
        status: selectedJob.status || 'Active'
      });
      setFormError(''); setFormSuccess('');
    }
  }, [isAddingJob, isEditingJob, selectedJob]);

  // (Posting handled by async handleAddNewJob defined above)

  // Handle edit job
  const handleEditJob = () => {
    setIsEditingJob(true);
  };

  // Handle submit job form (for posting new jobs)
  const handleSubmitJob = async ({ isEdit = false } = {}) => {
    setFormError(''); setFormSuccess('');
    // basic client-side validation
    if (!formState.title || !formState.company) {
      setFormError('Please provide at least a job title and company.');
      return;
    }
    setFormLoading(true);
    try {
      const requirements = String(formState.requirements || '').split('\n').map(s => s.trim()).filter(Boolean);
      const payload = {
        title: formState.title,
        company: formState.company,
        location: formState.location,
        type: formState.type,
        salary: formState.salary,
        posted: new Date().toISOString().slice(0,10),
        deadline: formState.deadline,
        status: formState.status,
        applications: isEdit && selectedJob ? selectedJob.applications : 0,
        description: formState.description,
        requirements,
        featured: !!formState.featured
      };

      if (isEdit && selectedJob) {
        const res = await fetch(`/api/jobs/${selectedJob.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          const updated = await res.json();
          setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
          setSelectedJob(updated);
          setFormSuccess('Job updated successfully.');
          // Toast
        } else {
          setFormError('Failed to update job.');
        }
      } else {
        const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          const created = await res.json();
          setJobs(prev => [...prev, created]);
          setSelectedJob(created);
          setIsAddingJob(false);
          setFormSuccess('Job posted successfully.');
        } else {
          setFormError('Failed to create job.');
        }
      }
    } catch (err) {
      console.error('Error submitting job form', err);
      setFormError('An unexpected error occurred.');
    } finally {
      setFormLoading(false);
      setTimeout(() => setFormSuccess(''), 3000);
    }
  };


  // Handle close job detail
  const handleCloseJobDetail = () => {
    setSelectedJob(null);
    setIsAddingJob(false);
    setIsEditingJob(false);
  };

  // Change job status (Close / Reopen)
  const handleChangeJobStatus = async (job, newStatus) => {
    if (!job) return;
    setFormError(''); setFormSuccess(''); setFormLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (res.ok) {
        const updated = await res.json();
        setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
        setSelectedJob(updated);
        setFormSuccess(`Job ${newStatus === 'Closed' ? 'closed' : 'reopened'} successfully.`);
      } else {
        setFormError('Failed to update job status.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Error updating job status.');
    } finally {
      setFormLoading(false);
      setTimeout(() => setFormSuccess(''), 3000);
    }
  };

  // Delete job
  const handleDeleteJob = async (job) => {
    if (!job) return;
    if (!confirm('Delete this job? This action cannot be undone.')) return;
    setFormError(''); setFormSuccess(''); setFormLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== job.id));
        setSelectedJob(null);
        setFormSuccess('Job deleted.');
      } else {
        setFormError('Failed to delete job.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Error deleting job.');
    } finally {
      setFormLoading(false);
      setTimeout(() => setFormSuccess(''), 3000);
    }
  };
  return (
    <DashboardLayout userType="career-office">
      <Toast message={formSuccess || formError} type={formError ? 'error' : 'success'} />
      <div className={styles.jobsContainer}>
          <div className={styles.jobsHeader}>
            <h1 className={styles.jobsTitle}>Job Management</h1>
            {/* Only show header 'Post New Job' when no job is selected and form is not open */}
            {!(isAddingJob || isEditingJob || selectedJob) && (
              <button 
                className={`btn ${styles.addJobButton}`}
                onClick={() => { setIsAddingJob(true); setSelectedJob(null); }}
              >
                Post New Job
              </button>
            )}
          </div>

        <div className={styles.jobsContent}>
          {/* Left Panel - Filters */}
          <div className={styles.filtersPanel}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button 
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Status</h3>
              <select
                className={styles.filterSelect}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Job Type</h3>
              <select
                className={styles.filterSelect}
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Featured</h3>
              <select
                className={styles.filterSelect}
                value={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
              >
                <option value="all">All Jobs</option>
                <option value="featured">Featured Only</option>
                <option value="regular">Regular Only</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Sort By</h3>
              <select
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="applications">Most Applications</option>
              </select>
            </div>

            <button 
              className={styles.clearFiltersButton}
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  status: 'all',
                  type: 'all',
                  featured: 'all'
                });
                setSortBy('newest');
              }}
            >
              Clear All Filters
            </button>
          </div>

          {/* Middle Panel - Jobs List */}
          <div className={styles.jobsList}>
            <div className={styles.jobsListHeader}>
              <div className={styles.jobsCount}>
                {sortedJobs.length} {sortedJobs.length === 1 ? 'job' : 'jobs'} found
              </div>
            </div>

            {sortedJobs.length > 0 ? (
              <div className={styles.jobsGrid}>
                {sortedJobs.map(job => (
                  <div 
                    key={job.id} 
                    className={`${styles.jobCard} ${selectedJob?.id === job.id ? styles.selectedJob : ''}`}
                    onClick={() => handleJobSelect(job)}
                  >
                    <div className={styles.jobCardHeader}>
                      <h3 className={styles.jobCardTitle}>{job.title}</h3>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className={styles.jobCardCompany}>{job.company}</div>
                    <div className={styles.jobCardLocation}>{job.location}</div>
                    <div className={styles.jobCardDetails}>
                      <div className={styles.jobCardDetail}>
                        <span className={styles.detailLabel}>Type:</span> {job.type}
                      </div>
                      <div className={styles.jobCardDetail}>
                        <span className={styles.detailLabel}>Salary:</span> {job.salary}
                      </div>
                    </div>
                    <div className={styles.jobCardFooter}>
                      <div className={styles.jobCardMeta}>
                        <div>Posted: {formatDate(job.posted)}</div>
                        <div>Applications: {job.applications}</div>
                      </div>
                      {job.featured && (
                        <div className={styles.featuredBadge}>Featured</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noJobs}>
                <div className={styles.noJobsIcon}>🔍</div>
                <h3>No jobs found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Mobile overlay */}
          <div 
            className={`${styles.jobDetailOverlay} ${(selectedJob || isAddingJob) ? styles.active : ''}`}
            onClick={handleCloseJobDetail}
          />

          {/* Right Panel - Job Detail */}
          <div className={`${styles.jobDetail} ${(selectedJob || isAddingJob) ? styles.jobDetailActive : ''}`}>
            {selectedJob && !isAddingJob && !isEditingJob && (
              <div className={styles.jobDetailContent}>
                <div className={styles.jobDetailHeader}>
                  <button 
                    className={styles.closeButton}
                    onClick={handleCloseJobDetail}
                  >
                    ×
                  </button>
                  <h2 className={styles.jobDetailTitle}>{selectedJob.title}</h2>
                  <div className={styles.jobDetailCompany}>{selectedJob.company}</div>
                  <div className={styles.jobDetailLocation}>{selectedJob.location}</div>
                  <div className={styles.jobDetailMeta}>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedJob.status)}`}>
                      {selectedJob.status}
                    </span>
                    <span className={styles.jobType}>{selectedJob.type}</span>
                    {selectedJob.featured && (
                      <span className={styles.featuredBadge}>Featured</span>
                    )}
                  </div>
                </div>

                <div className={styles.jobDetailBody}>
                  <div className={styles.jobDetailSection}>
                    <h3 className={styles.sectionTitle}>Job Details</h3>
                    <div className={styles.jobDetailItem}>
                      <span className={styles.detailLabel}>Salary:</span>
                      <span>{selectedJob.salary}</span>
                    </div>
                    <div className={styles.jobDetailItem}>
                      <span className={styles.detailLabel}>Posted:</span>
                      <span>{formatDate(selectedJob.posted)}</span>
                    </div>
                    <div className={styles.jobDetailItem}>
                      <span className={styles.detailLabel}>Application Deadline:</span>
                      <span>{formatDate(selectedJob.deadline)}</span>
                    </div>
                    <div className={styles.jobDetailItem}>
                      <span className={styles.detailLabel}>Applications:</span>
                      <span>{selectedJob.applications}</span>
                    </div>
                  </div>

                  <div className={styles.jobDetailSection}>
                    <h3 className={styles.sectionTitle}>Description</h3>
                    <p className={styles.jobDescription}>{selectedJob.description}</p>
                  </div>

                  <div className={styles.jobDetailSection}>
                    <h3 className={styles.sectionTitle}>Requirements</h3>
                    <ul className={styles.requirementsList}>
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index} className={styles.requirementItem}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div id="applicants" className={styles.jobDetailSection}>
                    <h3 className={styles.sectionTitle}>Applicants</h3>
                    {applicationsList.filter(a => Number(a.jobId) === Number(selectedJob.id)).length === 0 ? (
                      <p>No applicants yet.</p>
                    ) : (
                      <ul className={styles.requirementsList}>
                        {applicationsList.filter(a => Number(a.jobId) === Number(selectedJob.id)).map(app => (
                          <li key={app.id} className={styles.requirementItem}>
                            <div>
                              <strong>Application #{app.id}</strong>
                            </div>
                            <div>
                              {app.resumeName ? (
                                <>
                                  <a href={app.resumeData} download={app.resumeName} target="_blank" rel="noreferrer">{app.resumeName}</a>
                                  {app.resumeData && app.resumeData.length > 0 ? (
                                    <span style={{ marginLeft: 8, color: '#6b7280' }}>({(app.resumeData.length * 3 / 4 / 1024 / 1024).toFixed(2)} MB)</span>
                                  ) : null}
                                </>
                              ) : (
                                <span>No resume uploaded</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className={styles.jobDetailActions}>
                    <button
                      className={`btn ${styles.editButton}`}
                      onClick={() => { setIsEditingJob(true); setIsAddingJob(false); }}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn ${styles.deleteJobButton}`}
                      onClick={() => handleDeleteJob(selectedJob)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(isAddingJob || isEditingJob) && (
              <div className={styles.jobFormContent}>
                <div className={styles.jobFormHeader}>
                  <button 
                    className={styles.closeButton}
                    onClick={handleCloseJobDetail}
                  >
                    ×
                  </button>
                  <h2 className={styles.jobFormTitle}>
                    {isAddingJob ? 'Post New Job' : 'Edit Job'}
                  </h2>
                </div>

                <JobForm formState={formState} setFormState={setFormState} onSubmit={handleSubmitJob} onCancel={handleCloseJobDetail} loading={formLoading} error={formError} isEditing={isEditingJob} />

                {/* Actions moved into the JobForm component to avoid duplication */}
                {formSuccess && <div style={{ color: 'green', marginTop: 12 }}>{formSuccess}</div>}
              </div>
            )}

            {!selectedJob && !isAddingJob && (
              <div className={styles.noJobSelected}>
                <div className={styles.noJobSelectedIcon}>👈</div>
                <h3>No job selected</h3>
                <p>Select a job from the list to view details</p>
                {/* Only show this button when the form isn't already open */}
                {!(isAddingJob || isEditingJob) && (
                  <button 
                    className={`btn ${styles.addJobButton}`}
                    onClick={() => { setIsAddingJob(true); setSelectedJob(null); }}
                  >
                    Post New Job
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}