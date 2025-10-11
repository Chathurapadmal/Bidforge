"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  userName: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">
        Registered Users
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-orange-300">
          <thead className="bg-orange-100">
            <tr>
              <th className="border border-orange-300 p-2">ID</th>
              <th className="border border-orange-300 p-2">Email</th>
              <th className="border border-orange-300 p-2">Username</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="text-sm">
                <td className="border border-orange-200 p-2">{u.id}</td>
                <td className="border border-orange-200 p-2">{u.email}</td>
                <td className="border border-orange-200 p-2">{u.userName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
