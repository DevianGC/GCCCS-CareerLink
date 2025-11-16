'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './mentorship-groups.module.css';

export default function MentorshipGroups() {
  const [activeTab, setActiveTab] = useState('my-groups');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  const [newGroup, setNewGroup] = useState({
    title: '',
    description: '',
    category: 'Career Development',
    maxMembers: 10
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mentorship-groups?myGroups=true', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMyGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/mentorship-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      });

      if (res.ok) {
        alert('Mentorship group created successfully!');
        setShowCreateModal(false);
        setNewGroup({
          title: '',
          description: '',
          category: 'Career Development',
          maxMembers: 10
        });
        fetchGroups();
      } else {
        const contentType = res.headers.get('content-type');
        let errorMessage = 'Unknown error';
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          errorMessage = errorData.error || 'Failed to create group';
          console.error('Failed to create group:', errorData);
        } else {
          const textError = await res.text();
          errorMessage = textError || `HTTP ${res.status}`;
          console.error('Failed to create group (non-JSON):', textError);
        }
        
        alert(`Failed to create group: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert(`Failed to create group: ${error.message}`);
    }
  };

  const handleViewApplicants = async (group) => {
    try {
      const res = await fetch(`/api/mentorship-groups/${group.id}/applications`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setSelectedGroup(group);
        setShowApplicantsModal(true);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleAcceptApplicant = async (applicationId) => {
    try {
      const res = await fetch(`/api/mentorship-groups/${selectedGroup.id}/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' })
      });

      if (res.ok) {
        alert('Applicant accepted!');
        handleViewApplicants(selectedGroup); // Refresh applications
        fetchGroups(); // Refresh groups to update member count
      }
    } catch (error) {
      console.error('Error accepting applicant:', error);
      alert('Failed to accept applicant');
    }
  };

  const handleRejectApplicant = async (applicationId) => {
    try {
      const res = await fetch(`/api/mentorship-groups/${selectedGroup.id}/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' })
      });

      if (res.ok) {
        alert('Applicant declined.');
        handleViewApplicants(selectedGroup); // Refresh applications
      }
    } catch (error) {
      console.error('Error declining applicant:', error);
      alert('Failed to decline applicant');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (confirm('Are you sure you want to close this mentorship group?')) {
      try {
        const res = await fetch(`/api/mentorship-groups/${groupId}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          alert('Group closed successfully.');
          fetchGroups();
        }
      } catch (error) {
        console.error('Error closing group:', error);
        alert('Failed to close group');
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="alumni">
        <div className={styles.container}>
          <div className={styles.loading}>Loading mentorship groups...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="alumni">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Mentorship Groups</h1>
            <p className={styles.subtitle}>Create and manage group mentorship sessions</p>
          </div>
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
             Create New Group
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'my-groups' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('my-groups')}
          >
            My Groups
            <span className={styles.badge}>{myGroups.length}</span>
          </button>
        </div>

        {/* My Groups Tab */}
        {activeTab === 'my-groups' && (
          <div className={styles.groupsSection}>
            {myGroups.length > 0 ? (
              <div className={styles.groupsGrid}>
                {myGroups.map((group) => (
                  <div key={group.id} className={styles.groupCard}>
                    <div className={styles.groupHeader}>
                      <div>
                        <h3 className={styles.groupTitle}>{group.title}</h3>
                        <p className={styles.groupTopic}>{group.category}</p>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[group.status]}`}>
                        {group.status}
                      </span>
                    </div>

                    <p className={styles.groupDescription}>{group.description}</p>

                    <div className={styles.groupDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                        </span>
                        <span>{group.currentMembers} / {group.maxMembers} members</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="5" width="18" height="14" rx="2"/>
                            <path d="M7 10h10" strokeLinecap="round"/>
                            <path d="M7 14h6" strokeLinecap="round"/>
                          </svg>
                        </span>
                        <span>{group.pendingApplications || 0} pending applications</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="8 12 12 16 16 12"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                          </svg>
                        </span>
                        <span>Created: {group.createdAt?.seconds 
                          ? new Date(group.createdAt.seconds * 1000).toLocaleDateString()
                          : group.createdAt 
                            ? new Date(group.createdAt).toLocaleDateString()
                            : 'Recently'}</span>
                      </div>
                    </div>

                    <div className={styles.groupActions}>
                      <button
                        className={styles.viewApplicantsButton}
                        onClick={() => handleViewApplicants(group)}
                      >
                        View Applications
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        Close Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3>No mentorship groups yet</h3>
                <p>Create your first group mentorship session to share your expertise with multiple students</p>
                <button className={styles.createEmptyButton} onClick={() => setShowCreateModal(true)}>
                  Create Your First Group
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Create Mentorship Group</h2>
                <button className={styles.closeButton} onClick={() => setShowCreateModal(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Group Title *</label>
                  <input
                    type="text"
                    value={newGroup.title}
                    onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
                    placeholder="e.g., Frontend Development Career Path"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Describe what students will learn and achieve in this group..."
                    rows="4"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Category</label>
                    <select
                      value={newGroup.category}
                      onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                    >
                      <option>Career Development</option>
                      <option>Technical Skills</option>
                      <option>Networking</option>
                      <option>Interview Preparation</option>
                      <option>Resume Building</option>
                      <option>General Mentorship</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Max Members *</label>
                    <input
                      type="number"
                      value={newGroup.maxMembers}
                      onChange={(e) => setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) })}
                      min="1"
                      max="50"
                      required
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Applicants Modal */}
        {showApplicantsModal && selectedGroup && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Applications for "{selectedGroup.title}"</h2>
                <button className={styles.closeButton} onClick={() => setShowApplicantsModal(false)}>
                  ×
                </button>
              </div>

              <div className={styles.applicantsList}>
                {applications.length > 0 ? (
                  applications.map((application) => (
                    <div key={application.id} className={styles.applicantCard}>
                      <div className={styles.applicantInfo}>
                        <h3>{application.studentName}</h3>
                        <p className={styles.applicationMessage}>{application.message}</p>
                        <p className={styles.appliedDate}>
                          Applied: {new Date(application.appliedAt?.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={styles.applicantStatus}>
                        <span className={`${styles.statusLabel} ${styles[application.status]}`}>
                          {application.status}
                        </span>
                        {application.status === 'pending' && (
                          <div className={styles.applicantActions}>
                            <button
                              className={styles.acceptBtn}
                              onClick={() => handleAcceptApplicant(application.id)}
                              disabled={selectedGroup.currentMembers >= selectedGroup.maxMembers}
                            >
                              Accept
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleRejectApplicant(application.id)}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noApplicants}>
                    <p>No applications yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
