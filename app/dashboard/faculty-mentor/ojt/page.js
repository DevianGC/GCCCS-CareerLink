'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './ojt.module.css';

export default function ManageStudentsOJT() {
  const [activeTab, setActiveTab] = useState('without-ojt');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [studentsWithoutOJT, setStudentsWithoutOJT] = useState([]);

  const [studentsWithOJT, setStudentsWithOJT] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Fetch students data from API
  useEffect(() => {
    fetchStudentsData();
  }, []);

  const fetchStudentsData = async () => {
    setLoading(true);
    try {
      // Fetch all students with role 'student'
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        const students = data.students || [];
        
        // Separate students with and without OJT
        const withOJT = students.filter(s => s.ojtCompany || s.ojtStatus === 'Active');
        const withoutOJT = students.filter(s => !s.ojtCompany && s.ojtStatus !== 'Active');
        
        setStudentsWithOJT(withOJT.map(s => ({
          id: s.uid,
          name: s.fullName || `${s.firstName} ${s.lastName}`,
          studentId: s.studentId || 'N/A',
          year: s.year || 'N/A',
          major: s.major || s.degree || 'N/A',
          email: s.email,
          phone: s.phone || 'N/A',
          company: s.ojtCompany || 'N/A',
          position: s.ojtPosition || 'N/A',
          startDate: s.ojtStartDate || 'N/A',
          endDate: s.ojtEndDate || 'N/A',
          supervisor: s.ojtSupervisor || 'N/A',
          status: s.ojtStatus || 'N/A',
          hoursCompleted: s.ojtHoursCompleted || 0,
          totalHours: s.ojtTotalHours || 400
        })));
        
        setStudentsWithoutOJT(withoutOJT.map(s => ({
          id: s.uid,
          name: s.fullName || `${s.firstName} ${s.lastName}`,
          studentId: s.studentId || 'N/A',
          year: s.year || 'N/A',
          major: s.major || s.degree || 'N/A',
          email: s.email,
          phone: s.phone || 'N/A',
          gpa: s.gpa || 'N/A',
          lastContact: s.lastContact || 'N/A',
          status: s.ojtSearchStatus || 'Not Started',
          notes: s.ojtNotes || ''
        })));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = (activeTab === 'without-ojt' ? studentsWithoutOJT : studentsWithOJT)
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleContactStudent = (student) => {
    setSelectedStudent(student);
    setShowContactModal(true);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setShowContactModal(false);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Looking': return styles.statusLooking;
      case 'Not Started': return styles.statusNotStarted;
      case 'Applied': return styles.statusApplied;
      case 'Active': return styles.statusActive;
      default: return '';
    }
  };

  return (
    <DashboardLayout userType="faculty-mentor">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Manage Students OJT</h1>
            <p>Monitor and assist students with their On-the-Job Training</p>
          </div>
          <div className={styles.searchBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>{studentsWithoutOJT.length}</h3>
              <p>Without OJT</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>{studentsWithOJT.length}</h3>
              <p>With Active OJT</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>{Math.round((studentsWithOJT.length / (studentsWithOJT.length + studentsWithoutOJT.length)) * 100)}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'without-ojt' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('without-ojt')}
          >
            Without OJT ({studentsWithoutOJT.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'with-ojt' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('with-ojt')}
          >
            With OJT ({studentsWithOJT.length})
          </button>
        </div>

        {/* Students List */}
        {loading ? (
          <div className={styles.loading}>Loading students data...</div>
        ) : activeTab === 'without-ojt' ? (
          <div className={styles.studentsList}>
            {filteredStudents.length === 0 ? (
              <div className={styles.emptyState}>No students found</div>
            ) : (
              filteredStudents.map((student) => (
              <div key={student.id} className={styles.studentCard}>
                <div className={styles.studentHeader}>
                  <div>
                    <h3>{student.name}</h3>
                    <p className={styles.studentId}>{student.studentId}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(student.status)}`}>
                    {student.status}
                  </span>
                </div>

                <div className={styles.studentInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Year:</span>
                    <span>{student.year}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Major:</span>
                    <span>{student.major}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>GPA:</span>
                    <span>{student.gpa}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Last Contact:</span>
                    <span>{student.lastContact}</span>
                  </div>
                </div>

                {student.notes && (
                  <div className={styles.notes}>
                    <strong>Notes:</strong> {student.notes}
                  </div>
                )}

                <div className={styles.studentActions}>
                  <button 
                    className={styles.contactBtn}
                    onClick={() => handleContactStudent(student)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Student
                  </button>
                  <button className={styles.viewBtn}>View Details</button>
                </div>
              </div>
            )))}
          </div>
        ) : (
          <div className={styles.ojtList}>
            {filteredStudents.length === 0 ? (
              <div className={styles.emptyState}>No students found</div>
            ) : (
              filteredStudents.map((student) => (
              <div key={student.id} className={styles.ojtCard}>
                <div className={styles.ojtHeader}>
                  <div>
                    <h3>{student.name}</h3>
                    <p className={styles.studentId}>{student.studentId}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(student.status)}`}>
                    {student.status}
                  </span>
                </div>

                <div className={styles.companyInfo}>
                  <div className={styles.companyHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h4>{student.company}</h4>
                      <p>{student.position}</p>
                    </div>
                  </div>

                  <div className={styles.ojtDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Duration:</span>
                      <span>{student.startDate} - {student.endDate}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Supervisor:</span>
                      <span>{student.supervisor}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span>Progress</span>
                    <span className={styles.hoursText}>
                      {student.hoursCompleted} / {student.totalHours} hours
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${(student.hoursCompleted / student.totalHours) * 100}%` }}
                    />
                  </div>
                </div>

                <div className={styles.studentActions}>
                  <button 
                    className={styles.contactBtn}
                    onClick={() => handleContactStudent(student)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Student
                  </button>
                  <button className={styles.viewBtn}>View Details</button>
                </div>
              </div>
            )))}
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedStudent && (
          <div className={styles.modal} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Contact Student</h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
              </div>

              <div className={styles.contactInfo}>
                <h3>{selectedStudent.name}</h3>
                <p className={styles.studentId}>{selectedStudent.studentId}</p>

                <div className={styles.contactDetails}>
                  <div className={styles.contactItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${selectedStudent.email}`}>{selectedStudent.email}</a>
                  </div>
                  <div className={styles.contactItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${selectedStudent.phone}`}>{selectedStudent.phone}</a>
                  </div>
                </div>
              </div>

              <div className={styles.messageForm}>
                <label>Send Message</label>
                <textarea
                  rows="6"
                  placeholder="Type your message here..."
                />
                <button className={styles.sendBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
