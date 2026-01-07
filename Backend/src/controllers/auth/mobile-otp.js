import Twilio from "twilio";

const getTwilioClient = () => {
  return new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

const formatMobileNumber = (number) => {
  if (number.startsWith("+")) return number;
  return `+91${number}`;
};

export const sendMobileOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const formattedNumber = formatMobileNumber(mobileNumber);
    const client = getTwilioClient();

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedNumber,
        channel: "sms",
      });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyMobileOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res
        .status(400)
        .json({ message: "Mobile number and OTP are required" });
    }

    const formattedNumber = mobileNumber.startsWith("+")
      ? mobileNumber
      : `+91${mobileNumber}`;

    const client = getTwilioClient();

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: formattedNumber,
        code: otp,
      });

    if (verificationCheck.status === "approved") {
      return res.json({ message: "Mobile number verified successfully" });
    }

    res.status(400).json({ message: "Invalid or expired OTP" });
  } catch (error) {
    // Log full error
    console.error("Twilio Verify Error:", error);
    return res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
    });
  }
};
