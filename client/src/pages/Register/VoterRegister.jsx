import { ScanFace, Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { endpoint } from "../../endpoint";
import * as faceapi from "face-api.js";

function VoterRegister() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    registrationNumber: "",
    biometricData: "",
    faculty: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef();
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Password regex: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Registration number regex: Format CIT-123-123/2025
  const regNoRegex = /^[A-Z]{3}-\d{3}-\d{3}\/\d{4}$/

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear previous errors for the field
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validation for firstName and lastName
    if (
      (name === "firstName" || name === "lastName") &&
      /[^a-zA-Z\s]/.test(value)
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "Only valid names are allowed.",
      }));
      return;
    }

    // Password validation
    if (name === "password" && value) {
      if (!passwordRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          password:
            "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.",
        }));
      }
    }

    // Registration number validation
    if (name === "registrationNumber" && value) {
      if (!regNoRegex.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          registrationNumber:
            "Invalid registration number format. Use format: CIT-123-123/2025",
        }));
      }
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URI = "/models";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URI),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URI),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URI),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const scanFace = async () => {
    setError("");
    setIsScanning(true);
    setCapturedImage(null);

    if (!modelsLoaded) {
      setIsScanning(false);
      return toast.info("Face recognition models are loading...");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/jpeg");

        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setIsScanning(false);

        if (!detection) {
          setCapturedImage(null);
          return toast.info("No face detected. Please try again.");
        }

        const descriptorArray = Array.from(detection.descriptor);
        setFormData((prev) => ({
          ...prev,
          biometricData: descriptorArray,
        }));
        setCapturedImage(imageDataUrl);
        toast.success("Face scanning successful.");
      };
    } catch (error) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsScanning(false);
      setCapturedImage(null);
      toast.error("Error accessing webcam or detecting face.");
    }
  };

  const faculties = [
    "Business and Economics",
    "Engineering and Technology",
    "Science and Technology",
    "Computing and Information Technology",
    "Social Sciences and Technology",
    "Media and Communication",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const newErrors = {};

    // First name validation
    if (!/^[a-zA-Z]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = "First name must contain only letters.";
    }

    // Last name validation
    if (!/^[a-zA-Z]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = "Last name must contain only letters.";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    // Registration number validation
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required.";
    } else if (!regNoRegex.test(formData.registrationNumber)) {
      newErrors.registrationNumber =
        "Invalid registration number format. Use format: CIT-123-123/2025";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    // Biometric data validation
    if (!formData.biometricData) {
      newErrors.biometricData = "Please scan your face before submitting.";
    }

    // Faculty validation
    if (!formData.faculty) {
      newErrors.faculty = "Please select a faculty.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${endpoint}/auth/users/voter/register-voter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setFieldErrors({});
        if (data.message?.toLowerCase().includes("first name")) {
          setFieldErrors({ firstName: data.message });
        } else if (data.message?.toLowerCase().includes("last name")) {
          setFieldErrors({ lastName: data.message });
        } else if (data.message?.toLowerCase().includes("email")) {
          setFieldErrors({ email: data.message });
        } else if (data.message?.toLowerCase().includes("registration number")) {
          setFieldErrors({ registrationNumber: data.message });
        } else if (data.message?.toLowerCase().includes("password")) {
          setFieldErrors({ password: data.message });
        } else if (data.message?.toLowerCase().includes("biometric")) {
          setFieldErrors({ biometricData: data.message });
        } else if (data.message?.toLowerCase().includes("faculty")) {
          setFieldErrors({ faculty: data.message });
        } else {
          toast.error(data.message || "Something went wrong.");
        }
        return;
      }

      setFieldErrors({});
      toast.success(data.message);
      setTimeout(() => navigate("/voter/login"), 4000);
    } catch (error) {
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col pt-30 lg:flex-row items-center justify-center min-h-screen px-6 lg:px-10 gap-6">
        <div className="w-full lg:w-1/2 max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
              <Spinner />
            </div>
          )}

          <div className="text-center space-y-2">
            <ScanFace className="mx-auto text-green-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-800">
              Voter Registration
            </h2>
            <p className="text-sm text-gray-500">
              Register to vote using biometric verification
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mt-4">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center mt-4">{success}</p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="flex gap-4">
              <div className="flex-1">
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

              <div className="flex-1">
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

            <div>
              <label className="block text-md font-medium text-gray-700">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. CIT-123-456/2023"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {fieldErrors.registrationNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.registrationNumber}
                </p>
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
                  setFieldErrors((prev) => ({ ...prev, password: "" }));
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
              <label className="block text-sm font-medium text-gray-700">
                Faculty
              </label>
              <select
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">FACULTY</option>
                {faculties.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
              {fieldErrors.faculty && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.faculty}
                </p>
              )}
            </div>

            {/* Face scanning section */}
            <div className="text-center">
              {!isScanning && (
                <div className="mb-2 text-sm text-gray-600">
                  <p>Before scanning, please ensure:</p>
                  <ul className="list-disc list-inside text-left inline-block text-gray-500 text-xs mt-2">
                    <li>You're looking directly into the camera</li>
                    <li>Your face is centered in the frame</li>
                    <li>You're in a well-lit area</li>
                  </ul>
                </div>
              )}

              {isScanning && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Please look directly into the camera lens.
                  </p>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-64 rounded-lg border border-gray-300"
                  ></video>
                </div>
              )}

              {capturedImage && !isScanning && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Captured Face:</p>
                  <img
                    src={capturedImage}
                    alt="Captured face"
                    className="w-full h-64 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={scanFace}
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition cursor-pointer mt-4"
              >
                <ScanFace className="mr-2" size={20} />
                {capturedImage ? "Rescan Face" : "Scan Face"}
              </button>
              {fieldErrors.biometricData && (
                <p className="text-red-500 text-xs mt-2">
                  {fieldErrors.biometricData}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Facial scan required for final registration
              </p>
            </div>

            <button
              type="submit"
              className={`w-full py-2 text-white rounded-lg transition duration-200 cursor-pointer ${
                loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } flex items-center justify-center`}
              disabled={loading}
            >
              Complete Registration
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link
              to="/voter/login"
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

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default VoterRegister;