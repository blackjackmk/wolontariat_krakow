import Logo from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';
import { Link, Outlet } from 'react-router-dom';

export default function GuestLayout() {
  const {user} = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link className="text-gray-700 hover:text-black" to="/about">O nas</Link>
            {user ? (
              <Link className="text-gray-700 hover:text-black" to="/dashboard">Panel</Link>
            ) : (
              <Link className="text-gray-700 hover:text-black" to="/login">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}