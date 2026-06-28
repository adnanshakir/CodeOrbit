import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send an email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"CodeOrbit" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export function getEmailTemplate(action, { userId, timestamp }) {
  switch (action) {
    case "signup":
      return {
        subject: "Welcome to CodeOrbit!",

        text: `Hello,

Welcome to CodeOrbit!

Your account has been created successfully.

Account Details:
- User ID: ${userId}
- Created At: ${new Date(timestamp).toLocaleString()}

You can now start building, coding, and collaborating with CodeOrbit.

If you have any questions, feel free to reach out to our support team.

Welcome aboard!

The CodeOrbit Team`,

        html: `
          <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;line-height:1.6;color:#333;">
            <h2 style="color:#2563eb;">🎉 Welcome to CodeOrbit!</h2>

            <p>Hello,</p>

            <p>Your account has been created successfully. We're excited to have you join the CodeOrbit community.</p>

            <div style="background:#f5f5f5;padding:16px;border-radius:8px;">
              <p><strong>User ID:</strong> ${userId}</p>
              <p><strong>Created At:</strong> ${new Date(timestamp).toLocaleString()}</p>
            </div>

            <p>You can now sign in and start using all of CodeOrbit's features.</p>

            <p>Thank you for choosing CodeOrbit!</p>

            <hr style="margin:24px 0;border:none;border-top:1px solid #ddd;">

            <p style="font-size:13px;color:#666;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `,
      };

    case "login":
      return {
        subject: "New Login Detected",

        text: `Hello,

We detected a new login to your CodeOrbit account.

Login Details:
- User ID: ${userId}
- Time: ${new Date(timestamp).toLocaleString()}

If this login was you, no further action is required.

If you do not recognize this activity, please change your password immediately and contact support.

The CodeOrbit Team`,

        html: `
          <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;line-height:1.6;color:#333;">
            <h2 style="color:#2563eb;">🔐 New Login Detected</h2>

            <p>Hello,</p>

            <p>We detected a new login to your CodeOrbit account.</p>

            <div style="background:#f5f5f5;padding:16px;border-radius:8px;">
              <p><strong>User ID:</strong> ${userId}</p>
              <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
            </div>

            <p>If this login was you, no further action is required.</p>

            <p><strong>If you do not recognize this activity:</strong></p>

            <ul>
              <li>Change your password immediately.</li>
              <li>Review your recent account activity.</li>
              <li>Contact support if you believe your account has been compromised.</li>
            </ul>

            <hr style="margin:24px 0;border:none;border-top:1px solid #ddd;">

            <p style="font-size:13px;color:#666;">
              This is an automated security notification from CodeOrbit.
            </p>
          </div>
        `,
      };

    default:
      throw new Error(`Unknown email action: ${action}`);
  }
}