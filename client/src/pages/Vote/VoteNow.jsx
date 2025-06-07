import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Vote, User, Check, AlertCircle } from "lucide-react";

function VoteNow() {
  // Mock data for demonstration (replace with backend API data)
  const election = {
    id: 1,
    title: "Student Council Election 2025",
    description: "Vote for your preferred candidates for the student council.",
    endDate: "2025-06-10",
    positions: [
      {
        id: 1,
        name: "President",
        candidates: [
          { id: 1, name: "Jane Smith" },
          { id: 2, name: "John Doe" },
        ],
      },
      {
        id: 2,
        name: "Vice President",
        candidates: [
          { id: 3, name: "Alice Johnson" },
          { id: 4, name: "Bob Brown" },
        ],
      },
    ],
  };

  // State for selected candidates and submission status
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // Handle candidate selection
  const handleSelectCandidate = (positionId, candidateId) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }));
  };

  // Handle vote submission
  const handleSubmitVote = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // Check if all positions have a selected candidate
      const allPositionsSelected = election.positions.every(
        (position) => selectedCandidates[position.id]
      );
      if (allPositionsSelected) {
        setSubmissionStatus({
          type: "success",
          message: "Your vote has been submitted successfully!",
        });
      } else {
        setSubmissionStatus({
          type: "error",
          message: "Please select a candidate for each position.",
        });
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="ml-64 p-6 flex-1">
          <div className="max-w-3xl mx-auto">
            {/* Page Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Vote size={24} className="text-gray-500" aria-hidden="true" />
              <span>Vote Now</span>
            </h1>

            {/* Election Details */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">
                {election.title}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                {election.description}
              </p>
              <p className="text-sm text-gray-500">
                Voting ends: {election.endDate}
              </p>
            </div>

            {/* Candidate Selection */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
              {election.positions.map((position) => (
                <div key={position.id} className="mb-6">
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center space-x-2">
                    <User
                      size={20}
                      className="text-gray-500"
                      aria-hidden="true"
                    />
                    <span>{position.name}</span>
                  </h3>
                  <div className="space-y-3">
                    {position.candidates.map((candidate) => (
                      <label
                        key={candidate.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name={`position-${position.id}`}
                          checked={
                            selectedCandidates[position.id] === candidate.id
                          }
                          onChange={() =>
                            handleSelectCandidate(position.id, candidate.id)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                        <span className="text-gray-800 font-medium">
                          {candidate.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submission Status */}
              {submissionStatus && (
                <div
                  className={`mt-4 p-3 rounded-md flex items-center space-x-2 ${
                    submissionStatus.type === "success"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {submissionStatus.type === "success" ? (
                    <Check size={20} aria-hidden="true" />
                  ) : (
                    <AlertCircle size={20} aria-hidden="true" />
                  )}
                  <span>{submissionStatus.message}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  onClick={handleSubmitVote}
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Vote size={16} aria-hidden="true" />
                  <span>{isSubmitting ? "Submitting..." : "Submit Vote"}</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default VoteNow;
