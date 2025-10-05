import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {mobile && <UserMenu variant="mobile" onLogout={() => setOpen(false)} />}
      <Link className="text-gray-700 hover:text-black" to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
      {user?.rola === 'wolontariusz' && (
          <Link className="text-gray-700 hover:text-black" to="/volunteer/offers" onClick={() => setOpen(false)}>Oferty</Link>
      )}
      {user?.rola === 'koordynator' && (
        <Link className="text-gray-700 hover:text-black" to="/coordinator/projects" onClick={() => setOpen(false)}>Projekty</Link>
      )}
      {user?.rola === 'organizacja' && (
        <Link className="text-gray-700 hover:text-black" to="/organization/projects" onClick={() => setOpen(false)}>Projekty</Link>
      )}
      {!mobile && <UserMenu variant="desktop" onLogout={undefined} />}
      {mobile && (
        <button
            className="text-gray-700 hover:text-black text-left"
            onClick={() => {
              logout();
            }}
          >
            Wyloguj
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-secondary/5 text-gray-900">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
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
            <NavLinks mobile />
          </div>
        </div>
      )}
    </div>
  );
}
