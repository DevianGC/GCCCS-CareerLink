'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './students.module.css';

export default function CareerOfficeStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('all');
  const [selectedGradYear, setSelectedGradYear] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Real-time listener for registered and verified users
  useEffect(() => {
    const usersQuery = query(
      collection(firebaseDb, 'users'),
      where('role', 'in', ['student', 'alumni'])
    );

    const unsubscribe = onSnapshot(usersQuery, async (snapshot) => {
      const usersData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const userData = doc.data();
          
          // Fetch application count for this user
          const applicationsQuery = query(
            collection(firebaseDb, 'applications'),
            where('userId', '==', doc.id)
          );
          const applicationsSnapshot = await onSnapshot(applicationsQuery, () => {});
          const applicationsCount = (await new Promise((resolve) => {
            const unsub = onSnapshot(applicationsQuery, (snap) => {
              unsub();
              resolve(snap.size);
            });
          }));
          
          // Fetch event registrations count for this user
          const eventsQuery = query(
            collection(firebaseDb, 'eventRegistrations'),
            where('userId', '==', doc.id)
          );
          const eventsCount = (await new Promise((resolve) => {
            const unsub = onSnapshot(eventsQuery, (snap) => {
              unsub();
              resolve(snap.size);
            }, (error) => {
              unsub();
              resolve(0);
            });
          }));
          
          return {
            id: doc.id,
            ...userData,
            applications: applicationsCount || 0,
            eventsRegistered: eventsCount || 0,
            skills: Array.isArray(userData.skills) ? userData.skills : [],
            profileCompletion: calculateProfileCompletion(userData)
          };
        })
      );
      
      const sortedUsers = usersData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      
      setStudents(sortedUsers);
      setFilteredStudents(sortedUsers);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching students:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    const fields = ['firstName', 'lastName', 'email', 'major', 'graduationYear', 'university', 'skills', 'gpa', 'location'];
    const filledFields = fields.filter(field => userData[field] && userData[field] !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Apply filters
  useEffect(() => {
    let result = [...students];

    // Search filter
    if (searchTerm) {
      result = result.filter(student => {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
        const email = (student.email || '').toLowerCase();
        const major = (student.major || '').toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || 
               email.includes(searchTerm.toLowerCase()) ||
               major.includes(searchTerm.toLowerCase());
      });
    }

    // Major filter
    if (selectedMajor !== 'all') {
      result = result.filter(student => student.major === selectedMajor);
    }

    // Graduation year filter
    if (selectedGradYear !== 'all') {
      result = result.filter(student => student.graduationYear === parseInt(selectedGradYear));
    }

    // Availability filter
    if (selectedAvailability !== 'all') {
      result = result.filter(student => student.availability === selectedAvailability);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`;
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`;
          return nameA.localeCompare(nameB);
        case 'gpa':
          return (b.gpa || 0) - (a.gpa || 0);
        case 'applications':
          return (b.applications || 0) - (a.applications || 0);
        case 'recent':
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        default:
          return 0;
      }
    });

    setFilteredStudents(result);
  }, [students, searchTerm, selectedMajor, selectedGradYear, selectedAvailability, sortBy]);

  // Get unique majors from students
  const uniqueMajors = [...new Set(students.map(s => s.major).filter(Boolean))];

  // Get unique graduation years
  const uniqueGradYears = [...new Set(students.map(s => s.graduationYear).filter(Boolean))].sort();

  // State
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Sort students for display
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const nameA = `${a.firstName || ''} ${a.lastName || ''}`;
    const nameB = `${b.firstName || ''} ${b.lastName || ''}`;
    
    switch (sortBy) {
      case 'name':
        return nameA.localeCompare(nameB);
      case 'gpa':
        return (b.gpa || 0) - (a.gpa || 0);
      case 'graduationYear':
        return (a.graduationYear || 0) - (b.graduationYear || 0);
      case 'profileCompletion':
        return (b.profileCompletion || 0) - (a.profileCompletion || 0);
      case 'applications':
        return (b.applications || 0) - (a.applications || 0);
      default:
        return 0;
    }
  });

  // Get unique availability options for filter
  const uniqueAvailability = [...new Set(students.map(s => s.availability).filter(Boolean))];

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  // Handle close student detail
  const handleCloseStudentDetail = () => {
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <DashboardLayout userType="career-office">
        <div className={styles.studentsContainer}>
          <div className={styles.loading}>Loading student profiles...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="career-office">
      <div className={styles.studentsContainer}>
        <div className={styles.studentsHeader}>
          <h1 className={styles.studentsTitle}>Student Profiles</h1>
          <div className={styles.studentsActions}>
            <button className={`btn ${styles.exportButton}`}>
              Export Data
            </button>
            <button className={`btn ${styles.bulkEmailButton}`}>
              Send Bulk Email
            </button>
          </div>
        </div>

        <div className={styles.studentsContent}>
          {/* Left Panel - Filters */}
          <div className={styles.filtersPanel}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button 
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Major</h3>
              <select
                className={styles.filterSelect}
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
              >
                <option value="all">All Majors</option>
                {uniqueMajors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Graduation Year</h3>
              <select
                className={styles.filterSelect}
                value={selectedGradYear}
                onChange={(e) => setSelectedGradYear(e.target.value)}
              >
                <option value="all">All Years</option>
                {uniqueGradYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Availability</h3>
              <select
                className={styles.filterSelect}
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
              >
                <option value="all">All Availability</option>
                {uniqueAvailability.map(availability => (
                  <option key={availability} value={availability}>{availability}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Sort By</h3>
              <select
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="gpa">GPA (Highest First)</option>
                <option value="graduationYear">Graduation Year (Earliest First)</option>
                <option value="profileCompletion">Profile Completion</option>
              </select>
            </div>

            <button 
              className={styles.clearFiltersButton}
              onClick={() => {
                setSearchTerm('');
                setSelectedMajor('all');
                setSelectedGradYear('all');
                setSelectedAvailability('all');
                setSortBy('name');
              }}
            >
              Clear All Filters
            </button>
          </div>

          {/* Middle Panel - Students List */}
          <div className={styles.studentsList}>
            <div className={styles.studentsListHeader}>
              <div className={styles.studentsCount}>
                {sortedStudents.length} {sortedStudents.length === 1 ? 'student' : 'students'} found
              </div>
            </div>

            {sortedStudents.length > 0 ? (
              <div className={styles.studentsGrid}>
                {sortedStudents.map(student => (
                  <div 
                    key={student.id} 
                    className={`${styles.studentCard} ${selectedStudent?.id === student.id ? styles.selectedStudent : ''}`}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className={styles.studentAvatar}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className={styles.studentInfo}>
                      <h3 className={styles.studentName}>
                        {`${student.firstName || ''} ${student.lastName || ''}`.trim() || 'No Name'}
                      </h3>
                      <div className={styles.studentMajor}>{student.major || 'N/A'}</div>
                      <div className={styles.studentUniversity}>{student.university || 'N/A'}</div>
                      <div className={styles.studentGradYear}>
                        Class of {student.graduationYear || 'N/A'}
                      </div>
                      
                      <div className={styles.studentStats}>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>{student.applications || 0}</span>
                          <span className={styles.statLabel}>applications</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>{student.eventsRegistered || 0}</span>
                          <span className={styles.statLabel}>events</span>
                        </div>
                      </div>
                      
                      <div className={styles.studentSkills}>
                        {(student.skills || []).slice(0, 3).map((skill, index) => (
                          <span key={index} className={styles.skillBadge}>{skill}</span>
                        ))}
                        {(student.skills || []).length > 3 && (
                          <span className={styles.moreSkills}>+{student.skills.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noStudents}>
                <div className={styles.noStudentsIcon}>🔍</div>
                <h3>No students found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Right Panel - Student Detail */}
          <div className={`${styles.studentDetail} ${selectedStudent ? styles.studentDetailActive : ''}`}>
            {selectedStudent && (
              <div className={styles.studentDetailContent}>
                <div className={styles.studentDetailHeader}>
                  <button 
                    className={styles.closeButton}
                    onClick={handleCloseStudentDetail}
                  >
                    ×
                  </button>
                  <div className={styles.studentDetailAvatar}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h2 className={styles.studentDetailName}>
                    {`${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim() || 'No Name'}
                  </h2>
                  <div className={styles.studentDetailMajor}>{selectedStudent.major || 'N/A'}</div>
                  <div className={styles.studentDetailUniversity}>{selectedStudent.university || 'N/A'}</div>
                  <div className={styles.studentDetailGradYear}>Class of {selectedStudent.graduationYear || 'N/A'}</div>
                </div>

                <div className={styles.studentDetailBody}>
                  <div className={styles.studentDetailSection}>
                    <h3 className={styles.sectionTitle}>Contact Information</h3>
                    <div className={styles.studentDetailItem}>
                      <span className={styles.detailLabel}>Email:</span>
                      <span>{selectedStudent.email || 'N/A'}</span>
                    </div>
                    <div className={styles.studentDetailItem}>
                      <span className={styles.detailLabel}>Location:</span>
                      <span>{selectedStudent.location || 'N/A'}</span>
                    </div>
                  </div>

                  <div className={styles.studentDetailSection}>
                    <h3 className={styles.sectionTitle}>Academic Information</h3>
                    <div className={styles.studentDetailItem}>
                      <span className={styles.detailLabel}>GPA:</span>
                      <span>{selectedStudent.gpa || 'N/A'}</span>
                    </div>
                    <div className={styles.studentDetailItem}>
                      <span className={styles.detailLabel}>Availability:</span>
                      <span>{selectedStudent.availability || 'N/A'}</span>
                    </div>
                  </div>

                  <div className={styles.studentDetailSection}>
                    <h3 className={styles.sectionTitle}>Skills</h3>
                    <div className={styles.skillsList}>
                      {(selectedStudent.skills || []).map((skill, index) => (
                        <span key={index} className={styles.skillBadge}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.studentDetailSection}>
                    <h3 className={styles.sectionTitle}>Job Preferences</h3>
                    <div className={styles.preferencesList}>
                      {selectedStudent.jobPreferences ? 
                        (typeof selectedStudent.jobPreferences === 'string' ? 
                          <p>{selectedStudent.jobPreferences}</p> : 
                          Array.isArray(selectedStudent.jobPreferences) ?
                            <ul>
                              {selectedStudent.jobPreferences.map((preference, index) => (
                                <li key={index} className={styles.preferenceItem}>{preference}</li>
                              ))}
                            </ul> : 
                            <p>N/A</p>
                        ) : 
                        <p>N/A</p>
                      }
                    </div>
                  </div>

                  <div className={styles.studentDetailSection}>
                    <h3 className={styles.sectionTitle}>Activity</h3>
                    <div className={styles.applicationStats}>
                      <div className={styles.applicationStat}>
                        <div className={styles.statValue}>{selectedStudent.applications || 0}</div>
                        <div className={styles.statLabel}>Applications</div>
                      </div>
                      <div className={styles.applicationStat}>
                        <div className={styles.statValue}>{selectedStudent.eventsRegistered || 0}</div>
                        <div className={styles.statLabel}>Events Registered</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.studentDetailActions}>
                  <button className={`btn ${styles.downloadResumeButton}`}>
                    Download Resume
                  </button>
                  <button className={`btn ${styles.hideButton}`} onClick={handleCloseStudentDetail}>
                    Hide
                  </button>
                </div>
              </div>
            )}

            {!selectedStudent && (
              <div className={styles.noStudentSelected}>
                <div className={styles.noStudentSelectedIcon}>👈</div>
                <h3>No student selected</h3>
                <p>Select a student from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}