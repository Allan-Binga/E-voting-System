import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { User, Mail, Camera, CheckCircle, School, Hash } from "lucide-react";

function VoterProfile() {
  // Mock data for demonstration (replace with actual data from your backend)
  const voter = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@mmu.ac.ke",
    biometricData: "https://via.placeholder.com/150", // Placeholder for biometric image
    status: "Active",
    faculty: "Faculty of Computing and Informatics",
    registrationNumber: "SCI/1234/2023",
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Voter Profile
            </h1>

            {/* Profile Card */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
                {/* Biometric Image */}
                <div className="flex-shrink-0">
                  <img
                    src={voter.biometricData}
                    alt="Biometric Profile"
                    className="w-32 h-32 rounded-md object-cover border border-gray-200"
                  />
                </div>

                {/* Voter Details */}
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="flex items-center space-x-2">
                      <User
                        size={20}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          First Name
                        </label>
                        <p className="text-gray-800 font-medium">
                          {voter.firstName}
                        </p>
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="flex items-center space-x-2">
                      <User
                        size={20}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Last Name
                        </label>
                        <p className="text-gray-800 font-medium">
                          {voter.lastName}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center space-x-2">
                      <Mail
                        size={20}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Email
                        </label>
                        <p className="text-gray-800 font-medium">
                          {voter.email}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <CheckCircle
                        size={20}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <p
                          className={`font-medium ${
                            voter.status === "Active"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {voter.status}
                        </p>
                      </div>
                    </div>

                    {/* Faculty */}
                    <div className="flex items-center space-x-2">
                      <School
                        size={20}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Faculty
                        </label>
                        <p className="text-gray-800 font-medium">
                          {voter.faculty}
                        </p>
                      </div>
                    </div>

                    {/* Registration Number */}
                    <div className="flex items-center space-x-2">
                      <Hash
                        size={20}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Registration Number
                        </label>
                        <p className="text-gray-800 font-medium">
                          {voter.registrationNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className="mt-6">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default VoterProfile;
