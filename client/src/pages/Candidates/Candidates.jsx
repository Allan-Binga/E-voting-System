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
        <AdminSidebar />
        <main className="ml-64 p-6 flex-1">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Users size={24} className="text-gray-500" aria-hidden="true" />
              <span>Candidates</span>
            </h1>

            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">
                Student Council Election 2025
              </h2>
              <p className="text-sm text-gray-600">
                Meet the candidates running for various positions.
              </p>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <Filter size={16} className="text-gray-500" aria-hidden="true" />
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

            {loading ? (
              <div className="text-center text-gray-600 mt-6">
                Loading candidates...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <User
                            size={16}
                            className="text-gray-500"
                            aria-hidden="true"
                          />
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
                          <Info size={16} aria-hidden="true" />
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
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Candidate Details</h2>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={UserProfile}
                alt={`${selectedCandidate.name} profile`}
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {selectedCandidate.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedCandidate.faculty}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Email:</strong> {selectedCandidate.email}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Registration Number:</strong>{" "}
              {selectedCandidate.registrationNumber}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Faculty:</strong> {selectedCandidate.faculty}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={openUpdateModal}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => deleteCandidate(selectedCandidate.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Candidate</h2>
            <form onSubmit={updateCandidate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={updateForm.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={updateForm.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={updateForm.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Faculty
                </label>
                <input
                  type="text"
                  name="faculty"
                  value={updateForm.faculty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={updateForm.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 cursor-pointer"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Candidates;
