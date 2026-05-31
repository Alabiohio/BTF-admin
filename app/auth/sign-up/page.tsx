"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting sign-up with:", { email, name });
      console.log("Auth base URL:", process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
      
      const result = await signUp.email({
        email,
        password,
        name,
        callbackURL: "/",
      });
      
      console.log("Sign-up result:", result);
    } catch (err) {
      console.error("Sign-up error:", err);
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      console.error("Full error details:", err);
      setError(errorMessage || "An unexpected error occurred during sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-4">
        <div className="mb-4 flex justify-center">
          <img src="/images/logo/logo.png" alt="Logo" className="h-18 w-auto" />
        </div>
        <h1 className="text-2xl font-oswald font-bold text-biro-blue-dark mb-6 text-center">
          Create Admin Account
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-biro-blue outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-biro-blue outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-biro-blue outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-biro-blue hover:bg-biro-blue-dark text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/auth/sign-in" className="text-biro-blue hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
