import Logo from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';
import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function GuestLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link className="text-gray-700 hover:text-black" to="/about" onClick={() => setOpen(false)}>O nas</Link>
      {user ? (
        <Link className="text-gray-700 hover:text-black" to="/dashboard" onClick={() => setOpen(false)}>Panel</Link>
      ) : (
        <Link className="text-gray-700 hover:text-black" to="/login" onClick={() => setOpen(false)}>Login</Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          {/* Desktop nav */}
          <nav className="ml-auto hidden md:flex items-center gap-4">
            <NavLinks />
          </nav>
          {/* Mobile trigger */}
          <div className="ml-auto md:hidden">
            <Button variant="outline" size="icon" onClick={() => setOpen(true)} aria-label="Otwórz menu">
              <Menu />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile modal menu */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Menu</div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Zamknij">
                <X />
              </Button>
            </div>
            <NavLinks />
          </div>
        </div>
      )}
    </div>
  );
}
