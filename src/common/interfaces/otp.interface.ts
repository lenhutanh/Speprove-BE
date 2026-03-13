export interface IOtpService {
  storeOtp(email: string, otp: string): Promise<void>
  verifyOtp(email: string, otp: string): Promise<boolean>
  deleteOtp(email: string): Promise<void>
}
