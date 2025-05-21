import { UserData } from './types';

export const checkAccess = (userData: UserData): boolean => {
  const { role } = userData.user;
  const permissions = userData.permissions || '';

  if (role === 0) return true; // Администратор
  if (role === 1 && permissions.includes('r')) return true; // Оператор с доступом

  return false;
};