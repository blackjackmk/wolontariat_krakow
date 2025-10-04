// src/components/RoleRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { JSX } from 'react';

interface RoleRouteProps {
  allow: RoleType[];
  children: JSX.Element;
}

export default function RoleRoute({ allow, children }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.rola)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

