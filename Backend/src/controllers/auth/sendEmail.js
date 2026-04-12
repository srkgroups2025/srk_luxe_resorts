import { getResendClient } from "../../services/emailService.js";
import { TEXT } from "../../constants/site.js";

const FROM_EMAIL = TEXT.MAIL.FROM_EMAIL;
const REPLY_TO_EMAIL = TEXT.MAIL.REPLY_TO_EMAIL;

const buildEmailOptions = (to, subject, html) => ({
  from: FROM_EMAIL,
  to,
  subject,
  html,
  replyTo: REPLY_TO_EMAIL,
});

const sendEmail = async ({ to, subject, html, logLabel }) => {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send(buildEmailOptions(to, subject, html));

    if (result.error) {
      throw new Error(result.error.message || `Failed to send ${logLabel}`);
    }

    return result.data;
  } catch (error) {
    console.error(`Error sending ${logLabel}:`, error);
    throw error;
  }
};

export const signUpEmailSendor = async (email, verificationLink) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #111; border-radius: 8px; padding: 20px; border: 1px solid #333;">
          <h2 style="text-align: center; color: #0073e6;">Welcome to ${TEXT.SITE.TITLE}</h2>
          <p>Dear User,</p>
          <p>Please verify your email address by clicking the button below:</p>

          <p style="text-align: center;">
            <a href="${verificationLink}" target="_blank"
              style="padding: 12px 25px; background-color: #0073e6; color: #fff; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </p>

          <p>If you didn’t create an account, please ignore this email.</p>
          <hr style="border-color: #333;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            © 2025 ${TEXT.SITE.TITLE}. All rights reserved.
          </p>
        </div>
      </body>
      </html>
      `;

    return await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html,
      logLabel: "verification email",
    });
  } catch (error) {
    console.error("Error preparing verification email:", error);
    throw error;
  }
};

export const resetPasswordEmailSender = async (email, resetLink) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial; background:#000; color:#fff; padding:20px">
        <div style="max-width:600px;margin:auto;background:#111;padding:20px;border-radius:8px">
          <h2 style="color:#0073e6;text-align:center">Reset Your Password</h2>
          <p>You requested a password reset. Click the button below:</p>

          <p style="text-align:center">
            <a href="${resetLink}" 
               style="padding:12px 25px;background:#0073e6;color:#fff;
               text-decoration:none;border-radius:5px">
              Reset Password
            </a>
          </p>

          <p>This link will expire in 15 minutes.</p>
          <p>If you didn’t request this, please ignore this email.</p>

          <hr style="border-color:#333"/>
          <p style="font-size:12px;color:#999;text-align:center">
            © 2025 ${TEXT.SITE.TITLE}
          </p>
        </div>
      </body>
      </html>
      `;

    return await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html,
      logLabel: "reset password email",
    });
  } catch (error) {
    console.error("Error preparing reset password email:", error);
    throw error;
  }
};

export const sendBookingConfirmationEmail = async (booking) => {
  try {
    const profileUrl = `${process.env.FRONTEND_URL}/profile`;

    const html = `
        <div style="font-family: Arial, sans-serif; background:#000; color:#fff; padding:20px; max-width:600px; margin:auto; border-radius:8px; border:1px solid #333;">
          <h2 style="text-align:center; color:#0073e6;">Booking Confirmed!</h2>
          <p>Dear ${booking.guest.name},</p>
          <p>Thank you for booking with ${TEXT.SITE.TITLE}. Here are your booking details:</p>
          <ul>
            <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
            <li><strong>Room:</strong> ${booking.roomId.name}</li>
            <li><strong>Check-In:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
            <li><strong>Check-Out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
            <li><strong>Guests:</strong> ${booking.guests.adults} Adults${booking.guests.children > 0 ? `, ${booking.guests.children} Children` : ''}</li>
            <li><strong>Total Amount:</strong> ₹${booking.totalAmount}</li>
          </ul>
          <p>You can view all your bookings on your profile page:</p>
          <p style="text-align:center;">
            <a href="${profileUrl}" target="_blank"
               style="padding:12px 25px; background:#0073e6; color:#fff; text-decoration:none; border-radius:5px;">
              Go to My Profile
            </a>
          </p>
          <p>We look forward to hosting you!</p>
          <hr style="border-color:#333" />
          <p style="font-size:12px; color:#999; text-align:center;">
            © 2025 ${TEXT.SITE.TITLE}. All rights reserved.
          </p>
        </div>
      `;

    return await sendEmail({
      to: booking.guest.email,
      subject: `Your Booking is Confirmed at ${TEXT.SITE.TITLE}`,
      html,
      logLabel: "booking confirmation email",
    });
  } catch (error) {
    console.error("Error preparing booking confirmation email:", error);
    throw error;
  }
};

export const sendReviewMail = async (booking) => {
  try {
    const reviewUrl = `${process.env.FRONTEND_URL}/review?email=${encodeURIComponent(
      booking.guest.email
    )}`;

    const html = `
      <div style="font-family: Arial; background:#000; color:#fff; padding:20px">
        <div style="max-width:600px;margin:auto;background:#111;padding:20px;border-radius:8px">
          <h2 style="color:#0073e6;text-align:center">We’d love your feedback</h2>
          <p>Dear ${booking.guest.name},</p>
          <p>Thank you for staying at <strong>${TEXT.SITE.TITLE}</strong>.</p>
          <p>Please take a moment to share your experience.</p>

          <p style="text-align:center">
            <a href="${reviewUrl}"
               style="padding:12px 25px;background:#0073e6;color:#fff;
               text-decoration:none;border-radius:5px">
              Leave a Review
            </a>
          </p>

          <p style="font-size:12px;color:#999;text-align:center">
            © 2025 ${TEXT.SITE.TITLE}
          </p>
        </div>
      </div>
    `;

    return await sendEmail({
      to: booking.guest.email,
      subject: `How was your stay at ${TEXT.SITE.TITLE}?`,
      html,
      logLabel: "review email",
    });
  } catch (error) {
    console.error("Error preparing review email:", error);
    throw error;
  }
};
