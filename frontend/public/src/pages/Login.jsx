import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { z } from "zod";
import { loginUser } from "../authSlice";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Code, ArrowRight } from "lucide-react";

const signupSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const onSubmit = (data) => {
    setLocalError(null);
    dispatch(loginUser(data));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0f1a] via-[#0b1220] to-[#0c1424]">
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
                Welcome back! Please login to your account
              </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Error Display */}
              {localError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-medium text-center">
                    {localError}
                  </p>
                </div>
              )}

              {/* Email Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 bg-[#0f1728] border rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-100 placeholder-gray-500 ${
                    errors.emailId 
                      ? "border-red-500 focus:ring-red-500/20" 
                      : "border-[#1f2937] focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  {...register("emailId")}
                  onChange={(e) => {
                    register("emailId").onChange(e);
                    if (localError) setLocalError(null);
                  }}
                />
                {errors.emailId && (
                  <p className="text-xs text-red-400 mt-1">{errors.emailId.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-[#0f1728] border rounded-lg focus:outline-none focus:ring-2 transition-all pr-10 text-gray-100 placeholder-gray-500 ${
                      errors.password 
                        ? "border-red-500 focus:ring-red-500/20" 
                        : "border-[#1f2937] focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    {...register("password")}
                    onChange={(e) => {
                      register("password").onChange(e);
                      if (localError) setLocalError(null);
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
