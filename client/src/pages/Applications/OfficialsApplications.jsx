import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import axios from "axios";
import { endpoint } from "../../endpoint";
import UserProfile from "../../assets/user.png";
import { toast } from "react-toastify";
import { Users, FileText, CheckCircle, XCircle, Filter } from "lucide-react";

function OfficialsApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch applications
  const getApplications = async () => {
    try {
      const response = await axios.get(
        `${endpoint}/applications/all-applications`,
        { withCredentials: true }
      );
      const applicationsList = response.data.applications;

      const normalized = applicationsList.map((app) => ({
        id: app.id,
        candidateId: app.candidate_id,
        fullName: app.full_name,
        positionContested: app.position_contested,
        manifesto: app.manifesto,
        approvalStatus: app.approval_status,
        submittedAt: new Date(app.submitted_at).toLocaleDateString(),
        facultyRepresented: app.faculty_represented,
        executivePosition: app.executive_position || "N/A",
        photo: UserProfile,
      }));

      setApplications(normalized);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getApplications();
  }, []);

  // Approve Application
  const approveApplication = async (candidateId) => {
    if (!window.confirm("Are you sure you want to approve this application?"))
      return;

    try {
      const response = await axios.put(
        `${endpoint}/applications/approve-application`,
        { candidateId },
        { withCredentials: true }
      );

      setApplications((prev) =>
        prev.map((app) =>
          app.candidateId === candidateId
            ? { ...app, approvalStatus: "Approved" }
            : app
        )
      );
      toast.success(response.data.message);
    } catch (error) {
      console.error("Failed to approve application:", error);
      toast.error(
        error.response?.data?.message || "Failed to approve application."
      );
    }
  };

  // Reject Application
  const rejectApplication = async (candidateId) => {
    if (!window.confirm("Are you sure you want to reject this application?"))
      return;

    try {
      const response = await axios.put(
        `${endpoint}/applications/reject-application`,
        { candidateId },
        { withCredentials: true }
      );

      setApplications((prev) =>
        prev.map((app) =>
          app.candidateId === candidateId
            ? { ...app, approvalStatus: "Rejected" }
            : app
        )
      );
      toast.success(response.data.message);
    } catch (error) {
      console.error("Failed to reject application:", error);
      toast.error(
        error.response?.data?.message || "Failed to reject application."
      );
    }
  };

  // Filter applications by approval status
  const filteredApplications = applications.filter(
    (app) => statusFilter === "All" || app.approvalStatus === statusFilter
  );

  const statusOptions = ["All", "Approved", "Rejected", "Pending"];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar - show only on medium and up */}
        <div className="hidden sm:block">
          <AdminSidebar />
        </div>

        <main className="flex-1 p-4 sm:ml-64">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Users size={24} className="text-gray-500" aria-hidden="true" />
              <span>Officials Applications</span>
            </h1>

            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">
                Election Applications
              </h2>
              <p className="text-sm text-gray-600">
                Review and manage applications for election positions.
              </p>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <Filter size={16} className="text-gray-500" aria-hidden="true" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <Spinner size="large" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredApplications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white border border-gray-100 shadow-sm rounded-lg p-4 flex items-start space-x-4 hover:bg-green-50 transition-colors"
                    >
                      <img
                        src={app.photo}
                        alt={`${app.fullName} profile`}
                        className="w-16 h-16 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="text-md font-medium text-gray-800 flex items-center space-x-2">
                          <FileText
                            size={16}
                            className="text-gray-500"
                            aria-hidden="true"
                          />
                          <span>{app.fullName}</span>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Position:</strong> {app.positionContested}{" "}
                          {app.executivePosition !== "N/A" &&
                            `(${app.executivePosition})`}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Faculty:</strong> {app.facultyRepresented}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Manifesto:</strong> {app.manifesto}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Submitted:</strong> {app.submittedAt}
                        </p>
                        <p
                          className={`text-sm mt-1 flex items-center space-x-1 ${
                            app.approvalStatus === "Approved"
                              ? "text-green-600"
                              : app.approvalStatus === "Rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          <strong>Status:</strong> {app.approvalStatus}
                        </p>
                        <div className="mt-2 flex space-x-2">
                          {app.approvalStatus !== "Approved" && (
                            <button
                              onClick={() =>
                                approveApplication(app.candidateId)
                              }
                              className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center space-x-1"
                            >
                              <CheckCircle size={16} aria-hidden="true" />
                              <span>Approve</span>
                            </button>
                          )}
                          {app.approvalStatus !== "Rejected" && (
                            <button
                              onClick={() => rejectApplication(app.candidateId)}
                              className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center space-x-1"
                            >
                              <XCircle size={16} aria-hidden="true" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredApplications.length === 0 && (
                  <div className="text-center text-gray-600 mt-6">
                    No applications found for the selected status.
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default OfficialsApplications;
