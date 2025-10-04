import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/guest/Home/Index';
import About from './pages/guest/About/Index';
import NotFound from './pages/NotFound/Index';
import Dashboard from './pages/authenticated/Dashboard/Index';
import Profile from './pages/authenticated/Profile/Index';
import GuestLayout from './layouts/GuestLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Login from './pages/guest/Login/Index';
import Register from './pages/guest/Register/Index';
import { AuthProvider } from './hooks/useAuth';
import VolunteerOffersPage from './pages/authenticated/Volunteer/Offers/Index';
import CoordinatorProjectsPage from './pages/authenticated/Coordinator/Projects/Index';
import OrganizationProjectsPage from './pages/authenticated/Organization/Projects/Index';

export default function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Guest routes */}
          <Route element={<GuestLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Authenticated routes */}
          <Route
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Role-specific routes */}
            <Route
              path="/volunteer/offers"
              element={
                <RoleRoute allow={["wolontariusz"]}>
                  <VolunteerOffersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/coordinator/projects"
              element={
                <RoleRoute allow={["koordynator"]}>
                  <CoordinatorProjectsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/organization/projects"
              element={
                <RoleRoute allow={["organizacja"]}>
                  <OrganizationProjectsPage />
                </RoleRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
