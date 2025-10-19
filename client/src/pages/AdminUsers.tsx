import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getData } from "../api";
import apiClient from "../api";

type AdminUser = { uid: string; email?: string; name?: string; role?: string };

export default function AdminUsers() {
  useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const j = await getData<{ success: boolean; data?: AdminUser[] }>(
          "/admin/users"
        );
        if (j?.success) setUsers(j.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const appoint = async (uid: string) => {
    try {
      const j = (await apiClient.post<{
        success: boolean;
        message?: string;
      }>(`/admin/appoint-hr`, { uid })) as {
        success: boolean;
        message?: string;
      };
      if (j?.success) {
        alert("Appointed as HR");
        setUsers((u) =>
          u.map((x) => (x.uid === uid ? { ...x, role: "hr" } : x))
        );
      } else alert(j?.message || "Failed");
    } catch (e) {
      console.error(e);
      alert("Failed");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.uid}
              className="p-3 bg-white rounded shadow flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{u.name || u.email}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm">{u.role || "employee"}</div>
                {u.role !== "hr" && (
                  <button
                    onClick={() => appoint(u.uid)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Make HR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
