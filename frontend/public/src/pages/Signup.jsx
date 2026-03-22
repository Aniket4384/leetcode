import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Code, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { registerUser } from '../authSlice';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ 
    resolver: zodResolver(signupSchema),
  });

  const formDataRef = useRef({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const onSubmit = (data) => {
    formDataRef.current = data;
    dispatch(registerUser(data));
  };

  const handleRetry = () => {
    setLocalError(null);
    reset(formDataRef.current);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0f1a] via-[#0b1220] to-[#0c1424]">
      {/* Main Card */}
      <div className="w-full max-w-md">
        <div className="bg-[#071026] rounded-2xl shadow-2xl border border-[#1f2937]">
          <div className="p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CodeForge
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Create your account to start coding
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Backend Error Display */}
              {localError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-medium text-center">
                    {localError}
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium text-center w-full"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* First Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="John"
                    className={`w-full pl-10 pr-4 py-3 bg-[#0f1728] border rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-100 placeholder-gray-500 ${
                      errors.firstName 
                        ? "border-red-500 focus:ring-red-500/20" 
                        : "border-[#1f2937] focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    {...register('firstName')}
                    onChange={(e) => {
                      if (localError) setLocalError(null);
                      register('firstName').onChange(e);
                    }}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-400 font-medium">{errors.firstName.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-[#0f1728] border rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-100 placeholder-gray-500 ${
                      errors.emailId 
                        ? "border-red-500 focus:ring-red-500/20" 
                        : "border-[#1f2937] focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    {...register('emailId')}
                    onChange={(e) => {
                      if (localError) setLocalError(null);
                      register('emailId').onChange(e);
                    }}
                  />
                </div>
                {errors.emailId && (
                  <p className="text-xs text-red-400 font-medium">{errors.emailId.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-[#0f1728] border rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-100 placeholder-gray-500 ${
                      errors.password 
                        ? "border-red-500 focus:ring-red-500/20" 
                        : "border-[#1f2937] focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    {...register('password')}
                    onChange={(e) => {
                      if (localError) setLocalError(null);
                      register('password').onChange(e);
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  Login here
                </Link>
              </p>
            </div>

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
