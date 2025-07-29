export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'COURIER_AGENT';
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
