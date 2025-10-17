import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");

  const extractErrorMessage = (err: unknown) => {
    if (!err) return "An error occurred";
    if (err instanceof Error) return err.message;
    try {
      return String(err);
    } catch {
      return "An error occurred";
    }
  };

  const navigate = useNavigate();
  const { login, register, loginWithGoogle, loginWithMicrosoft } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        if (!formData.acceptTerms) {
          setError("Please accept the terms and conditions");
          setLoading(false);
          return;
        }
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        await register(formData.email, formData.password, fullName);
        navigate("/");
      } else {
        await login(formData.email, formData.password);
        navigate("/");
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoft = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithMicrosoft();
      navigate("/");
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="w-full bg-white h-screen overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Dark Section */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 p-12 hidden md:flex flex-col justify-center items-start text-white relative overflow-hidden rounded-r-3xl">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-40 h-40 bg-cyan-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-teal-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Create your
              <br />
              Account
            </h1>
            <p className="text-lg text-teal-100 mb-8">
              Share your artwork
              <br />
              and Get projects!
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-20 left-10 opacity-20">
            <div className="w-32 h-32 border-4 border-white rounded-full"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {isSignUp ? "Sign Up" : "Sign In"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400"
                      required={isSignUp}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400"
                  required
                />
              </div>

              {isSignUp && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.acceptTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        acceptTerms: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    Accept Terms & Conditions
                  </label>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Loading..." : isSignUp ? "Join Us" : "Sign In"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full border border-gray-300 bg-white text-gray-700 py-3 rounded-lg flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>
              <button
                type="button"
                onClick={handleMicrosoft}
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg flex items-center justify-center space-x-3 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12l-10-9v7H2v4h10v7z" />
                </svg>
                <span>Sign up with Microsoft</span>
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-teal-600 hover:text-teal-700 text-sm transition-colors font-medium"
                >
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}