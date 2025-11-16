'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './reports.module.css';

export default function ReportsPage() {
  const [applications, setApplications] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load applications for reports with real-time listener
  useEffect(() => {
    if (!firebaseDb) {
      setLoading(false);
      return;
    }

    const applicationsQuery = query(
      collection(firebaseDb, 'applications')
    );

    const unsubscribe = onSnapshot(applicationsQuery, async (snapshot) => {
      console.log('Applications fetched:', snapshot.docs.length);
      
      // Fetch user data for each application
      const applicationsWithUsers = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const appData = doc.data();
          console.log('Application data:', {
            id: doc.id,
            hasResume: !!appData.resumeData,
            resumeName: appData.resumeName,
            resumeDataLength: appData.resumeData?.length
          });
          
          let userName = 'Unknown User';
          
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
                userName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email || 'Unknown User';
              }
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          }
          
          return {
            id: doc.id,
            ...appData,
            userName,
            date: appData.createdAt || appData.date || new Date().toISOString()
          };
        })
      );

      const sortedApplications = applicationsWithUsers.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB - dateA;
      });
      
      setApplications(sortedApplications);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching applications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    const fileName = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    const csvContent = generateCSV(applications);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  // Generate CSV content from report data
  const generateCSV = (rows) => {
    const headers = ['Student Name', 'Job Title', 'Company', 'Status', 'Date', 'Resume Name'];
    const csvRows = rows.map(a => [
      quote(a.userName || 'Unknown'),
      quote(a.jobTitle),
      quote(a.company),
      a.status,
      a.date,
      quote(a.resumeName || '')
    ]);
    
    return [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
  };
  const quote = (s) => {
    const v = String(s == null ? '' : s);
    return v.includes(',') ? '"' + v.replace(/"/g, '""') + '"' : v;
  };

  const handleDownloadResume = (row) => {
    if (!row?.resumeData) {
      alert('No resume available for this application');
      return;
    }
    
    try {
      // Extract base64 data from data URL (format: data:application/pdf;base64,xxxxx)
      const base64Data = row.resumeData;
      
      // Check if it's a valid data URL
      if (!base64Data.startsWith('data:')) {
        alert('Invalid resume format');
        return;
      }
      
      // Split to get the base64 part
      const [header, data] = base64Data.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'application/pdf';
      
      // Convert base64 to binary
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = row.resumeName || `resume-${row.userName || 'applicant'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. The file may be corrupted.');
    }
  };

  return (
    <DashboardLayout userType="career-office">
      <div className={styles.reportsContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Applications Report</h1>
          <div className={styles.reportControls}>
            <button 
              className={styles.exportButton}
              onClick={handleExport}
              disabled={isExporting || applications.length === 0}
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        <div className={styles.reportsTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Date</th>
                <th>Resume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((row) => (
                  <tr key={row.id}>
                    <td>{row.userName || 'Unknown User'}</td>
                    <td>{row.jobTitle}</td>
                    <td>{row.company}</td>
                    <td>{row.status}</td>
                    <td>{new Date(row.date).toLocaleDateString()}</td>
                    <td>{row.resumeName ? row.resumeName : '—'}</td>
                    <td>
                      <button 
                        className={styles.viewButton}
                        onClick={() => setViewRow(row)}
                      >
                        View
                      </button>
                      {row.resumeData ? (
                        <button 
                          className={styles.downloadButton}
                          onClick={() => handleDownloadResume(row)}
                          title="Download Resume"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                            <path d="M12 15L12 3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 15L3 18C3 19.6569 4.34315 21 6 21L18 21C19.6569 21 21 19.6569 21 18L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Download Resume
                        </button>
                      ) : (
                        <span className={styles.noResume}>No Resume</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noReports}>
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {viewRow && (
          <div className={styles.modalOverlay} onClick={() => setViewRow(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>Application #{viewRow.id}</div>
              <div className={styles.modalBody}>
                <div><strong>Student:</strong> {viewRow.userName || 'Unknown User'}</div>
                <div><strong>Job:</strong> {viewRow.jobTitle}</div>
                <div><strong>Company:</strong> {viewRow.company}</div>
                <div><strong>Status:</strong> {viewRow.status}</div>
                <div><strong>Date:</strong> {new Date(viewRow.date).toLocaleDateString()}</div>
                <div><strong>Resume:</strong> {viewRow.resumeName || '—'}</div>
                {viewRow.resumeData && (
                  <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '0.875rem' }}>
                    ✓ Resume file available ({(viewRow.resumeData.length * 3 / 4 / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
              <div className={styles.modalActions}>
                <button className={styles.btnBase} onClick={() => setViewRow(null)}>Close</button>
                {viewRow.resumeData ? (
                  <button className={`${styles.btnBase} ${styles.btnPrimary}`} onClick={() => { handleDownloadResume(viewRow); }}>Download Resume</button>
                ) : (
                  <button className={`${styles.btnBase}`} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>No Resume Available</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}