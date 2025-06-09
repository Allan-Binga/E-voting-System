import { Vote, ScrollText, User, LogOut, FileText} from "lucide-react";
import axios from "axios";
import { endpoint } from "../endpoint";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function CandidateSidebar() {
  const navigate = useNavigate();

  //Handle Logout
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${endpoint}/candidates/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        document.cookie = "candidateVotingSession=; Max-Age=0; path=/;";

        toast.success("Successfully logged out.");

        // Delay navigation by 2 seconds (long enough for toast to show)
        setTimeout(() => {
          navigate("/candidate/login");
        }, 2000);
      } else {
        toast.error("You are not logged in.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("You are not logged in.");
    }
  };
  return (
    <aside className="fixed top-20 left-0 w-64 h-[calc(100vh-80px)] bg-white border-r border-gray-100 shadow-sm p-5">
      <nav className="flex flex-col gap-4 text-gray-600 font-medium">
        <a
          href="/application/apply"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <FileText size={20} />
          <span>Applications</span>
        </a>
        <a
          href="/candidate/vote-now"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Vote size={20} />
          <span>Vote Now</span>
        </a>
        <a
          href="/candidate-results"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <ScrollText size={20} />
          <span>Election Results</span>
        </a>
        <a
          href="/candidate-profile"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <User size={20} />
          <span>Profile</span>
        </a>
        <a
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </a>
      </nav>
    </aside>
  );
}

export default CandidateSidebar;
