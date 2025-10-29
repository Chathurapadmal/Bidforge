"use client";
import { useSession } from "../../lib/session";
import { apiFetch } from "../../lib/api";
import { useEffect, useState } from "react";

type UserStatus = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  isApproved?: boolean;
  hasNicNumber?: boolean;
  hasNicImage?: boolean;
};

type ApprovalGuardProps = {
  children: React.ReactNode;
  showForApproved?: boolean; // If true, only show children for approved users
  requiredAction?: "bid" | "sell" | "general"; // What action user is trying to perform
};

export default function ApprovalGuard({ 
  children, 
  showForApproved = true, 
  requiredAction = "general" 
}: ApprovalGuardProps) {
  const { user, loading } = useSession();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      fetchUserStatus();
    }
  }, [user, loading]);

  const fetchUserStatus = async () => {
    setStatusLoading(true);
    try {
      const status = await apiFetch<UserStatus>("/api/auth/me");
      setUserStatus(status);
    } catch (error) {
      console.error("Failed to fetch user status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  // Don't show anything while loading
  if (loading || statusLoading || !user || !userStatus) {
    return null;
  }

  // Admin users bypass all checks
  if (userStatus.role === "Admin") {
    return <>{children}</>;
  }

  // If we want to show content only for approved users and user is not approved
  if (showForApproved && !userStatus.isApproved) {
    const actionText = {
      bid: "place bids",
      sell: "create auctions", 
      general: "participate in auctions"
    }[requiredAction];

    // Check if user needs to submit NIC info
    const needsNicInfo = !userStatus.hasNicNumber || !userStatus.hasNicImage;

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-800">
          <h3 className="text-lg font-semibold mb-2">Account Verification Required</h3>
          {needsNicInfo ? (
            <div className="space-y-3">
              <p>To {actionText}, please submit your NIC information for verification.</p>
              <a
                href="/profile"
                className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Submit NIC Information
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <p>Your NIC information has been submitted and is pending admin approval.</p>
              <p className="text-sm">You'll be able to {actionText} once your account is verified.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If user is approved or we don't require approval, show children
  return <>{children}</>;
}

// Simple status indicator component
export function ApprovalStatus() {
  const { user, loading } = useSession();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);

  useEffect(() => {
    if (user && !loading) {
      fetchUserStatus();
    }
  }, [user, loading]);

  const fetchUserStatus = async () => {
    try {
      const status = await apiFetch<UserStatus>("/api/auth/me");
      setUserStatus(status);
    } catch (error) {
      console.error("Failed to fetch user status:", error);
    }
  };

  if (loading || !user || !userStatus || userStatus.role === "Admin") {
    return null;
  }

  if (!userStatus.isApproved) {
    return (
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-1 rounded text-sm">
        {!userStatus.hasNicNumber || !userStatus.hasNicImage 
          ? "⚠️ NIC Verification Needed" 
          : "⏳ Pending Approval"
        }
      </div>
    );
  }

  return (
    <div className="bg-green-100 border border-green-300 text-green-800 px-3 py-1 rounded text-sm">
      ✓ Verified
    </div>
  );
}