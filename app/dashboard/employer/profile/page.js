'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firebaseDb, firebaseAuth } from '@/lib/firebaseClient';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './profile.module.css';

export default function EmployerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [companyData, setCompanyData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    founded: '',
    headquarters: '',
    logo: null
  });

  const [formData, setFormData] = useState(companyData);

  // Get current user
  useEffect(() => {
    const unsubscribe = firebaseAuth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe?.();
  }, []);

  // Fetch employer profile from Firebase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!firebaseDb || !currentUserId) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(firebaseDb, 'users', currentUserId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Fetched user data:', userData); // Debug log
          const profileData = {
            companyName: userData.companyName || '',
            industry: userData.industry || '',
            companySize: userData.companySize || '',
            website: userData.companyWebsite || userData.website || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || userData.location || '',
            description: userData.description || userData.bio || userData.about || '',
            founded: userData.founded || userData.yearEstablished || '',
            headquarters: userData.headquarters || userData.location || '',
            logo: userData.logo || userData.logoUrl || null
          };
          console.log('Processed profile data:', profileData); // Debug log
          setCompanyData(profileData);
          setFormData(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUserId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Only allow digits and limit to 11 characters
      const phoneValue = value.replace(/\D/g, '').slice(0, 11);
      setFormData(prev => ({
        ...prev,
        [name]: phoneValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!firebaseDb || !currentUserId) return;

    try {
      const userDocRef = doc(firebaseDb, 'users', currentUserId);
      await updateDoc(userDocRef, {
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        companyWebsite: formData.website,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        location: formData.address,
        description: formData.description,
        bio: formData.description,
        founded: formData.founded,
        yearEstablished: formData.founded,
        headquarters: formData.headquarters,
        logo: formData.logo,
        logoUrl: formData.logo,
        updatedAt: new Date().toISOString()
      });

      setCompanyData(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(companyData);
    setIsEditing(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout userType="employer">
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1 className={styles.pageTitle}>Company Profile</h1>
          <p className={styles.pageSubtitle}>Manage your company information and branding</p>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <p>Loading profile...</p>
          </div>
        ) : (
          <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Company Information</h2>
            <div className={styles.headerActions}>
              {!isEditing ? (
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className={styles.editActions}>
                  <button 
                    className={styles.cancelButton}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button 
                    className={styles.saveButton}
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.cardContent}>
            {/* Company Logo Section */}
            <div className={styles.logoSection}>
              <div className={styles.logoContainer}>
                {formData.logo ? (
                  <img src={formData.logo} alt="Company Logo" className={styles.logoImage} />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M14 22L24 16L34 22V34H14V22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className={styles.logoUpload}>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className={styles.fileInput}
                  />
                  <label htmlFor="logo-upload" className={styles.uploadButton}>
                    Upload Logo
                  </label>
                </div>
              )}
            </div>

            {/* Company Details Form */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Company Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                ) : (
                  <p className={styles.formValue}>{companyData.companyName || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Industry</label>
                {isEditing ? (
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="education">Education</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail & E-commerce</option>
                    <option value="construction">Construction</option>
                    <option value="hospitality">Hospitality & Tourism</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className={styles.formValue}>{companyData.industry || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Company Size</label>
                {isEditing ? (
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                ) : (
                  <p className={styles.formValue}>{companyData.companySize || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Founded</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="founded"
                    value={formData.founded}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="e.g., 2015"
                  />
                ) : (
                  <p className={styles.formValue}>{companyData.founded || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="https://yourcompany.com"
                  />
                ) : (
                  <p className={styles.formValue}>
                    {companyData.website ? (
                      <a href={companyData.website} target="_blank" rel="noopener noreferrer" className={styles.formLink}>
                        {companyData.website}
                      </a>
                    ) : 'Not provided'}
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                ) : (
                  <p className={styles.formValue}>{companyData.email || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                ) : (
                  <p className={styles.formValue}>{companyData.phone || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Headquarters</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="headquarters"
                    value={formData.headquarters}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                ) : (
                  <p className={styles.formValue}>{companyData.headquarters || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows="2"
                />
              ) : (
                <p className={styles.formValue}>{companyData.address || 'Not provided'}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Company Description</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows="4"
                  placeholder="Tell us about your company..."
                />
              ) : (
                <p className={styles.formValue}>{companyData.description || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
}
