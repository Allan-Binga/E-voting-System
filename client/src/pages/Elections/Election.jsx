import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import { Vote, Plus, Filter, Edit, Trash, Info } from "lucide-react";
import axios from "axios";
import { endpoint } from "../../endpoint";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";

function Elections() {
  const [elections, setElections] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    delegatePositions: "",
    executivePositions: "",
    startDate: "",
    endDate: "",
    status: "Upcoming",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "",
    delegates: "",
    executives: "",
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  // Format date to YYYY-MM-DD or return empty string if invalid
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Fetch Elections from API
  const getElections = async () => {
    try {
      const response = await axios.get(`${endpoint}/election/get-elections`, {
        withCredentials: true,
      });
      const electionsData = response.data.elections || [];
      console.log("Raw API Response:", electionsData);
      const normalized = electionsData.map((election) => ({
        id:
          election.id || `fallback-${Math.random().toString(36).substr(2, 9)}`,
        title: election.title || "",
        description: election.description || "",
        delegatePositions: election.delegates || "",
        executivePositions: election.executives || "",
        startDate: formatDate(election.start_date),
        endDate: formatDate(election.end_date),
        status: election.status || "Upcoming",
      }));
      setElections(normalized);
    } catch (error) {
      console.error("Failed to fetch elections:", error);
      toast.error("Failed to load elections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getElections();
  }, []);

  // Filter and sort elections
  const filteredElections = elections
    .filter(
      (election) => statusFilter === "All" || election.status === statusFilter
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.startDate) - new Date(a.startDate);
    });

  // Handle form input changes for add modal
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewElection((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form input changes for edit modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Open Update Modal
  const openUpdateModal = (election) => {
    setSelectedElection(election);
    setEditForm({
      title: election.title,
      description: election.description,
      startDate: election.startDate,
      endDate: election.endDate,
      status: election.status,
      delegates: election.delegatePositions,
      executives: election.executivePositions,
    });
    setShowEditModal(true);
    setShowDetailsModal(false); // Close details modal when opening edit modal
  };

  // Add Election
  const addElection = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${endpoint}/election/create-general-election`,
        {
          title: newElection.title,
          description: newElection.description,
          delegatePositions: newElection.delegatePositions,
          executivePositions: newElection.executivePositions,
          startDate: newElection.startDate,
          endDate: newElection.endDate,
          status: newElection.status,
        },
        { withCredentials: true }
      );

      const newElectionData = response.data.election;
      setElections((prev) => [
        ...prev,
        {
          id: newElectionData.election_id,
          title: newElectionData.title,
          description: newElectionData.description,
          delegatePositions: newElectionData.delegatePositions,
          executivePositions: newElection.executivePositions,
          startDate: formatDate(newElectionData.start_date),
          endDate: formatDate(newElectionData.end_date),
          status: newElectionData.status,
        },
      ]);

      setShowAddModal(false);
      setNewElection({
        title: "",
        description: "",
        delegatePositions: "",
        executivePositions: "",
        startDate: "",
        endDate: "",
        status: "Upcoming",
      });
      toast.success("Election created successfully!");
    } catch (error) {
      console.error("Failed to create election:", error);
      toast.error(
        error.response?.data?.message || "Failed to create election."
      );
    }
  };

  // Update Election
  const updateElection = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${endpoint}/election/update-election/${selectedElection.id}`,
        {
          title: editForm.title,
          description: editForm.description,
          start_date: editForm.startDate,
          end_date: editForm.endDate,
          status: editForm.status,
          delegates: editForm.delegates,
          executives: editForm.executives,
        },
        { withCredentials: true }
      );

      setElections((prev) =>
        prev.map((election) =>
          election.id === selectedElection.id
            ? {
                ...election,
                title: editForm.title,
                description: editForm.description,
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                status: editForm.status,
                delegatePositions: editForm.delegates,
                executivePositions: editForm.executives,
              }
            : election
        )
      );

      setShowEditModal(false);
      toast.success("Election updated successfully.");
    } catch (error) {
      console.error("Failed to update election:", error);
      toast.error("Failed to update election. Please try again.");
    }
  };

  // Delete Election
  const deleteElection = async (electionId) => {
    toast.info(({ closeToast }) => (
      <div className="space-y-2">
        <p>Are you sure you want to delete this election entry?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={async () => {
              try {
                await axios.delete(
                  `${endpoint}/election/delete-election/${electionId}`,
                  { withCredentials: true }
                );
                setElections((prev) =>
                  prev.filter((election) => election.id !== electionId)
                );
                toast.dismiss();
                toast.success("Entry deleted");
              } catch (error) {
                console.error("Failed to delete entry:", error);
                toast.dismiss();
                toast.error("Failed to delete entry. Please try again.");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex flex-col pt-24 min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        <main className="ml-0 md:ml-64 p-4 sm:p-6 flex-1">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Vote size={24} className="text-gray-500" aria-hidden="true" />
              <span>Elections</span>
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 mb-4 md:mb-0 cursor-pointer"
              >
                <Plus size={16} aria-hidden="true" />
                <span>Add Election</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter
                    size={16}
                    className="text-gray-500"
                    aria-hidden="true"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter
                    size={16}
                    className="text-gray-500"
                    aria-hidden="true"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <Spinner size="large" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {filteredElections.map((election) => (
                    <div
                      key={election.id}
                      className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-green-50 transition-colors"
                    >
                      <div>
                        <h3 className="text-md font-medium text-gray-800 flex items-center space-x-2">
                          <Vote
                            size={16}
                            className="text-gray-500"
                            aria-hidden="true"
                          />
                          <span>{election.title}</span>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {election.description}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {election.startDate || "No start date"} to{" "}
                          {election.endDate || "No end date"}
                        </p>
                        <p
                          className={`text-sm font-medium mt-1 ${
                            election.status === "Completed"
                              ? "text-green-600"
                              : election.status === "Ongoing"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          Status: {election.status}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Delegates: {election.delegatePositions || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Executives: {election.executivePositions || "N/A"}
                        </p>
                      </div>
                      <div className="flex space-x-2 mt-4 md:mt-0">
                        <button
                          onClick={() => openUpdateModal(election)}
                          className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit size={16} aria-hidden="true" />
                          <span>Update</span>
                        </button>
                        <button
                          onClick={() => deleteElection(election.id)}
                          className="px-3 py-1 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash size={16} aria-hidden="true" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredElections.length === 0 && (
                  <div className="text-center text-gray-600 mt-6">
                    No elections found matching your criteria.
                  </div>
                )}
              </>
            )}

            {/* Add Election Modal */}
            {showAddModal && (
              <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                  <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                    <Plus
                      size={20}
                      className="text-gray-500"
                      aria-hidden="true"
                    />
                    <span>Add New Election</span>
                  </h2>
                  <form onSubmit={addElection}>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Title <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={newElection.title}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newElection.description}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Delegate Positions
                      </label>
                      <select
                        name="delegatePositions"
                        value={newElection.delegatePositions}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select number</option>
                        {[...Array(100).keys()].map((num) => (
                          <option key={num + 1} value={num + 1}>
                            {num + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Executive Positions
                      </label>
                      <select
                        name="executivePositions"
                        value={newElection.executivePositions}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select number</option>
                        {[...Array(5).keys()].map((num) => (
                          <option key={num + 1} value={num + 1}>
                            {num + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Start Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={newElection.startDate}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        End Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={newElection.endDate}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <select
                        name="status"
                        value={newElection.status}
                        onChange={handleAddInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors cursor-pointer"
                      >
                        Add Election
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedElection && (
              <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Election Details</h2>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Title:</strong> {selectedElection.title}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Description:</strong> {selectedElection.description}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Start Date:</strong>{" "}
                    {selectedElection.startDate || "No start date"}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>End Date:</strong>{" "}
                    {selectedElection.endDate || "No end date"}
                  </p>
                  <p
                    className={`text-sm mb-4 ${
                      selectedElection.status === "Completed"
                        ? "text-green-600"
                        : selectedElection.status === "Ongoing"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    <strong>Status:</strong> {selectedElection.status}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => openUpdateModal(selectedElection)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteElection(selectedElection.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Election Modal */}
            {showEditModal && (
              <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                  <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                    <Edit
                      size={20}
                      className="text-gray-500"
                      aria-hidden="true"
                    />
                    <span>Edit Election</span>
                  </h2>
                  <form onSubmit={updateElection}>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Title <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Delegate Positions
                      </label>
                      <select
                        name="delegates"
                        value={editForm.delegates}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select number</option>
                        {[...Array(100).keys()].map((num) => (
                          <option key={num + 1} value={num + 1}>
                            {num + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Executive Positions
                      </label>
                      <select
                        name="executives"
                        value={editForm.executives}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select number</option>
                        {[...Array(5).keys()].map((num) => (
                          <option key={num + 1} value={num + 1}>
                            {num + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Start Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={editForm.startDate}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        End Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={editForm.endDate}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        Update Election
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Elections;
