export enum UserRole {
  Admin = 0,
  Operator = 1
}

export enum Permission {
  Read = 'r',
  Write = 'w',
  Execute = 'x'
}

export interface User {
  login: string;
  role: UserRole;
}

export interface UserData {
  user: User;
  permissions?: string; // Можно оставить строкой для совместимости с JSON
}
