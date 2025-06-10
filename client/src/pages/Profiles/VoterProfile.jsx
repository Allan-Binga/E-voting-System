import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { User, Mail, CheckCircle, School, Hash } from "lucide-react";
import Spinner from "../../components/Spinner";
import axios from "axios";
import { endpoint } from "../../endpoint";
import ProfileImage from "../../assets/user.png";

function VoterProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${endpoint}/profiles/profile/voter/my-profile`,
        { withCredentials: true }
      );

      const profileData = response.data.profile;

      // Convert biometric_data buffer to base64 string
      const byteArray = new Uint8Array(profileData.biometric_data.data);
      const base64String = btoa(
        byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      const biometricImageUrl = `data:image/jpeg;base64,${base64String}`;

      setUserProfile({
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

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

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
                    src={ProfileImage}
                    alt="Biometric Profile"
                    className="w-30 h-30 rounded-md object-cover"
                  />
                </div>

                {/* Voter Details */}
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Detail Item */}
                    {[
                      {
                        label: "First Name",
                        icon: (
                          <User
                            size={20}
                            className="text-gray-500 flex-shrink-0"
                          />
                        ),
                        value: userProfile.first_name,
                      },
                      {
                        label: "Last Name",
                        icon: (
                          <User
                            size={20}
                            className="text-gray-500 flex-shrink-0"
                          />
                        ),
                        value: userProfile.last_name,
                      },
                      {
                        label: "Email",
                        icon: (
                          <Mail
                            size={20}
                            className="text-gray-500 flex-shrink-0"
                          />
                        ),
                        value: userProfile.email,
                      },
                      {
                        label: "Status",
                        icon: (
                          <CheckCircle
                            size={20}
                            className="text-gray-500 flex-shrink-0"
                          />
                        ),
                        value: (
                          <span
                            className={`font-medium ${
                              userProfile.status === "Active"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {userProfile.status || "N/A"}
                          </span>
                        ),
                      },
                      {
                        label: "Faculty",
                        icon: (
                          <School
                            size={20}
                            className="text-gray-500 flex-shrink-0"
                          />
                        ),
                        value: userProfile.faculty,
                      },
                      {
                        label: "Registration Number",
                        icon: (
                          <Hash
                            size={20}
                            className="text-gray-500 flex-shrink-0"
                          />
                        ),
                        value: userProfile.registration_number,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 break-words"
                      >
                        {item.icon}
                        <div className="min-w-0">
                          <label className="text-sm font-medium text-gray-500">
                            {item.label}
                          </label>
                          <p className="text-gray-800 font-medium break-words truncate max-w-xs">
                            {item.value || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
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
