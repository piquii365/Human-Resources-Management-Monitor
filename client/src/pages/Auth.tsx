import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Linkedin, Instagram, Facebook, Twitter, MessageCircle, Mail, Phone } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#3B4F7A] via-[#4A5E8F] to-[#E87399] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-300 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#5A9FD4] via-[#7BB4E4] to-[#95C9F0] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-10 left-10 w-24 h-24 bg-[#FF6B9D] rounded-full opacity-40 blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#FFA07A] rounded-full opacity-40 blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-12">
              <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white text-xl font-semibold">HR Monitoring System</span>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full opacity-30 blur-xl"></div>
                <div className="relative bg-white/20 backdrop-blur-md rounded-full p-8">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/50">
                    <img
                      src="https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Professional"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-pink-400 rounded-full opacity-60"></div>
                <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-orange-400 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 -right-12 w-24 h-2 bg-pink-400 rounded-full opacity-60"></div>
                <div className="absolute top-1/3 -left-12 w-20 h-2 bg-orange-400 rounded-full opacity-60 transform rotate-45"></div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-white/90 text-sm text-center">
              Copyright © 2019, HR Monitoring System. All rights reserved
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gray-50">
          <div className="max-w-md mx-auto w-full">
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`px-8 py-2 rounded-md transition-all ${
                    isSignUp
                      ? "bg-[#5A9FD4] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`px-8 py-2 rounded-md transition-all ${
                    !isSignUp
                      ? "bg-[#5A9FD4] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sign In
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-[#5A9FD4] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Aldrego"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-[#5A9FD4] outline-none bg-transparent transition-colors placeholder-gray-400"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#5A9FD4] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Aldrego@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-[#5A9FD4] outline-none bg-transparent transition-colors placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A9FD4] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-[#5A9FD4] outline-none bg-transparent transition-colors placeholder-gray-400"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5A9FD4] text-white py-3 rounded-lg hover:bg-[#4A8FC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-200"
              >
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#E87399] hover:text-[#D86389] text-sm transition-colors"
                >
                  {isSignUp ? "I have an Account ?" : "Create an Account ?"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-center space-x-4">
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-600 hover:text-[#5A9FD4]">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-600 hover:text-[#5A9FD4]">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-600 hover:text-[#5A9FD4]">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-600 hover:text-[#5A9FD4]">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-600 hover:text-[#5A9FD4]">
                  <MessageCircle size={20} />
                </a>
              </div>

              <div className="flex justify-center items-center space-x-6 mt-6 text-sm text-gray-600">
                <a href="#" className="flex items-center space-x-2 hover:text-[#5A9FD4] transition-colors">
                  <Phone size={16} />
                  <span>959812**67</span>
                </a>
                <a href="#" className="flex items-center space-x-2 hover:text-[#5A9FD4] transition-colors">
                  <Mail size={16} />
                  <span>info@hrms.in</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
