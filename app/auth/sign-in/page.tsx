"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type AuthClientResult = {
  data?: {
    redirect?: boolean;
    url?: string | null;
  } | null;
  error?: {
    message?: string;
    statusText?: string;
  } | null;
};

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting sign in with:", { email });
      console.log("Auth base URL:", process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
      console.log("Window origin:", typeof window !== 'undefined' ? window.location.origin : 'N/A');
      
      const result = (await signIn.email({
        email,
        password,
        callbackURL: "/",
      })) as AuthClientResult;
      
      console.log("Sign in result:", result);

      if (result.error) {
        setError(
          result.error.message ||
            result.error.statusText ||
            "Invalid email or password.",
        );
        return;
      }

      if (result.data?.url) {
        router.push(result.data.url);
        router.refresh();
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign in error:", err);
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      setError(errorMessage || "An unexpected error occurred.");
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
          Admin Sign In
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/auth/sign-up" className="text-biro-blue hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
