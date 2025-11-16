'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './jobs.module.css';

export default function EmployerJobs() {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    department: '',
    type: 'Full-time',
    location: 'Remote',
    salary: '',
    deadline: '',
    description: '',
    requirements: ''
  });

  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    type: 'Full-time',
    location: 'Remote',
    salary: '',
    deadline: '',
    description: '',
    requirements: ''
  });

  // Fetch jobs from Firebase on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const result = await response.json();
      const data = result.jobs || result.data || result;
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeJobs = jobs.filter(job => job.status === 'Active');
  const closedJobs = jobs.filter(job => job.status === 'Closed');
  const draftJobs = jobs.filter(job => job.status === 'Draft');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        title: newJob.title,
        company: newJob.department, // Map department to company
        location: newJob.location,
        type: newJob.type,
        salary: newJob.salary || '',
        deadline: newJob.deadline || '',
        description: newJob.description,
        requirements: newJob.requirements || '',
        applicants: 0,
        status: 'Active',
        posted: new Date().toISOString().split('T')[0]
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create job');
      }

      const createdJob = await response.json();
      setJobs(prev => [...prev, createdJob]);
      
      // Reset form
      setNewJob({
        title: '',
        department: '',
        type: 'Full-time',
        location: 'Remote',
        salary: '',
        deadline: '',
        description: '',
        requirements: ''
      });
      setShowCreateModal(false);
      
      // Show success message
      alert('Job posted successfully!');
      
      // Refresh jobs list
      fetchJobs();
    } catch (err) {
      console.error('Error creating job:', err);
      alert(`Failed to create job: ${err.message}`);
    }
  };

  const handleJobAction = async (jobId, action) => {
    try {
      const newStatus = action === 'close' ? 'Closed' : action === 'activate' ? 'Active' : null;
      if (!newStatus) return;

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      const updatedJob = await response.json();
      setJobs(prev => prev.map(job => 
        job.id === jobId ? updatedJob : job
      ));
    } catch (err) {
      console.error('Error updating job status:', err);
      alert('Failed to update job status. Please try again.');
    }
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      const response = await fetch(`/api/jobs/${jobToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      setJobs(prev => prev.filter(job => job.id !== jobToDelete.id));
      setShowDeleteModal(false);
      setJobToDelete(null);
      alert('Job deleted permanently.');
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title || '',
      department: job.department || '',
      type: job.type || 'Full-time',
      location: job.location || 'Remote',
      salary: job.salary || '',
      deadline: job.deadline || '',
      description: job.description || '',
      requirements: job.requirements || ''
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update job');
      }

      const updatedJob = await response.json();
      setJobs(prev => prev.map(job => 
        job.id === editingJob.id ? updatedJob : job
      ));
      
      setShowEditModal(false);
      setEditingJob(null);
      alert('Job updated successfully!');
    } catch (err) {
      console.error('Error updating job:', err);
      alert('Failed to update job. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingJob(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return styles.statusActive;
      case 'Closed':
        return styles.statusClosed;
      case 'Draft':
        return styles.statusDraft;
      default:
        return styles.statusDefault;
    }
  };

  const renderJobCard = (job) => (
    <div key={job.id} className={styles.jobCard}>
      <div className={styles.jobHeader}>
        <div className={styles.jobTitleSection}>
          <h3 className={styles.jobTitle}>{job.title}</h3>
          <div className={styles.jobMeta}>
            <span className={styles.jobDepartment}>{job.department}</span>
            <span className={styles.jobType}>{job.type}</span>
            <span className={styles.jobLocation}>{job.location}</span>
          </div>
        </div>
        <div className={styles.jobActions}>
          <span className={`${styles.jobStatus} ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
          <div className={styles.actionButtons}>
            <button className={styles.actionButton} title="View Details">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3C4.5 3 1.73 5.11 1 8C1.73 10.89 4.5 13 8 13C11.5 13 14.27 10.89 15 8C14.27 5.11 11.5 3 8 3Z" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
            <button className={styles.actionButton} title="Edit Job" onClick={() => handleEditClick(job)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
            {job.status === 'Active' ? (
              <button 
                className={styles.closeButton} 
                title="Close Job"
                onClick={() => handleJobAction(job.id, 'close')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            ) : job.status === 'Closed' ? (
              <>
                <button 
                  className={styles.activateButton} 
                  title="Reactivate Job"
                  onClick={() => handleJobAction(job.id, 'activate')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
                <button 
                  className={styles.deleteButton} 
                  title="Delete Permanently"
                  onClick={() => handleDeleteClick(job)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            ) : (
              <button 
                className={styles.activateButton} 
                title="Reactivate Job"
                onClick={() => handleJobAction(job.id, 'activate')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.jobDetails}>
        <div className={styles.jobInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Salary:</span>
            <span className={styles.infoValue}>{job.salary}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Posted:</span>
            <span className={styles.infoValue}>{job.posted}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Deadline:</span>
            <span className={styles.infoValue}>{job.deadline}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Applicants:</span>
            <span className={styles.applicantCount}>{job.applicants}</span>
          </div>
        </div>
        <p className={styles.jobDescription}>{job.description}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout userType="employer">
      <div className={styles.jobsContainer}>
        <div className={styles.jobsHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Job Postings</h1>
            <p className={styles.pageSubtitle}>Manage your job listings and track applications</p>
          </div>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Post New Job
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active Jobs ({activeJobs.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'closed' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('closed')}
            >
              Closed Jobs ({closedJobs.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'drafts' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('drafts')}
            >
              Drafts ({draftJobs.length})
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className={styles.jobsList}>
          {loading && (
            <div className={styles.loadingState}>
              <p>Loading jobs...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <p>Error: {error}</p>
              <button className={styles.retryButton} onClick={fetchJobs}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {activeTab === 'active' && activeJobs.map(renderJobCard)}
              {activeTab === 'closed' && closedJobs.map(renderJobCard)}
              {activeTab === 'drafts' && draftJobs.map(renderJobCard)}
              
              {((activeTab === 'active' && activeJobs.length === 0) ||
                (activeTab === 'closed' && closedJobs.length === 0) ||
                (activeTab === 'drafts' && draftJobs.length === 0)) && (
                <div className={styles.emptyState}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="12" y="20" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
                    <rect x="20" y="12" width="24" height="16" rx="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>No {activeTab} jobs found</h3>
                  <p>
                    {activeTab === 'active' && "You don't have any active job postings yet."}
                    {activeTab === 'closed' && "No closed job postings."}
                    {activeTab === 'drafts' && "No draft job postings."}
                  </p>
                  {activeTab === 'active' && (
                    <button 
                      className={styles.createButton}
                      onClick={() => setShowCreateModal(true)}
                    >
                      Post Your First Job
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Job Modal */}
        {showEditModal && (
          <div className={styles.modalOverlay} onClick={handleEditCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Edit Job</h2>
                <button 
                  className={styles.modalClose}
                  onClick={handleEditCancel}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className={styles.modalForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={editFormData.department}
                      onChange={handleEditInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Job Type *</label>
                    <select
                      name="type"
                      value={editFormData.type}
                      onChange={handleEditInputChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Location *</label>
                    <select
                      name="location"
                      value={editFormData.location}
                      onChange={handleEditInputChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Salary Range</label>
                    <input
                      type="text"
                      name="salary"
                      value={editFormData.salary}
                      onChange={handleEditInputChange}
                      className={styles.formInput}
                      placeholder="e.g., 20,000 - 30,000"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Application Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={editFormData.deadline}
                      onChange={handleEditInputChange}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Job Description *</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    className={styles.formTextarea}
                    rows="4"
                    required
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Requirements</label>
                  <textarea
                    name="requirements"
                    value={editFormData.requirements}
                    onChange={handleEditInputChange}
                    className={styles.formTextarea}
                    rows="3"
                    placeholder="List the required skills, experience, and qualifications..."
                  />
                </div>
                
                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={handleEditCancel}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Update Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className={styles.modalOverlay} onClick={handleDeleteCancel}>
            <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.confirmHeader}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.warningIcon}>
                  <circle cx="24" cy="24" r="22" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M24 14V26" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="24" cy="32" r="1.5" fill="#ef4444"/>
                </svg>
                <h2 className={styles.confirmTitle}>Delete Job Permanently?</h2>
                <p className={styles.confirmMessage}>
                  Are you sure you want to permanently delete <strong>{jobToDelete?.title}</strong>? 
                  This action cannot be undone and all associated data will be lost.
                </p>
              </div>
              <div className={styles.confirmActions}>
                <button 
                  className={styles.confirmCancelButton}
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </button>
                <button 
                  className={styles.confirmDeleteButton}
                  onClick={handleDeleteConfirm}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Post New Job</h2>
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreateJob} className={styles.modalForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newJob.title}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={newJob.department}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Job Type *</label>
                    <select
                      name="type"
                      value={newJob.type}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Location *</label>
                    <select
                      name="location"
                      value={newJob.location}
                      onChange={handleInputChange}
                      className={styles.formSelect}
                      required
                    >
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Salary Range</label>
                    <input
                      type="text"
                      name="salary"
                      value={newJob.salary}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      placeholder="e.g., 20,000 - 30,000"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Application Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={newJob.deadline}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Job Description *</label>
                  <textarea
                    name="description"
                    value={newJob.description}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    rows="4"
                    required
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Requirements</label>
                  <textarea
                    name="requirements"
                    value={newJob.requirements}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    rows="3"
                    placeholder="List the required skills, experience, and qualifications..."
                  />
                </div>
                
                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Post Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
