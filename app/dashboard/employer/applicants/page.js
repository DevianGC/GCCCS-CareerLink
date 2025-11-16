'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './applicants.module.css';

export default function EmployerApplicants() {
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from Firebase
  useEffect(() => {
    if (!firebaseDb) return;

    const jobsQuery = query(collection(firebaseDb, 'jobs'));
    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
      }));
      setJobs(jobsData);
    });

    return () => unsubscribe();
  }, []);

  // Fetch applications with verified users only
  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      return;
    }

    const applicationsQuery = query(collection(firebaseDb, 'applications'));

    const unsubscribe = onSnapshot(applicationsQuery, async (snapshot) => {
      // Fetch user data for each application and filter verified users
      const applicantsWithUsers = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const appData = doc.data();
          
          // Fetch user data
          if (appData.userId) {
            try {
              const userQuery = query(
                collection(firebaseDb, 'users'),
                where('__name__', '==', appData.userId)
              );
              const userSnapshot = await getDocs(userQuery);
              
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                
                // Include user (checking for verified email or student role)
                // Students are considered verified if they have a role
                const isVerified = userData.emailVerified === true || userData.role === 'student';
                
                if (isVerified) {
                  return {
                    id: doc.id,
                    name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'Unknown',
                    email: userData.email || appData.email || 'N/A',
                    phone: userData.phone || 'N/A',
                    jobId: appData.jobId,
                    jobTitle: appData.jobTitle || appData.position || 'N/A',
                    appliedDate: appData.createdAt?.split('T')[0] || appData.date || 'N/A',
                    status: appData.status || 'New Application',
                    experience: userData.yearsOfExperience || userData.graduationYear || 'N/A',
                    education: userData.major || userData.degree || 'N/A',
                    skills: Array.isArray(userData.skills) ? userData.skills : [],
                    resume: appData.resumeName || 'resume.pdf',
                    resumeData: appData.resumeData,
                    coverLetter: appData.coverLetter || 'No cover letter provided',
                    rating: appData.rating || null,
                    userId: appData.userId
                  };
                }
              }
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          }
          return null;
        })
      );

      // Filter out null values (unverified users)
      const verifiedApplicants = applicantsWithUsers.filter(app => app !== null);
      
      // Sort by date (newest first)
      const sortedApplicants = verifiedApplicants.sort((a, b) => {
        const dateA = new Date(a.appliedDate);
        const dateB = new Date(b.appliedDate);
        return dateB - dateA;
      });

      setApplicants(sortedApplicants);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching applications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredApplicants = applicants.filter(applicant => {
    const jobMatch = selectedJob === 'all' || applicant.jobId === parseInt(selectedJob);
    const statusMatch = selectedStatus === 'all' || applicant.status === selectedStatus;
    return jobMatch && statusMatch;
  });

  const handleStatusChange = (applicantId, newStatus) => {
    setApplicants(prev => prev.map(applicant => 
      applicant.id === applicantId 
        ? { ...applicant, status: newStatus }
        : applicant
    ));
  };

  const handleRatingChange = (applicantId, rating) => {
    setApplicants(prev => prev.map(applicant => 
      applicant.id === applicantId 
        ? { ...applicant, rating: rating }
        : applicant
    ));
  };

  const handleDownloadResume = (resumeData, resumeName) => {
    if (!resumeData) {
      alert('Resume not available');
      return;
    }

    try {
      // Convert base64 to blob
      const base64Data = resumeData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resumeName || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume');
    }
  };

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
      case 'Rejected':
        return styles.statusRejected;
      case 'Hired':
        return styles.statusHired;
      default:
        return styles.statusDefault;
    }
  };


  const renderStars = (rating, applicantId, interactive = false) => {
    return (
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={`${styles.star} ${star <= (rating || 0) ? styles.starFilled : ''}`}
            onClick={interactive ? () => handleRatingChange(applicantId, star) : undefined}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout userType="employer">
      <div className={styles.applicantsContainer}>
        <div className={styles.applicantsHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Applicant Management</h1>
            <p className={styles.pageSubtitle}>Review and manage job applications</p>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Filter by Job:</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="New Application">New Application</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Rejected">Rejected</option>
              <option value="Hired">Hired</option>
            </select>
          </div>

          <div className={styles.resultsCount}>
            {loading ? 'Loading...' : `${filteredApplicants.length} applicant${filteredApplicants.length !== 1 ? 's' : ''} found`}
          </div>
        </div>

        {/* Applicants List */}
        <div className={styles.applicantsList}>
          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading applicants...</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <h3>No Applicants Found</h3>
              <p>No applicants match your current filters.</p>
            </div>
          ) : (
            filteredApplicants.map(applicant => (
            <div key={applicant.id} className={styles.applicantCard}>
              <div className={styles.applicantHeader}>
                <div className={styles.applicantInfo}>
                  <h3 className={styles.applicantName}>{applicant.name}</h3>
                  <p className={styles.applicantJob}>{applicant.jobTitle}</p>
                  <p className={styles.applicantDate}>Applied: {applicant.appliedDate}</p>
                </div>
                <div className={styles.applicantMeta}>
                  <span className={`${styles.applicantStatus} ${getStatusColor(applicant.status)}`}>
                    {applicant.status}
                  </span>
                  {renderStars(applicant.rating, applicant.id, true)}
                </div>
              </div>

              <div className={styles.applicantDetails}>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Experience:</span>
                    <span className={styles.detailValue}>{applicant.experience}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Education:</span>
                    <span className={styles.detailValue}>{applicant.education}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{applicant.email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phone:</span>
                    <span className={styles.detailValue}>{applicant.phone}</span>
                  </div>
                </div>

                <div className={styles.skillsContainer}>
                  <span className={styles.detailLabel}>Skills:</span>
                  <div className={styles.skillsList}>
                    {applicant.skills.map(skill => (
                      <span key={skill} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.applicantActions}>
                <button
                  onClick={() => handleDownloadResume(applicant.resumeData, applicant.resume)}
                  className={styles.resumeButton}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 9V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8 10L8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5 5L8 2L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                   Resume
                </button>
                
                <div className={styles.statusActions}>
                  <select
                    value={applicant.status}
                    onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value="New Application">New Application</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
