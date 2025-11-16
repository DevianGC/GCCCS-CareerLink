'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { firebaseAuth } from '../../../lib/firebaseClient';
import Link from 'next/link';
import styles from './alumni-register.module.css';
import FormInput from '../../../components/UI/FormInput/FormInput';
import Button from '../../../components/UI/Button/Button';
import { getAuthConfig, getNavConfig, getValidationConfig } from '../../../utils/config';

export default function AlumniRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    graduationYear: '',
    major: '',
    company: '',
    position: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [verificationSent, setVerificationSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required';
    }

    if (!formData.major.trim()) {
      newErrors.major = 'Major is required';
    }

    // Validate phone number if provided
    if (formData.phone && formData.phone.trim()) {
      if (!/^\d+$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must contain only digits';
      } else if (formData.phone.length < 10) {
        newErrors.phone = 'Phone number must be at least 10 digits';
      } else if (formData.phone.length > 11) {
        newErrors.phone = 'Phone number must not exceed 11 digits';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < validationConfig.passwordMinLength) {
      newErrors.password = `Password must be at least ${validationConfig.passwordMinLength} characters`;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setResendMessage(data.error || 'Failed to resend verification email.');
      }
    } catch (error) {
      setResendMessage('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        formData.email,
        formData.password
      );

      // Update profile
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Save additional alumni data to Firestore
      const { firebaseDb } = await import('../../../lib/firebaseClient');
      const { doc, setDoc } = await import('firebase/firestore');
      
      const userDocRef = doc(firebaseDb, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: 'alumni',
        graduationYear: formData.graduationYear,
        major: formData.major,
        currentCompany: formData.company || '',
        currentPosition: formData.position || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Initialize other profile fields
        phone: '',
        location: '',
        linkedIn: '',
        website: '',
        bio: '',
        industry: '',
        yearsOfExperience: '',
        employmentType: 'Full-time',
        skills: [],
        achievements: [],
        certifications: [],
        awards: [],
        publications: [],
        availableForMentorship: true,
        mentorshipAreas: [],
        maxMentees: 3,
        preferredMeetingFrequency: 'Bi-weekly',
      });

      // Show verification message instead of redirecting
      setVerificationSent(true);
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({
        submit: errorMessage,
      });
    }
  };

  // Show verification success message
  if (verificationSent) {
    return (
      <div className={styles.registerPage}>
        <div className={styles.registerContainer}>
          <div className={styles.registerCard}>
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h1 className={styles.successTitle}>Verify Your Email</h1>
              <p className={styles.successText}>
                We've sent a verification email to <strong>{formData.email}</strong>
              </p>
              <p className={styles.successText}>
                Please check your inbox and click the verification link to activate your account.
              </p>
              {resendMessage && (
                <p className={resendMessage.includes('sent') ? styles.successText : styles.errorText}>
                  {resendMessage}
                </p>
              )}
              <div className={styles.successActions}>
                <Button 
                  variant="secondary" 
                  onClick={handleResendVerification}
                  disabled={resending}
                >
                  {resending ? 'Resending...' : 'Resend Verification Email'}
                </Button>
                <Link href="/alumni/login">
                  <Button variant="primary">Go to Login</Button>
                </Link>
              </div>
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
            <h1 className={styles.title}>Alumni Registration</h1>
            <p className={styles.subtitle}>Join our alumni network and stay connected</p>
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
            placeholder="your.email@example.com"
            required
          />

          <div className={styles.formRow}>
            <FormInput
              label="Graduation Year"
              type="number"
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleChange}
              error={errors.graduationYear}
              placeholder="2020"
              required
            />

            <FormInput
              label="Major"
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              error={errors.major}
              placeholder="Computer Science"
              required
            />
          </div>

          <div className={styles.formRow}>
            <FormInput
              label="Current Company (Optional)"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Tech Corp"
            />

            <FormInput
              label="Position (Optional)"
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Software Engineer"
            />
          </div>

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

          <Button type="submit" variant="primary" size="large" fullWidth>
            Create Alumni Account
          </Button>
        </form>

        <div className={styles.registerFooter}>
          <p>
            Already have an account?{' '}
            <Link href="/alumni/login">Login here</Link>
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
