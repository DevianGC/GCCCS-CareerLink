'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '../../../../lib/firebaseClient';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './profile.module.css';

export default function AlumniProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    website: '',
    bio: '',
    profileImage: '',
    
    // Career Details
    currentCompany: '',
    currentPosition: '',
    industry: '',
    yearsOfExperience: '',
    employmentType: 'Full-time',
    startDate: '',
    skills: [],
    
    // Education
    graduationYear: '',
    degree: '',
    major: '',
    minor: '',
    gpa: '',
    
    // Achievements
    achievements: [],
    certifications: [],
    awards: [],
    publications: [],
    
    // Mentorship Preferences
    availableForMentorship: true,
    mentorshipAreas: [],
    maxMentees: 3,
    preferredMeetingFrequency: 'Bi-weekly',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '', date: '' });
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', date: '', url: '' });
  const [newAward, setNewAward] = useState({ title: '', issuer: '', date: '', description: '' });

  // Get current user
  useEffect(() => {
    const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchProfileData();
    }
  }, [currentUserId]);

  const fetchProfileData = async () => {
    if (!currentUserId || !firebaseDb) {
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(firebaseDb, 'users', currentUserId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Merge Firebase data with default structure
        setProfileData({
          // Personal Information
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          linkedIn: userData.linkedIn || '',
          website: userData.website || '',
          bio: userData.bio || '',
          profileImage: userData.profileImage || '',
          
          // Career Details
          currentCompany: userData.currentCompany || '',
          currentPosition: userData.currentPosition || '',
          industry: userData.industry || '',
          yearsOfExperience: userData.yearsOfExperience || '',
          employmentType: userData.employmentType || 'Full-time',
          startDate: userData.startDate || '',
          skills: userData.skills || [],
          
          // Education
          graduationYear: userData.graduationYear || '',
          degree: userData.degree || '',
          major: userData.major || '',
          minor: userData.minor || '',
          gpa: userData.gpa || '',
          
          // Achievements
          achievements: userData.achievements || [],
          certifications: userData.certifications || [],
          awards: userData.awards || [],
          publications: userData.publications || [],
          
          // Mentorship Preferences
          availableForMentorship: userData.availableForMentorship !== undefined ? userData.availableForMentorship : true,
          mentorshipAreas: userData.mentorshipAreas || [],
          maxMentees: userData.maxMentees || 3,
          preferredMeetingFrequency: userData.preferredMeetingFrequency || 'Bi-weekly',
        });
      } else {
        // If user document doesn't exist, get data from Firebase Auth
        const currentUser = firebaseAuth.currentUser;
        if (currentUser) {
          setProfileData(prev => ({
            ...prev,
            firstName: currentUser.displayName?.split(' ')[0] || '',
            lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            email: currentUser.email || '',
          }));
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!currentUserId || !firebaseDb) {
      alert('Unable to save profile. Please log in again.');
      return;
    }

    setSaving(true);
    try {
      const userDocRef = doc(firebaseDb, 'users', currentUserId);
      
      // Update the user document with all profile data
      await setDoc(userDocRef, {
        ...profileData,
        role: 'alumni', // Ensure role is set
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddAchievement = () => {
    if (newAchievement.title.trim()) {
      const achievement = {
        id: Date.now(),
        ...newAchievement
      };
      setProfileData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievement]
      }));
      setNewAchievement({ title: '', description: '', date: '' });
    }
  };

  const handleRemoveAchievement = (id) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== id)
    }));
  };

  const handleAddCertification = () => {
    if (newCertification.name.trim()) {
      const certification = {
        id: Date.now(),
        ...newCertification
      };
      setProfileData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certification]
      }));
      setNewCertification({ name: '', issuer: '', date: '', url: '' });
    }
  };

  const handleRemoveCertification = (id) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id)
    }));
  };

  const handleAddAward = () => {
    if (newAward.title.trim()) {
      const award = {
        id: Date.now(),
        ...newAward
      };
      setProfileData(prev => ({
        ...prev,
        awards: [...prev.awards, award]
      }));
      setNewAward({ title: '', issuer: '', date: '', description: '' });
    }
  };

  const handleRemoveAward = (id) => {
    setProfileData(prev => ({
      ...prev,
      awards: prev.awards.filter(a => a.id !== id)
    }));
  };

  const toggleMentorshipArea = (area) => {
    setProfileData(prev => ({
      ...prev,
      mentorshipAreas: prev.mentorshipAreas.includes(area)
        ? prev.mentorshipAreas.filter(a => a !== area)
        : [...prev.mentorshipAreas, area]
    }));
  };

  if (loading) {
    return (
      <DashboardLayout userType="alumni">
        <div className={styles.container}>
          <div className={styles.loading}>Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="alumni">
      <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Alumni Profile</h1>
          <p className={styles.subtitle}>Manage your professional information and achievements</p>
        </div>
        <div className={styles.headerActions}>
          {!isEditing ? (
            <button className={styles.editButton} onClick={() => setIsEditing(true)}>
               Edit Profile
            </button>
          ) : (
            <>
              <button className={styles.cancelButton} onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button 
                className={styles.saveButton} 
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Section Navigation */}
      <div className={styles.sectionNav}>
        <button
          className={`${styles.navButton} ${activeSection === 'personal' ? styles.activeNav : ''}`}
          onClick={() => setActiveSection('personal')}
        >
          Personal Info
        </button>
        <button
          className={`${styles.navButton} ${activeSection === 'career' ? styles.activeNav : ''}`}
          onClick={() => setActiveSection('career')}
        >
          Career Details
        </button>
        <button
          className={`${styles.navButton} ${activeSection === 'achievements' ? styles.activeNav : ''}`}
          onClick={() => setActiveSection('achievements')}
        >
          Achievements
        </button>
        <button
          className={`${styles.navButton} ${activeSection === 'mentorship' ? styles.activeNav : ''}`}
          onClick={() => setActiveSection('mentorship')}
        >
          Mentorship
        </button>
      </div>

      {/* Personal Information Section */}
      {activeSection === 'personal' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>First Name *</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Last Name *</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                placeholder="City, State/Country"
              />
            </div>

            <div className={styles.formGroup}>
              <label>LinkedIn Profile</label>
              <input
                type="url"
                value={profileData.linkedIn}
                onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Personal Website</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Graduation Year</label>
              <input
                type="text"
                value={profileData.graduationYear}
                onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                disabled={!isEditing}
                placeholder="2020"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Professional Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              rows="4"
              placeholder="Tell students about your professional journey and expertise..."
            />
          </div>
        </div>
      )}

      {/* Career Details Section */}
      {activeSection === 'career' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Career Details</h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Current Company *</label>
              <input
                type="text"
                value={profileData.currentCompany}
                onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Current Position *</label>
              <input
                type="text"
                value={profileData.currentPosition}
                onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Industry</label>
              <input
                type="text"
                value={profileData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Technology, Finance, Healthcare"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Years of Experience</label>
              <input
                type="number"
                value={profileData.yearsOfExperience}
                onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                disabled={!isEditing}
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Employment Type</label>
              <select
                value={profileData.employmentType}
                onChange={(e) => handleInputChange('employmentType', e.target.value)}
                disabled={!isEditing}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Self-employed">Self-employed</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input
                type="month"
                value={profileData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Skills Section */}
          <div className={styles.skillsSection}>
            <h3>Skills & Expertise</h3>
            <div className={styles.skillsContainer}>
              {profileData.skills.map((skill, index) => (
                <div key={index} className={styles.skillTag}>
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      className={styles.removeSkillButton}
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className={styles.addSkillForm}>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <button onClick={handleAddSkill} className={styles.addButton}>
                  + Add Skill
                </button>
              </div>
            )}
          </div>

          {/* Education Details */}
          <div className={styles.educationSection}>
            <h3>Education</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Degree</label>
                <input
                  type="text"
                  value={profileData.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Bachelor of Science"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Major</label>
                <input
                  type="text"
                  value={profileData.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Minor (Optional)</label>
                <input
                  type="text"
                  value={profileData.minor}
                  onChange={(e) => handleInputChange('minor', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className={styles.formGroup}>
                <label>GPA (Optional)</label>
                <input
                  type="text"
                  value={profileData.gpa}
                  onChange={(e) => handleInputChange('gpa', e.target.value)}
                  disabled={!isEditing}
                  placeholder="3.5"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Section */}
      {activeSection === 'achievements' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Achievements & Recognition</h2>
          
          {/* Professional Achievements */}
          <div className={styles.achievementsSection}>
            <h3>Professional Achievements</h3>
            {profileData.achievements.map((achievement) => (
              <div key={achievement.id} className={styles.achievementCard}>
                <div className={styles.achievementHeader}>
                  <div>
                    <h4>{achievement.title}</h4>
                    <p className={styles.achievementDate}>
                      {new Date(achievement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveAchievement(achievement.id)}
                    >
                       Remove
                    </button>
                  )}
                </div>
                <p className={styles.achievementDescription}>{achievement.description}</p>
              </div>
            ))}
            
            {isEditing && (
              <div className={styles.addForm}>
                <h4>Add New Achievement</h4>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                    placeholder="Achievement title"
                  />
                </div>
                <div className={styles.formGroup}>
                  <textarea
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                    placeholder="Description"
                    rows="3"
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="month"
                    value={newAchievement.date}
                    onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                  />
                </div>
                <button onClick={handleAddAchievement} className={styles.addButton}>
                  + Add Achievement
                </button>
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className={styles.certificationsSection}>
            <h3>Certifications</h3>
            {profileData.certifications.map((cert) => (
              <div key={cert.id} className={styles.certCard}>
                <div className={styles.certHeader}>
                  <div>
                    <h4>{cert.name}</h4>
                    <p className={styles.certIssuer}>{cert.issuer}</p>
                    <p className={styles.certDate}>
                      Issued: {new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer" className={styles.certLink}>
                        View Credential →
                      </a>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveCertification(cert.id)}
                    >
                       Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isEditing && (
              <div className={styles.addForm}>
                <h4>Add Certification</h4>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      value={newCertification.name}
                      onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                      placeholder="Certification name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      value={newCertification.issuer}
                      onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                      placeholder="Issuing organization"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="month"
                      value={newCertification.date}
                      onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="url"
                      value={newCertification.url}
                      onChange={(e) => setNewCertification({ ...newCertification, url: e.target.value })}
                      placeholder="Credential URL (optional)"
                    />
                  </div>
                </div>
                <button onClick={handleAddCertification} className={styles.addButton}>
                  + Add Certification
                </button>
              </div>
            )}
          </div>

          {/* Awards */}
          <div className={styles.awardsSection}>
            <h3>Awards & Honors</h3>
            {profileData.awards.map((award) => (
              <div key={award.id} className={styles.awardCard}>
                <div className={styles.awardHeader}>
                  <div>
                    <h4>{award.title}</h4>
                    <p className={styles.awardIssuer}>{award.issuer}</p>
                    <p className={styles.awardDate}>
                      {new Date(award.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                    {award.description && (
                      <p className={styles.awardDescription}>{award.description}</p>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveAward(award.id)}
                    >
                       Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isEditing && (
              <div className={styles.addForm}>
                <h4>Add Award</h4>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      value={newAward.title}
                      onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
                      placeholder="Award title"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      value={newAward.issuer}
                      onChange={(e) => setNewAward({ ...newAward, issuer: e.target.value })}
                      placeholder="Issuing organization"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="month"
                      value={newAward.date}
                      onChange={(e) => setNewAward({ ...newAward, date: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <textarea
                      value={newAward.description}
                      onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
                      placeholder="Description (optional)"
                      rows="2"
                    />
                  </div>
                </div>
                <button onClick={handleAddAward} className={styles.addButton}>
                  + Add Award
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mentorship Preferences Section */}
      {activeSection === 'mentorship' && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Mentorship Preferences</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={profileData.availableForMentorship}
                onChange={(e) => handleInputChange('availableForMentorship', e.target.checked)}
                disabled={!isEditing}
              />
              <span>I am available for mentorship</span>
            </label>
          </div>

          {profileData.availableForMentorship && (
            <>
              <div className={styles.formGroup}>
                <label>Mentorship Areas</label>
                <p className={styles.fieldDescription}>Select areas where you can provide guidance</p>
                <div className={styles.mentorshipAreasGrid}>
                  {[
                    'Career Planning',
                    'Technical Skills',
                    'Interview Preparation',
                    'Resume Review',
                    'Networking',
                    'Leadership',
                    'Entrepreneurship',
                    'Work-Life Balance',
                    'Industry Insights',
                    'Graduate School',
                    'Job Search Strategies',
                    'Professional Development'
                  ].map((area) => (
                    <label key={area} className={styles.areaCheckbox}>
                      <input
                        type="checkbox"
                        checked={profileData.mentorshipAreas.includes(area)}
                        onChange={() => toggleMentorshipArea(area)}
                        disabled={!isEditing}
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Maximum Number of Mentees</label>
                  <select
                    value={profileData.maxMentees}
                    onChange={(e) => handleInputChange('maxMentees', parseInt(e.target.value))}
                    disabled={!isEditing}
                  >
                    <option value={1}>1 mentee</option>
                    <option value={2}>2 mentees</option>
                    <option value={3}>3 mentees</option>
                    <option value={4}>4 mentees</option>
                    <option value={5}>5 mentees</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Preferred Meeting Frequency</label>
                  <select
                    value={profileData.preferredMeetingFrequency}
                    onChange={(e) => handleInputChange('preferredMeetingFrequency', e.target.value)}
                    disabled={!isEditing}
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
