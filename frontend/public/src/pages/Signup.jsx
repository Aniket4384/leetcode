import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../authSlice';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null); // Local state for error

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ 
    resolver: zodResolver(signupSchema),
  });

  // Store form data in ref to persist across re-renders
  const formDataRef = useRef({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Sync error from Redux to local state
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const onSubmit = (data) => {
    // Store form data before dispatching
    formDataRef.current = data;
    dispatch(registerUser(data));
  };

  const handleRetry = () => {
    // Clear local error
    setLocalError(null);
    // Reset form with the previously entered data
    reset(formDataRef.current);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Leetcode</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Backend Error Display */}
            {localError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm font-medium text-center">
                  {localError}
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium text-center w-full"
                >
                  Try Again
                </button>
              </div>
            )}

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="John"
                className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
                }`}
                {...register('firstName')}
                onChange={(e) => {
                  if (localError) setLocalError(null);
                  register('firstName').onChange(e);
                }}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.firstName.message}</p>
              )}
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.emailId ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
                }`}
                {...register('emailId')}
                onChange={(e) => {
                  if (localError) setLocalError(null);
                  register('emailId').onChange(e);
                }}
              />
              {errors.emailId && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.emailId.message}</p>
              )}
            </div>

            <div className="form-control">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
                  }`}
                  {...register('password')}
                  onChange={(e) => {
                    if (localError) setLocalError(null);
                    register('password').onChange(e);
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Signup;