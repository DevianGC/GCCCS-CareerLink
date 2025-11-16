'use client';


import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/Dashboard/DashboardLayout';
import styles from './alumni-dashboard.module.css';

export default function AlumniDashboard() {
  const [updates, setUpdates] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // Fetch updates, opportunities, and mentoring invitations
        // const updatesData = await fetch('/api/alumni/updates').then(res => res.json());
        // const opportunitiesData = await fetch('/api/alumni/opportunities').then(res => res.json());
        // Mock data for now
        setUpdates([
          { id: 1, title: 'Career Fair 2025', date: '2025-11-15', description: 'Join us for the annual career fair' },
          { id: 2, title: 'Networking Event', date: '2025-11-20', description: 'Connect with fellow alumni' },
        ]);
        setOpportunities([
          { id: 1, title: 'Senior Software Engineer', company: 'Tech Corp', type: 'Full-time', postedDate: '2025-11-01' },
          { id: 2, title: 'Product Manager', company: 'Innovation Ltd', type: 'Full-time', postedDate: '2025-11-03' },
        ]);
        // Mock mentorship groups with applicants
        setMyGroups([
          {
            id: 1,
            title: 'Frontend Career Group',
            applicants: [
              { id: 101, name: 'Alice Johnson', major: 'Computer Science', year: '3rd Year', appliedDate: '2025-11-05', status: 'pending' },
              { id: 102, name: 'Bob Lee', major: 'IT', year: '2nd Year', appliedDate: '2025-11-04', status: 'accepted' }
            ]
          },
          {
            id: 2,
            title: 'Business Mentorship',
            applicants: [
              { id: 103, name: 'Cathy Smith', major: 'Business', year: '4th Year', appliedDate: '2025-11-03', status: 'pending' }
            ]
          }
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  // Accept/Decline applicant for a group
  const handleAcceptApplicant = (groupId, applicantId) => {
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
  };

  const handleDeclineApplicant = (groupId, applicantId) => {
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
        <h1 className={styles.title}>Alumni Dashboard</h1>
        
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
