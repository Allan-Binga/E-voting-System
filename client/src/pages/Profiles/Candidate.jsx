import { useState, useEffect } from "react";
import CandidateSidebar from "../../components/CandidateSidebar";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";
import { User, Mail, CheckCircle, School, Hash } from "lucide-react";
import axios from "axios";
import { endpoint } from "../../endpoint";

function CandidateProfile() {
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${endpoint}/profiles/profile/candidate/my-profile`,
        { withCredentials: true }
      );

      const profileData = response.data.profile[0];

      // Convert biometric_data buffer to base64 string
      const byteArray = new Uint8Array(profileData.biometric_data.data);
      const base64String = btoa(
        byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      const biometricImageUrl = `data:image/jpeg;base64,${base64String}`;

      setCandidateProfile({
        ...profileData,
        biometricImageUrl,
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!candidateProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <div className="hidden md:block">
          <CandidateSidebar />
        </div>

        <main className="ml-64 p-6 flex-1">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Your Profile
            </h1>

            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
                <div className="flex-shrink-0">
                  <img
                    src={candidateProfile.biometricImageUrl}
                    alt="Biometric"
                    className="w-32 h-32 rounded-md object-cover border border-gray-200"
                  />
                </div>

                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="flex items-center space-x-2">
                      <User size={20} className="text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          First Name
                        </label>
                        <p className="text-gray-800 font-medium">
                          {candidateProfile.first_name}
                        </p>
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="flex items-center space-x-2">
                      <User size={20} className="text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Last Name
                        </label>
                        <p className="text-gray-800 font-medium">
                          {candidateProfile.last_name}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center space-x-2">
                      <Mail size={20} className="text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Email
                        </label>
                        <p className="text-gray-800 font-medium">
                          {candidateProfile.email}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={20} className="text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <p
                          className={`font-medium ${
                            candidateProfile.voting_status
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {candidateProfile.voting_status
                            ? "Active"
                            : "Inactive"}
                        </p>
                      </div>
                    </div>

                    {/* Faculty */}
                    <div className="flex items-center space-x-2">
                      <School size={20} className="text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Faculty
                        </label>
                        <p className="text-gray-800 font-medium">
                          {candidateProfile.faculty}
                        </p>
                      </div>
                    </div>

                    {/* Registration Number */}
                    <div className="flex items-center space-x-2">
                      <Hash size={20} className="text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Registration Number
                        </label>
                        <p className="text-gray-800 font-medium">
                          {candidateProfile.registration_number}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

export default CandidateProfile;
