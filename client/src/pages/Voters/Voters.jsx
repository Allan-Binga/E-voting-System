import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import { Users, Search, Filter, UserCheck, UserX } from "lucide-react";

function Voters() {
  // Mock data for voters (replace with backend API data)
  const initialVoters = [
    {
      id: 1,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@mmu.ac.ke",
      registrationNumber: "SCI/1234/2023",
      faculty: "Faculty of Computing and Informatics",
      status: "Active",
    },
    {
      id: 2,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@mmu.ac.ke",
      registrationNumber: "ENG/5678/2023",
      faculty: "Faculty of Engineering",
      status: "Inactive",
    },
    {
      id: 3,
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@mmu.ac.ke",
      registrationNumber: "BUS/9012/2023",
      faculty: "Faculty of Business",
      status: "Active",
    },
  ];

  // State for search, filter, and sort
  const [voters, setVoters] = useState(initialVoters);
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name"); // name or registrationNumber

  // Filter and sort voters
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

  // Get unique faculties for filter
  const faculties = ["All", ...new Set(voters.map((voter) => voter.faculty))];

  // Toggle voter status (mock action)
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
              <Users size={24} className="text-gray-500" aria-hidden="true" />
              <span>Voters</span>
            </h1>

            {/* Search and Filter Controls */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Search Bar */}
                <div className="flex items-center space-x-2 w-full md:w-1/2">
                  <Search
                    size={20}
                    className="text-gray-500"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or registration number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter
                      size={16}
                      className="text-gray-500"
                      aria-hidden="true"
                    />
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
                    <Filter
                      size={16}
                      className="text-gray-500"
                      aria-hidden="true"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-md text-gray-800 text-sm"
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
                  <option value="name">Sort by Name</option>
                  <option value="registrationNumber">
                    Sort by Registration Number
                  </option>
                </select>
              </div>
            </div>

            {/* Voters Table */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm font-medium">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Registration Number</th>
                    <th className="px-4 py-3 text-left">Faculty</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoters.map((voter) => (
                    <tr
                      key={voter.id}
                      className="border-t border-gray-100 text-gray-800 hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-3">{`${voter.firstName} ${voter.lastName}`}</td>
                      <td className="px-4 py-3">{voter.email}</td>
                      <td className="px-4 py-3">{voter.registrationNumber}</td>
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
                            <UserCheck size={16} aria-hidden="true" />
                          ) : (
                            <UserX size={16} aria-hidden="true" />
                          )}
                          <span>{voter.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(voter.id)}
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

            {/* Empty State */}
            {filteredVoters.length === 0 && (
              <div className="text-center text-gray-600 mt-6">
                No voters found matching your criteria.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Voters;
