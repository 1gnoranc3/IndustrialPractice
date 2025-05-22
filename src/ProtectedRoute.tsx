import { Navigate } from 'react-router-dom';
import { JSX } from 'react';

interface ProtectedRouteProps {
  hasAccess: boolean;
  redirectPath: string;
  children: JSX.Element;
}

export const ProtectedRoute = ({
                                 hasAccess,
                                 redirectPath,
                                 children,
                               }: ProtectedRouteProps) => {
  return hasAccess ? children : <Navigate to={redirectPath} replace />;
};