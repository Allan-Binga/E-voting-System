import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Users, ScanFace } from "lucide-react";
import axios from "axios";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { endpoint } from "../../endpoint";
import Spinner from "../../components/Spinner";

function VoteNow() {
  const [formData, setFormData] = useState({
    biometricData: "",
    candidateId: "",
  });
  const [delegates, setDelegates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voter, setVoter] = useState(false);
  const [delegatesModal, setDelegatesModal] = useState(false);
  const [scanFaceModal, setScanFaceModal] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedDelegateId, setSelectedDelegateId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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
      return toast.info("Face recognition models are still loading...");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = async () => {
        await new Promise((res) => setTimeout(res, 3000));

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

        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setIsScanning(false);

        if (!detection) {
          return toast.info("No face detected. Please try again.");
        }

        const descriptorArray = Array.from(detection.descriptor);
        setFormData((prev) => ({ ...prev, biometricData: descriptorArray }));
        setFaceDescriptor(descriptorArray);
        setCapturedImage(imageDataUrl);
        toast.success("Face scanning successful.");

        // Show delegates list after successful scan
        setScanFaceModal(false);
        setDelegatesModal(true);
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

  useEffect(() => {
    const getDelegates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${endpoint}/applications/all-applications?position=Delegate`
        );
        setDelegates(response.data.applications || []);
      } catch (error) {
        setError("Failed to load delegates.");
        toast.error("Failed to load delegates.");
      } finally {
        setLoading(false);
      }
    };
    getDelegates();
  }, []);

  const handleVote = async (candidateId) => {
    if (!faceDescriptor) {
      return toast.error("Please authenticate your face first.");
    }
    setVoting(true);

    try {
      const response = await axios.post(
        `${endpoint}/vote/user/vote-now`,
        {
          biometricData: faceDescriptor,
          candidateId,
        },
        { withCredentials: true }
      );
      setHasVoted(true);
      setDelegatesModal(false);
      toast.success("Vote cast successfully!");
    } catch (error) {
      const message = error.response?.data?.message || "Voting failed.";
      toast.error(message);
    } finally {
      setVoting(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${endpoint}/auth/users/voter/logout-voter`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        document.cookie = "userVotingSession=; Max-Age=0; path=/;";
        // localStorage.removeItem("tenantId");

        toast.success("Successfully logged out.");

        // Delay navigation by 2 seconds (long enough for toast to show)
        setTimeout(() => {
          navigate("/voter/login");
        }, 2000);
      } else {
        toast.error("You are not logged in.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("You are not logged in.");
    }
  };

  //Fetch Voter status
  const getVoterStatus = async () => {
    try {
      const response = await axios.get(
        `${endpoint}/profiles/profile/voter/my-profile`,
        { withCredentials: true }
      );
      const status = response.data.profile.voting_status;
      if (status === "Voted") {
        setHasVoted(true);
      }
    } catch (error) {
      console.error("Failed to fetch voting status", error);
      toast.error("Failed to fetch voting status.");
    }
  };

  useEffect(() => {
    getVoterStatus();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <div className="flex flex-1 items-center justify-center p-4">
          {loading ? (
            <p>Loading delegates...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : hasVoted ? (
            <div className="bg-white shadow-lg rounded-xl p-6 max-w-md text-center border border-green-200">
              <div className="flex flex-col items-center justify-center space-y-4">
                <svg
                  className="w-16 h-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-green-600">
                  Vote Submitted!
                </h2>
                <p className="text-gray-700">
                  Thank you for participating in the election.
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              <div
                className="w-64 h-64 bg-white shadow-md rounded-xl flex flex-col items-center justify-center hover:shadow-lg transition cursor-pointer border border-gray-200"
                onClick={() => setScanFaceModal(true)}
              >
                <Users size={48} className="text-blue-600 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 text-center">
                  Vote for Delegates
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Face Scan Modal */}
      {scanFaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg text-center">
            <h2 className="text-xl font-bold mb-4">Face ID Verification</h2>

            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="mt-4 rounded border"
              />
            )}

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 rounded-lg border border-gray-300"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Flex container for buttons */}
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                onClick={scanFace}
                disabled={isScanning}
              >
                <span>
                  {isScanning ? "Scanning..." : "Authenticate Face ID"}
                </span>
                <ScanFace className="w-5 h-5" />
              </button>

              <button
                onClick={() => setScanFaceModal(false)}
                className="text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delegates Modal */}
      {delegatesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Please select a candidate to vote for
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {delegates.length === 0 ? (
                <p>No delegates available.</p>
              ) : (
                delegates.map((delegate) => (
                  <div
                    key={delegate.candidate_id}
                    className={`border p-4 rounded shadow cursor-pointer ${
                      selectedDelegateId === delegate.candidate_id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-400"
                    }`}
                    onClick={() => setSelectedDelegateId(delegate.candidate_id)}
                  >
                    <p className="font-semibold">{delegate.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {delegate.manifesto}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setDelegatesModal(false)}
              >
                Close
              </button>
              <button
                disabled={!selectedDelegateId || voting}
                className={`px-4 py-2 rounded text-white flex items-center justify-center gap-2 cursor-pointer ${
                  selectedDelegateId && !voting
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-300 cursor-not-allowed"
                }`}
                onClick={() => handleVote(selectedDelegateId)}
              >
                {voting ? <Spinner size="small" /> : "Vote Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoteNow;
