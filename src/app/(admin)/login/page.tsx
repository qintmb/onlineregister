"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { login } from "@/app/actions/auth";
import { MotionBackground } from "@/components/MotionBackground";
import { Lock } from "lucide-react";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initialState = { error: "" } as any;

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      <MotionBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-sm p-8"
      >
        <div className="flex justify-center mb-6">
          <div className="mb-3">
            <Image
              src="/st_logo.webp"
              alt="ST LOGO"
              width={90}
              height={90}
              priority
              className="mx-auto drop-shadow-2xl"
            />
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900 text-center mb-1">
          Admin Login
        </h1>
        <p className="font-medium text-sm text-center mb-10 mt-1">
          DATABASE ABSENSI RAPAT INTERNAL
        </p>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 tracking-wider">
              USERNAME
            </label>
            <input
              name="username"
              type="text"
              required
              className="glass-input w-full p-3 font-medium transition-all focus:bg-white"
              placeholder="Username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 tracking-wider">
              PASSWORD
            </label>
            <input
              name="password"
              type="password"
              required
              className="glass-input w-full p-3 font-medium transition-all focus:bg-white"
              placeholder="Password"
            />
          </div>

          {state?.error && (
            <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium border border-red-100">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="glass-button w-full mt-4 py-3"
          >
            {isPending ? "Authenticating..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
