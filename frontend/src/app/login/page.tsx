"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../../lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await authClient.signIn.email(
      { email, password, rememberMe: remember, callbackURL: "/dashboard" },
      {
        onError: (error: any) => setErr(error?.message || "Login failed."),
        onSuccess: () => router.push("/dashboard"),
      }
    );

    setLoading(false);
    if (error) setErr(error?.message || "Login failed.");
  };

  return React.createElement(
    "main",
    {
      className:
        "flex justify-center items-center min-h-screen bg-gray-100 px-4",
    },
    React.createElement(
      "div",
      { className: "bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md" },
      React.createElement(
        "div",
        { className: "flex justify-center mb-4" },
        React.createElement("img", {
          src: "/bidf.png",
          alt: "Bidforge Logo",
          width: 80,
          height: 80,
          className: "h-10 w-auto",
        })
      ),
      React.createElement(
        "h2",
        { className: "text-xl font-bold text-center mb-6 text-gray-700" },
        "Login to Bidforge"
      ),

      React.createElement(
        "form",
        {
          className: "flex flex-col gap-4",
          onSubmit: onSubmit,
          noValidate: true,
        },
        React.createElement("input", {
          type: "email",
          placeholder: "Email",
          autoComplete: "email",
          className: "border p-2 rounded",
          value: email,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value),
          required: true,
        }),

        React.createElement("input", {
          type: "password",
          placeholder: "Password",
          autoComplete: "current-password",
          className: "border p-2 rounded",
          value: password,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value),
          required: true,
        }),

        React.createElement(
          "button",
          {
            type: "submit",
            className: "bg-blue-600 text-white p-2 rounded",
            disabled: loading,
          },
          loading ? "Signing in..." : "Login"
        ),

        err &&
          React.createElement("p", { className: "text-red-600 text-sm" }, err)
      ),

      React.createElement(
        "p",
        { className: "text-sm text-center mt-6 text-gray-500" },
        "Don’t have an account? ",
        React.createElement(
          Link,
          { href: "/register", className: "text-blue-600 hover:underline" },
          "Register"
        )
      )
    )
  );
}
