"use client";

import SignupWizard from "@/components/signup/signup-wizard";

export default function SignupPage() {
  return (
    <div className="flex h-screen w-screen items-start justify-center bg-black p-8">
      <SignupWizard />
    </div>
  );
}
