import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import { Vote, Award, Users } from "lucide-react";

function ElectionResult() {
  // Mock data for demonstration (replace with actual data from your backend)
  const electionResults = [
    {
      id: 1,
      position: "President",
      candidate: "Jane Smith",
      votes: 1200,
      status: "Winner",
    },
    {
      id: 2,
      position: "President",
      candidate: "John Doe",
      votes: 900,
      status: "Runner-up",
    },
    {
      id: 3,
      position: "Vice President",
      candidate: "Alice Johnson",
      votes: 1000,
      status: "Winner",
    },
    {
      id: 4,
      position: "Vice President",
      candidate: "Bob Brown",
      votes: 800,
      status: "Runner-up",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="ml-64 p-6 flex-1">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Users size={24} className="text-gray-500" aria-hidden="true" />
              <span>Election Results</span>
            </h1>

            {/* Results Table */}
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
                  {electionResults.map((result) => (
                    <tr
                      key={result.id}
                      className="border-t border-gray-100 text-gray-800 hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-3">{result.position}</td>
                      <td className="px-4 py-3">{result.candidate}</td>
                      <td className="px-4 py-3 flex items-center space-x-2">
                        <Vote
                          size={16}
                          className="text-gray-500"
                          aria-hidden="true"
                        />
                        <span>{result.votes}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`flex items-center space-x-2 ${
                            result.status === "Winner"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {result.status === "Winner" && (
                            <Award size={16} aria-hidden="true" />
                          )}
                          <span>{result.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ElectionResult;
