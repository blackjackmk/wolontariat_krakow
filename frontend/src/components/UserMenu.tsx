import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  variant?: 'desktop' | 'mobile';
  onLogout?: () => void; // e.g., close mobile drawer
};

export default function UserMenu({ variant = 'desktop', onLogout }: Props) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || `@${user.username}`;
  const initials = (() => {
    const first = (user.first_name || user.username || "").trim();
    const last = (user.last_name || "").trim();
    const a = first.charAt(0).toUpperCase();
    const b = last.charAt(0).toUpperCase();
    return (a + b).trim() || "U";
  })();

  // Mobile variant: inline block within the drawer
  if (variant === 'mobile') {
    return (
      <div className="pt-2">
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="size-10 rounded-full bg-gray-200 text-gray-700 font-semibold flex items-center justify-center">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate" title={displayName}>{displayName}</div>
            <div className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</div>
          </div>
        </div>
        <div className="pt-3 hidden md:visible">
          <button
            className="text-gray-700 hover:text-black"
            onClick={() => {
              logout();
              onLogout?.();
            }}
          >
            Wyloguj
          </button>
        </div>
      </div>
    );
  }

  // Desktop variant: avatar with popover
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Otwórz menu użytkownika"
        className="size-9 rounded-full bg-gray-200 text-gray-700 font-semibold flex items-center justify-center hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={() => setOpen((v) => !v)}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-md border bg-white shadow-lg p-3 z-50">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="size-10 rounded-full bg-gray-200 text-gray-700 font-semibold flex items-center justify-center">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate" title={displayName}>{displayName}</div>
              <div className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</div>
            </div>
          </div>
          <div className="pt-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              Wyloguj
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
