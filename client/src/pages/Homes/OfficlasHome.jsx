import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import AdminSidebar from "../../components/AdminSidebar";
import Spinner from "../../components/Spinner";
import {
  LayoutDashboard,
  Vote,
  Users,
  AlertTriangle,
  Plus,
  BarChart,
} from "lucide-react";
import axios from "axios";
import { endpoint } from "../../endpoint";

function AdminHome() {
  const [dashboardData, setDashboardData] = useState({
    activeElections: 0,
    totalVoters: 0,
    averageTurnout: 0,
    alerts: [],
    recentElections: [],
  });
  const [loading, setLoading] = useState(true);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const fetchElections = async () => {
    try {
      const response = await axios.get(`${endpoint}/election/get-elections`, {
        withCredentials: true,
      });
      const electionsData = response.data.elections || [];

      const normalizedElections = electionsData.map((election) => ({
        id: election.election_id || `temp-id-${Math.random()}`,
        title: election.title || "",
        status: election.status || "Upcoming",
        turnout: election.turnout || 0,
        endDate: formatDate(election.end_date),
      }));

      const activeElections = normalizedElections.filter(
        (election) => election.status === "Ongoing"
      ).length;

      const totalTurnout = normalizedElections.reduce(
        (sum, election) => sum + (election.turnout || 0),
        0
      );
      const averageTurnout =
        normalizedElections.length > 0
          ? Math.round(totalTurnout / normalizedElections.length)
          : 0;

      const recentElections = normalizedElections
        .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
        .slice(0, 5);

      return { activeElections, recentElections, averageTurnout };
    } catch (error) {
      console.error("Failed to fetch elections:", error.message);
      return { activeElections: 0, recentElections: [], averageTurnout: 0 };
    }
  };

  const fetchVoters = async () => {
    try {
      const response = await axios.get(`${endpoint}/users/voters`, {
        withCredentials: true,
      });

      const users = Array.isArray(response.data.users)
        ? response.data.users
        : [];
      const candidates = Array.isArray(response.data.candidates)
        ? response.data.candidates
        : [];

      const totalVoters = users.length + candidates.length;

      const alerts = [];
      const pendingVerificationUsers = users.filter(
        (user) => user.status !== "Active"
      );
      if (pendingVerificationUsers.length > 0) {
        alerts.push({
          id: `pending-${Math.random()}`,
          message: `${pendingVerificationUsers.length} voters pending verification`,
          severity: "error",
        });
      }

      return { totalVoters, alerts };
    } catch (error) {
      console.error("Failed to fetch voters:", error.message);
      return { totalVoters: 0, alerts: [] };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [electionsData, votersData] = await Promise.all([
          fetchElections(),
          fetchVoters(),
        ]);

        setDashboardData({
          activeElections: electionsData.activeElections,
          totalVoters: votersData.totalVoters,
          averageTurnout: electionsData.averageTurnout,
          alerts: votersData.alerts,
          recentElections: electionsData.recentElections,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 pt-20 flex-col md:flex-row">
        <div className="hidden sm:block">
          <AdminSidebar />
        </div>

        <main className="ml-0 md:ml-64 p-4 sm:p-6 flex-1">
          <div className="max-w-6xl mx-auto w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <LayoutDashboard size={24} className="text-gray-500" />
              <span>Admin Dashboard</span>
            </h1>

            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <Spinner size="medium" />
              </div>
            ) : (
              <>
                {/* Stats Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    {
                      title: "Active Elections",
                      count: dashboardData.activeElections,
                      icon: <Vote size={20} className="text-gray-500" />,
                      href: "/officials/elections",
                      link: "View Elections",
                    },
                    {
                      title: "Total Voters",
                      count: dashboardData.totalVoters,
                      icon: <Users size={20} className="text-gray-500" />,
                      href: "/officials/voters",
                      link: "Manage Voters",
                    },
                    {
                      title: "Average Turnout",
                      count: `${dashboardData.averageTurnout}%`,
                      icon: <BarChart size={20} className="text-gray-500" />,
                      href: "/officials/results",
                      link: "View Results",
                    },
                  ].map(({ title, count, icon, href, link }) => (
                    <div
                      key={title}
                      className="bg-white border border-gray-100 shadow-sm rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {icon}
                        <h2 className="text-sm font-medium text-gray-600">
                          {title}
                        </h2>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {count}
                      </p>
                      <a
                        href={href}
                        className="text-sm text-green-600 hover:text-green-800 mt-2 inline-block"
                      >
                        {link}
                      </a>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">
                    Quick Actions
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="/officials/elections"
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add Election</span>
                    </a>
                    <a
                      href="/officials/voters"
                      className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
                    >
                      <Users size={16} />
                      <span>Manage Voters</span>
                    </a>
                    <a
                      href="/officials/results"
                      className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors flex items-center space-x-2"
                    >
                      <BarChart size={16} />
                      <span>View Results</span>
                    </a>
                  </div>
                </div>

                {/* Alerts */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                    <AlertTriangle size={20} className="text-gray-500" />
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
                          <AlertTriangle size={16} />
                          <span className="text-sm">{alert.message}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No alerts at this time.
                    </p>
                  )}
                </div>

                {/* Recent Elections */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
                    <Vote size={20} className="text-gray-500" />
                    <span>Recent Elections</span>
                  </h2>
                  <div className="space-y-4">
                    {dashboardData.recentElections.map((election) => (
                      <div
                        key={election.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-gray-200 rounded-md hover:bg-green-50 transition-colors"
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
                                  ? "text-green-600"
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
                            className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 flex items-center space-x-1"
                          >
                            <BarChart size={16} />
                            <span>View Results</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Turnout Bar Chart */}
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-2">Turnout Trend</p>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {dashboardData.recentElections.map((election) => (
                        <div
                          key={election.id}
                          className="flex-1 min-w-[80px] max-w-[150px]"
                        >
                          <div
                            className="bg-green-600 rounded-t"
                            style={{
                              height: `${Math.min(election.turnout, 100)}px`,
                            }}
                          />
                          <p className="text-xs text-gray-600 text-center mt-1 truncate">
                            {election.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminHome;
