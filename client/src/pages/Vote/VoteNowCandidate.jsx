import { Users, Briefcase } from "lucide-react";
import Navbar from "../../components/Navbar";
import CandidateSidebar from "../../components/CandidateSidebar";

function VoteNow() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <CandidateSidebar />

      <div className="flex flex-1 justify-center items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Vote for Delegates */}
          <div className="w-64 h-64 bg-white shadow-md rounded-xl flex flex-col items-center justify-center hover:shadow-lg transition cursor-pointer border border-gray-200">
            <Users size={48} className="text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Vote for Delegates
            </h2>
          </div>

          {/* Card 2: Vote for Executives */}
          <div className="w-64 h-64 bg-white shadow-md rounded-xl flex flex-col items-center justify-center hover:shadow-lg transition cursor-pointer border border-gray-200">
            <Briefcase size={48} className="text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Vote for Executives
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoteNow;
