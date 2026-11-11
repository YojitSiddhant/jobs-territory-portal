"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../api";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={className ?? "text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-50 transition-colors"}
    >
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}
