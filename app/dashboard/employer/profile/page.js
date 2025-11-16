'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import styles from './profile.module.css';

export default function EmployerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    companyName: 'TechCorp Solutions Inc.',
    industry: 'Information Technology',
    companySize: '51-200 employees',
    website: 'https://techcorp.com',
    email: 'hr@techcorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Street, Olongapo City',
    description: 'TechCorp Solutions is a leading technology company specializing in innovative software solutions for businesses worldwide. We pride ourselves on creating cutting-edge products that transform how companies operate.',
    founded: '2015',
    headquarters: 'Silicon Valley, CA',
    logo: null
  });

  const [formData, setFormData] = useState(companyData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setCompanyData(formData);
    setIsEditing(false);
    // Here you would typically save to your backend
    console.log('Saving company data:', formData);
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
                  <p className={styles.formValue}>{companyData.companyName}</p>
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
                    <option value="Information Technology">Information Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className={styles.formValue}>{companyData.industry}</p>
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
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                    <option value="501-1000 employees">501-1000 employees</option>
                    <option value="1000+ employees">1000+ employees</option>
                  </select>
                ) : (
                  <p className={styles.formValue}>{companyData.companySize}</p>
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
                  <p className={styles.formValue}>{companyData.founded}</p>
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
                  <a href={companyData.website} target="_blank" rel="noopener noreferrer" className={styles.formLink}>
                    {companyData.website}
                  </a>
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
                  <p className={styles.formValue}>{companyData.email}</p>
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
                  <p className={styles.formValue}>{companyData.phone}</p>
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
                  <p className={styles.formValue}>{companyData.headquarters}</p>
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
                <p className={styles.formValue}>{companyData.address}</p>
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
                <p className={styles.formValue}>{companyData.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
