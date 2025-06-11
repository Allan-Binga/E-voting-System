import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import { Users, User, Filter, Info } from "lucide-react";
import axios from "axios";
import { endpoint } from "../../endpoint";
import UserProfile from "../../assets/user.png";
import { toast } from "react-toastify";

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [positionFilter, setPositionFilter] = useState("All");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    faculty: "",
    registrationNumber: "",
  });
  const [loading, setLoading] = useState(true);

  // Get unique positions for filter (derived from candidates' faculty or a separate API if needed)
  const positions = [
    "All",
    ...new Set(candidates.map((candidate) => candidate.faculty)),
  ];

  // Fetch Candidates from API
  const getCandidates = async () => {
    try {
      const response = await axios.get(
        `${endpoint}/candidates/all-candidates`,
        {
          withCredentials: true,
        }
      );
      const candidatesData = response.data.candidates;

      const normalized = candidatesData.map((candidate) => ({
        id: candidate.candidate_id,
        firstName: candidate.first_name,
        lastName: candidate.last_name,
        name: `${candidate.first_name} ${candidate.last_name}`,
        email: candidate.email,
        faculty: candidate.faculty,
        registrationNumber: candidate.registration_number,
        photo: UserProfile, // Use imported UserProfile
      }));

      setCandidates(normalized);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCandidates();
  }, []);

  // Filter candidates by faculty (used as position in this context)
  const filteredCandidates = candidates.filter(
    (candidate) =>
      positionFilter === "All" || candidate.faculty === positionFilter
  );

  // Open Details Modal
  const openDetailsModal = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsModalOpen(true);
  };

  // Open Update Modal
  const openUpdateModal = () => {
    setUpdateForm({
      firstName: selectedCandidate.firstName,
      lastName: selectedCandidate.lastName,
      email: selectedCandidate.email,
      faculty: selectedCandidate.faculty,
      registrationNumber: selectedCandidate.registrationNumber,
    });
    setIsDetailsModalOpen(false);
    setIsUpdateModalOpen(true);
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  // Update Candidate API
  const updateCandidate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `${endpoint}/candidates/update-candidate/${selectedCandidate.id}`,
        {
          first_name: updateForm.firstName,
          last_name: updateForm.lastName,
          email: updateForm.email,
          faculty: updateForm.faculty,
          registration_number: updateForm.registrationNumber,
        },
        { withCredentials: true }
      );

      // Update local state
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === selectedCandidate.id
            ? {
                ...candidate,
                firstName: updateForm.firstName,
                lastName: updateForm.lastName,
                name: `${updateForm.firstName} ${updateForm.lastName}`,
                email: updateForm.email,
                faculty: updateForm.faculty,
                registrationNumber: updateForm.registrationNumber,
              }
            : candidate
        )
      );

      setIsUpdateModalOpen(false);
      toast.success("Candidate updated successfully!");
    } catch (error) {
      console.error("Failed to update candidate:", error);
      alert("Failed to update candidate. Please try again.");
    }
  };

  // Delete Candidate API
  const deleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?"))
      return;

    try {
      await axios.delete(
        `${endpoint}/candidates/delete-candidate/${candidateId}`,
        { withCredentials: true }
      );

      // Remove candidate from local state
      setCandidates((prev) =>
        prev.filter((candidate) => candidate.id !== candidateId)
      );
      setIsDetailsModalOpen(false);
      alert("Candidate deleted successfully!");
    } catch (error) {
      console.error("Failed to delete candidate:", error);
      alert("Failed to delete candidate. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar: hide on small screens, show on md+ */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 md:ml-64">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Users size={24} className="text-gray-500" aria-hidden="true" />
              <span>Candidates</span>
            </h1>

            {/* Election info box */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4 sm:p-6 mb-4">
              <h2 className="text-base sm:text-lg font-medium text-gray-800 mb-1">
                Student Council Election 2025
              </h2>
              <p className="text-sm text-gray-600">
                Meet the candidates running for various positions.
              </p>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Filter
                  size={16}
                  className="text-gray-500"
                  aria-hidden="true"
                />
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidates */}
            {loading ? (
              <div className="text-center text-gray-600 mt-6">
                Loading candidates...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="bg-white border border-gray-100 shadow-sm rounded-lg p-4 flex items-start space-x-4 hover:bg-green-50 transition-colors"
                    >
                      <img
                        src={UserProfile}
                        alt={`${candidate.name} profile`}
                        className="w-16 h-16 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="text-md font-medium text-gray-800 flex items-center space-x-2">
                          <User size={16} className="text-gray-500" />
                          <span>{candidate.name}</span>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {candidate.faculty}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {candidate.email}
                        </p>
                        <button
                          onClick={() => openDetailsModal(candidate)}
                          className="mt-2 px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 flex items-center space-x-1 cursor-pointer"
                        >
                          <Info size={16} />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredCandidates.length === 0 && (
                  <div className="text-center text-gray-600 mt-6">
                    No candidates found for the selected position.
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            {/* ...content unchanged... */}
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            {/* ...content unchanged... */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Candidates;
