import Navbar from "../../components/Navbar";
import CandidateSidebar from "../../components/CandidateSidebar";
import axios from "axios";
import { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import { endpoint } from "../../endpoint";
import { Briefcase, Users, CheckCircle, Clock } from "lucide-react";

function CandidateApplication() {
  const [positions, setPositions] = useState({
    delegates_positions: 0,
    executive_positions: 0,
  });
  const [applications, setApplications] = useState([]);
  const [applicationData, setApplicationData] = useState({
    facultyRepresented: "",
    manifesto: "",
    executivePositionContested: "",
  });
  const [loading, setLoading] = useState(true);
  const [delegatesModal, setDelegatesModal] = useState(false);
  const [executiveModal, setExecutiveModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submit button spinner

  const faculties = [
    "Business and Economics",
    "Engineering and Technology",
    "Science and Technology",
    "Computing and Information Technology",
    "Social Sciences and Technology",
    "Media and Communication",
  ];

  useEffect(() => {
    fetchPositions();
    fetchApplications();
  }, []);

  const fetchPositions = async () => {
    try {
      const res = await axios.get(`${endpoint}/election/get-elections`, {
        withCredentials: true,
      });
      const latest = res.data.elections[0];
      setPositions({
        delegates_positions: latest.delegates,
        executive_positions: latest.executives,
      });
    } catch (err) {
      console.error("Failed to fetch positions", err);
      setError("Failed to load available positions.");
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${endpoint}/applications/my-applications`, {
        withCredentials: true,
      });
      setApplications(res.data.applications);
    } catch (err) {
      console.error("Failed to fetch applications", err);
      setError("Failed to load your applications.");
    } finally {
      setLoading(false);
    }
  };

  const applyDelegates = async () => {
    if (!applicationData.facultyRepresented || !applicationData.manifesto) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true); // Start spinner
    try {
      const response = await axios.post(
        `${endpoint}/applications/apply-delegates`,
        {
          facultyRepresented: applicationData.facultyRepresented,
          manifesto: applicationData.manifesto,
        },
        { withCredentials: true }
      );
      setSuccess(response.data.message);
      setError("");
      setApplicationData({
        facultyRepresented: "",
        manifesto: "",
        executivePositionContested: "",
      });
      fetchPositions();
      fetchApplications();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to submit application."
      );
      setSuccess("");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setDelegatesModal(false); // Close modal after 2 seconds
      }, 3000);
    }
  };

  const applyExecutives = async () => {
    if (
      !applicationData.facultyRepresented ||
      !applicationData.manifesto ||
      !applicationData.executivePositionContested
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true); // Start spinner
    try {
      const response = await axios.post(
        `${endpoint}/applications/apply-executive`,
        {
          facultyRepresented: applicationData.facultyRepresented,
          manifesto: applicationData.manifesto,
          executivePositionContested:
            applicationData.executivePositionContested,
        },
        { withCredentials: true }
      );
      setSuccess(response.data.message);
      setError("");
      setApplicationData({
        facultyRepresented: "",
        manifesto: "",
        executivePositionContested: "",
      });
      fetchPositions();
      fetchApplications();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to submit application."
      );
      setSuccess("");
    } finally {
      setIsSubmitting(false); // Stop spinner
      setTimeout(() => {
        setExecutiveModal(false); // Close modal after 2 seconds
      }, 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({ ...prev, [name]: value }));
  };

  const closeModal = () => {
    setDelegatesModal(false);
    setExecutiveModal(false);
    setError("");
    setSuccess("");
    setApplicationData({
      facultyRepresented: "",
      manifesto: "",
      executivePositionContested: "",
    });
  };

  const hasRecentlyApplied = applications.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden md:block">
        <CandidateSidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="ml-0 md:ml-64 p-6 space-y-8">
          {/* Application Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Apply as a Delegate
                  </h2>
                </div>
                <p className="text-gray-600">
                  Join the student representation team and make your faculty
                  heard.
                </p>
                <p className="text-sm text-gray-500">
                  Remaining Positions:{" "}
                  <span className="font-bold">
                    {positions.delegates_positions}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setDelegatesModal(true)}
                className="mt-4 w-fit bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={
                  positions.delegates_positions === 0 || hasRecentlyApplied
                }
              >
                Apply Now
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Briefcase className="text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Apply for Executive
                  </h2>
                </div>
                <p className="text-gray-600">
                  Run for a top leadership role in the organization.
                </p>
                <p className="text-sm text-gray-500">
                  Remaining Positions:{" "}
                  <span className="font-bold">
                    {positions.executive_positions}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setExecutiveModal(true)}
                className="mt-4 w-fit bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={
                  positions.executive_positions === 0 || hasRecentlyApplied
                }
              >
                Apply Now
              </button>
            </div>
          </div>

          {/* Delegates Modal */}
          {delegatesModal && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 bg-opacity-0">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Apply as Delegate
                </h3>
                <div className="space-y-4">
                  {(error || success) && (
                    <div
                      className={`p-4 rounded-lg ${
                        error
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {error || success}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Faculty Represented
                    </label>
                    <select
                      name="facultyRepresented"
                      value={applicationData.facultyRepresented}
                      onChange={handleInputChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 focus:outline-none text-sm sm:text-base"
                    >
                      <option value="" disabled>
                        Select your faculty
                      </option>
                      {faculties.map((faculty, index) => (
                        <option key={index} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Manifesto
                    </label>
                    <textarea
                      name="manifesto"
                      value={applicationData.manifesto}
                      onChange={handleInputChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 focus:outline-none text-sm sm:text-base"
                      rows="4"
                      placeholder="Enter your manifesto"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyDelegates}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Spinner size="small" /> : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Executive Modal */}
          {executiveModal && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 bg-opacity-0">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Apply for Executive
                </h3>
                <div className="space-y-4">
                  {(error || success) && (
                    <div
                      className={`p-4 rounded-lg ${
                        error
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {error || success}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Faculty Represented
                    </label>
                    <select
                      name="facultyRepresented"
                      value={applicationData.facultyRepresented}
                      onChange={handleInputChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 focus:outline-none text-sm sm:text-base"
                    >
                      <option value="" disabled>
                        Select your faculty
                      </option>
                      {faculties.map((faculty, index) => (
                        <option key={index} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Executive Position
                    </label>
                    <select
                      name="executivePositionContested"
                      value={applicationData.executivePositionContested}
                      onChange={handleInputChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 focus:outline-none text-sm sm:text-base"
                    >
                      <option value="">Select a position</option>
                      <option value="Chairperson">Chairperson</option>
                      <option value="Chairlady">Chairlady</option>
                      <option value="Secretary General">
                        Secretary General
                      </option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Manifesto
                    </label>
                    <textarea
                      name="manifesto"
                      value={applicationData.manifesto}
                      onChange={handleInputChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 focus:outline-none text-sm sm:text-base"
                      rows="4"
                      placeholder="Enter your manifesto"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyExecutives}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Spinner size="small" /> : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Applications */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Recent Applications
            </h3>
            {loading ? (
              <Spinner size="small" />
            ) : applications.length === 0 ? (
              <p className="text-gray-500 bg-white italic text-center font-semibold">
                You haven’t made any applications yet.
              </p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {app.position_contested === "Executive"
                          ? `Executive - ${app.executive_position}`
                          : `Delegate - ${app.faculty_represented}`}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {app.manifesto}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {app.approval_status === "Approved" && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle size={16} />
                          Approved
                        </span>
                      )}
                      {app.approval_status === "Pending" && (
                        <span className="text-yellow-600 flex items-center gap-1">
                          <Clock size={16} />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default CandidateApplication;
