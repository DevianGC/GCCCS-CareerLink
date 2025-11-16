'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import Button from '../../../../components/UI/Button/Button';
import styles from './mentor-approvals.module.css';

export default function MentorApprovals() {
  const [pendingMentors, setPendingMentors] = useState([]);
  const [approvedMentors, setApprovedMentors] = useState([]);
  const [rejectedMentors, setRejectedMentors] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mentors/approvals');
      if (response.ok) {
        const data = await response.json();
        setPendingMentors(data.pending || []);
        setApprovedMentors(data.approved || []);
        setRejectedMentors(data.rejected || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (mentorId) => {
    setActionLoading(true);
    try {
      const mentorRef = doc(firebaseDb, 'users', mentorId);
      await updateDoc(mentorRef, {
        accountStatus: 'approved',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setSelectedMentor(null);
    } catch (error) {
      console.error('Error approving mentor:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (mentorId) => {
    setActionLoading(true);
    try {
      const mentorRef = doc(firebaseDb, 'users', mentorId);
      await updateDoc(mentorRef, {
        accountStatus: 'rejected',
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setSelectedMentor(null);
    } catch (error) {
      console.error('Error rejecting mentor:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getMentorList = () => {
    switch (activeTab) {
      case 'pending':
        return pendingMentors;
      case 'approved':
        return approvedMentors;
      case 'rejected':
        return rejectedMentors;
      default:
        return [];
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: styles.statusPending,
      approved: styles.statusApproved,
      rejected: styles.statusRejected
    };
    return statusColors[status] || '';
  };

  return (
    <DashboardLayout userType="career-office">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Faculty Mentor Approvals</h1>
            <p className={styles.subtitle}>Review and approve faculty mentor registrations</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{pendingMentors.length}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{approvedMentors.length}</span>
              <span className={styles.statLabel}>Approved</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingMentors.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'approved' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({approvedMentors.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'rejected' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({rejectedMentors.length})
          </button>
        </div>

        {/* Mentor List */}
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.mentorGrid}>
            {getMentorList().length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <p>No {activeTab} mentors</p>
              </div>
            ) : (
              getMentorList().map((mentor) => (
                <div key={mentor.id} className={styles.mentorCard}>
                  <div className={styles.mentorHeader}>
                    <div className={styles.mentorAvatar}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className={styles.mentorInfo}>
                      <h3 className={styles.mentorName}>
                        {mentor.firstName} {mentor.lastName}
                      </h3>
                      <p className={styles.mentorEmail}>{mentor.email}</p>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusBadge(mentor.accountStatus)}`}>
                      {mentor.accountStatus}
                    </span>
                  </div>

                  <div className={styles.mentorDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Faculty ID:</span>
                      <span className={styles.detailValue}>{mentor.facultyId}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Department:</span>
                      <span className={styles.detailValue}>{mentor.department}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Specialization:</span>
                      <span className={styles.detailValue}>{mentor.specialization}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Phone:</span>
                      <span className={styles.detailValue}>{mentor.phone}</span>
                    </div>
                    {mentor.officeLocation && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Office:</span>
                        <span className={styles.detailValue}>{mentor.officeLocation}</span>
                      </div>
                    )}
                    {mentor.yearsOfExperience && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Experience:</span>
                        <span className={styles.detailValue}>{mentor.yearsOfExperience} years</span>
                      </div>
                    )}
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Registered:</span>
                      <span className={styles.detailValue}>
                        {new Date(mentor.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {activeTab === 'pending' && (
                    <div className={styles.mentorActions}>
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(mentor.id)}
                        disabled={actionLoading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleReject(mentor.id)}
                        disabled={actionLoading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Reject
                      </Button>
                    </div>
                  )}

                  {activeTab === 'approved' && mentor.approvedAt && (
                    <div className={styles.approvalInfo}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Approved on {new Date(mentor.approvedAt).toLocaleDateString()}
                    </div>
                  )}

                  {activeTab === 'rejected' && mentor.rejectedAt && (
                    <div className={styles.rejectionInfo}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      Rejected on {new Date(mentor.rejectedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
