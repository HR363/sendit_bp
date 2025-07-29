export interface AuthTokenResponse {
  access_token: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'COURIER_AGENT';
  createdAt: string;
  isEmailVerified: boolean;
}
