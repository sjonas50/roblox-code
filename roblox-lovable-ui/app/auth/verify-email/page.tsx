"use client";

import PublicLayout from '@/components/PublicLayout';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-gray-400">
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
              </p>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300">
                <strong>Note:</strong> The verification email may take a few minutes to arrive. Please also check your spam folder.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Back to Login
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Resend verification email
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}