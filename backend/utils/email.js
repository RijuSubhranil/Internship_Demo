import 'dotenv/config';

export const sendEmail = async (options) => {
  const url = 'https://api.brevo.com/v3/smtp/email';
  
  const emailData = {
    sender: { 
      name: process.env.BREVO_SENDER_NAME, 
      email: process.env.BREVO_SENDER_EMAIL 
    },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 15px; padding: 40px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4a90e2; font-size: 28px; letter-spacing: -1px;">Verification Required</h1>
        </div>
        <p style="font-size: 16px; color: #555; line-height: 1.5;">Hello,</p>
        <p style="font-size: 16px; color: #555;">To continue with your <strong>Internship Demo</strong> registration, please use the following One-Time Password (OTP):</p>
        <div style="text-align: center; margin: 40px 0;">
          <div style="display: inline-block; padding: 15px 35px; background-color: #f8f9fa; border: 2px solid #4a90e2; border-radius: 10px; font-size: 36px; font-weight: bold; color: #4a90e2; letter-spacing: 8px;">
            ${options.otp}
          </div>
          <p style="margin-top: 15px; font-size: 13px; color: #999;">This code expires in <strong>2 minutes</strong>.</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">This is an automated security email. Please do not reply.</p>
      </div>
    `
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });
    return await response.json();
  } catch (error) {
    console.error('Brevo API Error:', error);
  }
};