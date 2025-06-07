import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import { Users, User, Filter, Info } from "lucide-react";

function Candidates() {
  // Mock data for candidates (replace with backend API data)
  const election = {
    id: 1,
    title: "Student Council Election 2025",
    positions: [
      {
        id: 1,
        name: "President",
        candidates: [
          {
            id: 1,
            name: "Jane Smith",
            photo: "https://via.placeholder.com/100",
            bio: "Passionate about student welfare and academic excellence.",
          },
          {
            id: 2,
            name: "John Doe",
            photo: "https://via.placeholder.com/100",
            bio: "Dedicated to improving campus facilities and inclusivity.",
          },
        ],
      },
      {
        id: 2,
        name: "Vice President",
        candidates: [
          {
            id: 3,
            name: "Alice Johnson",
            photo: "https://via.placeholder.com/100",
            bio: "Focused on student engagement and extracurricular activities.",
          },
          {
            id: 4,
            name: "Bob Brown",
            photo: "https://via.placeholder.com/100",
            bio: "Advocating for better communication between students and administration.",
          },
        ],
      },
    ],
  };

  // State for position filter
  const [positionFilter, setPositionFilter] = useState("All");

  // Get unique positions for filter
  const positions = ["All", ...election.positions.map((pos) => pos.name)];

  // Filter candidates by position
  const filteredCandidates = election.positions
    .filter((pos) => positionFilter === "All" || pos.name === positionFilter)
    .flatMap((pos) => pos.candidates.map((candidate) => ({ ...candidate, position: pos.name })));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar/>

        {/* Main Content */}
        <main className="ml-64 p-6 flex-1">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Users size={24} className="text-gray-500" aria-hidden="true" />
              <span>Candidates</span>
            </h1>

            {/* Election Info */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">{election.title}</h2>
              <p className="text-sm text-gray-600">Meet the candidates running for various positions.</p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-2 mb-6">
              <Filter size={16} className="text-gray-500" aria-hidden="true" />
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white border border-gray-100 shadow-sm rounded-lg p-4 flex items-start space-x-4 hover:bg-blue-50 transition-colors"
                >
                  <img
                    src={candidate.photo}
                    alt={`${candidate.name} profile`}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="text-md font-medium text-gray-800 flex items-center space-x-2">
                      <User size={16} className="text-gray-500" aria-hidden="true" />
                      <span>{candidate.name}</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{candidate.position}</p>
                    <p className="text-sm text-gray-600 mt-1">{candidate.bio}</p>
                    <button
                      onClick={() => alert(`View details for ${candidate.name}`)}
                      className="mt-2 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Info size={16} aria-hidden="true" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCandidates.length === 0 && (
              <div className="text-center text-gray-600 mt-6">
                No candidates found for the selected position.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Candidates;