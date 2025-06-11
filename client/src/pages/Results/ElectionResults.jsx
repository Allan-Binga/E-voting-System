import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";
import { Vote, Award, Users } from "lucide-react";
import axios from "axios";
import { endpoint } from "../../endpoint";
import { useState, useEffect } from "react";

function ElectionResult() {
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [electionId, setElectionId] = useState(1); 

  // API for fetching results
  const getResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${endpoint}/results/all-results`, {
        params: { election_id: electionId },
      });
      setResults(response.data.results);
      setWinner(response.data.winner);
      setLoading(false);
    } catch (error) {
      setMessage("Failed to fetch results.");
      setLoading(false);
    }
  };

  // API for announcing winner
  const announceWinner = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${endpoint}/results/announce-winner`, {
        electionId,
      });
      setMessage(response.data.message);
      setWinner(response.data.winner);
      setLoading(false);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to announce winner.";
      setMessage(errMsg);
      setLoading(false);
    }
  };

  useEffect(() => {
    getResults();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex flex-1">
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        <main className="ml-0 md:ml-64 p-4 sm:p-6 flex-1">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Users size={24} className="text-gray-500" />
              <span>Election Results</span>
            </h1>

            {/* Winner Message */}
            {winner && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg shadow">
                🏆 <strong>{winner}</strong> is currently leading!
              </div>
            )}

            {/* Response Message */}
            {message && (
              <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded">
                {message}
              </div>
            )}

            {/* Announce Winner Button */}
            <div className="mb-6">
              <button
                onClick={announceWinner}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
              >
                {loading ? "Processing..." : "Announce Winner"}
              </button>
            </div>

            {/* Results Table */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm font-medium">
                    <th className="px-4 py-3 text-left">Candidate</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left flex items-center space-x-2">
                      <Vote size={16} className="text-gray-500" />
                      <span>Votes</span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Award size={16} className="text-gray-500" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result.result_id}
                      className="border-t border-gray-100 text-gray-800 hover:bg-green-50 transition-colors"
                    >
                      <td className="px-4 py-3">{result.candidate_name}</td>
                      <td className="px-4 py-3">{result.candidate_email}</td>
                      <td className="px-4 py-3 flex items-center space-x-2">
                        <span>{result.total_votes}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`flex items-center space-x-2 ${
                            result.candidate_name === winner
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {result.candidate_name === winner && (
                            <Award size={16} aria-hidden="true" />
                          )}
                          <span>
                            {result.candidate_name === winner
                              ? "Winner"
                              : "Participant"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!results.length && !loading && (
                <div className="p-4 text-center text-gray-500">
                  No results found.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ElectionResult;
