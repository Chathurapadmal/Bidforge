"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/session";
import { apiFetch } from "../../lib/api";

type AuthUserWithRole = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

export function useAdminAuth() {
  const { user, loading } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminRole() {
      if (loading) return;
      
      if (!user) {
        router.push("/auth/login?next=/admin");
        return;
      }

      try {
        // Get user info with role from /me endpoint
        const userData: AuthUserWithRole = await apiFetch("/api/auth/me");
        const userIsAdmin = userData.role === "Admin";
        
        setIsAdmin(userIsAdmin);
        
        if (!userIsAdmin) {
          router.push("/"); // Redirect non-admins to home
          return;
        }
      } catch (error) {
        console.error("Failed to verify admin role:", error);
        router.push("/auth/login?next=/admin");
      } finally {
        setAdminLoading(false);
      }
    }

    checkAdminRole();
  }, [user, loading, router]);

  return {
    isAdmin,
    loading: loading || adminLoading,
    user,
  };
}

export default function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}