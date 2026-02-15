"use client";

import { AuthProvider, type User } from "@/features/auth/context/AuthContext";

export default function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
}