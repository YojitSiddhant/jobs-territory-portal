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
      className={className ?? "rounded-lg px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 transition-colors w-full sm:w-auto"}
    >
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}
