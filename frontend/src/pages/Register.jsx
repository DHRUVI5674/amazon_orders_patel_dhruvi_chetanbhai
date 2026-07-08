import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, clearError, clearSuccessMessage } from "../features/auth/authSlice";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, successMessage, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
    dispatch(clearError());
    dispatch(clearSuccessMessage());
  }, [isAuthenticated, navigate, dispatch]);

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = "Full name is required";
    }
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(clearSuccessMessage());

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    dispatch(registerUser({ name, email, password }));
  };

  // Redirect to login page after successful registration after 3 seconds
  useEffect(() => {
    let timeoutId;
    if (successMessage) {
      timeoutId = setTimeout(() => {
        dispatch(clearSuccessMessage());
        navigate("/login");
      }, 3500);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [successMessage, navigate, dispatch]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] overflow-hidden px-4 py-8">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#147EB3]/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8b5cf6]/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Main Glassmorphic Card */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-all duration-300 hover:scale-[1.01]">
        
        {/* Logo/Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#147EB3] to-sky-400 rounded-2xl shadow-lg shadow-[#147EB3]/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight bg-clip-text bg-gradient-to-r from-white to-slate-300">
            Create Account
          </h2>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">
            Join ShopFusion today. It takes less than a minute.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3 animate-fadeIn">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{successMessage}</span>
            </div>
            <p className="text-xs text-emerald-300/80 ml-8">Redirecting to the login page shortly...</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                }}
                className={`w-full pl-11 pr-4 py-2.5 bg-white/5 border ${
                  formErrors.name ? "border-red-500/50 focus:border-red-400" : "border-white/10 focus:border-sky-400"
                } text-white rounded-xl placeholder-slate-500 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-sky-400/10`}
                placeholder="John Doe"
                required
              />
            </div>
            {formErrors.name && (
              <p className="text-red-400 text-xs font-medium pl-1">{formErrors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                }}
                className={`w-full pl-11 pr-4 py-2.5 bg-white/5 border ${
                  formErrors.email ? "border-red-500/50 focus:border-red-400" : "border-white/10 focus:border-sky-400"
                } text-white rounded-xl placeholder-slate-500 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-sky-400/10`}
                placeholder="name@example.com"
                required
              />
            </div>
            {formErrors.email && (
              <p className="text-red-400 text-xs font-medium pl-1">{formErrors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                }}
                className={`w-full pl-11 pr-4 py-2.5 bg-white/5 border ${
                  formErrors.password ? "border-red-500/50 focus:border-red-400" : "border-white/10 focus:border-sky-400"
                } text-white rounded-xl placeholder-slate-500 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-sky-400/10`}
                placeholder="••••••••"
                required
              />
            </div>
            {formErrors.password && (
              <p className="text-red-400 text-xs font-medium pl-1">{formErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: "" });
                }}
                className={`w-full pl-11 pr-4 py-2.5 bg-white/5 border ${
                  formErrors.confirmPassword ? "border-red-500/50 focus:border-red-400" : "border-white/10 focus:border-sky-400"
                } text-white rounded-xl placeholder-slate-500 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-sky-400/10`}
                placeholder="••••••••"
                required
              />
            </div>
            {formErrors.confirmPassword && (
              <p className="text-red-400 text-xs font-medium pl-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative py-3 mt-2 bg-gradient-to-r from-[#147EB3] to-sky-500 hover:from-sky-500 hover:to-[#147EB3] text-white font-semibold rounded-xl shadow-lg shadow-[#147EB3]/20 hover:shadow-sky-500/25 active:scale-[0.98] transition-all duration-150 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating account...</span>
              </div>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Redirect to Login */}
        <div className="text-center mt-6 pt-5 border-t border-white/10">
          <p className="text-sm text-slate-400 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
