import {
  LayoutDashboard,
  Users,
  UserPlus,
  ListChecks,
  ScrollText,
  LogOut,
  File,
} from "lucide-react";
import axios from "axios";
import { endpoint } from "../endpoint";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${endpoint}/auth/users/administrator/logout-admin`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        document.cookie = "adminVotingSession=; Max-Age=0; path=/;";
        toast.success("Successfully logged out.");
        setTimeout(() => {
          navigate("/officials/login");
        }, 2000);
      } else {
        toast.error("You are not logged in.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed.");
    }
  };

  return (
    <aside className="fixed top-20 left-0 w-64 h-[calc(100vh-80px)] bg-white border-r border-gray-100 shadow-sm p-5">
      <nav className="flex flex-col gap-4 text-gray-600 font-medium">
        <a
          href="/officials/home"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </a>
        <a
          href="/officials/applications"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <File size={20} />
          <span>Applications</span>
        </a>
        <a
          href="/officials/voters"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Users size={20} />
          <span>Voters</span>
        </a>
        <a
          href="/officials/candidates"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <UserPlus size={20} />
          <span>Candidates</span>
        </a>
        <a
          href="/officials/elections"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <ListChecks size={20} />
          <span>Elections</span>
        </a>
        <a
          href="/officials/results"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <ScrollText size={20} />
          <span>Election Results</span>
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

export default AdminSidebar;
