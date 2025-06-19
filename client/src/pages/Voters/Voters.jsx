import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import { Users, Search, Filter, UserCheck, UserX } from "lucide-react";
import axios from "axios";
import { endpoint } from "../../endpoint";
import ProfileImage from "../../assets/user.png";

function Voters() {
  const [voters, setVoters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    firstName: "",
    lastName: "",
    faculty: "",
    registrationNumber: "",
  });

  // Fetch Voters from API
  const getVoters = async () => {
    try {
      const response = await axios.get(`${endpoint}/users/voters`);
      // console.log("API Response:", response.data); // Debug
      const votersData = Array.isArray(response.data.users)
        ? response.data.users
        : [];
      if (votersData.length === 0) {
        console.warn("No users found in response");
        setVoters([]);
        setLoading(false);
        return;
      }
      const normalized = votersData.map((voter) => ({
        id: voter.user_id || "",
        firstName: voter.first_name || "",
        lastName: voter.last_name || "",
        email: voter.email || "",
        registrationNumber: voter.registration_number || "",
        faculty: voter.faculty || "",
        status: voter.status || "Inactive",
        votingStatus: voter.voting_status || "",
        capturedImage: voter.captured_image || ProfileImage,
      }));
      setVoters(normalized);
    } catch (error) {
      console.error(
        "Failed to fetch voters:",
        error.message,
        error.response?.data
      );
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getVoters();
  }, []);

  const filteredVoters = voters
    .filter((voter) => {
      const fullName = `${voter.firstName} ${voter.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        voter.registrationNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesFaculty =
        facultyFilter === "All" || voter.faculty === facultyFilter;
      const matchesStatus =
        statusFilter === "All" || voter.status === statusFilter;
      return matchesSearch && matchesFaculty && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      }
      return a.registrationNumber.localeCompare(b.registrationNumber);
    });

  const faculties = ["All", ...new Set(voters.map((voter) => voter.faculty))];

  const toggleStatus = (id) => {
    setVoters((prev) =>
      prev.map((voter) =>
        voter.id === id
          ? {
              ...voter,
              status: voter.status === "Active" ? "Inactive" : "Active",
            }
          : voter
      )
    );
  };

  // Open Update Modal
  const openUpdateModal = (voter) => {
    setSelectedVoter(voter);
    setUpdateForm({
      firstName: voter.firstName,
      lastName: voter.lastName,
      faculty: voter.faculty,
      registrationNumber: voter.registrationNumber,
    });
    setIsModalOpen(true);
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  // Update Voter API
  const updateVoter = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `${endpoint}/voters/update-voter/${selectedVoter.id}`,
        {
          first_name: updateForm.firstName,
          last_name: updateForm.lastName,
          faculty: updateForm.faculty,
          registration_number: updateForm.registrationNumber,
        },
        { withCredentials: true }
      );

      // Update local state
      setVoters((prev) =>
        prev.map((voter) =>
          voter.id === selectedVoter.id
            ? {
                ...voter,
                firstName: updateForm.firstName,
                lastName: updateForm.lastName,
                faculty: updateForm.faculty,
                registrationNumber: updateForm.registrationNumber,
              }
            : voter
        )
      );

      setIsModalOpen(false);
      alert("Voter updated successfully!");
    } catch (error) {
      console.error("Failed to update voter:", error);
      alert("Failed to update voter. Please try again.");
    }
  };

  // Deactivate Voter API
  const deactivateVoter = async (voterId) => {
    if (!window.confirm("Are you sure you want to deactivate this voter?"))
      return;

    try {
      const response = await axios.delete(
        `${endpoint}/voters/deactivate-voter/${voterId}`,
        { withCredentials: true }
      );

      // Remove voter from local state
      setVoters((prev) => prev.filter((voter) => voter.id !== voterId));
      alert("Voter deactivated successfully!");
    } catch (error) {
      console.error("Failed to deactivate voter:", error);
      alert("Failed to deactivate voter. Please try again.");
    }
  };

  return (
    <div className="flex flex-col pt-24 min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        <main className="flex-1 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Users size={24} className="text-gray-500" />
              <span>Voters</span>
            </h1>

            {/* Search & Filters */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4 mb-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Search bar */}
                <div className="flex items-center space-x-2 w-full md:w-1/2">
                  <Search size={20} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by name or registration number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Filter size={16} className="text-gray-500" />
                    <select
                      value={facultyFilter}
                      onChange={(e) => setFacultyFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm"
                    >
                      {faculties.map((faculty) => (
                        <option key={faculty} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter size={16} className="text-gray-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-md text-gray-600 text-sm"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="mt-4 flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="registrationNumber">Sort by Reg. No.</option>
                </select>
              </div>
            </div>

            {/* Data Table */}
            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <Spinner size="large" />
              </div>
            ) : (
              <>
                <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-sm font-medium">
                        <th className="px-4 py-3 text-left whitespace-nowrap">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left whitespace-nowrap">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left whitespace-nowrap">
                          Registration Number
                        </th>
                        <th className="px-4 py-3 text-left whitespace-nowrap">
                          Faculty
                        </th>
                        <th className="px-4 py-3 text-left whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVoters.map((voter) => (
                        <tr
                          key={voter.id}
                          className="border-t border-gray-100 text-gray-800 hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-4 py-3 flex items-center space-x-3">
                            <img
                              src={voter.capturedImage || ProfileImage}
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover border border-gray-300"
                            />
                            <span>{`${voter.firstName} ${voter.lastName}`}</span>
                          </td>
                          <td className="px-4 py-3">{voter.email}</td>
                          <td className="px-4 py-3">
                            {voter.registrationNumber}
                          </td>
                          <td className="px-4 py-3">{voter.faculty}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`flex items-center space-x-2 ${
                                voter.status === "Active"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {voter.status === "Active" ? (
                                <UserCheck size={16} />
                              ) : (
                                <UserX size={16} />
                              )}
                              <span>{voter.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => openUpdateModal(voter)}
                              className="px-3 py-1 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => deactivateVoter(voter.id)}
                              className={`px-3 py-1 text-sm font-medium rounded-md ${
                                voter.status === "Active"
                                  ? "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-green-600 text-white hover:bg-green-700"
                              } transition-colors`}
                            >
                              {voter.status === "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredVoters.length === 0 && (
                  <div className="text-center text-gray-600 mt-6">
                    No voters found matching your criteria.
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Voter</h2>
            <form onSubmit={updateVoter}>
              {["firstName", "lastName", "faculty", "registrationNumber"].map(
                (field) => (
                  <div key={field} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={updateForm[field]}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                      required
                    />
                  </div>
                )
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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

export default Voters;
