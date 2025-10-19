import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getData } from "../api";

type AuthMeResponse = {
  success: boolean;
  data?: { uid?: string; email?: string; role?: string };
  message?: string;
};
type SessionUser = { uid?: string; role?: string; [k: string]: unknown };

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      setChecking(true);
      // try sessionStorage first
      try {
        const s = sessionStorage.getItem("user");
        if (s) {
          const parsed = JSON.parse(s) as { uid?: string; role?: string };
          if (parsed?.role) {
            setRole(parsed.role);
            setChecking(false);
            return;
          }
        }
      } catch (e) {
        console.debug("ProtectedRoute: failed to parse session user", e);
      }

      // fallback to server via central apiClient so baseURL and auth headers are used
      try {
        const j = await getData<AuthMeResponse>("/auth/me");
        const dbRole = j?.success && j.data?.role ? j.data.role : undefined;
        if (dbRole) {
          const normalized =
            typeof dbRole === "string"
              ? dbRole.trim().toLowerCase()
              : undefined;
          if (normalized) {
            setRole(normalized);
            // update session user role too so other parts of the app see DB role
            try {
              const s = sessionStorage.getItem("user");
              if (s) {
                const parsed = JSON.parse(s) as SessionUser;
                parsed.role = normalized;
                sessionStorage.setItem("user", JSON.stringify(parsed));
              }
            } catch (e) {
              console.debug(
                "ProtectedRoute: failed to update session user role",
                e
              );
            }
          }
        }
      } catch (e) {
        console.debug("ProtectedRoute: failed to call /auth/me", e);
      } finally {
        setChecking(false);
      }
    })();
  }, [location.pathname]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A9FD4]"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // only admin and hr can proceed to dashboard routes
  const allowed = role === "admin" || role === "hr";
  if (!allowed) {
    // set a message for the auth page and redirect there
    const msg =
      "Your account is pending admin approval. An administrator will approve your access shortly.";
    try {
      sessionStorage.setItem("authMessage", msg);
    } catch (e) {
      console.debug("ProtectedRoute: failed to set authMessage", e);
    }
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
