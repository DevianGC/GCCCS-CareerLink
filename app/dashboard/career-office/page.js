'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './career-office-dashboard.module.css';

export default function CareerOfficeDashboard() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    pendingApplications: 0,
    scheduledInterviews: 0,
    newStudents: 0,
    totalMentors: 0,
    pendingMentors: 0
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Real-time listener for jobs
  useEffect(() => {
    const jobsQuery = query(
      collection(firebaseDb, 'jobs'),
      where('status', '==', 'Active'),
      limit(10)
    );

    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentJobs(jobsData);
      setStats(prev => ({ ...prev, activeJobs: snapshot.size }));
    }, (error) => {
      console.error('Error fetching jobs:', error);
      // Fallback: count all jobs if index issue
      const fallbackQuery = query(
        collection(firebaseDb, 'jobs')
      );
      const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
        const activeJobs = snapshot.docs.filter(doc => doc.data().status === 'Active');
        setRecentJobs(activeJobs.slice(0, 5).map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
        setStats(prev => ({ ...prev, activeJobs: activeJobs.length }));
      });
      return () => fallbackUnsubscribe();
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for applications
  useEffect(() => {
    const applicationsQuery = query(
      collection(firebaseDb, 'applications'),
      limit(10)
    );

    const unsubscribe = onSnapshot(applicationsQuery, async (snapshot) => {
      // Fetch user data for each application
      const applicationsWithUsers = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const appData = doc.data();
          let studentName = 'Unknown Student';
          
          // Fetch user name from users collection
          if (appData.userId) {
            try {
              const userQuery = query(
                collection(firebaseDb, 'users'),
                where('__name__', '==', appData.userId)
              );
              const userSnapshot = await new Promise((resolve) => {
                const unsub = onSnapshot(userQuery, (snap) => {
                  unsub();
                  resolve(snap);
                });
              });
              
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                studentName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'Unknown Student';
              }
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          }
          
          return {
            id: doc.id,
            ...appData,
            studentName
          };
        })
      );

      const sortedApplications = applicationsWithUsers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      }).slice(0, 5);
      
      setRecentApplications(sortedApplications);
      
      // Count pending/applied applications (not yet processed)
      const pendingCount = applicationsWithUsers.filter(app => {
        const status = app.status;
        return status === 'Applied' || status === 'pending' || status === 'submitted';
      }).length;
      setStats(prev => ({ ...prev, pendingApplications: pendingCount }));
    }, (error) => {
      console.error('Error fetching applications:', error);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for registered users
  useEffect(() => {
    const usersQuery = query(
      collection(firebaseDb, 'users'),
      limit(10)
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
      setRegisteredUsers(usersData);
      
      // Count new students (registered in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newStudentCount = snapshot.docs.filter(doc => {
        const userData = doc.data();
        const createdAt = userData.createdAt?.toDate?.() || new Date(userData.createdAt);
        return createdAt >= thirtyDaysAgo && (userData.role === 'student' || userData.role === 'alumni');
      }).length;
      
      setStats(prev => ({ ...prev, newStudents: newStudentCount }));
    }, (error) => {
      console.error('Error fetching users:', error);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for scheduled interviews
  useEffect(() => {
    const interviewsQuery = query(
      collection(firebaseDb, 'applications'),
      where('status', '==', 'interview')
    );

    const unsubscribe = onSnapshot(interviewsQuery, (snapshot) => {
      setStats(prev => ({ ...prev, scheduledInterviews: snapshot.size }));
    }, (error) => {
      console.error('Error fetching interviews:', error);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for faculty mentors
  useEffect(() => {
    if (!firebaseDb) return;

    const mentorsQuery = query(
      collection(firebaseDb, 'users'),
      where('role', '==', 'faculty-mentor')
    );

    const unsubscribe = onSnapshot(mentorsQuery, (snapshot) => {
      const totalMentors = snapshot.size;
      const pendingMentors = snapshot.docs.filter(doc => {
        const status = doc.data().accountStatus;
        return status === 'pending';
      }).length;
      
      setStats(prev => ({ 
        ...prev, 
        totalMentors,
        pendingMentors
      }));
    }, (error) => {
      console.error('Error fetching mentors:', error);
    });

    return () => unsubscribe();
  }, []);

  // Format date helper
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    let date;
    if (dateValue?.toDate) {
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      date = dateValue;
    }
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'pending review': 
      case 'submitted':
        return styles.statusPending;
      case 'forwarded to employer':
      case 'reviewed':
        return styles.statusForwarded;
      case 'interview scheduled':
      case 'interview':
        return styles.statusInterview;
      case 'rejected':
        return styles.statusRejected;
      case 'offer extended':
      case 'accepted':
        return styles.statusOffer;
      default: return '';
    }
  };

  return (
    <DashboardLayout userType="career-office">
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Career Office Dashboard</h1>
          <div className={styles.dashboardActions}>
            <a href="/dashboard/career-office/jobs" className={`btn ${styles.actionButton}`}>
            <button className={`btn ${styles.actionButton}`}>Post New Job</button>
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.activeJobs}</div>
              <div className={styles.statLabel}>Active Job Listings</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.pendingApplications}</div>
              <div className={styles.statLabel}>Pending Applications</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.scheduledInterviews}</div>
              <div className={styles.statLabel}>Scheduled Interviews</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.newStudents}</div>
              <div className={styles.statLabel}>New Students This Month</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.totalMentors}</div>
              <div className={styles.statLabel}>Faculty Mentors</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.pendingMentors}</div>
              <div className={styles.statLabel}>Pending Mentor Approvals</div>
            </div>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          {/* Recent Applications */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Recent Applications</h2>
              <a href="/dashboard/career-office/students" className={styles.cardLink}>View All</a>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.applicationsList}>
                {recentApplications.length === 0 ? (
                  <p className={styles.emptyState}>No recent applications</p>
                ) : (
                  recentApplications.map(application => (
                    <div key={application.id} className={styles.applicationItem}>
                      <div className={styles.applicationHeader}>
                        <div className={styles.applicationStudent}>
                          {application.studentName || application.applicantName || 'Unknown Student'}
                        </div>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(application.status)}`}>
                          {application.status || 'Pending'}
                        </span>
                      </div>
                      <div className={styles.applicationPosition}>{application.position || application.jobTitle || 'N/A'}</div>
                      <div className={styles.applicationCompany}>{application.company || application.companyName || 'N/A'}</div>
                      <div className={styles.applicationMeta}>
                        <span>Applied: {formatDate(application.createdAt || application.date)}</span>
                        <div className={styles.applicationActions}>
                          <button className={styles.actionButton} title="View Details">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Interviews removed */}

          {/* Recent Jobs */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Recent Job Postings</h2>
              <a href="/dashboard/career-office/jobs" className={styles.cardLink}>Manage Jobs</a>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.jobsList}>
                {recentJobs.length === 0 ? (
                  <p className={styles.emptyState}>No active job postings</p>
                ) : (
                  recentJobs.map(job => (
                    <div key={job.id} className={styles.jobItem}>
                      <div className={styles.jobHeader}>
                        <div className={styles.jobTitle}>{job.title || 'Untitled Job'}</div>
                        <div className={styles.jobApplications}>{job.applicationCount || 0} applications</div>
                      </div>
                      <div className={styles.jobCompany}>{job.company || job.companyName || 'N/A'}</div>
                      <div className={styles.jobLocation}>{job.location || 'Location not specified'}</div>
                      <div className={styles.jobMeta}>
                        <span>Posted: {formatDate(job.createdAt || job.posted)}</span>
                        <div className={styles.jobActions}>
                          <button className={styles.actionButton} title="View Applications">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                              <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className={styles.actionButton} title="Edit Job">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className={styles.actionButton} title="Close Job">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Quick Actions</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.quickActionsList}>
                <a href="/dashboard/career-office/jobs" className={styles.quickActionItem}>
                  <div className={styles.quickActionIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.quickActionContent}>
                    <div className={styles.quickActionTitle}>Post New Job</div>
                    <div className={styles.quickActionDescription}>Create a new job listing for employers</div>
                  </div>
                </a>
                <a href="/dashboard/career-office/students" className={styles.quickActionItem}>
                  <div className={styles.quickActionIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className={styles.quickActionContent}>
                    <div className={styles.quickActionTitle}>Browse Student Profiles</div>
                    <div className={styles.quickActionDescription}>View and search student portfolios</div>
                  </div>
                </a>
                {/* Schedule Interview quick action removed per request */}
                <a href="/dashboard/career-office/reports" className={styles.quickActionItem}>
                  <div className={styles.quickActionIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.quickActionContent}>
                    <div className={styles.quickActionTitle}>Generate Reports</div>
                    <div className={styles.quickActionDescription}>Create placement and activity reports</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}