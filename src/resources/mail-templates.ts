export const registerOtpTemplate = (otp: string) => {
  return {
    subject: 'StepUp Speak: Verify your email address',
    content: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Email Verification</h1>
        <p>Your One-Time Password (OTP) is:</p>
        <p style="font-size: 20px; font-weight: bold;">${otp}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `
  }
}
