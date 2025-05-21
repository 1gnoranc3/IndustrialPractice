import { UserData, UserRole, Permission } from './types/user/types';

export const checkAccess = (userData: UserData): boolean => {
  const { role } = userData.user;
  const permissions = userData.permissions || '';

  if (role === UserRole.Admin) return true;
  if (role === UserRole.Operator && permissions.includes(Permission.Read)) return true;

  return false;
};