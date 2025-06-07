import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import { Vote, Plus, Filter, Edit, Trash, Info } from "lucide-react";

function Elections() {
  // Mock data for elections (replace with backend API data)
  const initialElections = [
    {
      id: 1,
      title: "Student Council Election 2025",
      description: "Annual election for student council positions.",
      startDate: "2025-06-01",
      endDate: "2025-06-10",
      status: "Completed",
      totalVoters: 2000,
      votesCast: 1800,
    },
    {
      id: 2,
      title: "Faculty Representative Election 2025",
      description: "Election for faculty representatives.",
      startDate: "2025-06-15",
      endDate: "2025-06-20",
      status: "Ongoing",
      totalVoters: 1500,
      votesCast: 900,
    },
    {
      id: 3,
      title: "Club Leadership Election 2025",
      description: "Election for club leadership roles.",
      startDate: "2025-07-01",
      endDate: "2025-07-05",
      status: "Upcoming",
      totalVoters: 1000,
      votesCast: 0,
    },
  ];

  // State for elections, modal, and filters
  const [elections, setElections] = useState(initialElections);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Upcoming",
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date"); // date or title

  // Filter and sort elections
  const filteredElections = elections
    .filter(
      (election) => statusFilter === "All" || election.status === statusFilter
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.startDate) - new Date(a.startDate); // Newest first
    });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewElection((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new election (mock action)
  const handleAddElection = (e) => {
    e.preventDefault();
    if (!newElection.title || !newElection.startDate || !newElection.endDate) {
      alert("Please fill in all required fields.");
      return;
    }
    setElections((prev) => [
      ...prev,
      { ...newElection, id: prev.length + 1, totalVoters: 0, votesCast: 0 },
    ]);
    setShowAddModal(false);
    setNewElection({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "Upcoming",
    });
  };

  // Handle delete election (mock action)
  const handleDeleteElection = (id) => {
    if (confirm("Are you sure you want to delete this election?")) {
      setElections((prev) => prev.filter((election) => election.id !== id));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="ml-64 p-6 flex-1">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Vote size={24} className="text-gray-500" aria-hidden="true" />
              <span>Elections</span>
            </h1>

            {/* Controls: Add Election and Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 mb-4 md:mb-0"
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
                    className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recent Elections */}
            <div className="grid grid-cols-1 gap-4">
              {filteredElections.map((election) => {
                const turnoutPercentage = election.totalVoters
                  ? ((election.votesCast / election.totalVoters) * 100).toFixed(
                      1
                    )
                  : 0;
                return (
                  <div
                    key={election.id}
                    className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-blue-50 transition-colors"
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
                        {election.startDate} to {election.endDate}
                      </p>
                      <p
                        className={`text-sm font-medium mt-1 ${
                          election.status === "Completed"
                            ? "text-green-600"
                            : election.status === "Ongoing"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        Status: {election.status}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Voter Turnout: {turnoutPercentage}% (
                        {election.votesCast}/{election.totalVoters})
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <button
                        onClick={() =>
                          alert(`View details for ${election.title}`)
                        }
                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Info size={16} aria-hidden="true" />
                        <span>Details</span>
                      </button>
                      <button
                        onClick={() => alert(`Edit ${election.title}`)}
                        className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center space-x-1"
                      >
                        <Edit size={16} aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteElection(election.id)}
                        className="px-3 py-1 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-1"
                      >
                        <Trash size={16} aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredElections.length === 0 && (
              <div className="text-center text-gray-600 mt-6">
                No elections found matching your criteria.
              </div>
            )}

            {/* Add Election Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                  <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                    <Plus
                      size={20}
                      className="text-gray-500"
                      aria-hidden="true"
                    />
                    <span>Add New Election</span>
                  </h2>
                  <form onSubmit={handleAddElection}>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Title <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={newElection.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-600">
                        Start Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={newElection.startDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default Elections;
