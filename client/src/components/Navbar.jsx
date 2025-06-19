import { Vote, Menu, X } from "lucide-react";
import Logo from "../assets/mmu.jpeg";
import { useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const showElectionOfficialsLink = [
    "/voter/registration",
    "/voter/login",
    "/candidate/registration",
    "/candidate/login",
    "/officials/registration",
    "/officials/login",
  ].includes(location.pathname);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm h-16 md:h-20">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3">
        <img
          src={Logo}
          alt="Multimedia University"
          className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-bold text-gray-800">
            Multimedia University of Kenya
          </span>
          <span className="text-xs md:text-sm text-gray-500 font-medium">
            Biometric e-Voting Management System
          </span>
        </div>
      </div>

      {/* Hamburger Icon for Mobile */}
      <button
        className="md:hidden text-gray-800 focus:outline-none"
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Right Side: Desktop Menu */}
      <div className="hidden md:flex items-center space-x-3 text-green-600 hover:text-green-800">
        <Vote size={32} />
        {showElectionOfficialsLink && (
          <a href="/officials/registration" className="text-md font-medium">
            Election Officials
          </a>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-md md:hidden">
          <div className="flex flex-col items-center py-4">
            {showElectionOfficialsLink && (
              <a
                href="/officials/registration"
                className="text-green-600 hover:text-green-800 text-md font-medium py-2 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Vote size={24} className="mr-2" />
                Election Officials
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
