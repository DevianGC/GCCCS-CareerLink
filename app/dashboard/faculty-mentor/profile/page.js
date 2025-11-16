'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './profile.module.css';

export default function MentorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    department: 'Computer Science',
    position: 'Associate Professor',
    phone: '+1 (555) 123-4567',
    officeLocation: 'Building A, Room 301',
    bio: 'Passionate educator with 10+ years of experience in software engineering and computer science education.',
    areasOfExpertise: ['Software Engineering', 'Database Systems', 'Web Development', 'Career Development'],
    availability: {
      monday: { available: true, timeSlots: ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM'] },
      tuesday: { available: true, timeSlots: ['10:00 AM - 12:00 PM'] },
      wednesday: { available: true, timeSlots: ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM'] },
      thursday: { available: false, timeSlots: [] },
      friday: { available: true, timeSlots: ['9:00 AM - 12:00 PM'] }
    },
    preferredMeetingTypes: ['In-person', 'Online'],
    maxMenteesPerSemester: 10
  });

  const [editData, setEditData] = useState(profileData);
  const [newExpertise, setNewExpertise] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() && !editData.areasOfExpertise.includes(newExpertise.trim())) {
      setEditData(prev => ({
        ...prev,
        areasOfExpertise: [...prev.areasOfExpertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const handleRemoveExpertise = (expertise) => {
    setEditData(prev => ({
      ...prev,
      areasOfExpertise: prev.areasOfExpertise.filter(e => e !== expertise)
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setEditData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };

  const handleAddTimeSlot = (day) => {
    setEditData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          timeSlots: [...prev.availability[day].timeSlots, '']
        }
      }
    }));
  };

  const handleRemoveTimeSlot = (day, index) => {
    setEditData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          timeSlots: prev.availability[day].timeSlots.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleTimeSlotChange = (day, index, value) => {
    setEditData(prev => {
      const newTimeSlots = [...prev.availability[day].timeSlots];
      newTimeSlots[index] = value;
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: {
            ...prev.availability[day],
            timeSlots: newTimeSlots
          }
        }
      };
    });
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <DashboardLayout userType="faculty-mentor">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Mentor Profile</h1>
            <p>Manage your profile information and availability</p>
          </div>
          {!isEditing ? (
            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          ) : (
            <div className={styles.actionBtns}>
              <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
            </div>
          )}
        </div>

        <div className={styles.content}>
          {/* Personal Information */}
          <div className={styles.section}>
            <h2>Personal Information</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.firstName}</p>
                )}
              </div>

              <div className={styles.field}>
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.lastName}</p>
                )}
              </div>

              <div className={styles.field}>
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.email}</p>
                )}
              </div>

              <div className={styles.field}>
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.phone}</p>
                )}
              </div>

              <div className={styles.field}>
                <label>Department</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={editData.department}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.department}</p>
                )}
              </div>

              <div className={styles.field}>
                <label>Position</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="position"
                    value={editData.position}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.position}</p>
                )}
              </div>

              <div className={styles.field}>
                <label>Office Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="officeLocation"
                    value={editData.officeLocation}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.officeLocation}</p>
                )}
              </div>

              <div className={styles.field}>
                <label>Max Mentees per Semester</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="maxMenteesPerSemester"
                    value={editData.maxMenteesPerSemester}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                  />
                ) : (
                  <p>{profileData.maxMenteesPerSemester}</p>
                )}
              </div>
            </div>

            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label>Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleInputChange}
                  rows="4"
                />
              ) : (
                <p>{profileData.bio}</p>
              )}
            </div>
          </div>

          {/* Areas of Expertise */}
          <div className={styles.section}>
            <h2>Areas of Expertise</h2>
            <div className={styles.expertiseList}>
              {(isEditing ? editData : profileData).areasOfExpertise.map((expertise, index) => (
                <div key={index} className={styles.expertiseTag}>
                  {expertise}
                  {isEditing && (
                    <button
                      className={styles.removeTag}
                      onClick={() => handleRemoveExpertise(expertise)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className={styles.addExpertise}>
                <input
                  type="text"
                  placeholder="Add new area of expertise..."
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddExpertise()}
                />
                <button onClick={handleAddExpertise}>Add</button>
              </div>
            )}
          </div>

          {/* Availability */}
          <div className={styles.section}>
            <h2>Weekly Availability</h2>
            <div className={styles.availabilityGrid}>
              {Object.keys(profileData.availability).map((day) => (
                <div key={day} className={styles.dayCard}>
                  <div className={styles.dayHeader}>
                    <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                    {isEditing && (
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={editData.availability[day].available}
                          onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    )}
                  </div>
                  <div className={styles.timeSlots}>
                    {(isEditing ? editData : profileData).availability[day].available ? (
                      <>
                        {(isEditing ? editData : profileData).availability[day].timeSlots.length > 0 ? (
                          (isEditing ? editData : profileData).availability[day].timeSlots.map((slot, index) => (
                            <div key={index} className={styles.timeSlot}>
                              {isEditing ? (
                                <>
                                  <input
                                    type="text"
                                    className={styles.timeSlotInput}
                                    value={slot}
                                    onChange={(e) => handleTimeSlotChange(day, index, e.target.value)}
                                    placeholder="e.g. 9:00 AM - 11:00 AM"
                                  />
                                  <button
                                    className={styles.removeSlotBtn}
                                    onClick={() => handleRemoveTimeSlot(day, index)}
                                  >
                                    ×
                                  </button>
                                </>
                              ) : (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {slot}
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className={styles.noSlots}>No time slots set</p>
                        )}
                        {isEditing && (
                          <button
                            className={styles.addSlotBtn}
                            onClick={() => handleAddTimeSlot(day)}
                          >
                            + Add Time Slot
                          </button>
                        )}
                      </>
                    ) : (
                      <p className={styles.notAvailable}>Not available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Preferences */}
          <div className={styles.section}>
            <h2>Meeting Preferences</h2>
            <div className={styles.preferences}>
              {isEditing ? (
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={editData.preferredMeetingTypes.includes('In-person')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditData(prev => ({
                            ...prev,
                            preferredMeetingTypes: [...prev.preferredMeetingTypes, 'In-person']
                          }));
                        } else {
                          setEditData(prev => ({
                            ...prev,
                            preferredMeetingTypes: prev.preferredMeetingTypes.filter(t => t !== 'In-person')
                          }));
                        }
                      }}
                    />
                    In-person meetings
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={editData.preferredMeetingTypes.includes('Online')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditData(prev => ({
                            ...prev,
                            preferredMeetingTypes: [...prev.preferredMeetingTypes, 'Online']
                          }));
                        } else {
                          setEditData(prev => ({
                            ...prev,
                            preferredMeetingTypes: prev.preferredMeetingTypes.filter(t => t !== 'Online')
                          }));
                        }
                      }}
                    />
                    Online meetings
                  </label>
                </div>
              ) : (
                <div className={styles.preferencesList}>
                  {profileData.preferredMeetingTypes.map((type, index) => (
                    <span key={index} className={styles.preferenceTag}>{type}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
