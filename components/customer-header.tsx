"use client";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";

type CustomerHeaderProps = {
  children?: React.ReactNode;
};

export function CustomerHeader({ children }: CustomerHeaderProps) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <nav className="w-full px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-400 shadow">
          <svg
            viewBox="0 0 64 64"
            width="22"
            height="22"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="20" cy="20" r="12" fill="#0f172a" />
            <path
              d="M39 10c6 0 12 6 12 12s-6 12-12 12-12-6-12-12 6-12 12-12z"
              fill="#fef3c7"
            />
            <rect
              x="33"
              y="33"
              width="18"
              height="6"
              rx="3"
              transform="rotate(-35 33 33)"
              fill="#fde68a"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-white">ClubPlay</h1>
      </div>

      <div className="flex gap-3 items-center">
        {children}
        {!isPending && session && <UserMenu user={session.user} />}
      </div>
    </nav>
  );
}
