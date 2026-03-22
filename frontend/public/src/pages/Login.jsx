import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { z } from "zod";
import { loginUser } from "../authSlice";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const signupSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak"),
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

  // Sync error from Redux to local state
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const onSubmit = (data) => {
    setLocalError(null); // Clear previous error before new submission
    dispatch(loginUser(data));
    console.log(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="card w-96 bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="card-body p-8">
          <h2 className="card-title justify-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            LeetCode
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Backend Error Display */}
            {localError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
                <p className="text-red-600 text-sm font-medium text-center">
                  {localError}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text font-medium text-gray-700">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.emailId 
                    ? "border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:border-blue-500"
                }`}
                {...register("emailId")}
                onChange={(e) => {
                  register("emailId").onChange(e);
                  if (localError) setLocalError(null); // Clear error when user types
                }}
              />
              {errors.emailId && (
                <span className="text-xs text-red-500 mt-1 font-medium">{errors.emailId.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text font-medium text-gray-700">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10 ${
                    errors.password 
                      ? "border-red-500 focus:ring-red-200" 
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  {...register("password")}
                  onChange={(e) => {
                    register("password").onChange(e);
                    if (localError) setLocalError(null); // Clear error when user types
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
                <span className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</span>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mt-2">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500 hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;