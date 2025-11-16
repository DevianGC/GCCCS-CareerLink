'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './employer-dashboard.module.css';

export default function EmployerDashboard() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    scheduledInterviews: 0,
    totalMentors: 0,
    pendingMentors: 0
  });
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe?.();
  }, []);

  // Real-time listener for ALL active jobs (same as career office)
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
          posted: doc.data().createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          applicants: 0
        }))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
      
      setJobs(jobsData);
      setStats(prev => ({ ...prev, activeJobs: snapshot.size }));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching jobs:', error);
      // Fallback: count all jobs if index issue
      const fallbackQuery = query(collection(firebaseDb, 'jobs'));
      const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
        const activeJobs = snapshot.docs.filter(doc => doc.data().status === 'Active');
        setJobs(activeJobs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          posted: doc.data().createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          applicants: 0
        })));
        setStats(prev => ({ ...prev, activeJobs: activeJobs.length }));
      });
      setLoading(false);
      return () => fallbackUnsubscribe();
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time listener for ALL applications (same as career office)
  useEffect(() => {
    if (!firebaseDb) return;

    const applicationsQuery = query(
      collection(firebaseDb, 'applications'),
      limit(10)
    );

    const unsubscribe = onSnapshot(applicationsQuery, async (snapshot) => {
      // Fetch user data for each application
      const applicationsWithUsers = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const appData = doc.data();
          let candidateName = 'Unknown Candidate';
          let experience = 'N/A';
          
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
                candidateName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'Unknown Candidate';
                experience = userData.yearsOfExperience || userData.graduationYear || 'N/A';
              }
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          }
          
          return {
            id: doc.id,
            ...appData,
            candidateName,
            studentName: candidateName,
            position: appData.jobTitle || appData.position,
            appliedDate: appData.createdAt?.split('T')[0] || appData.date || 'N/A',
            experience: experience
          };
        })
      );

      const sortedApplications = applicationsWithUsers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      }).slice(0, 5);
      
      setRecentApplications(sortedApplications);
      
      // Update stats - same as career office
      const totalApplications = applicationsWithUsers.length;
      const pendingCount = applicationsWithUsers.filter(app => {
        const status = app.status;
        return status === 'Applied' || status === 'pending' || status === 'submitted';
      }).length;
      const shortlisted = applicationsWithUsers.filter(app => 
        app.status === 'Shortlisted' || app.status === 'Offer'
      ).length;
      const interviews = applicationsWithUsers.filter(app => 
        app.status === 'Interview' || app.status === 'interview'
      ).length;
      
      setStats(prev => ({
        ...prev,
        totalApplications,
        shortlistedCandidates: shortlisted,
        scheduledInterviews: interviews
      }));
    }, (error) => {
      console.error('Error fetching applications:', error);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const activeJobPostings = jobs.filter(job => job.status === 'Active').slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New Application':
        return styles.statusNew;
      case 'Shortlisted':
        return styles.statusShortlisted;
      case 'Interview Scheduled':
        return styles.statusInterview;
      case 'Under Review':
        return styles.statusReview;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <DashboardLayout userType="employer">
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.pageTitle}>Employer Dashboard</h1>
          <p className={styles.pageSubtitle}>Manage your job postings and track applications</p>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="8" y="3" width="8" height="4" rx="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.activeJobs}</h3>
              <p className={styles.statLabel}>Active Job Postings</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.totalApplications}</h3>
              <p className={styles.statLabel}>Total Applications</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.shortlistedCandidates}</h3>
              <p className={styles.statLabel}>Shortlisted Candidates</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{stats.scheduledInterviews}</h3>
              <p className={styles.statLabel}>Scheduled Interviews</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Recent Applications */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Recent Applications</h2>
              <button className={styles.viewAllButton}>View All</button>
            </div>
            <div className={styles.cardContent}>
              {recentApplications.map((application) => (
                <div key={application.id} className={styles.applicationItem}>
                  <div className={styles.applicationInfo}>
                    <h4 className={styles.candidateName}>{application.candidateName}</h4>
                    <p className={styles.positionTitle}>{application.position}</p>
                    <p className={styles.applicationDate}>Applied: {application.appliedDate}</p>
                  </div>
                  <div className={styles.applicationMeta}>
                    <span className={styles.experience}>{application.experience} exp.</span>
                    <span className={`${styles.applicationStatus} ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Job Postings */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Active Job Postings</h2>
              <button className={styles.viewAllButton}>Manage All</button>
            </div>
            <div className={styles.cardContent}>
              {activeJobPostings.map((job) => (
                <div key={job.id} className={styles.jobItem}>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{job.title}</h4>
                    <p className={styles.jobDepartment}>{job.department}</p>
                    <p className={styles.jobPosted}>Posted: {job.posted}</p>
                  </div>
                  <div className={styles.jobMeta}>
                    <span className={styles.applicantCount}>{job.applicants} applicants</span>
                    <span className={styles.jobStatus}>{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
