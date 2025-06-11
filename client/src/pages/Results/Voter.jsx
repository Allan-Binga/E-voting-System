import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { useEffect, useState } from "react";
import { endpoint } from "../../endpoint";
import Spinner from "../../components/Spinner";
import { Trophy } from "lucide-react";

function VoterResults() {
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${endpoint}/results/all-results`);
      setResults(response.data.results);
      setWinner(response.data.winner);
    } catch (error) {
      setError("Failed to fetch election results.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <div className="hidden md:block">
          <Sidebar/>
        </div>

        <main className="ml-0 md:ml-64 p-6 flex-1">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Election Results
            </h1>

            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
              {loading ? (
                <Spinner />
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Candidate
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Total Votes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {results.map((r) => (
                          <tr key={r.result_id}>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {r.candidate_name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {r.candidate_email}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              {r.total_votes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex items-center space-x-2 text-green-600 font-semibold">
                    <Trophy size={20} />
                    <span>Winner: {winner}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default VoterResults;
