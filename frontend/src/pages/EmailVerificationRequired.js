import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckSquare, Mail, Loader, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

const EmailVerificationRequired = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // If email is passed through navigation state, set it
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(email);
      toast.success('Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
              <CheckSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification Required
          </h2>
          <p className="text-gray-600">
            Please verify your email address to complete your registration
          </p>
        </div>

        {/* Main Content */}
        <div className="card p-8">
          <div className="text-center mb-6">
            <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Check Your Email
            </h3>
            <p className="text-gray-600 mb-4">
              We've sent a verification link to your email address. Please click the link in the email to verify your account.
            </p>
            <p className="text-sm text-gray-500">
              Don't see the email? Check your spam folder or request a new one below.
            </p>
          </div>

          {/* Resend verification form */}
          <form onSubmit={handleResendVerification} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                disabled={isResending}
              />
            </div>
            <button
              type="submit"
              disabled={isResending}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isResending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-500 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationRequired;
