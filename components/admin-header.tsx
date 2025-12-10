"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";
import { Home } from "lucide-react";

type AdminHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export function AdminHeader({ title, children }: AdminHeaderProps) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="w-full flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50 border border-white/10 rounded-xl px-6 py-4 shadow-lg backdrop-blur-sm text-white">
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="icon" title="Ir a Panel Administrativo">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        {children}

        {!isPending && session && <UserMenu user={session.user} />}
      </div>
    </header>
  );
}
