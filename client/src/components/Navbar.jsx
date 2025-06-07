import { Vote } from "lucide-react";
import Logo from "../assets/mmu.jpeg";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const isOfficialsPage =
    location.pathname === "/officials/registration" ||
    location.pathname === "/officials/login";

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm h-20">
      {/* Logo and Title */}
      <div className="flex items-center space-x-4">
        <img
          src={Logo}
          alt="Multimedia University"
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="text-xl font-bold text-gray-800">
            Multimedia University
          </span>
          <span className="text-sm text-gray-500 font-medium">
            e-Voting Management System
          </span>
        </div>
      </div>

      {/* Right Side: Icon and Conditional Link */}
      <div className="flex items-center space-x-3 text-blue-600">
        <Vote size={36} />
        {!isOfficialsPage && (
          <a
            href="/officials/registration"
            className="text-sm font-medium text-blue hover:text-gray-800 transition"
          >
            Election Officials
          </a>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
