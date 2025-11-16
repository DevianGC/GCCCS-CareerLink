'use client';
import { useState, useEffect } from 'react';
import { firebaseAuth, firebaseDb } from '../../../../lib/firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import Card from '../../../../components/UI/Card/Card';
import Button from '../../../../components/UI/Button/Button';
import FormInput, { FormSelect, FormTextarea } from '../../../../components/UI/FormInput/FormInput';
import styles from './profile.module.css';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Education
    degree: '',
    major: '',
    university: '',
    graduationDate: '',
    gpa: '',
    
    // Skills & Experience
    skills: '',
    bio: '',
    
    // Resume & Portfolio
    resumeUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    
    // Preferences
    jobTypes: [],
    locations: [],
    industries: [],
    salary: '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Only allow digits and limit to 11 characters
      const phoneValue = value.replace(/\D/g, '').slice(0, 11);
      setFormData({
        ...formData,
        [name]: phoneValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Load profile from backend for current user
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        const p = data.profile || {};
        setFormData(prev => ({
          ...prev,
          firstName: p.firstName || prev.firstName,
          lastName: p.lastName || prev.lastName,
          email: p.email || prev.email,
          phone: p.phone || prev.phone,
          dateOfBirth: p.dateOfBirth || prev.dateOfBirth,
          address: p.address || prev.address,
          city: p.city || prev.city,
          state: p.state || prev.state,
          zipCode: p.zipCode || prev.zipCode,
          degree: p.degree || prev.degree,
          major: p.major || prev.major,
          university: p.university || prev.university,
          graduationDate: p.graduationDate || prev.graduationDate,
          gpa: p.gpa || prev.gpa,
          skills: p.skills || prev.skills,
          bio: p.bio || prev.bio,
          resumeUrl: p.resumeUrl || prev.resumeUrl,
          portfolioUrl: p.portfolioUrl || prev.portfolioUrl,
          githubUrl: p.githubUrl || prev.githubUrl,
          linkedinUrl: p.linkedinUrl || prev.linkedinUrl,
          jobTypes: p.jobTypes || prev.jobTypes,
          locations: p.locations || prev.locations,
          industries: p.industries || prev.industries,
          salary: p.salary || prev.salary,
        }));
      } catch {
        // Fallback: read directly with client SDK
        try {
          const user = firebaseAuth.currentUser;
          if (user) {
            const snap = await getDoc(doc(firebaseDb, 'users', user.uid));
            const p = snap.exists() ? snap.data() : {};
            setFormData(prev => ({
              ...prev,
              firstName: p.firstName || prev.firstName,
              lastName: p.lastName || prev.lastName,
              email: p.email || user.email || prev.email,
              phone: p.phone || prev.phone,
              dateOfBirth: p.dateOfBirth || prev.dateOfBirth,
              address: p.address || prev.address,
              city: p.city || prev.city,
              state: p.state || prev.state,
              zipCode: p.zipCode || prev.zipCode,
              degree: p.degree || prev.degree,
              major: p.major || prev.major,
              university: p.university || prev.university,
              graduationDate: p.graduationDate || prev.graduationDate,
              gpa: p.gpa || prev.gpa,
              skills: p.skills || prev.skills,
              bio: p.bio || prev.bio,
              resumeUrl: p.resumeUrl || prev.resumeUrl,
              portfolioUrl: p.portfolioUrl || prev.portfolioUrl,
              githubUrl: p.githubUrl || prev.githubUrl,
              linkedinUrl: p.linkedinUrl || prev.linkedinUrl,
              jobTypes: p.jobTypes || prev.jobTypes,
              locations: p.locations || prev.locations,
              industries: p.industries || prev.industries,
              salary: p.salary || prev.salary,
            }));
          }
        } catch {}
      }
    })();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          degree: formData.degree,
          major: formData.major,
          university: formData.university,
          graduationDate: formData.graduationDate,
          gpa: formData.gpa,
          skills: formData.skills,
          bio: formData.bio,
          resumeUrl: formData.resumeUrl,
          githubUrl: formData.githubUrl,
          linkedinUrl: formData.linkedinUrl,
          portfolioUrl: formData.portfolioUrl,
          jobTypes: formData.jobTypes,
          locations: formData.locations,
          industries: formData.industries,
          salary: formData.salary,
        })
      });
      if (!res.ok) {
        let msg = 'Failed to save profile';
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        // Fallback: save directly with client SDK
        const user = firebaseAuth.currentUser;
        if (user) {
          await setDoc(doc(firebaseDb, 'users', user.uid), {
            firstName: formData.firstName,
            lastName: formData.lastName,
            fullName: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email || user.email || '',
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            degree: formData.degree,
            major: formData.major,
            university: formData.university,
            graduationDate: formData.graduationDate,
            gpa: formData.gpa,
            skills: formData.skills,
            bio: formData.bio,
            resumeUrl: formData.resumeUrl,
            githubUrl: formData.githubUrl,
            linkedinUrl: formData.linkedinUrl,
            portfolioUrl: formData.portfolioUrl,
            jobTypes: formData.jobTypes,
            locations: formData.locations,
            industries: formData.industries,
            salary: formData.salary,
            uid: user.uid,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } else {
          throw new Error(msg);
        }
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleCancel = () => {
    // Reset form data to original values
    setIsEditing(false);
  };
  
  return (
    <DashboardLayout userType="student">
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>My Profile</h1>
        {!isEditing && (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>
      
      <div className={styles.profileContent}>
        <div className={styles.profileSidebar}>
          <Card>
            <div className={styles.profileCard}>
              <div className={styles.profileAvatar}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className={styles.profileName}>{formData.firstName} {formData.lastName}</h2>
              <p className={styles.profileMajor}>{formData.major}</p>
              <p className={styles.profileUniversity}>{formData.university}</p>
              
              <div className={styles.profileLinks}>
                {formData.githubUrl && (
                  <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.profileLink}>
                    GitHub
                  </a>
                )}
                {formData.linkedinUrl && (
                  <a href={formData.linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.profileLink}>
                    LinkedIn
                  </a>
                )}
                {formData.portfolioUrl && (
                  <a href={formData.portfolioUrl} target="_blank" rel="noopener noreferrer" className={styles.profileLink}>
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        <div className={styles.profileMain}>
          <Card>
            <div className={styles.profileTabs}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'personal' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Info
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'education' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('education')}
              >
                Education
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'skills' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                Skills & Experience
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'resume' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('resume')}
              >
                Resume & Portfolio
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'preferences' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                Job Preferences
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.profileForm}>
              {/* Personal Information */}
              {activeTab === 'personal' && (
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Personal Information</h3>
                  
                  <div className={styles.formRow}>
                    <FormInput
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                    <FormInput
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <FormInput
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                    <FormInput
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <FormInput
                    label="Date of Birth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  
                  <FormInput
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  
                  <div className={styles.formRow}>
                    <FormInput
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                    <FormInput
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                    <FormInput
                      label="Zip Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}
              
              {/* Education */}
              {activeTab === 'education' && (
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Education</h3>
                  
                  <div className={styles.formRow}>
                    <FormInput
                      label="Degree"
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                    <FormInput
                      label="Major"
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <FormInput
                    label="University"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                  
                  <div className={styles.formRow}>
                    <FormInput
                      label="Graduation Date"
                      type="month"
                      name="graduationDate"
                      value={formData.graduationDate}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                    <FormInput
                      label="GPA"
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}
              
              {/* Skills & Experience */}
              {activeTab === 'skills' && (
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Skills & Experience</h3>
                  
                  <FormInput
                    label="Skills (comma separated)"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                  
                  <FormTextarea
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              )}
              
              {/* Resume & Portfolio */}
              {activeTab === 'resume' && (
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Resume & Portfolio</h3>
                  
                  {isEditing ? (
                    <div className={styles.fileUpload}>
                      <label className={styles.fileLabel}>Resume</label>
                      <input type="file" className={styles.fileInput} accept=".pdf,.doc,.docx" />
                      <p className={styles.fileHelp}>Upload your resume (PDF, DOC, or DOCX)</p>
                    </div>
                  ) : formData.resumeUrl ? (
                    <div className={styles.resumePreview}>
                      <p>Resume: <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                    </div>
                  ) : (
                    <p className={styles.noResume}>No resume uploaded yet.</p>
                  )}
                  
                  <FormInput
                    label="Portfolio URL"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  
                  <FormInput
                    label="GitHub URL"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  
                  <FormInput
                    label="LinkedIn URL"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              )}
              
              {/* Job Preferences */}
              {activeTab === 'preferences' && (
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Job Preferences</h3>
                  
                  <FormInput
                    label="Job Types (comma separated)"
                    name="jobTypes"
                    value={formData.jobTypes.join(', ')}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        jobTypes: value.split(',').map(item => item.trim()),
                      });
                    }}
                    disabled={!isEditing}
                  />
                  
                  <FormInput
                    label="Preferred Locations (comma separated)"
                    name="locations"
                    value={formData.locations.join(', ')}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        locations: value.split(',').map(item => item.trim()),
                      });
                    }}
                    disabled={!isEditing}
                  />
                  
                  <FormInput
                    label="Preferred Industries (comma separated)"
                    name="industries"
                    value={formData.industries.join(', ')}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        industries: value.split(',').map(item => item.trim()),
                      });
                    }}
                    disabled={!isEditing}
                  />
                  
                  <FormInput
                    label="Expected Salary Range"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              )}
              
              {isEditing && (
                <div className={styles.formActions}>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}