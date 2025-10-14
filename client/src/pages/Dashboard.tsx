import { useState } from "react";
import { Users, TrendingUp, Calendar, Bell, Plus, ArrowRight, CheckCircle2, Clock, FileText } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A5FEF]"></div>
      </div>
    );
  }

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  const currentDay = today.getDate();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#5A5FEF] via-[#6B6FF5] to-[#7C80FA] rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hi, {userName}!</h1>
            <p className="text-white/90 text-lg">What are your plans for today?</p>
            <p className="text-white/80 text-sm mt-3">This platform is designed to revolutionize the way you organize and access your notes</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#5A5FEF]/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#5A5FEF]" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Stay organized</h3>
          <p className="text-sm text-gray-500">Manage your HR tasks efficiently</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#5A5FEF]/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#5A5FEF]" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Sync your notes</h3>
          <p className="text-sm text-gray-500">Access data from anywhere</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#5A5FEF]/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#5A5FEF]" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Collaborate and share</h3>
          <p className="text-sm text-gray-500">Work together with your team</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            <button className="text-[#5A5FEF] text-sm hover:underline">Clear</button>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-[#5A5FEF] pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">Upcoming event:</span>
                <Bell className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Tue 16 May - 7:45 - 10:45 AM</p>
            </div>
            <div className="border-l-2 border-gray-300 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Message: Product design</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Assignments</h2>
            <button className="text-[#5A5FEF] text-sm hover:underline">Edit</button>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">UI/UX Design - Light</span>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Past due</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-2">Design a responsive concept for a new product</p>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#5A5FEF] flex items-center justify-center">
                  <span className="text-xs text-white">A</span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-[#5A5FEF] text-white rounded-lg hover:bg-[#4A4FDF] transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add new assignment</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{currentMonth}</h2>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-gray-600">&lt;</button>
                <button className="text-gray-400 hover:text-gray-600">&gt;</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isToday = day === currentDay;
                const hasEvent = day === 16 || day === 17 || day === 19 || day === 20;
                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                      isToday
                        ? 'bg-[#5A5FEF] text-white font-bold'
                        : hasEvent
                        ? 'bg-blue-50 text-[#5A5FEF] font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#5A5FEF] to-[#7C80FA] rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Go premium!</h3>
              <p className="text-white/90 text-sm mb-4">Get access to all our features</p>
              <button className="bg-white text-[#5A5FEF] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Find out more
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Today tasks</h2>
            <div className="flex items-center gap-2">
              <span className="text-[#5A5FEF] text-sm">5 of 10</span>
              <button className="text-gray-400 hover:text-gray-600">...</button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">Conduct research</span>
              </div>
              <span className="text-xs text-gray-500">07:30-10:30</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-700">Schedule a meeting</span>
              </div>
              <span className="text-xs text-gray-500">09:30-11:30</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-700">Send out reminders</span>
              </div>
              <span className="text-xs text-gray-500">01:30-02:30</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Board meeting</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-[#5A5FEF]/10 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#5A5FEF]" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                90%
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Planning</p>
              <p className="text-xs text-gray-400">3 assignments are great</p>
            </div>
            <div className="ml-auto">
              <button className="text-[#5A5FEF] text-sm hover:underline">Done</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                85%
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Team synergy</p>
              <p className="text-xs text-gray-400">2 assignments are great</p>
            </div>
            <div className="ml-auto">
              <button className="text-[#5A5FEF] text-sm hover:underline">Done</button>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Meeting with John Smith, Mike Wilson, Jason QP</p>
            <div className="flex items-center justify-between">
              <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Reschedule
              </button>
              <button className="px-6 py-2 bg-[#5A5FEF] text-white rounded-lg hover:bg-[#4A4FDF] transition-colors">
                Accept invite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
