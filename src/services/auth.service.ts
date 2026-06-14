import { apiClient } from '@/lib/api-client';
import type { LoginResult, LoginSuccessData } from '@/types/auth';

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResult>('/auth/login', { email, password }, { auth: false }),

  verifyOtp: (otpToken: string, otp: string) =>
    apiClient.post<LoginSuccessData>('/auth/verify-otp', { otpToken, otp }, { auth: false }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<{ changed: boolean }>('/auth/change-password', {
      currentPassword,
      newPassword,
    }),

  logout: (refreshToken: string) =>
    apiClient.post<void>('/auth/logout', { refreshToken }),
};
