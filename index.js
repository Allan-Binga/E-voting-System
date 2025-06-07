const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const electionRoute = require("./routes/election");
const candidateRoute = require("./routes/candidates");
const facultyRoute = require("./routes/faculty");
const positionsRoute = require("./routes/positions");
const verificationRoute = require("./routes/verify");

//Import PG
require("./config/db");

dotenv.config();

const app = express();

//JSON
app.use(express.json());

//CORS implementation
const allowedOrigins = ["http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS!"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

//Cookie Parser
app.use(cookieParser());

//Route
app.use("/e-voting-system/v1/auth/users", authRoute);
app.use("/e-voting-system/v1/auth/verification", verificationRoute);
app.use("/e-voting-system/v1/election", electionRoute);
app.use("/e-voting-system/v1/candidates", candidateRoute);
app.use("/e-voting-system/v1/faculty", facultyRoute);
app.use("/e-voting-system/v1/position", positionsRoute);

// Start the server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 6300;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
