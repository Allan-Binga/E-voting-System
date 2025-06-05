import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VoterRegister from "./pages/Register/VoterRegister";
import VoterLogin from "./pages/Login/VoterLogin"
import VoterHome from "./pages/Homes/VoterHome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/voter/registration" />} />
        <Route path="/voter/registration" element={<VoterRegister />} />
        <Route path="/voter/login" element={<VoterLogin/>}/>
        <Route path="/voter/home" element={<VoterHome/>}/>
      </Routes>

      {/* Global ToastContainer */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
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

export default App
