'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { firebaseDb } from '../../../lib/firebaseClient';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import styles from './alumni-dashboard.module.css';

export default function AlumniDashboard() {
  const [updates, setUpdates] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const user = data?.profile || data?.user;
          if (user) {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            const fullName = user.fullName || `${firstName} ${lastName}`.trim();
            setUserName(fullName || user.email || 'Alumni');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch events from Firestore
  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      return;
    }

    const eventsQuery = query(
      collection(firebaseDb, 'events'),
      where('status', 'in', ['Upcoming', 'Ongoing']),
      limit(5)
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          title: doc.data().title || doc.data().name,
          description: doc.data().description || '',
          date: doc.data().date || doc.data().createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
        }))
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 2);
      setUpdates(eventsData);
    }, (error) => {
      console.error('Error fetching events:', error);
      // Fallback: fetch all events and filter client-side
      const fallbackQuery = query(
        collection(firebaseDb, 'events'),
        limit(5)
      );
      const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
        const eventsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            title: doc.data().title || doc.data().name,
            description: doc.data().description || '',
            date: doc.data().date || doc.data().createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
          }))
          .filter(event => event.status === 'Upcoming' || event.status === 'Ongoing')
          .slice(0, 2);
        setUpdates(eventsData);
      });
      return () => fallbackUnsubscribe();
    });

    return () => unsubscribe();
  }, []);

  // Fetch jobs/opportunities from Firestore
  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      return;
    }

    const jobsQuery = query(
      collection(firebaseDb, 'jobs'),
      where('status', '==', 'Active'),
      limit(10)
    );

    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          title: doc.data().title,
          company: doc.data().company,
          type: doc.data().type || 'Full-time',
          postedDate: doc.data().posted || doc.data().createdAt?.split('T')[0] || ''
        }))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 2);
      setOpportunities(jobsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching jobs:', error);
      // Fallback: fetch all jobs and filter client-side
      const fallbackQuery = query(
        collection(firebaseDb, 'jobs'),
        limit(10)
      );
      const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
        const jobsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            title: doc.data().title,
            company: doc.data().company,
            type: doc.data().type || 'Full-time',
            postedDate: doc.data().posted || doc.data().createdAt?.split('T')[0] || ''
          }))
          .filter(job => job.status === 'Active')
          .slice(0, 2);
        setOpportunities(jobsData);
      });
      setLoading(false);
      return () => fallbackUnsubscribe();
    });

    return () => unsubscribe();
  }, []);

  // Fetch mentorship groups and applications
  useEffect(() => {
    const fetchMentorshipData = async () => {
      try {
        // Fetch alumni's mentorship groups
        const groupsRes = await fetch('/api/mentorship-groups?myGroups=true', { cache: 'no-store' });
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          const groups = groupsData.groups || [];
          
          // Fetch applications for each group
          const groupsWithApplicants = await Promise.all(
            groups.map(async (group) => {
              const appsRes = await fetch(`/api/mentorship-groups/${group.id}/applications`, { cache: 'no-store' });
              if (appsRes.ok) {
                const appsData = await appsRes.json();
                return {
                  ...group,
                  title: group.title,
                  applicants: appsData.applications || []
                };
              }
              return { ...group, applicants: [] };
            })
          );
          
          setMyGroups(groupsWithApplicants);
        }
      } catch (error) {
        console.error('Error fetching mentorship data:', error);
      }
    };

    fetchMentorshipData();
  }, []);

  // Accept/Decline applicant for a group
  const handleAcceptApplicant = async (groupId, applicantId) => {
    try {
      const res = await fetch(`/api/mentorship-groups/${groupId}/applications/${applicantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' })
      });

      if (res.ok) {
        // Update local state
        setMyGroups(prev => prev.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              applicants: group.applicants.map(a =>
                a.id === applicantId ? { ...a, status: 'accepted' } : a
              )
            };
          }
          return group;
        }));
      }
    } catch (error) {
      console.error('Error accepting applicant:', error);
      alert('Failed to accept applicant');
    }
  };

  const handleDeclineApplicant = async (groupId, applicantId) => {
    try {
      const res = await fetch(`/api/mentorship-groups/${groupId}/applications/${applicantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' })
      });

      if (res.ok) {
        // Update local state
        setMyGroups(prev => prev.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              applicants: group.applicants.map(a =>
                a.id === applicantId ? { ...a, status: 'declined' } : a
              )
            };
          }
          return group;
        }));
      }
    } catch (error) {
      console.error('Error declining applicant:', error);
      alert('Failed to decline applicant');
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="alumni">
        <div className={styles.container}>
          <div className={styles.loading}>Loading your dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="alumni">
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome{userName ? `, ${userName}` : ''}!</h1>
        
        {/* Updates Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Updates</h2>
            <a href="/dashboard/alumni/updates" className={styles.viewAll}>View All</a>
          </div>
          <div className={styles.cardGrid}>
            {updates.length > 0 ? (
              updates.map((update) => (
                <div key={update.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{update.title}</h3>
                    <span className={styles.date}>{new Date(update.date).toLocaleDateString()}</span>
                  </div>
                  <p className={styles.cardDescription}>{update.description}</p>
                </div>
              ))
            ) : (
              <p className={styles.emptyState}>No updates available</p>
            )}
          </div>
        </section>

        {/* Posted Opportunities Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Posted Opportunities</h2>
            <a href="/dashboard/alumni/opportunities" className={styles.viewAll}>View All</a>
          </div>
          <div className={styles.cardGrid}>
            {opportunities.length > 0 ? (
              opportunities.map((opportunity) => (
                <div key={opportunity.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{opportunity.title}</h3>
                    <span className={styles.badge}>{opportunity.type}</span>
                  </div>
                  <p className={styles.company}>{opportunity.company}</p>
                  <p className={styles.postedDate}>
                    Posted: {new Date(opportunity.postedDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className={styles.emptyState}>No opportunities available</p>
            )}
          </div>
        </section>


        {/* Mentorship Group Applications Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Mentorship Group Applications</h2>
          </div>
          <div className={styles.cardGrid}>
            {
              (() => {
                const pending = myGroups.flatMap(group =>
                  group.applicants
                    .filter(applicant => applicant.status === 'pending')
                    .map(applicant => ({ group, applicant }))
                );
                if (pending.length === 0) {
                  return <p className={styles.emptyState}>No mentorship group applications</p>;
                }
                const { group, applicant } = pending[0];
                return (
                  <div key={group.id + '-' + applicant.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{applicant.name}</h3>
                      <span className={`${styles.status} ${styles[applicant.status]}`}>
                        {applicant.status}
                      </span>
                    </div>
                    <p className={styles.major}>Major: {applicant.major}</p>
                    <p className={styles.requestDate}>
                      Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                    </p>
                    <p className={styles.major}><b>Group:</b> {group.title}</p>
                    <div className={styles.actions}>
                      <button
                        className={styles.acceptButton}
                        onClick={() => handleAcceptApplicant(group.id, applicant.id)}
                      >
                        Accept
                      </button>
                      <button
                        className={styles.declineButton}
                        onClick={() => handleDeclineApplicant(group.id, applicant.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })()
            }
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
