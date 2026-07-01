"use client";

import { SignupForm } from "@/features/auth";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 dark-first">
      <SignupForm />
    </div>
  );
}
