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

  const [newGroup, setNewGroup] = useState({
    title: '',
    description: '',
    topic: '',
    maxParticipants: 10,
    schedule: 'weekly',
    startDate: '',
    duration: '60',
    meetingLink: '',
    prerequisites: '',
    tags: []
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/alumni/mentorship-groups');
      // const data = await response.json();
      // setMyGroups(data.groups);

      // Mock data - empty by default
      const mockGroups = [];

      setMyGroups(mockGroups);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement API call
      console.log('Creating group:', newGroup);

      const group = {
        id: myGroups.length + 1,
        ...newGroup,
        currentParticipants: 0,
        status: 'active',
        applicants: [],
        participants: []
      };

      setMyGroups(prev => [...prev, group]);
      setShowCreateModal(false);
      setNewGroup({
        title: '',
        description: '',
        topic: '',
        maxParticipants: 10,
        schedule: 'weekly',
        startDate: '',
        duration: '60',
        meetingLink: '',
        prerequisites: '',
        tags: []
      });
      alert('Mentorship group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newGroup.tags.includes(newTag.trim())) {
      setNewGroup(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setNewGroup(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleViewApplicants = (group) => {
    setSelectedGroup(group);
    setShowApplicantsModal(true);
  };

  const handleAcceptApplicant = (groupId, applicantId) => {
    setMyGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const applicant = group.applicants.find(a => a.id === applicantId);
        return {
          ...group,
          applicants: group.applicants.map(a =>
            a.id === applicantId ? { ...a, status: 'accepted' } : a
          ),
          currentParticipants: group.currentParticipants + 1,
          participants: [...group.participants, applicant]
        };
      }
      return group;
    }));
    alert('Applicant accepted!');
  };

  const handleRejectApplicant = (groupId, applicantId) => {
    setMyGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          applicants: group.applicants.map(a =>
            a.id === applicantId ? { ...a, status: 'rejected' } : a
          )
        };
      }
      return group;
    }));
    alert('Applicant rejected.');
  };

  const handleDeleteGroup = (groupId) => {
    if (confirm('Are you sure you want to delete this mentorship group?')) {
      setMyGroups(prev => prev.filter(group => group.id !== groupId));
      alert('Group deleted successfully.');
    }
  };

  const handleUpdateMeetingLink = (groupId, newLink) => {
    setMyGroups(prev => prev.map(group =>
      group.id === groupId ? { ...group, meetingLink: newLink } : group
    ));
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
                        <p className={styles.groupTopic}>{group.topic}</p>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[group.status]}`}>
                        {group.status}
                      </span>
                    </div>

                    <p className={styles.groupDescription}>{group.description}</p>

                    <div className={styles.groupTags}>
                      {group.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                      ))}
                    </div>

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
                        <span>{group.currentParticipants} / {group.maxParticipants} participants</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </span>
                        <span>{group.schedule}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                        </span>
                        <span>{group.duration} min</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="8 12 12 16 16 12"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                          </svg>
                        </span>
                        <span>Starts: {new Date(group.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className={styles.meetingLinkSection}>
                      <label className={styles.linkLabel}>Meeting Link:</label>
                      <div className={styles.linkInput}>
                        <input
                          type="url"
                          value={group.meetingLink}
                          onChange={(e) => handleUpdateMeetingLink(group.id, e.target.value)}
                          placeholder="Add meeting link..."
                        />
                        <a
                          href={group.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.joinButton}
                          disabled={!group.meetingLink}
                        >
                          Join
                        </a>
                      </div>
                    </div>

                    {group.applicants.filter(a => a.status === 'pending').length > 0 && (
                      <div className={styles.applicantNotice}>
                        <span className={styles.noticeIcon}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                          </svg>
                        </span>
                        <span>{group.applicants.filter(a => a.status === 'pending').length} pending application(s)</span>
                      </div>
                    )}

                    <div className={styles.groupActions}>
                      <button
                        className={styles.viewApplicantsButton}
                        onClick={() => handleViewApplicants(group)}
                      >
                        View Applicants ({group.applicants.length})
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        Delete Group
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
                    placeholder="e.g., Career in Software Engineering"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Describe what participants will learn..."
                    rows="4"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Topic *</label>
                    <input
                      type="text"
                      value={newGroup.topic}
                      onChange={(e) => setNewGroup({ ...newGroup, topic: e.target.value })}
                      placeholder="e.g., Software Development"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Max Participants *</label>
                    <input
                      type="number"
                      value={newGroup.maxParticipants}
                      onChange={(e) => setNewGroup({ ...newGroup, maxParticipants: parseInt(e.target.value) })}
                      min="3"
                      max="50"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Schedule *</label>
                    <select
                      value={newGroup.schedule}
                      onChange={(e) => setNewGroup({ ...newGroup, schedule: e.target.value })}
                      required
                    >
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Duration (minutes) *</label>
                    <select
                      value={newGroup.duration}
                      onChange={(e) => setNewGroup({ ...newGroup, duration: e.target.value })}
                      required
                    >
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={newGroup.startDate}
                    onChange={(e) => setNewGroup({ ...newGroup, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Meeting Link</label>
                  <input
                    type="url"
                    value={newGroup.meetingLink}
                    onChange={(e) => setNewGroup({ ...newGroup, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/... or https://zoom.us/..."
                  />
                  <small>You can add or update this later</small>
                </div>

                <div className={styles.formGroup}>
                  <label>Prerequisites (Optional)</label>
                  <textarea
                    value={newGroup.prerequisites}
                    onChange={(e) => setNewGroup({ ...newGroup, prerequisites: e.target.value })}
                    placeholder="Any required knowledge or preparation..."
                    rows="2"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tags</label>
                  <div className={styles.tagsContainer}>
                    {newGroup.tags.map((tag, index) => (
                      <span key={index} className={styles.tagItem}>
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className={styles.addTagInput}>
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button type="button" onClick={handleAddTag} className={styles.addTagButton}>
                      Add
                    </button>
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
                <h2>Applicants for "{selectedGroup.title}"</h2>
                <button className={styles.closeButton} onClick={() => setShowApplicantsModal(false)}>
                  ×
                </button>
              </div>

              <div className={styles.applicantsList}>
                {selectedGroup.applicants.length > 0 ? (
                  selectedGroup.applicants.map((applicant) => (
                    <div key={applicant.id} className={styles.applicantCard}>
                      <div className={styles.applicantInfo}>
                        <h3>{applicant.name}</h3>
                        <p>{applicant.major} • {applicant.year}</p>
                        <p className={styles.appliedDate}>
                          Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={styles.applicantStatus}>
                        <span className={`${styles.statusLabel} ${styles[applicant.status]}`}>
                          {applicant.status}
                        </span>
                        {applicant.status === 'pending' && (
                          <div className={styles.applicantActions}>
                            <button
                              className={styles.acceptBtn}
                              onClick={() => handleAcceptApplicant(selectedGroup.id, applicant.id)}
                              disabled={selectedGroup.currentParticipants >= selectedGroup.maxParticipants}
                            >
                              Accept
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleRejectApplicant(selectedGroup.id, applicant.id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noApplicants}>
                    <p>No applicants yet</p>
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
