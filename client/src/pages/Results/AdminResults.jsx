import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import { Vote, Award, Users, Download, Filter, BarChart } from "lucide-react";

function AdminResults() {
  // Mock data for multiple elections (replace with backend API data)
  const elections = [
    {
      id: 1,
      title: "Student Council Election 2025",
      status: "Completed",
      totalVoters: 2000,
      votesCast: 1800,
      positions: [
        {
          id: 1,
          name: "President",
          candidates: [
            { id: 1, name: "Jane Smith", votes: 1200 },
            { id: 2, name: "John Doe", votes: 600 },
          ],
        },
        {
          id: 2,
          name: "Vice President",
          candidates: [
            { id: 3, name: "Alice Johnson", votes: 1000 },
            { id: 4, name: "Bob Brown", votes: 800 },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Faculty Representative Election 2025",
      status: "Ongoing",
      totalVoters: 1500,
      votesCast: 900,
      positions: [
        {
          id: 3,
          name: "Faculty Representative",
          candidates: [
            { id: 5, name: "Emma Davis", votes: 500 },
            { id: 6, name: "Michael Lee", votes: 400 },
          ],
        },
      ],
    },
  ];

  // State for selected election and filters
  const [selectedElection, setSelectedElection] = useState(elections[0].id);
  const [sortBy, setSortBy] = useState("votes"); // votes or position

  // Get selected election data
  const election = elections.find((e) => e.id === selectedElection);
  const turnoutPercentage = (
    (election.votesCast / election.totalVoters) *
    100
  ).toFixed(1);

  // Sort candidates by votes or position
  const sortedPositions = [...election.positions].sort((a, b) => {
    if (sortBy === "position") return a.name.localeCompare(b.name);
    const maxVotesA = Math.max(...a.candidates.map((c) => c.votes));
    const maxVotesB = Math.max(...b.candidates.map((c) => c.votes));
    return maxVotesB - maxVotesA;
  });

  // Mock download function
  const handleDownload = () => {
    alert("Downloading results as CSV..."); // Replace with actual CSV generation
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
              <BarChart
                size={24}
                className="text-gray-500"
                aria-hidden="true"
              />
              <span>Admin Election Results</span>
            </h1>

            {/* Election Selector and Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <select
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm"
                >
                  {elections.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDownload}
                  className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Download size={16} aria-hidden="true" />
                  <span>Download Results</span>
                </button>
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
                  className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm"
                >
                  <option value="votes">Sort by Votes</option>
                  <option value="position">Sort by Position</option>
                </select>
              </div>
            </div>

            {/* Election Summary Card */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                <Users size={20} className="text-gray-500" aria-hidden="true" />
                <span>{election.title}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p
                    className={`font-medium ${
                      election.status === "Completed"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {election.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Voters</p>
                  <p className="text-gray-800 font-medium">
                    {election.totalVoters}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Voter Turnout</p>
                  <p className="text-gray-800 font-medium">
                    {turnoutPercentage}%
                  </p>
                </div>
              </div>
              {/* Simple Bar Chart for Turnout */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">
                  Turnout Visualization
                </p>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${turnoutPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Detailed Results Table */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm font-medium">
                    <th className="px-4 py-3 text-left">Position</th>
                    <th className="px-4 py-3 text-left">Candidate</th>
                    <th className="px-4 py-3 text-left">
                      <div className="flex items-center space-x-2">
                        <Vote
                          size={16}
                          className="text-gray-500"
                          aria-hidden="true"
                        />
                        <span>Votes</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <div className="flex items-center space-x-2">
                        <Award
                          size={16}
                          className="text-gray-500"
                          aria-hidden="true"
                        />
                        <span>Status</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPositions.map((position) =>
                    position.candidates.map((candidate, index) => (
                      <tr
                        key={`${position.id}-${candidate.id}`}
                        className="border-t border-gray-100 text-gray-800 hover:bg-blue-50 transition-colors"
                      >
                        {index === 0 && (
                          <td
                            className="px-4 py-3"
                            rowSpan={position.candidates.length}
                          >
                            {position.name}
                          </td>
                        )}
                        <td className="px-4 py-3">{candidate.name}</td>
                        <td className="px-4 py-3 flex items-center space-x-2">
                          <Vote
                            size={16}
                            className="text-gray-500"
                            aria-hidden="true"
                          />
                          <span>{candidate.votes}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={`flex items-center space-x-2 ${
                              candidate.votes ===
                              Math.max(
                                ...position.candidates.map((c) => c.votes)
                              )
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {candidate.votes ===
                              Math.max(
                                ...position.candidates.map((c) => c.votes)
                              ) && <Award size={16} aria-hidden="true" />}
                            <span>
                              {candidate.votes ===
                              Math.max(
                                ...position.candidates.map((c) => c.votes)
                              )
                                ? "Winner"
                                : "Runner-up"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminResults;
