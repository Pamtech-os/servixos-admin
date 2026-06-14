export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginSuccessData {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  admin: Admin;
}

export interface LoginOtpData {
  requiresOtp: true;
  otpToken: string;
}

export type LoginResult = LoginSuccessData | LoginOtpData;

export function isOtpRequired(r: LoginResult): r is LoginOtpData {
  return 'requiresOtp' in r && r.requiresOtp === true;
}
