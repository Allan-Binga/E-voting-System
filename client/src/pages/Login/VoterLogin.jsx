import { ShieldIcon } from "lucide-react";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { endpoint } from "../../endpoint";
import axios from "axios";

function VoterLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${endpoint}/auth/users/voter/login-voter`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setFieldErrors({});
        if (data.message?.toLowerCase().includes("email")) {
          setFieldErrors({ email: data.message });
        } else if (data.message?.toLowerCase().includes("password")) {
          setFieldErrors({ password: data.message });
        } else {
          setError(data.message || "Login failed. Please try again.");
        }
        return;
      }

      localStorage.setItem("userId", data.voter.id);
      setSuccess("Login successful.");
      toast.success("Login successful.");
      setTimeout(() => {
        navigate("/vote-now");
      }, 3000);
    } catch (error) {
      console.error("[Login Error]", error);
      toast.error(error.message || "Something went wrong.");
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPEmail = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!formData.email) {
      setFieldErrors({ email: "Email is required for OTP login." });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${endpoint}/auth/users/voter/otp-login`, {
        email: formData.email,
      });

      toast.success("Please check your email for an OTP verification code.");
      setTimeout(() => {
        navigate("/user/verify-email");
      }, 5000);
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
    <div className="min-h-screen bg-gray-50 pt-24">
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
            <h2 className="text-2xl font-bold text-gray-800">Voter Login</h2>
            <p className="text-sm text-gray-500">
              Log in using your email and secure password
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mt-4">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center mt-4">{success}</p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="johndoe@gmail.com"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                className={`w-full py-3 text-white rounded-lg transition duration-200 cursor-pointer ${
                  loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                } flex items-center justify-center`}
                disabled={loading}
              >
                Log in
              </button>
              <span className="text-md text-gray-500">Or</span>
              <button
                type="button"
                onClick={handleOTPEmail}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 focus:outline-none cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <Spinner className="w-5 h-5" />
                ) : (
                  <>
                    <ShieldIcon className="mr-2 w-5 h-5" />
                    Log in with OTP
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link
              to="/voter/registration"
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

export default VoterLogin;
