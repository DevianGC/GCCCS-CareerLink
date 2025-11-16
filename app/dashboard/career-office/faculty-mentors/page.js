'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/Dashboard/DashboardLayout';
import styles from './faculty-mentors.module.css';
import Button from '../../../../components/UI/Button/Button';
import FormInput from '../../../../components/UI/FormInput/FormInput';

export default function FacultyMentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    facultyId: '',
    phone: '',
    officeLocation: '',
    specialization: '',
    yearsOfExperience: '',
    bio: '',
    maxMenteesPerSemester: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/faculty-mentors');
      const data = await response.json();
      if (response.ok) {
        setMentors(data.mentors || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.facultyId) newErrors.facultyId = 'Faculty ID is required';
    
    // Validate password for new accounts, optional for editing
    if (!editingMentor) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else {
      // When editing, if password is provided, validate it
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const url = editingMentor 
        ? `/api/faculty-mentors/${editingMentor.id}`
        : '/api/faculty-mentors';
      
      const method = editingMentor ? 'PUT' : 'POST';

      // Prepare data to send
      const submitData = { ...formData };
      
      // If editing and password hasn't changed, don't send it
      if (editingMentor && formData.password === editingMentor.initialPassword) {
        delete submitData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(editingMentor ? 'Faculty mentor updated successfully!' : 'Faculty mentor account created successfully!');
        setShowModal(false);
        resetForm();
        fetchMentors();
      } else {
        alert(data.error || 'Failed to save faculty mentor');
      }
    } catch (error) {
      console.error('Error saving mentor:', error);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (mentor) => {
    setEditingMentor(mentor);
    setFormData({
      email: mentor.email || '',
      firstName: mentor.firstName || '',
      lastName: mentor.lastName || '',
      department: mentor.department || '',
      facultyId: mentor.facultyId || '',
      phone: mentor.phone || '',
      officeLocation: mentor.officeLocation || '',
      specialization: mentor.specialization || '',
      yearsOfExperience: mentor.yearsOfExperience || '',
      bio: mentor.bio || '',
      maxMenteesPerSemester: mentor.maxMenteesPerSemester || '',
      password: mentor.initialPassword || '' // Load stored password
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this faculty mentor account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/faculty-mentors/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        alert('Faculty mentor deleted successfully');
        fetchMentors();
      } else {
        alert(data.error || 'Failed to delete faculty mentor');
      }
    } catch (error) {
      console.error('Error deleting mentor:', error);
      alert('An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      department: '',
      facultyId: '',
      phone: '',
      officeLocation: '',
      specialization: '',
      yearsOfExperience: '',
      bio: '',
      maxMenteesPerSemester: '',
      password: ''
    });
    setEditingMentor(null);
    setErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <DashboardLayout userType="career-office">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Faculty Mentors Management</h1>
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            + Add New Faculty Mentor
          </Button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Faculty ID</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mentors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.emptyState}>
                      No faculty mentors found. Click "Add New Faculty Mentor" to create one.
                    </td>
                  </tr>
                ) : (
                  mentors.map(mentor => (
                    <tr key={mentor.id}>
                      <td>{mentor.fullName || `${mentor.firstName} ${mentor.lastName}`}</td>
                      <td>{mentor.email}</td>
                      <td>{mentor.facultyId}</td>
                      <td>{mentor.department}</td>
                      <td>{mentor.phone || 'N/A'}</td>
                      <td>{mentor.specialization || 'N/A'}</td>
                      <td className={styles.actions}>
                        <button 
                          onClick={() => handleEdit(mentor)}
                          className={styles.editBtn}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(mentor.id)}
                          className={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={handleCloseModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingMentor ? 'Edit Faculty Mentor' : 'Add New Faculty Mentor'}</h2>
                <button onClick={handleCloseModal} className={styles.closeBtn}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <FormInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    required
                  />
                  <FormInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    required
                  />
                </div>

                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                  disabled={!!editingMentor}
                />

                <div className={styles.formRow}>
                  <FormInput
                    label="Faculty ID"
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleInputChange}
                    error={errors.facultyId}
                    required
                  />
                  <FormInput
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    error={errors.department}
                    required
                  />
                </div>

                <FormInput
                  label={editingMentor ? "Password (leave unchanged or enter new password)" : "Password"}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  required={!editingMentor}
                  placeholder={editingMentor ? "Enter new password to change" : "Set initial password for faculty mentor"}
                />

                <div className={styles.formRow}>
                  <FormInput
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <FormInput
                    label="Office Location"
                    name="officeLocation"
                    value={formData.officeLocation}
                    onChange={handleInputChange}
                  />
                </div>

                <FormInput
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                />

                <FormInput
                  label="Years of Experience"
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                />

                <FormInput
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief description about the faculty mentor"
                />

                <FormInput
                  label="Max Mentees per Semester"
                  name="maxMenteesPerSemester"
                  type="number"
                  value={formData.maxMenteesPerSemester}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                />

                <div className={styles.formActions}>
                  <Button type="button" variant="secondary" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingMentor ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
