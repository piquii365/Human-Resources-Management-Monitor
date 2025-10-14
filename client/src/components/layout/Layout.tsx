import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Briefcase,
  GraduationCap,
  FileText,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Evaluations", href: "/evaluations", icon: ClipboardCheck },
  { name: "Recruitment", href: "/recruitment", icon: Briefcase },
  { name: "Training", href: "/training", icon: GraduationCap },
  { name: "Reports", href: "/reports", icon: FileText },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-[#F6FAFD]">
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white shadow-lg z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#4A7FA7] rounded-xl flex items-center justify-center">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">HR-MES</h1>
                <p className="text-xs text-[#B3CFE5]">
                  Ministry of Local Government
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#B3CFE5]">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex pt-[72px]">
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-[#B3CFE5]
            transform transition-transform duration-300 ease-in-out z-30 pt-[72px] lg:pt-0
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white shadow-lg shadow-blue-100/50"
                        : "text-gray-700 hover:bg-[#B3CFE5]/30"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden pt-[72px]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
