import Navbar from "../../components/Navbar";
import CandidateSidebar from "../../components/CandidateSidebar";
import axios from "axios";
import { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import { endpoint } from "../../endpoint";

function CandidateApplication() {
  const [applicationData, setApplicationData] = useState({
    facultyRepresented: "",
    manifesto: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  //Get Positions
  const getPositions = async () => {
    try {
      const response = await axios.get(`${endpoint}/position/all-positions`, {
        withCredentials: true,
      });
    } catch (error) {}
  };

  //API for delegates application
  const applyDelegates = async () => {
    try {
      const response = await axios.post(
        `${endpoint}/applications/apply-delegates`,
        {
          withCredentials: true,
        }
      );
    } catch (error) {}
  };

  //API for executives applications
  const applyExecutives = async () => {
    try {
      const response = await axios.post(
        `${endpoint}/applications/apply-executive`,
        { withCredentials: true }
      );
    } catch (error) {}
  };

  return (
    <div>
      <Navbar />
      <CandidateSidebar />
    </div>
  );
}

export default CandidateApplication;
