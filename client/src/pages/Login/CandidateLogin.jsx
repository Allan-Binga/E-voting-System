import { ShieldIcon } from "lucide-react";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { endpoint } from "../../endpoint";
import axios from "axios";

function LoginCandidate() {
  const [formData, setFormData] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address.",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, email: "" }));
      }
    }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!formData.email) {
      setFieldErrors({ email: "Email is required for OTP login." });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${endpoint}/candidates/auth/login/OTP`,
        {
          email: formData.email,
        }
      );

      toast.success("Please check your email for an OTP verification code.");
      setTimeout(() => {
        navigate("/candidate/verify-email");
      }, 5000);
      console.log("[OTP] Response:", response.data);
    } catch (error) {
      console.error("[OTP Error]", error);
      toast.info(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
              <Spinner />
            </div>
          )}
          <div className="text-center space-y-2">
            <ShieldIcon className="mx-auto text-green-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-800">
              Candidate Login
            </h2>
            <p className="text-sm text-gray-500">Log in with an OTP</p>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mt-4">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center mt-4">{success}</p>
          )}

          <form onSubmit={handleOTP} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-center mb-5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="johndoe@gmail.com"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className={`w-full py-3 text-white rounded-full transition duration-200 cursor-pointer ${
                  loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                } flex items-center justify-center`}
                disabled={loading}
              >
                Log In
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link
              to="/candidate/registration"
              className="text-green-600 hover:underline font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginCandidate;
