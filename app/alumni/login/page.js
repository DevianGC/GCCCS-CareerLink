'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../../../lib/firebaseClient';
import Link from 'next/link';
import styles from './alumni-login.module.css';
import FormInput from '../../../components/UI/FormInput/FormInput';
import Button from '../../../components/UI/Button/Button';
import { getAuthConfig, getNavConfig, getValidationConfig } from '../../../utils/config';

export default function AlumniLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validationConfig.email.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        formData.email,
        formData.password
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await firebaseAuth.signOut();
        setErrors({ 
          submit: 'Please verify your email before logging in. Check your inbox for the verification link.' 
        });
        return;
      }

      // Create session cookie
      const idToken = await userCredential.user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      // Redirect to alumni dashboard
      window.location.href = '/dashboard/alumni';
    } catch (error) {
      // Handle authentication errors
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
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

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.title}>Alumni Login</h1>
            <p className={styles.subtitle}>Welcome back! Sign in to your alumni account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
          {errors.submit && (
            <div className={styles.errorMessage}>{errors.submit}</div>
          )}

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

          <div className={styles.formOptions}>
            <label className={styles.rememberMe}>
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link href="/alumni/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="large" fullWidth>
            Sign In
          </Button>
        </form>

        <div className={styles.loginFooter}>
          <p>
            Don't have an account?{' '}
            <Link href="/alumni/register">Register as Alumni</Link>
          </p>
          <Link href="/auth/login" className={styles.backLink}>
            ← Back to Role Selection
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
