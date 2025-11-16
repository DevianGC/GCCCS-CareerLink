'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './ojt.module.css';

export default function StudentOJT() {
  const [ojtStatus, setOjtStatus] = useState('Not Started'); // 'Not Started', 'Looking', 'Applied', 'Active'
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showOJTModal, setShowOJTModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  
  const [studentData, setStudentData] = useState({
    studentId: '',
    name: '',
    email: '',
    year: '',
    major: '',
    gpa: 0,
    status: 'Not Started',
    notes: '',
    lastContact: new Date().toISOString().split('T')[0],
    // OJT details (only when Active)
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    supervisor: ''
  });

  const [ojtForm, setOjtForm] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    supervisor: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Load student profile
      const profileRes = await fetch('/api/profile', { cache: 'no-store' });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const profile = profileData?.profile || profileData?.user;
        
        // Load OJT data from database
        const ojtRes = await fetch('/api/ojt', { cache: 'no-store' });
        if (ojtRes.ok) {
          const ojtData = await ojtRes.json();
          
          if (ojtData.ojtData) {
            setStudentData({
              studentId: profile?.uid || ojtData.ojtData.studentId,
              name: profile?.fullName || profile?.name || '',
              email: profile?.email || '',
              year: profile?.yearLevel || profile?.year || '',
              major: profile?.program || profile?.major || '',
              gpa: profile?.gpa || 0,
              ...ojtData.ojtData
            });
            setOjtStatus(ojtData.ojtData.status || 'Not Started');
          } else {
            // No OJT record yet, use profile data
            setStudentData(prev => ({
              ...prev,
              studentId: profile?.uid || '',
              name: profile?.fullName || profile?.name || '',
              email: profile?.email || '',
              year: profile?.yearLevel || profile?.year || '',
              major: profile?.program || profile?.major || '',
              gpa: profile?.gpa || 0
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading OJT data:', error);
    }
  };

  const saveOJTData = async (data) => {
    try {
      const res = await fetch('/api/ojt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        throw new Error('Failed to save OJT data');
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error saving OJT data:', error);
      throw error;
    }
  };

  const handleStatusChange = async (newStatus) => {
    const updated = {
      ...studentData,
      status: newStatus,
      lastContact: new Date().toISOString().split('T')[0]
    };
    
    try {
      await saveOJTData(updated);
      setStudentData(updated);
      setOjtStatus(newStatus);
      setShowStatusModal(false);
      
      // If changing to Active, show OJT details modal
      if (newStatus === 'Active') {
        setShowOJTModal(true);
      }
    } catch (error) {
      alert('Failed to update status. Please try again.');
    }
  };

  const handleOJTSubmit = async (e) => {
    e.preventDefault();
    const updated = {
      ...studentData,
      ...ojtForm,
      status: 'Active',
      lastContact: new Date().toISOString().split('T')[0]
    };
    
    try {
      await saveOJTData(updated);
      setStudentData(updated);
      setOjtStatus('Active');
      setShowOJTModal(false);
    } catch (error) {
      alert('Failed to save OJT details. Please try again.');
    }
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();
    const notes = e.target.notes.value;
    const updated = {
      ...studentData,
      notes,
      lastContact: new Date().toISOString().split('T')[0]
    };
    
    try {
      await saveOJTData(updated);
      setStudentData(updated);
      setShowNotesModal(false);
    } catch (error) {
      alert('Failed to save notes. Please try again.');
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>My OJT Status</h1>
            <p>Monitor and update your On-the-Job Training status</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.statusBtn} onClick={() => setShowStatusModal(true)}>
              Update Status
            </button>
            {ojtStatus !== 'Not Started' && ojtStatus !== 'Active' && (
              <button className={styles.notesBtn} onClick={() => setShowNotesModal(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {studentData.notes ? 'Edit Notes' : 'Add Notes'}
              </button>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <h2>Current Status</h2>
            <span className={`${styles.statusBadge} ${styles['status' + ojtStatus.replace(' ', '')]}`}>
              {ojtStatus}
            </span>
          </div>

          <div className={styles.statusContent}>
            {ojtStatus === 'Not Started' && (
              <div className={styles.statusMessage}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>Not Started Yet</h3>
                <p>You haven't started your OJT journey. Update your status when you're ready to begin looking.</p>
              </div>
            )}

            {ojtStatus === 'Looking' && (
              <div className={styles.statusMessage}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3>Looking for OJT</h3>
                <p>You're actively searching for an OJT opportunity. Your faculty mentor can see this status and may reach out to help.</p>
                {studentData.notes && (
                  <div className={styles.notesDisplay}>
                    <strong>Your Notes:</strong>
                    <p>{studentData.notes}</p>
                  </div>
                )}
              </div>
            )}

            {ojtStatus === 'Applied' && (
              <div className={styles.statusMessage}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3>Application Submitted</h3>
                <p>You've applied to OJT positions and waiting for responses. Keep your faculty mentor informed.</p>
                {studentData.notes && (
                  <div className={styles.notesDisplay}>
                    <strong>Your Notes:</strong>
                    <p>{studentData.notes}</p>
                  </div>
                )}
              </div>
            )}

            {ojtStatus === 'Active' && (
              <div className={styles.ojtDetails}>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <span className={styles.label}>Company</span>
                      <span className={styles.value}>{studentData.company}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span className={styles.label}>Position</span>
                      <span className={styles.value}>{studentData.position}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span className={styles.label}>Duration</span>
                      <span className={styles.value}>{studentData.startDate} - {studentData.endDate}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <span className={styles.label}>Supervisor</span>
                      <span className={styles.value}>{studentData.supervisor}</span>
                    </div>
                  </div>
                </div>
                <button className={styles.editBtn} onClick={() => setShowOJTModal(true)}>
                  Edit OJT Details
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <h3>About This Page</h3>
          <p>This page helps your faculty mentor monitor your OJT progress. Keep your status updated so they can provide appropriate guidance and support.</p>
          <ul>
            <li><strong>Not Started:</strong> You haven't begun looking for an OJT yet</li>
            <li><strong>Looking:</strong> You're actively searching for opportunities</li>
            <li><strong>Applied:</strong> You've submitted applications and waiting for responses</li>
            <li><strong>Active:</strong> You've secured an OJT position and currently training</li>
          </ul>
        </div>

        {/* Status Selection Modal */}
        {showStatusModal && (
          <div className={styles.modal} onClick={() => setShowStatusModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Update OJT Status</h2>
                <button className={styles.closeBtn} onClick={() => setShowStatusModal(false)}>×</button>
              </div>
              <div className={styles.statusOptions}>
                <button
                  className={`${styles.statusOption} ${styles.statusNotStarted}`}
                  onClick={() => handleStatusChange('Not Started')}
                >
                  <h3>Not Started</h3>
                  <p>Haven't begun searching for OJT yet</p>
                </button>
                <button
                  className={`${styles.statusOption} ${styles.statusLooking}`}
                  onClick={() => handleStatusChange('Looking')}
                >
                  <h3>Looking</h3>
                  <p>Actively searching and browsing opportunities</p>
                </button>
                <button
                  className={`${styles.statusOption} ${styles.statusApplied}`}
                  onClick={() => handleStatusChange('Applied')}
                >
                  <h3>Applied</h3>
                  <p>Submitted applications, waiting for responses</p>
                </button>
                <button
                  className={`${styles.statusOption} ${styles.statusActive}`}
                  onClick={() => handleStatusChange('Active')}
                >
                  <h3>Active</h3>
                  <p>Currently in an OJT position</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OJT Details Modal */}
        {showOJTModal && (
          <div className={styles.modal} onClick={() => setShowOJTModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>OJT Details</h2>
                <button className={styles.closeBtn} onClick={() => setShowOJTModal(false)}>×</button>
              </div>
              <form onSubmit={handleOJTSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={ojtForm.company}
                    onChange={(e) => setOjtForm({...ojtForm, company: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Position *</label>
                  <input
                    type="text"
                    value={ojtForm.position}
                    onChange={(e) => setOjtForm({...ojtForm, position: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={ojtForm.startDate}
                    onChange={(e) => setOjtForm({...ojtForm, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={ojtForm.endDate}
                    onChange={(e) => setOjtForm({...ojtForm, endDate: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Supervisor Name *</label>
                  <input
                    type="text"
                    value={ojtForm.supervisor}
                    onChange={(e) => setOjtForm({...ojtForm, supervisor: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowOJTModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Save Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && (
          <div className={styles.modal} onClick={() => setShowNotesModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Notes for Faculty Mentor</h2>
                <button className={styles.closeBtn} onClick={() => setShowNotesModal(false)}>×</button>
              </div>
              <form onSubmit={handleNotesSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Your Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={studentData.notes}
                    rows="6"
                    placeholder="Share information about your OJT search, concerns, or questions for your faculty mentor..."
                  />
                  <small>This will be visible to your faculty mentor to help them guide you better.</small>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowNotesModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Save Notes
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
