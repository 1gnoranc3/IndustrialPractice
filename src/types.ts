export interface User {
  login: string;
  role: number;
}

export interface UserData {
  user: User;
  permissions?: string;
}