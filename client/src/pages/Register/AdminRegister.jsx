import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { endpoint } from "../../endpoint";
import { Eye, EyeOff } from "lucide-react";
import * as faceapi from "face-api.js";

function AdminRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      (name === "firstName" || name === "lastName") &&
      /[^a-zA-Z\s]/.test(value)
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "Only valid names are allowed.",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 lg:px-10 gap-6">
        {/* Left side - Image */}
        {/* <div className="w-full lg:w-1/2 h-64 lg:h-screen bg-white">
             <img src={HomeImage} alt="Home Image" className="w-400px h-400px " />
           </div> */}

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
              <Spinner />
            </div>
          )}

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Election Officials
            </h2>
            <p className="text-sm text-gray-500">
              Register here as an official
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mt-4">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center mt-4">{success}</p>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setSuccess("");
              setLoading(true);
              console.log("[Form] Submitting form data:", formData);

              const newErrors = {};
              if (!/^[a-zA-Z]+$/.test(formData.firstName.trim())) {
                newErrors.firstName = "First name must contain only letters.";
              }

              if (Object.keys(newErrors).length > 0) {
                console.log("[Form] Validation errors:", newErrors);
                setFieldErrors(newErrors);
                setLoading(false);
                return;
              }

              try {
                const res = await fetch(
                  `${endpoint}/auth/users/administrator/register-admin`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                  }
                );

                const data = await res.json();
                console.log("[Form] Server response:", data);

                if (!res.ok) {
                  setFieldErrors({});
                  if (data.message?.toLowerCase().includes("first name")) {
                    setFieldErrors({ firstName: data.message });
                  } else if (
                    data.message?.toLowerCase().includes("biometric")
                  ) {
                    setFieldErrors({ biometricData: data.message });
                  } else {
                    toast.error(data.message || "Something went wrong.");
                  }
                  return;
                }

                setFieldErrors({});
                toast.success(data.message);
                setTimeout(() => navigate("/officials/login"), 4000);
              } catch (error) {
                console.error("[Form Error]", error);
                toast.error("Server error. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
            className="mt-6 space-y-5"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {fieldErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>

              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {fieldErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700">
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

            <div className="relative">
              <label className="block text-md font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={(e) => {
                  handleChange(e);
                  setFieldErrors((prev) => ({ ...prev, password: "" })); // Clear error on input
                }}
                placeholder="••••••••"
                className={`mt-1 block w-full border ${
                  fieldErrors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm py-2.5 px-4 text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.password
                    ? "focus:ring-red-500"
                    : "focus:ring-green-500"
                }`}
              />
              <span
                className="absolute right-3 top-10 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className={`w-full py-3 text-white rounded-lg transition duration-200 cursor-pointer ${
                  loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                } flex items-center justify-center`}
                disabled={loading}
              >
                Complete Registration
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link
              to="/officials/login"
              className="text-green-600 hover:underline font-medium"
            >
              Login Here
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-4">
            Potential candidate?{" "}
            <Link
              to="/candidate/registration"
              className="text-green-600 hover:underline font-medium"
            >
              Click here
            </Link>
          </p>
        </div>
      </div>
      {/* <canvas ref={canvasRef} style={{ display: "none" }} /> */}
    </div>
  );
}

export default AdminRegister;
