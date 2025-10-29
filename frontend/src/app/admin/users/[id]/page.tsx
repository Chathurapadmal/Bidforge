"use client";
import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";
import { toImageSrc } from "../../../../lib/Config";
import AdminAuthWrapper from "../../AdminAuthWrapper";

type UserDetail = {
  user: {
    id: string;
    email: string | null;
    userName: string | null;
    fullName: string | null;
    phoneNumber: string | null;
    isApproved: boolean;
    createdAt: string;
    role: string;
    nicNumber: string | null;
    nicImagePath: string | null;
  };
  auctionCount: number;
  wonAuctionCount: number;
  bidCount: number;
  canDelete: boolean;
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<UserDetail>(`/api/admin/users/${userId}/details`);
      setUserDetail(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!userDetail || approving) return;
    setApproving(true);
    try {
      await apiFetch(`/api/admin/users/${userId}/approve`, {
        method: "PATCH",
      });
      await fetchUserDetail(); // Refresh data
    } catch (e: any) {
      alert(e.message ?? "Failed to approve user");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <AdminAuthWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading user details...</p>
          </div>
        </div>
      </AdminAuthWrapper>
    );
  }

  if (error) {
    return (
      <AdminAuthWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </AdminAuthWrapper>
    );
  }

  if (!userDetail) {
    return (
      <AdminAuthWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">User Not Found</h1>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </AdminAuthWrapper>
    );
  }

  const { user } = userDetail;
  console.log(user)
  const hasNicInfo = user.nicNumber && user.nicImagePath;

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-semibold">User Details</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.isApproved 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {user.isApproved ? "✓ Approved" : "⏳ Pending"}
              </span>
              {!user.isApproved && hasNicInfo && (
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {approving ? "Approving..." : "Approve User"}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="p-2 bg-gray-50 rounded border">{user.email || "—"}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="p-2 bg-gray-50 rounded border">{user.userName || "—"}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="p-2 bg-gray-50 rounded border">{user.fullName || "—"}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="p-2 bg-gray-50 rounded border">{user.phoneNumber || "—"}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="p-2 bg-gray-50 rounded border">{user.role}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="p-2 bg-gray-50 rounded border">
                  {new Date(user.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* NIC Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">NIC Information</h2>
            {hasNicInfo ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                  <div className="p-2 bg-gray-50 rounded border font-mono">{user.nicNumber}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC Image</label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img
                      src={toImageSrc(user.nicImagePath)}
                      alt="NIC Document"
                      className="max-w-md w-full h-auto rounded border"
                      onError={(e) => {
                        console.error("Failed to load NIC image:", toImageSrc(user.nicImagePath));
                        (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </div>
                </div>
                {!user.isApproved && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <p className="text-blue-800 text-sm">
                      Please review the NIC information above. If everything looks correct, 
                      approve this user to allow them to participate in auctions.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-yellow-800 text-sm">
                  This user has not submitted their NIC information yet. 
                  They will need to complete this step before admin approval.
                </p>
              </div>
            )}
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{userDetail.auctionCount}</div>
                <div className="text-sm text-gray-600">Auctions Created</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-green-600">{userDetail.wonAuctionCount}</div>
                <div className="text-sm text-gray-600">Auctions Won</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-purple-600">{userDetail.bidCount}</div>
                <div className="text-sm text-gray-600">Bids Placed</div>
              </div>
            </div>
            {!userDetail.canDelete && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-800 text-sm">
                  This user cannot be deleted because they have auction activity.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminAuthWrapper>
  );
}