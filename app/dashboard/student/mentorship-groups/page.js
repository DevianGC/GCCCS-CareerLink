'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './mentorship-groups.module.css';

export default function StudentMentorshipGroups() {
  const [groups, setGroups] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'my-applications'

  useEffect(() => {
    fetchGroups();
    fetchMyApplications();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mentorship-groups', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await fetch('/api/mentorship-groups/my-applications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMyApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = (group) => {
    setSelectedGroup(group);
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!selectedGroup) return;

    try {
      const res = await fetch(`/api/mentorship-groups/${selectedGroup.id}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: applicationMessage })
      });

      if (res.ok) {
        alert('Application submitted successfully!');
        setShowApplyModal(false);
        setApplicationMessage('');
        setSelectedGroup(null);
        fetchGroups();
        fetchMyApplications();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    }
  };

  const availableGroups = groups.filter(g => 
    g.status === 'active' && g.currentMembers < g.maxMembers
  );

  // Helper function to check if student has already applied to a group
  const hasAppliedToGroup = (groupId) => {
    return myApplications.some(app => 
      app.groupId === groupId && 
      (app.status === 'pending' || app.status === 'accepted')
    );
  };

  // Helper function to get application status for a group
  const getApplicationStatus = (groupId) => {
    const app = myApplications.find(app => app.groupId === groupId);
    return app?.status;
  };

  return (
    <DashboardLayout userType="student">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Alumni Mentorship Groups</h1>
          <p>Join mentorship groups led by alumni to enhance your career development</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'available' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Groups ({availableGroups.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'my-applications' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('my-applications')}
          >
            My Applications ({myApplications.length})
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : activeTab === 'available' ? (
          <div className={styles.groupsGrid}>
            {availableGroups.length > 0 ? (
              availableGroups.map((group) => (
                <div key={group.id} className={styles.groupCard}>
                  <div className={styles.groupHeader}>
                    <h3>{group.title}</h3>
                    <span className={styles.category}>{group.category}</span>
                  </div>
                  <p className={styles.description}>{group.description}</p>
                  <div className={styles.groupMeta}>
                    <div className={styles.mentor}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="8" r="4" strokeWidth="2"/>
                        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>{group.alumniName}</span>
                    </div>
                    <div className={styles.members}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                        <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
                      </svg>
                      <span>{group.currentMembers} / {group.maxMembers} members</span>
                    </div>
                  </div>
                  <button
                    className={styles.applyButton}
                    onClick={() => handleApply(group)}
                    disabled={group.currentMembers >= group.maxMembers || hasAppliedToGroup(group.id)}
                  >
                    {group.currentMembers >= group.maxMembers 
                      ? 'Group Full' 
                      : hasAppliedToGroup(group.id)
                        ? `Already Applied (${getApplicationStatus(group.id)})`
                        : 'Apply to Join'}
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.emptyState}>No mentorship groups available at the moment</p>
            )}
          </div>
        ) : (
          <div className={styles.applicationsContainer}>
            {myApplications.length > 0 ? (
              myApplications.map((app) => (
                <div key={app.id} className={styles.applicationCard}>
                  <div className={styles.applicationHeader}>
                    <h3>{app.groupTitle}</h3>
                    <span className={`${styles.statusBadge} ${styles[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className={styles.applicationMeta}>
                    <strong>Category:</strong> {app.groupCategory}
                  </p>
                  <p className={styles.applicationMeta}>
                    <strong>Alumni Mentor:</strong> {app.alumniName}
                  </p>
                  <p className={styles.applicationMeta}>
                    <strong>Applied:</strong> {app.appliedAt?.seconds 
                      ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString()
                      : app.appliedAt 
                        ? new Date(app.appliedAt).toLocaleDateString()
                        : 'Recently'}
                  </p>
                  {app.message && (
                    <p className={styles.applicationMessage}>
                      <strong>Your message:</strong> {app.message}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className={styles.emptyState}>You haven't applied to any groups yet</p>
            )}
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && selectedGroup && (
          <div className={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Apply to {selectedGroup.title}</h2>
                <button className={styles.closeButton} onClick={() => setShowApplyModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmitApplication}>
                <div className={styles.formGroup}>
                  <label>Why do you want to join this group?</label>
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    placeholder="Share your goals and what you hope to gain from this mentorship group..."
                    rows="5"
                    required
                    className={styles.textarea}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowApplyModal(false)} className={styles.cancelButton}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Submit Application
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
