"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { IconCheck, IconAlert } from "@/components/Icons";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.ok) {
        setMessage({
          type: "success",
          text: `Welcome back, ${username}! Redirecting to dashboard...`,
        });
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setMessage({ type: "error", text: result?.error || "Invalid credentials." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setMessage({ type: "error", text: `Login failed: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: username }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "info", text: data.message });
        if (data.previewCode) {
          setDebugOtp(data.previewCode);
          setResetCode(data.previewCode);
        }
        setView("reset");
      } else {
        setMessage({ type: "error", text: data.error || "Request failed." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setMessage({ type: "error", text: `Reset request failed: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: resetCode, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: `${data.message} Please log in with your new password.` });
        setPassword(newPassword);
        setView("login");
      } else {
        setMessage({ type: "error", text: data.error || "Reset failed." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setMessage({ type: "error", text: `Password update failed: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 antialiased">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20">
            M
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">HARSHITH MGEN CRM</h1>
          <p className="text-xs text-slate-400">Secure CAD/CAM Enterprise Authentication</p>
        </div>

        {/* Status Alert */}
        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : message.type === "error"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-blue-500/10 border-blue-500/30 text-blue-300"
            }`}
          >
            {message.type === "success" ? (
              <IconCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <IconAlert className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* VIEW 1: LOGIN */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Username (e.g., admin)"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot");
                    setMessage(null);
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              {isLoading ? "Authenticating..." : "Sign In to CRM Portal"}
            </button>
          </form>
        )}

        {/* VIEW 2: FORGOT PASSWORD */}
        {view === "forgot" && (
          <form onSubmit={handleRequestResetCode} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Reset Account Password</h3>
              <p className="text-xs text-slate-400">
                Enter your username or recovery email. A 6-digit verification code will be generated.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Username or Recovery Email</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                placeholder="admin or recovery email"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
              >
                {isLoading ? "Generating..." : "Get Reset Code"}
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: RESET PASSWORD */}
        {view === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Enter Verification Code</h3>
              <p className="text-xs text-slate-400">
                Enter the 6-digit OTP code and choose a new password.
              </p>
            </div>

            {debugOtp && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                <strong>Developer Preview OTP:</strong> <span className="font-mono font-bold text-white text-sm">{debugOtp}</span> (valid for 15 minutes)
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">6-Digit Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-center font-mono text-base tracking-widest text-white focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={5}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500"
                placeholder="At least 5 characters"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
              >
                {isLoading ? "Updating..." : "Set New Password"}
              </button>
            </div>
          </form>
        )}

        {/* Configuration Notice Footer */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Authentication Mode:</span>
            <span className="text-emerald-400 font-medium">PBKDF2-HMAC-SHA256 (310k iters)</span>
          </div>
          <div className="text-center pt-2">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-xs font-semibold">
              ← Return to Executive Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
