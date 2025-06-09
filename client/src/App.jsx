import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VoterRegister from "./pages/Register/VoterRegister";
import VoterLogin from "./pages/Login/VoterLogin";
import VoterHome from "./pages/Homes/VoterHome";
import CandidateRegister from "./pages/Register/CandidateRegister";
import LoginCandidate from "./pages/Login/CandidateLogin";
import CandidateHome from "./pages/Homes/CandidateHome";
import CandidateApplication from "./pages/Applications/CandidateApplication";
import AdminRegister from "./pages/Register/AdminRegister";
import AdminLogin from "./pages/Login/AdminLogin";
import AdminHome from "./pages/Homes/OfficlasHome";
import VoteNow from "./pages/Vote/VoteNow";
import ElectionResult from "./pages/Results/ElectionResults";
import VoterProfile from "./pages/Profiles/VoterProfile";
import AdminResults from "./pages/Results/AdminResults";
import Election from "./pages/Elections/Election";
import Voters from "./pages/Voters/Voters";
import Candidates from "./pages/Candidates/Candidates";
import VerifyEmailUser from "./pages/VerifyEmail/User";
import VerifyEmailAdmin from "./pages/VerifyEmail/Admin";
import VerifyEmailCandidate from "./pages/VerifyEmail/Candidate";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/voter/registration" />} />
        <Route path="/voter/registration" element={<VoterRegister />} />
        <Route path="/voter/login" element={<VoterLogin />} />
        <Route path="/voter/home" element={<VoterHome />} />
        <Route path="/candidate/registration" element={<CandidateRegister />} />
        <Route path="/candidate/login" element={<LoginCandidate />} />
        <Route path="/candidate/home" element={<CandidateHome />} />
        <Route path="/application/apply" element={<CandidateApplication/>}/>
        <Route path="/officials/registration" element={<AdminRegister />} />
        <Route path="/officials/login" element={<AdminLogin />} />
        <Route path="/officials/home" element={<AdminHome />} />
        <Route path="/vote-now" element={<VoteNow />} />
        <Route path="/results" element={<ElectionResult />} />
        <Route path="/voter-profile" element={<VoterProfile />} />
        <Route path="/admin-results" element={<AdminResults />} />
        <Route path="/elections" element={<Election />} />
        <Route path="/voters" element={<Voters/>}/>
        <Route path="/candidates" element={<Candidates/>}/>
        <Route path="/user/verify-email" element={<VerifyEmailUser/>}/>
        <Route path="/official/verify-email" element={<VerifyEmailAdmin/>}/>
        <Route path="/candidate/verify-email" element={<VerifyEmailCandidate/>}/>
      </Routes>

      {/* Global ToastContainer */}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        transition={Slide}
      />
    </Router>
  );
}

export default App;
