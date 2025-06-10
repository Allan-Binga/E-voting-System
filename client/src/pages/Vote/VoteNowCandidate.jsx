import { Users, Briefcase } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import CandidateSidebar from "../../components/CandidateSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import { endpoint } from "../../endpoint";
import Spinner from "../../components/Spinner";

function VoteNow() {
  const [delegates, setDelegates] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [votingStatus, setVotingStatus] = useState({
    delegateVoted: false,
    executiveVoted: false,
  });
  const [delegatesModal, setDelegatesModal] = useState(false);
  const [executivesModal, setExecutivesModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null); // Track "Delegate" or "Executive"
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch voter status
  const getVoterStatus = useCallback(async () => {
    try {
      const response = await axios.get(
        `${endpoint}/profiles/profile/candidate/my-profile`,
        { withCredentials: true }
      );
      const { delegate_voting_status, executive_voting_status } =
        response.data.profile;
      setVotingStatus({
        delegateVoted: delegate_voting_status === "Voted",
        executiveVoted: executive_voting_status === "Voted",
      });
    } catch (error) {
      console.error("[Voter Status Error]", error);
      toast.error("Failed to fetch voting status.");
    }
  }, []);

  useEffect(() => {
    getVoterStatus();
  }, [getVoterStatus]);

  // Fetch candidates (delegates or executives)
  const fetchCandidates = useCallback(async (position, setState) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${endpoint}/applications/all-applications?position=${position}`,
        { withCredentials: true }
      );
      setState(response.data.applications || []);
    } catch (error) {
      console.error(`[Fetch ${position} Error]`, error);
      toast.error(`Failed to load ${position.toLowerCase()}.`);
      setError(`Failed to load ${position.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates("Delegate", setDelegates);
    fetchCandidates("Executive", setExecutives);
  }, [fetchCandidates]);

  // Cast vote directly
  const castVote = useCallback(async (candidateId, voteType) => {
    setError(null);
    setVoting(true);
    try {
      await axios.post(
        `${endpoint}/vote/candidate/vote-now`,
        { candidateId, voteType },
        { withCredentials: true }
      );
      setVotingStatus((prev) => ({
        ...prev,
        [`${voteType}Voted`]: true,
      }));
      setDelegatesModal(false);
      setExecutivesModal(false);
      setSelectedPosition(null);
      setSelectedCandidateId(null);
      toast.success(
        `Vote for ${
          voteType.charAt(0).toUpperCase() + voteType.slice(1)
        } cast successfully!`
      );
    } catch (error) {
      console.error("[Vote Error]", error);
      const message = error.response?.data?.message || "Failed to cast vote.";
      toast.error(message);
      setError(message);
    } finally {
      setVoting(false);
    }
  }, []);

  // Open candidates modal and store selected position
  const openCandidateModal = useCallback(
    (type) => {
      if (
        (type === "Delegate" && votingStatus.delegateVoted) ||
        (type === "Executive" && votingStatus.executiveVoted)
      ) {
        toast.error(`You have already voted for ${type}.`);
        return;
      }
      setSelectedPosition(type);
      if (type === "Delegate") {
        setDelegatesModal(true);
      } else {
        setExecutivesModal(true);
      }
    },
    [votingStatus]
  );

  // Handle candidate selection and cast vote
  const handleCandidateSelect = useCallback(
    (candidateId) => {
      setSelectedCandidateId(candidateId);
      setDelegatesModal(false);
      setExecutivesModal(false);
      castVote(candidateId, selectedPosition.toLowerCase());
    },
    [selectedPosition, castVote]
  );

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${endpoint}/auth/candidates/candidate/logout-candidate`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        document.cookie = "candidateVotingSession=; Max-Age=0; path=/;";
        toast.success("Successfully logged out.");
        setTimeout(() => {
          navigate("/candidate/login");
        }, 2000);
      } else {
        toast.error("You are not logged in.");
      }
    } catch (error) {
      console.error("[Logout Error]", error);
      toast.error("You are not logged in.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <CandidateSidebar />
      <main className="flex flex-1 justify-center items-center p-4">
        {loading ? (
          <Spinner />
        ) : votingStatus.delegateVoted && votingStatus.executiveVoted ? (
          <div className="bg-white shadow-lg rounded-xl p-6 max-w-md text-center border border-green-200">
            <div className="flex flex-col items-center justify-center space-y-4">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="text-2xl font-bold text-green-600">
                All Votes Submitted!
              </h2>
              <p className="text-gray-700">
                Thank you for participating in the election.
              </p>
              <button
                onClick={handleLogout}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Vote for Delegates */}
            <div
              className={`w-64 h-64 bg-white shadow-md rounded-xl flex flex-col items-center justify-center transition border border-gray-200 ${
                votingStatus.delegateVoted
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg cursor-pointer"
              }`}
              onClick={() =>
                !votingStatus.delegateVoted && openCandidateModal("Delegate")
              }
            >
              <Users size={48} className="text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                Vote for Delegates
              </h2>
              {votingStatus.delegateVoted && (
                <p className="text-sm text-green-600 mt-2">Voted</p>
              )}
            </div>
            {/* Card 2: Vote for Executives */}
            <div
              className={`w-64 h-64 bg-white shadow-md rounded-xl flex flex-col items-center justify-center transition border border-gray-200 ${
                votingStatus.executiveVoted
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg cursor-pointer"
              }`}
              onClick={() =>
                !votingStatus.executiveVoted && openCandidateModal("Executive")
              }
            >
              <Briefcase size={48} className="text-green-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                Vote for Executives
              </h2>
              {votingStatus.executiveVoted && (
                <p className="text-sm text-green-600 mt-2">Voted</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Candidates Modal (Delegates or Executives) */}
      {(delegatesModal || executivesModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Select a {delegatesModal ? "Delegate" : "Executive"} to Vote For
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {(delegatesModal ? delegates : executives).length === 0 ? (
                <p>
                  No {delegatesModal ? "delegates" : "executives"} available.
                </p>
              ) : (
                (delegatesModal ? delegates : executives).map((candidate) => (
                  <div
                    key={candidate.candidate_id}
                    className={`border p-4 rounded shadow cursor-pointer transition ${
                      selectedCandidateId === candidate.candidate_id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-400"
                    }`}
                    onClick={() =>
                      !voting && handleCandidateSelect(candidate.candidate_id)
                    }
                  >
                    <p className="font-semibold text-gray-800">
                      {candidate.full_name}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {candidate.manifesto}
                    </p>
                    {voting &&
                      selectedCandidateId === candidate.candidate_id && (
                        <p className="text-sm text-blue-600 mt-2">Voting...</p>
                      )}
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => {
                  setDelegatesModal(false);
                  setExecutivesModal(false);
                  setSelectedPosition(null);
                  setSelectedCandidateId(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoteNow;
