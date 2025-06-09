import { Fingerprint, ScanFace } from "lucide-react";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { endpoint } from "../../endpoint";
import * as faceapi from "face-api.js";

function CandidateRegister() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    biometricData: "",
    faculty: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const navigate = useNavigate();
  const videoRef = useRef();
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

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

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setIsScanning(false);

        if (!detection) {
          console.log("[Scan] No face detected");
          setCapturedImage(null);
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

  const faculties = [
    "Business & Economics",
    "Engineering & Technology",
    "Science & Technology",
    "Computing & Information Technology",
    "Social Sciences & Technology",
    "Media & Communication",
  ];

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
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
            <ScanFace className="mx-auto text-blue-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-800">
              Candidate Registration
            </h2>
            <p className="text-sm text-gray-500">
              Register here as a candidate
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
              if (!formData.biometricData) {
                newErrors.biometricData =
                  "Please scan your face before submitting.";
              }

              if (Object.keys(newErrors).length > 0) {
                console.log("[Form] Validation errors:", newErrors);
                setFieldErrors(newErrors);
                setLoading(false);
                return;
              }

              try {
                const res = await fetch(
                  `${endpoint}/candidates/auth/register-candidate`,
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
                setTimeout(() => navigate("/candidate/login"), 4000);
              } catch (error) {
                console.error("[Form Error]", error);
                toast.error("Server error. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
            className="mt-6 space-y-5"
          >
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
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="text-gray-800">
                  -- Select Faculty --
                </option>
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

            <div>
              <button
                type="submit"
                className={`w-full py-3 text-white rounded-full transition duration-200 cursor-pointer ${
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
              to="/candidate/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login Here
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-4">
            Are you a voter?
            <Link
              to="/voter/registration"
              className="text-blue-600 hover:underline font-medium"
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

export default CandidateRegister;
