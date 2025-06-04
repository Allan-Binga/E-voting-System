import { Vote } from "lucide-react";
import Logo from "../assets/mmu.jpeg";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-6 bg-white border-b border-gray-200 shadow-md">
      {/* Logo and Title */}
      <div className="flex items-center space-x-5">
        <img
          src={Logo}
          alt="Multimedia University"
          className="h-20 w-20 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="text-2xl font-extrabold text-gray-800 leading-snug">
            Multimedia University
          </span>
          <span className="text-base text-gray-600 font-medium">
            e-Voting System
          </span>
        </div>
      </div>

      {/* Icon */}
      <div className="flex items-center space-x-2 text-blue-600">
        <Vote size={42} />
      </div>
    </nav>
  );
}

export default Navbar;
