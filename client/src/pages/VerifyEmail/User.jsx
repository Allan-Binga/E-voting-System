import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { endpoint } from "../../endpoint";

function VerifyEmailUser() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const [showResendModal, setShowResendModal] = useState(false);
  const [isInvalidOtp, setIsInvalidOtp] = useState(false);
  const location = useLocation();
  const email = location.state?.email || "";
  const [resendEmail, setResendEmail] = useState(email);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const isAllFilled = otp.every((digit) => digit !== "");

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setIsInvalidOtp(false);
    setFieldErrors({});

    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1].focus();
      } else {
        newOtp[index] = "";
        setOtp(newOtp);
        setIsInvalidOtp(false);
        setFieldErrors({});
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (isAllFilled && !loading) {
        verifyOTP();
      }
    }
  };

  const verifyOTP = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});

    const finalOtp = otp.join("");
    if (finalOtp.length < 6) {
      setFieldErrors({ otp: "Please enter the full 6-digit OTP" });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${endpoint}/auth/verification/verify-OTP`,
        { otp: finalOtp },
        { withCredentials: true }
      );
      setSuccess("OTP Verification successful!");
      setTimeout(() => navigate("/voter/home"), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Invalid OTP. Please try again.";
      setError(msg);
      setIsInvalidOtp(true);

      if (msg.toLowerCase().includes("expired")) {
        setShowResendModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await axios.post(`${endpoint}/auth/verification/resend-OTP`, {
        email: resendEmail,
      });
      setSuccess("OTP resent successfully.");
      setResendTimer(30);
      setShowResendModal(false); // Close modal after resend
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-grow px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Verify Your Email
          </h1>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Enter the 6-digit OTP sent to{" "}
            <span className="font-medium">{email || "your email"}</span>.
          </p>

          {/* OTP Inputs */}
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`w-12 h-12 text-center text-xl font-medium border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  fieldErrors.otp || isInvalidOtp
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Feedback Messages */}
          {fieldErrors.otp && (
            <p className="text-red-500 text-sm text-center mb-4 animate-pulse">
              {fieldErrors.otp}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-sm text-center mb-4 animate-pulse">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center mb-4 animate-pulse">
              {success}
            </p>
          )}

          {/* Buttons */}
          <button
            onClick={verifyOTP}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
            aria-label="Verify OTP"
          >
            {loading ? <Spinner size="small" /> : "Verify OTP"}
          </button>

          <button
            onClick={resendOTP}
            disabled={loading || resendTimer > 0}
            className={`mt-4 w-full text-sm text-green-600 hover:underline text-center ${
              resendTimer > 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Resend OTP"
          >
            {resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : "Didn’t receive the OTP? Resend OTP"}
          </button>
        </div>
      </div>
      {showResendModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl relative">
            <h2 className="text-lg font-bold mb-2">OTP Expired</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email to resend a new OTP:
            </p>
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring-green-500"
              placeholder="Enter your email"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResendModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={resendOTP}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyEmailUser;
