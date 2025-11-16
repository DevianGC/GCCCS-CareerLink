'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../../lib/firebaseClient';
import Link from 'next/link';
import styles from './login.module.css';
import FormInput from '../../components/UI/FormInput/FormInput';
import Button from '../../components/UI/Button/Button';
import { getAuthConfig, getNavConfig, getValidationConfig } from '../../utils/config';

export default function Login() {
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

    const navConfig = getNavConfig();
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, formData.email, formData.password);
      
      // Check if email is verified
      if (!cred.user.emailVerified) {
        await firebaseAuth.signOut();
        setErrors({ general: 'Please verify your email before logging in. Check your inbox for the verification link.' });
        return;
      }
      
      const idToken = await cred.user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      // Determine redirect based on role from session/profile
      let roleKey = 'student';
      try {
        const meRes = await fetch('/api/me', { cache: 'no-store' });
        if (meRes.ok) {
          const me = await meRes.json();
          const role = me?.user?.role || me?.profile?.role; // support either shape
          if (role) {
            // Map API role (e.g., 'career_office') to nav config key ('careerOffice')
            roleKey = role === 'career_office' ? 'careerOffice' : role;
          }
        }
      } catch {}
      const redirectMap = navConfig.dashboardRedirects || {};
      const target = redirectMap[roleKey] || redirectMap.student || '/dashboard/student';
      window.location.href = target;
    } catch (error) {
      // Handle authentication errors
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
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
      
      setErrors({ general: errorMessage });
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>Welcome Back</h1>
            <p className={styles.loginSubtitle}>
              Sign in to access your GCCCS CareerLink account
            </p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            {errors.general && (
              <div className={styles.errorMessage}>{errors.general}</div>
            )}

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

            <div className={styles.forgotPassword}>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Login
            </Button>
          </form>

          <div className={styles.loginFooter}>
            <p>
              Don't have an account?{' '}
              <Link href="/auth/register" className={styles.registerLink}>
                Register here
              </Link>
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