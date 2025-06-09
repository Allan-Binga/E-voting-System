import { Vote } from "lucide-react";
import Logo from "../assets/mmu.jpeg";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const showElectionOfficialsLink = [
    "/voter/registration",
    "/voter/login",
    "/candidate/registration",
    "/candidate/login",
    "/officials/registration",
    "/officials/login",
  ].includes(location.pathname);

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
      <div className="flex items-center space-x-3 text-green-600 hover:text-green-800">
        <Vote size={36} />
        {showElectionOfficialsLink && (
          <a
            href="/officials/registration"
            className="text-md font-medium"
          >
            Election Officials
          </a>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
