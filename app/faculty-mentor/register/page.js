'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { firebaseAuth } from '../../../lib/firebaseClient';
import Link from 'next/link';
import styles from './faculty-register.module.css';
import FormInput, { FormSelect } from '../../../components/UI/FormInput/FormInput';
import Button from '../../../components/UI/Button/Button';
import { getValidationConfig } from '../../../utils/config';

export default function FacultyMentorRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    facultyId: '',
    phone: '',
    officeLocation: '',
    specialization: '',
    yearsOfExperience: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const validationConfig = getValidationConfig();

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validationConfig.email.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.facultyId.trim()) {
      newErrors.facultyId = 'Faculty ID is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Area of specialization is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < validationConfig.password.minLength) {
      newErrors.password = `Password must be at least ${validationConfig.password.minLength} characters`;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        formData.email,
        formData.password
      );

      // Update profile
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      const idToken = await userCredential.user.getIdToken();
      
      // Create faculty mentor profile with pending status
      const facultyProfile = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: 'faculty-mentor',
        department: formData.department,
        facultyId: formData.facultyId,
        phone: formData.phone,
        officeLocation: formData.officeLocation,
        specialization: formData.specialization,
        yearsOfExperience: formData.yearsOfExperience,
        accountStatus: 'pending', // Requires admin approval
      };

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, profile: facultyProfile })
      });

      setRegistrationSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrors({
          submit: 'This email is already registered. Please login instead.',
        });
      } else {
        setErrors({
          submit: 'Registration failed. Please try again.',
        });
      }
    }
  };

  if (registrationSuccess) {
    return (
      <div className={styles.registerPage}>
        <div className={styles.registerContainer}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 className={styles.successTitle}>Registration Submitted!</h1>
            <p className={styles.successMessage}>
              Your faculty mentor account has been created and is pending approval from the Career Office.
              You will receive an email notification once your account is approved.
            </p>
            <div className={styles.successActions}>
              <Link href="/" className={styles.homeButton}>
                <Button variant="primary" size="large">
                  Return to Home
                </Button>
              </Link>
              <p className={styles.loginPrompt}>
                Already approved? <Link href="/faculty-mentor/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <div className={styles.registerHeader}>
            <h1 className={styles.title}>Faculty Mentor Registration</h1>
            <p className={styles.subtitle}>Join as a faculty mentor to guide students through their OJT journey</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.registerForm}>
            {errors.submit && (
              <div className={styles.errorMessage}>{errors.submit}</div>
            )}

            <div className={styles.formRow}>
              <FormInput
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="John"
                required
              />

              <FormInput
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Doe"
                required
              />
            </div>

            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="john.doe@university.edu"
              required
            />

            <div className={styles.formRow}>
              <FormInput
                label="Faculty ID"
                type="text"
                name="facultyId"
                value={formData.facultyId}
                onChange={handleChange}
                error={errors.facultyId}
                placeholder="FAC-12345"
                required
              />

              <FormInput
                label="Department"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                error={errors.department}
                placeholder="Computer Science"
                required
              />
            </div>

            <div className={styles.formRow}>
              <FormInput
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="(555) 123-4567"
                required
              />

              <FormInput
                label="Office Location"
                type="text"
                name="officeLocation"
                value={formData.officeLocation}
                onChange={handleChange}
                placeholder="Building A, Room 301"
              />
            </div>

            <FormSelect
              label="Area of Specialization"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              error={errors.specialization}
              options={[
                { value: '', label: 'Select Specialization' },
                { value: 'computer-science', label: 'Computer Science' },
                { value: 'information-technology', label: 'Information Technology' },
                { value: 'software-engineering', label: 'Software Engineering' },
                { value: 'data-science', label: 'Data Science' },
                { value: 'cybersecurity', label: 'Cybersecurity' },
                { value: 'web-development', label: 'Web Development' },
                { value: 'mobile-development', label: 'Mobile Development' },
                { value: 'artificial-intelligence', label: 'Artificial Intelligence' },
                { value: 'business-administration', label: 'Business Administration' },
                { value: 'other', label: 'Other' },
              ]}
              required
            />

            <FormInput
              label="Years of Experience (Optional)"
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              placeholder="10"
              min="0"
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
            />

            <div className={styles.noticeBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p>
                Your account will be pending approval from the Career Office. 
                You will be notified via email once your account is activated.
              </p>
            </div>

            <Button type="submit" variant="primary" size="large" fullWidth>
              Submit Registration
            </Button>
          </form>

          <div className={styles.registerFooter}>
            <p>
              Already have an account?{' '}
              <Link href="/faculty-mentor/login">Login here</Link>
            </p>
            <Link href="/auth/register" className={styles.backLink}>
              ← Back to Role Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
