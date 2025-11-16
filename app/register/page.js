'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { firebaseAuth } from '../../lib/firebaseClient';
import Link from 'next/link';
import Image from 'next/image';
import styles from './register.module.css';
import FormInput, { FormSelect } from '../../components/UI/FormInput/FormInput';
import Button from '../../components/UI/Button/Button';
import { getAuthConfig, getNavConfig, getValidationConfig } from '../../utils/config';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: getAuthConfig().defaultRole,
  });

  const [errors, setErrors] = useState({});
  const [verificationSent, setVerificationSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < validationConfig.passwordMinLength) {
      newErrors.password = `Password must be at least ${validationConfig.passwordMinLength} characters`;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
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

    const navConfig = getNavConfig();
    const role = formData.role;
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, formData.email, formData.password);
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await updateProfile(cred.user, { displayName: fullName });
      
      // Send email verification
      await sendEmailVerification(cred.user);
      
      const idToken = await cred.user.getIdToken();
      
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, profile: { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, role } })
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create session. Please try logging in.');
      }

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
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
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
                <Link href="/login">
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
            <h1 className={styles.registerTitle}>Create Your Account</h1>
            <p className={styles.registerSubtitle}>
              Join GCCCS CareerLink to access job opportunities, events, and career resources.
            </p>
          </div>

          <form className={styles.registerForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <FormInput
                label="First Name"
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                error={errors.firstName}
              />

              <FormInput
                label="Last Name"
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                error={errors.lastName}
              />
            </div>

            <FormInput
              label="Email Address"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
            />

            <FormInput
              label="Password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
            />

            <FormInput
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={errors.confirmPassword}
            />

            <Button type="submit" variant="primary" fullWidth>
              Register
            </Button>
            {errors.general && <div className={styles.errorText}>{errors.general}</div>}
          </form>

          <div className={styles.registerFooter}>
            <p>
              Already have an account?{' '}
              <Link href="/auth/login" className={styles.loginLink}>
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}