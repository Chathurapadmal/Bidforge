"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `HTTP ${res.status}`);
      }
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return React.createElement(
    "main",
    { style: { padding: 20 } },
    React.createElement("h1", null, "Register"),
    React.createElement(
      "form",
      {
        onSubmit: handleSubmit,
        style: { display: "grid", gap: 8, maxWidth: 420 },
      },
      React.createElement(
        "label",
        null,
        "Email",
        React.createElement("input", {
          value: email,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value),
          type: "email",
          required: true,
          className: "border p-2 w-full",
        })
      ),

      React.createElement(
        "label",
        null,
        "Password",
        React.createElement("input", {
          value: password,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value),
          type: "password",
          required: true,
          className: "border p-2 w-full",
        })
      ),

      React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          {
            disabled: loading,
            type: "submit",
            className: "bg-blue-600 text-white px-4 py-2 rounded",
          },
          loading ? "Creating..." : "Create account"
        )
      ),

      error && React.createElement("div", { className: "text-red-600" }, error),

      React.createElement(
        "p",
        { className: "text-sm mt-4" },
        "Already have an account? ",
        React.createElement(Link, { href: "/login" }, "Login")
      )
    )
  );
}
