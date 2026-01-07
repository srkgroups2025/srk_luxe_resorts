import nodemailer from "nodemailer";

export const signUpEmailSendor = async (email, verificationLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ Email transporter ready");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #111; border-radius: 8px; padding: 20px; border: 1px solid #333;">
          <h2 style="text-align: center; color: #0073e6;">Welcome to SRK Luxe Resorts</h2>
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
            © 2025 SRK Luxe Resorts. All rights reserved.
          </p>
        </div>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
};

export const resetPasswordEmailSender = async (email, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `
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
            © 2025 SRK Luxe Resorts
          </p>
        </div>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset password email sent to ${email}`);
  } catch (error) {
    console.error("❌ Reset email error:", error);
    throw error;
  }
};

export const sendBookingConfirmationEmail = async (booking) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const profileUrl = `${process.env.FRONTEND_URL}/profile`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.guest.email,
      subject: "Your Booking is Confirmed at SRK Luxe Resorts",
      html: `
        <div style="font-family: Arial, sans-serif; background:#000; color:#fff; padding:20px; max-width:600px; margin:auto; border-radius:8px; border:1px solid #333;">
          <h2 style="text-align:center; color:#0073e6;">Booking Confirmed!</h2>
          <p>Dear ${booking.guest.name},</p>
          <p>Thank you for booking with SRK Luxe Resorts. Here are your booking details:</p>
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
            © 2025 SRK Luxe Resorts. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to ${booking.guest.email}`);
  } catch (error) {
    console.error("❌ Error sending booking email:", error);
  }
};

export const sendReviewMail = async (booking) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: booking.guest.email,
    subject: "How was your stay at SRK Luxe Resorts?",
    html: `
      <h2>Thank you for staying with us</h2>
      <p>Dear ${booking.guest.name},</p>
      <p>We hope you enjoyed your stay.</p>
      <p>Please take a moment to leave us a review.</p>
      <a href="https://your-frontend/review/${booking.bookingId}">
        Leave a Review
      </a>
    `,
  };

  await transporter.sendMail(mailOptions);
};