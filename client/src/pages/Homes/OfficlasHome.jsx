import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import {
  LayoutDashboard,
  Vote,
  Users,
  AlertTriangle,
  Plus,
  BarChart,
} from "lucide-react";

function AdminHome() {
  // Mock data for dashboard (replace with backend API data)
  const [dashboardData, setDashboardData] = useState({
    activeElections: 2,
    totalVoters: 5000,
    averageTurnout: 75.5,
    alerts: [
      {
        id: 1,
        message: "Election 'Student Council 2025' ends in 24 hours",
        severity: "warning",
      },
      { id: 2, message: "10 voters pending verification", severity: "error" },
    ],
    recentElections: [
      {
        id: 1,
        title: "Student Council Election 2025",
        status: "Ongoing",
        turnout: 80,
        endDate: "2025-06-06",
      },
      {
        id: 2,
        title: "Faculty Representative Election 2025",
        status: "Completed",
        turnout: 70,
        endDate: "2025-06-01",
      },
    ],
  });

  // Simulate API fetch (replace with real API call)
  useEffect(() => {
    // Example: fetch("/api/admin/dashboard")
    //   .then((res) => res.json())
    //   .then((data) => setDashboardData(data));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="ml-20 p-6 flex-1">
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <LayoutDashboard
                size={24}
                className="text-gray-500"
                aria-hidden="true"
              />
              <span>Admin Dashboard</span>
            </h1>

            {/* Quick Stats Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Active Elections */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Vote
                    size={20}
                    className="text-gray-500"
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-medium text-gray-600">
                    Active Elections
                  </h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData.activeElections}
                </p>
                <a
                  href="/admin/elections"
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                  View Elections
                </a>
              </div>

              {/* Total Voters */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users
                    size={20}
                    className="text-gray-500"
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-medium text-gray-600">
                    Total Voters
                  </h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData.totalVoters}
                </p>
                <a
                  href="/admin/voters"
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                  Manage Voters
                </a>
              </div>

              {/* Average Turnout */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart
                    size={20}
                    className="text-gray-500"
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-medium text-gray-600">
                    Average Turnout
                  </h2>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboardData.averageTurnout}%
                </p>
                <a
                  href="/admin/results"
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                  View Results
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <a
                  href="/admin/elections"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} aria-hidden="true" />
                  <span>Add Election</span>
                </a>
                <a
                  href="/admin/voters"
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
                >
                  <Users size={16} aria-hidden="true" />
                  <span>Manage Voters</span>
                </a>
                <a
                  href="/admin/results"
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
                >
                  <BarChart size={16} aria-hidden="true" />
                  <span>View Results</span>
                </a>
              </div>
            </div>

            {/* Alerts Section */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                <AlertTriangle
                  size={20}
                  className="text-gray-500"
                  aria-hidden="true"
                />
                <span>System Alerts</span>
              </h2>
              {dashboardData.alerts.length > 0 ? (
                <ul className="space-y-2">
                  {dashboardData.alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className={`flex items-center space-x-2 p-2 rounded-md ${
                        alert.severity === "error"
                          ? "bg-red-50 text-red-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      <AlertTriangle size={16} aria-hidden="true" />
                      <span className="text-sm">{alert.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No alerts at this time.</p>
              )}
            </div>

            {/* Recent Elections Section */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                <Vote size={20} className="text-gray-500" aria-hidden="true" />
                <span>Recent Elections</span>
              </h2>
              <div className="space-y-4">
                {dashboardData.recentElections.map((election) => (
                  <div
                    key={election.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {election.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status:{" "}
                        <span
                          className={
                            election.status === "Ongoing"
                              ? "text-blue-600"
                              : election.status === "Completed"
                              ? "text-green-600"
                              : "text-gray-600"
                          }
                        >
                          {election.status}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Ends: {election.endDate}
                      </p>
                      <p className="text-sm text-gray-600">
                        Turnout: {election.turnout}%
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <a
                        href="/admin/results"
                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <BarChart size={16} aria-hidden="true" />
                        <span>View Results</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              {/* Turnout Trend Bar */}
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">Turnout Trend</p>
                <div className="flex space-x-2">
                  {dashboardData.recentElections.map((election) => (
                    <div key={election.id} className="flex-1">
                      <div
                        className="bg-blue-600 h-16 rounded-t"
                        style={{ height: `${election.turnout}px` }}
                      ></div>
                      <p className="text-xs text-gray-600 text-center mt-1 truncate">
                        {election.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminHome;
