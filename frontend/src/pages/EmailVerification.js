import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckSquare, CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { authService } from '../services/authService';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const verifyEmail = useCallback(async () => {
    try {
      const response = await authService.verifyEmail(token);
      const data = response.data;
      
      // Handle different verification statuses
      if (data.status === 'success') {
        setVerificationStatus('success');
        setMessage('Your email has been verified successfully! You can now log in to your account.');
        toast.success('Email verified successfully!');
      } else if (data.status === 'already_verified') {
        setVerificationStatus('success');
        setMessage('Your email is already verified! You can proceed to log in to your account.');
        toast.success('Email already verified!');
      } else {
        // For any other success response without specific status
        setVerificationStatus('success');
        setMessage(data.message || 'Your email has been verified successfully! You can now log in to your account.');
        toast.success('Email verified successfully!');
      }
    } catch (error) {
      setVerificationStatus('error');
      const data = error.response?.data;
      
      // Handle specific error statuses with appropriate messages
      if (data?.status === 'expired') {
        setMessage('Your verification link has expired. Please request a new verification email below.');
      } else if (data?.status === 'invalid') {
        setMessage('Invalid verification link. If you\'ve already verified your email, you can proceed to log in.');
      } else {
        const errorMessage = data?.message || 'Email verification failed. The link may be expired or invalid.';
        setMessage(errorMessage);
      }
      
      toast.error('Verification failed');
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail();
  }, [token, verifyEmail]);

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(resendEmail);
      toast.success('Verification email sent successfully! Please check your inbox.');
      setResendEmail('');
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
            Email Verification
          </h2>
        </div>

        {/* Verification Status */}
        <div className="card p-8">
          {verificationStatus === 'verifying' && (
            <div className="text-center">
              <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verifying your email...
              </h3>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email Verified Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <Link
                to="/login"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Go to Login</span>
              </Link>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verification Failed
              </h3>
              <p className="text-gray-600 mb-6">
                {message}
              </p>

              {/* Resend verification form */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Resend Verification Email</span>
                </h4>
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="input-field"
                    required
                    disabled={isResending}
                  />
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
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
