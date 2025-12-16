"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";
import { Home } from "lucide-react";

type InstructorHeaderProps = {
  children?: React.ReactNode;
};

export function InstructorHeader({ children }: InstructorHeaderProps) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <nav className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/instructor">
          <Button variant="ghost" size="icon" title="Ir a Panel de Instructor">
            <Home className="h-5 w-5" />
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-cyan-400 to-blue-400 shadow">
            <svg
              viewBox="0 0 64 64"
              width="22"
              height="22"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="32" cy="20" r="10" fill="#0f172a" />
              <path
                d="M10 45c0-8 8-14 22-14s22 6 22 14v6H10v-6z"
                fill="#e0e7ff"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white">Instructor</h1>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        {children}
        {!isPending && session && <UserMenu user={session.user} />}
      </div>
    </nav>
  );
}
