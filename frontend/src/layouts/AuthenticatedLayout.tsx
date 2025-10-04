import { Link, Outlet } from 'react-router-dom';

export default function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
          <Link to="/" className="font-semibold text-lg">Wolontariat Kraków</Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link className="text-gray-700 hover:text-black" to="/dashboard">Dashboard</Link>
            <Link className="text-gray-700 hover:text-black" to="/profile">Profile</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}