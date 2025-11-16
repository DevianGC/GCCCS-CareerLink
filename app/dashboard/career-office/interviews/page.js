'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './interviews.module.css';

export default function InterviewsPage() {
  // Mock data for interviews
  const mockInterviews = [
    {
      id: 1,
      studentName: 'Emma Johnson',
      studentId: 'S12345',
      jobTitle: 'Frontend Developer',
      companyName: 'TechCorp Inc.',
      date: '2023-06-15T10:00:00',
      duration: 45,
      status: 'scheduled',
      type: 'technical',
      location: 'Online (Zoom)',
      notes: 'Prepare questions about React experience and portfolio projects.',
      feedback: '',
    },
    {
      id: 2,
      studentName: 'Michael Chen',
      studentId: 'S12346',
      jobTitle: 'Data Analyst',
      companyName: 'DataViz Solutions',
      date: '2023-06-14T14:30:00',
      duration: 60,
      status: 'completed',
      type: 'behavioral',
      location: 'Career Office, Room 302',
      notes: 'Focus on teamwork and problem-solving scenarios.',
      feedback: 'Strong analytical skills. Could improve communication of technical concepts.',
    },
    {
      id: 3,
      studentName: 'Sophia Rodriguez',
      studentId: 'S12347',
      jobTitle: 'UX Designer',
      companyName: 'Creative Design Co.',
      date: '2023-06-16T11:00:00',
      duration: 45,
      status: 'scheduled',
      type: 'portfolio',
      location: 'Online (Microsoft Teams)',
      notes: 'Review portfolio beforehand. Prepare questions about design process.',
      feedback: '',
    },
    {
      id: 4,
      studentName: 'James Wilson',
      studentId: 'S12348',
      jobTitle: 'Backend Developer',
      companyName: 'ServerStack Ltd.',
      date: '2023-06-13T09:00:00',
      duration: 60,
      status: 'completed',
      type: 'technical',
      location: 'Career Office, Room 301',
      notes: 'Focus on database design and API development experience.',
      feedback: 'Excellent technical knowledge. Recommended for next round.',
    },
    {
      id: 5,
      studentName: 'Olivia Martinez',
      studentId: 'S12349',
      jobTitle: 'Marketing Coordinator',
      companyName: 'BrandBoost Agency',
      date: '2023-06-17T13:00:00',
      duration: 30,
      status: 'scheduled',
      type: 'behavioral',
      location: 'Phone Interview',
      notes: 'Discuss previous marketing campaign experience.',
      feedback: '',
    },
    {
      id: 6,
      studentName: 'Daniel Kim',
      studentId: 'S12350',
      jobTitle: 'Software Engineer',
      companyName: 'InnovateTech',
      date: '2023-06-12T15:00:00',
      duration: 45,
      status: 'cancelled',
      type: 'technical',
      location: 'Online (Google Meet)',
      notes: 'Company rescheduling due to interviewer availability.',
      feedback: '',
    },
  ];

  // State management
  const [interviews, setInterviews] = useState(mockInterviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateRange: '',
  });
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isAddingInterview, setIsAddingInterview] = useState(false);
  const [isEditingInterview, setIsEditingInterview] = useState(false);
  const [newInterview, setNewInterview] = useState({
    studentName: '',
    studentId: '',
    jobTitle: '',
    companyName: '',
    date: '',
    duration: 30,
    status: 'scheduled',
    type: 'technical',
    location: '',
    notes: '',
    feedback: '',
  });

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'scheduled':
        return styles.statusScheduled;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  // Filter and search interviews
  const filteredInterviews = interviews.filter((interview) => {
    // Search term filter
    const searchMatch =
      interview.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const statusMatch = filters.status ? interview.status === filters.status : true;

    // Type filter
    const typeMatch = filters.type ? interview.type === filters.type : true;

    // Date range filter (simplified for mock)
    let dateMatch = true;
    if (filters.dateRange === 'today') {
      const today = new Date().toDateString();
      dateMatch = new Date(interview.date).toDateString() === today;
    } else if (filters.dateRange === 'upcoming') {
      dateMatch = new Date(interview.date) > new Date() && interview.status === 'scheduled';
    } else if (filters.dateRange === 'past') {
      dateMatch = new Date(interview.date) < new Date() || interview.status === 'completed';
    }

    return searchMatch && statusMatch && typeMatch && dateMatch;
  });

  // Sort interviews by date (most recent first)
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // Handle interview selection
  const handleInterviewSelect = (interview) => {
    setSelectedInterview(interview);
    setIsAddingInterview(false);
    setIsEditingInterview(false);
  };

  // Handle adding new interview
  const handleAddInterview = () => {
    setSelectedInterview(null);
    setIsAddingInterview(true);
    setIsEditingInterview(false);
    setNewInterview({
      studentName: '',
      studentId: '',
      jobTitle: '',
      companyName: '',
      date: '',
      duration: 30,
      status: 'scheduled',
      type: 'technical',
      location: '',
      notes: '',
      feedback: '',
    });
  };

  // Handle editing interview
  const handleEditInterview = () => {
    setIsEditingInterview(true);
    setIsAddingInterview(false);
    setNewInterview({ ...selectedInterview });
  };

  // Handle saving interview (add or edit)
  const handleSaveInterview = () => {
    if (isAddingInterview) {
      const newId = Math.max(...interviews.map((i) => i.id)) + 1;
      const interviewToAdd = { ...newInterview, id: newId };
      setInterviews([...interviews, interviewToAdd]);
      setSelectedInterview(interviewToAdd);
    } else if (isEditingInterview) {
      const updatedInterviews = interviews.map((interview) =>
        interview.id === selectedInterview.id ? { ...newInterview } : interview
      );
      setInterviews(updatedInterviews);
      setSelectedInterview({ ...newInterview });
    }
    setIsAddingInterview(false);
    setIsEditingInterview(false);
  };

  // Handle cancelling interview
  const handleCancelInterview = () => {
    if (selectedInterview) {
      const updatedInterviews = interviews.map((interview) =>
        interview.id === selectedInterview.id
          ? { ...interview, status: 'cancelled' }
          : interview
      );
      setInterviews(updatedInterviews);
      setSelectedInterview({ ...selectedInterview, status: 'cancelled' });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInterview({ ...newInterview, [name]: value });
  };

  return (
    <DashboardLayout>
      <div className={styles.interviewsContainer}>
        <div className={styles.interviewsHeader}>
          <h1 className={styles.interviewsTitle}>Interview Management</h1>
          <button className={styles.addInterviewButton} onClick={handleAddInterview}>
            Schedule New Interview
          </button>
        </div>

        <div className={styles.interviewsContent}>
          {/* Filters Panel */}
          <div className={styles.filtersPanel}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search interviews..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Interview Type</h3>
              <select
                className={styles.filterSelect}
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="portfolio">Portfolio Review</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Date Range</h3>
              <select
                className={styles.filterSelect}
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({ ...filters, dateRange: e.target.value })
                }
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>

            {(filters.status || filters.type || filters.dateRange) && (
              <button
                className={styles.clearFiltersButton}
                onClick={() =>
                  setFilters({ status: '', type: '', dateRange: '' })
                }
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Interviews List */}
          <div className={styles.interviewsList}>
            <div className={styles.interviewsListHeader}>
              <span className={styles.interviewsCount}>
                {sortedInterviews.length} interviews found
              </span>
            </div>

            {sortedInterviews.length > 0 ? (
              <div className={styles.interviewsGrid}>
                {sortedInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className={`${styles.interviewCard} ${
                      selectedInterview?.id === interview.id
                        ? styles.selectedInterview
                        : ''
                    }`}
                    onClick={() => handleInterviewSelect(interview)}
                  >
                    <div className={styles.interviewHeader}>
                      <div className={styles.interviewDate}>
                        {formatDate(interview.date)}
                      </div>
                      <div
                        className={`${styles.interviewStatus} ${
                          getStatusClass(interview.status)
                        }`}
                      >
                        {interview.status}
                      </div>
                    </div>

                    <div className={styles.interviewTime}>
                      {formatTime(interview.date)} ({interview.duration} min)
                    </div>

                    <div className={styles.interviewStudent}>
                      <strong>{interview.studentName}</strong>
                    </div>

                    <div className={styles.interviewJob}>
                      {interview.jobTitle}
                    </div>

                    <div className={styles.interviewCompany}>
                      {interview.companyName}
                    </div>

                    <div className={styles.interviewType}>
                      Type: {interview.type}
                    </div>

                    <div className={styles.interviewLocation}>
                      {interview.location}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noInterviews}>
                <div className={styles.noInterviewsIcon}>📅</div>
                <h3>No interviews found</h3>
                <p>Try adjusting your filters or add a new interview</p>
              </div>
            )}
          </div>

          {/* Interview Detail */}
          <div
            className={`${styles.interviewDetail} ${
              selectedInterview || isAddingInterview || isEditingInterview
                ? styles.interviewDetailActive
                : ''
            }`}
          >
            {selectedInterview && !isAddingInterview && !isEditingInterview && (
              <div className={styles.interviewDetailContent}>
                <div className={styles.interviewDetailHeader}>
                  <button
                    className={styles.closeButton}
                    onClick={() => setSelectedInterview(null)}
                  >
                    ×
                  </button>
                  <h2 className={styles.interviewDetailTitle}>
                    Interview Details
                  </h2>
                  <div
                    className={`${styles.interviewDetailStatus} ${
                      getStatusClass(selectedInterview.status)
                    }`}
                  >
                    {selectedInterview.status}
                  </div>
                </div>

                <div className={styles.interviewDetailBody}>
                  <div className={styles.interviewDetailSection}>
                    <h3 className={styles.sectionTitle}>Student Information</h3>
                    <div className={styles.interviewDetailItem}>
                      <span className={styles.detailLabel}>Name:</span>
                      <span>{selectedInterview.studentName}</span>
                    </div>
                    <div className={styles.interviewDetailItem}>
                      <span className={styles.detailLabel}>Student ID:</span>
                      <span>{selectedInterview.studentId}</span>
                    </div>
                  </div>

                  <div className={styles.interviewDetailSection}>
                    <h3 className={styles.sectionTitle}>Job Information</h3>
                    <div className={styles.interviewDetailItem}>
                      <span className={styles.detailLabel}>Position:</span>
                      <span>{selectedInterview.jobTitle}</span>
                    </div>
                    <div className={styles.interviewDetailItem}>
                      <span className={styles.detailLabel}>Company:</span>
                      <span>{selectedInterview.companyName}</span>
                    </div>
                  </div>

                  <div className={styles.interviewDetailSection}>
                    <h3 className={styles.sectionTitle}>Interview Details</h3>
                    <div className={styles.interviewDetailItem}>
                      <span className={styles.detailLabel}>Date:</span>
                      <span>{formatDate(selectedInterview.date)}</span>
                    </div>
                    <div className={styles.interviewDetailItem}>
                      <span className={styles.detailLabel}>Time:</span>
                      <span>{formatTime(selectedInterview.date)}</span>
                    </div>
                    <div className={styles.interviewDetailItem}>
                      <span className={styles.detailLabel}>Duration:</span>
                      <span>{selectedInterview.duration} minutes</span>
                    </div>
                    <div className={styles.interviewDetailItem}>
                      <span className={styles.detailLabel}>Type:</span>
                      <span>{selectedInterview.type}</span>
                    </div>
                    <div className={styles.interviewDetailItem}>
                      <span className={styles.detailLabel}>Location:</span>
                      <span>{selectedInterview.location}</span>
                    </div>
                  </div>

                  <div className={styles.interviewDetailSection}>
                    <h3 className={styles.sectionTitle}>Notes</h3>
                    <div className={styles.interviewNotes}>
                      {selectedInterview.notes || 'No notes added'}
                    </div>
                  </div>

                  {selectedInterview.status === 'completed' && (
                    <div className={styles.interviewDetailSection}>
                      <h3 className={styles.sectionTitle}>Feedback</h3>
                      <div className={styles.interviewFeedback}>
                        {selectedInterview.feedback || 'No feedback provided'}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.interviewDetailActions}>
                  {selectedInterview.status === 'scheduled' && (
                    <>
                      <button
                        className={styles.editButton}
                        onClick={handleEditInterview}
                      >
                        Edit Interview
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={handleCancelInterview}
                      >
                        Cancel Interview
                      </button>
                    </>
                  )}
                  {selectedInterview.status === 'completed' && (
                    <button
                      className={styles.editButton}
                      onClick={handleEditInterview}
                    >
                      Edit Feedback
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Add/Edit Interview Form */}
            {(isAddingInterview || isEditingInterview) && (
              <div className={styles.interviewForm}>
                <div className={styles.interviewFormHeader}>
                  <button
                    className={styles.closeButton}
                    onClick={() => {
                      setIsAddingInterview(false);
                      setIsEditingInterview(false);
                    }}
                  >
                    ×
                  </button>
                  <h2 className={styles.interviewFormTitle}>
                    {isAddingInterview
                      ? 'Schedule New Interview'
                      : 'Edit Interview'}
                  </h2>
                </div>

                <div className={styles.interviewFormBody}>
                  <div className={styles.formGroup}>
                    <label htmlFor="studentName">Student Name *</label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      value={newInterview.studentName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="studentId">Student ID *</label>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={newInterview.studentId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="jobTitle">Job Title *</label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={newInterview.jobTitle}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={newInterview.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="date">Date and Time *</label>
                      <input
                        type="datetime-local"
                        id="date"
                        name="date"
                        value={newInterview.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="duration">Duration (minutes) *</label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={newInterview.duration}
                        onChange={handleInputChange}
                        min="15"
                        step="15"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="type">Interview Type *</label>
                      <select
                        id="type"
                        name="type"
                        value={newInterview.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="technical">Technical</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="portfolio">Portfolio Review</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="status">Status *</label>
                      <select
                        id="status"
                        name="status"
                        value={newInterview.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="location">Location *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={newInterview.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Online (Zoom) or Room 302"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={newInterview.notes}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>

                  {newInterview.status === 'completed' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="feedback">Feedback</label>
                      <textarea
                        id="feedback"
                        name="feedback"
                        value={newInterview.feedback}
                        onChange={handleInputChange}
                        rows="3"
                      ></textarea>
                    </div>
                  )}
                </div>

                <div className={styles.interviewFormActions}>
                  <button
                    className={styles.cancelFormButton}
                    onClick={() => {
                      setIsAddingInterview(false);
                      setIsEditingInterview(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.saveButton}
                    onClick={handleSaveInterview}
                  >
                    {isAddingInterview ? 'Schedule Interview' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {!selectedInterview && !isAddingInterview && !isEditingInterview && (
              <div className={styles.noInterviewSelected}>
                <div className={styles.noInterviewSelectedIcon}>👆</div>
                <h3>No Interview Selected</h3>
                <p>Select an interview from the list or schedule a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}