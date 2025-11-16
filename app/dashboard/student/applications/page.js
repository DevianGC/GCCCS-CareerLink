'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './applications.module.css';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [viewApp, setViewApp] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time applications listener
  useEffect(() => {
    if (!firebaseDb || !currentUserId) {
      if (!currentUserId && !loading) {
        setLoading(false);
      }
      return;
    }

    try {
      const applicationsQuery = query(
        collection(firebaseDb, 'applications'),
        where('userId', '==', currentUserId)
      );

      const unsubscribe = onSnapshot(
        applicationsQuery,
        (snapshot) => {
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
          setApplications(appsData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching applications:', err);
          setError('Failed to load applications. Please try again.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up applications listener:', err);
      setError('Failed to initialize applications. Please refresh the page.');
      setLoading(false);
    }
  }, [currentUserId]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Status options for filtering
  const statusOptions = ['All', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

  // Filter applications based on status and search term
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch = 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'company') {
      comparison = a.company.localeCompare(b.company);
    } else if (sortBy === 'jobTitle') {
      comparison = a.jobTitle.localeCompare(b.jobTitle);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Applied': return styles.statusApplied;
      case 'Assessment': return styles.statusAssessment;
      case 'Interview': return styles.statusInterview;
      case 'Offer': return styles.statusOffer;
      case 'Rejected': return styles.statusRejected;
      default: return '';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Toggle sort order
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Action handlers
  const handleView = async (id) => {
    const app = applications.find(a => a.id === id);
    if (app) setViewApp(app);
  };

  // Edit functionality removed per request

  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== id));
      }
    } catch {}
  };

  return (
    <DashboardLayout>
      <div className={styles.applicationsContainer}>
        <div className={styles.applicationsHeader}>
          <h1 className={styles.applicationsTitle}>My Applications</h1>
          <button className="btn btn-primary">Track New Application</button>
        </div>

        <div className={styles.applicationsControls}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by job title or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>

          <div className={styles.filterBox}>
            <label htmlFor="statusFilter" className={styles.filterLabel}>Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.applicationsTable}>
          <div className={styles.tableHeader}>
            <div 
              className={`${styles.headerCell} ${styles.jobCell}`}
              onClick={() => handleSortChange('jobTitle')}
            >
              <span>Job</span>
              {sortBy === 'jobTitle' && (
                <span className={styles.sortIcon}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
            <div 
              className={`${styles.headerCell} ${styles.companyCell}`}
              onClick={() => handleSortChange('company')}
            >
              <span>Company</span>
              {sortBy === 'company' && (
                <span className={styles.sortIcon}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
            <div className={`${styles.headerCell} ${styles.statusCell}`}>Status</div>
            <div 
              className={`${styles.headerCell} ${styles.dateCell}`}
              onClick={() => handleSortChange('date')}
            >
              <span>Date Applied</span>
              {sortBy === 'date' && (
                <span className={styles.sortIcon}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
            <div className={`${styles.headerCell} ${styles.actionsCell}`}>Actions</div>
          </div>

          {sortedApplications.length > 0 ? (
            <div className={styles.tableBody}>
              {sortedApplications.map(application => (
                <div key={application.id} className={styles.tableRow}>
                  <div className={`${styles.tableCell} ${styles.jobCell}`}>
                    <div className={styles.jobInfo}>
                      <div className={styles.jobTitle}>{application.jobTitle}</div>
                    </div>
                  </div>
                  <div className={`${styles.tableCell} ${styles.companyCell}`}>
                    <div className={styles.companyInfo}>
                      <div className={styles.companyLogo}>
                        {/* Placeholder for company logo */}
                        <div className={styles.logoPlaceholder}>
                          {application.company.charAt(0)}
                        </div>
                      </div>
                      <div className={styles.companyName}>{application.company}</div>
                    </div>
                  </div>
                  <div className={`${styles.tableCell} ${styles.statusCell}`}>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                  <div className={`${styles.tableCell} ${styles.dateCell}`}>
                    {formatDate(application.date)}
                  </div>
                  <div className={`${styles.tableCell} ${styles.actionsCell}`}>
                    <button className={styles.actionButton} title="View Details" onClick={() => handleView(application.id)}>
                      <span>👁️</span>
                    </button>
                    {/* Edit button removed */}
                    <button className={styles.actionButton} title="Delete Application" onClick={() => setConfirmDeleteId(application.id)}>
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noApplications}>
              <h3>No applications found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          )}
        </div>

        <div className={styles.applicationStats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{applications.filter(a => a.status === 'Applied').length}</div>
            <div className={styles.statLabel}>Applied</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{applications.filter(a => a.status === 'Interview').length}</div>
            <div className={styles.statLabel}>Interviews</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{applications.filter(a => a.status === 'Offer').length}</div>
            <div className={styles.statLabel}>Offers</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{applications.filter(a => a.status === 'Rejected').length}</div>
            <div className={styles.statLabel}>Rejected</div>
          </div>
        </div>
      </div>
      {viewApp && (
        <div className={styles.modalOverlay} onClick={() => setViewApp(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>Application Details</div>
            <div className={styles.modalBody}>
              <div className={styles.modalRow}><div className={styles.modalLabel}>Job</div><div>{viewApp.jobTitle}</div></div>
              <div className={styles.modalRow}><div className={styles.modalLabel}>Company</div><div>{viewApp.company}</div></div>
              <div className={styles.modalRow}><div className={styles.modalLabel}>Status</div><div>{viewApp.status}</div></div>
              <div className={styles.modalRow}><div className={styles.modalLabel}>Date Applied</div><div>{formatDate(viewApp.date)}</div></div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnBase} onClick={() => setViewApp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDeleteId(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>Delete Application</div>
            <div className={styles.modalBody}>
              Are you sure you want to delete this application? This action cannot be undone.
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnBase} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className={`${styles.btnBase} ${styles.btnDanger}`} onClick={async () => { const id = confirmDeleteId; setConfirmDeleteId(null); await handleDelete(id); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}