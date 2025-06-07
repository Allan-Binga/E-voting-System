import { Fingerprint, ScanFace } from "lucide-react";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { endpoint } from "../../endpoint";
import * as faceapi from "face-api.js";

function VoterLogin() {
  const [formData, setFormData] = useState({ email: "", biometricData: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false); // Track scanning state
  const navigate = useNavigate();
  const videoRef = useRef();
  const streamRef = useRef(null); // Store the stream to stop it later
  const canvasRef = useRef(null);

  // Load Face-API models
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

  // Clean up stream on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate email
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

  // Face Scan Function
  const scanFace = async () => {
    setError("");
    setIsScanning(true);
    setCapturedImage(null);
    console.log("[Scan] Starting face scan...");

    if (!modelsLoaded) {
      setIsScanning(false);
      console.log("[Scan] Models not loaded yet");
      return toast.info("Face recognition models are loading...");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      console.log("[Scan] Webcam stream started");

      videoRef.current.onloadedmetadata = async () => {
        console.log("[Scan] Video metadata loaded, waiting for 3 seconds");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Capture image from video
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

        console.log("[Scan] Face detection result:", detection);

        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setIsScanning(false);

        if (!detection) {
          console.log("[Scan] No face detected");
          return toast.info("No face detected. Please try again.");
        }

        const descriptorArray = Array.from(detection.descriptor);
        console.log("[Scan] Descriptor array:", descriptorArray);
        setFormData((prev) => ({
          ...prev,
          biometricData: descriptorArray,
        }));
        setCapturedImage(imageDataUrl);
        toast.success("Face scanning successful.");
      };
    } catch (error) {
      console.error("[Scan Error]", error);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsScanning(false);
      setCapturedImage(null);
      toast.error("Error accessing webcam or detecting face.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate form
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.biometricData) {
      newErrors.biometricData = "Please scan your face before logging in.";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("[Form] Validation errors:", newErrors);
      setFieldErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${endpoint}/auth/users/login-voter`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setFieldErrors({});
        if (data.message?.toLowerCase().includes("email")) {
          setFieldErrors({ email: data.message });
        } else if (data.message?.toLowerCase().includes("biometric")) {
          setFieldErrors({ biometricData: data.message });
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
      }, 4000);
    } catch (error) {
      console.error("[Form Error]", error);
      const errorMessage = error.message?.toLowerCase?.();

      if (errorMessage?.includes("already logged in")) {
        toast.info("You are already logged in.", {
          className:
            "bg-blue-100 text-blue-800 font-medium rounded-md p-3 shadow",
        });
        navigate("/home");
      } else {
        setError(error.message || "Something went wrong.");
        toast.error(error.message || "Something went wrong.");
      }
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
            <ScanFace className="mx-auto text-blue-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-800">Voter Login</h2>
            <p className="text-sm text-gray-500">
              Log in using your email and biometric verification
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

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
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer mt-4"
              >
                <ScanFace className="mr-2" size={20} />
                Scan Face
              </button>
              {fieldErrors.biometricData && (
                <p className="text-red-500 text-xs mt-2">
                  {fieldErrors.biometricData}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Facial scan required for login
              </p>
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
              to="/voter/registration"
              className="text-blue-600 hover:underline font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default VoterLogin;
