const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const electionRoute = require("./routes/election");
const candidateRoute = require("./routes/candidates");
const facultyRoute = require("./routes/faculty");
const verificationRoute = require("./routes/verify");
const applicationRoute = require("./routes/application");
const voteRoute = require("./routes/vote");
const ballotRoute = require("./routes/ballot");
const positionsRoute = require("./routes/positions");
const usersRoute = require("./routes/users");
const profileRoute = require("./routes/profile");
const votersRoute = require("./routes/voters");
const resultsRoute = require("./routes/results");

//Import PG
require("./config/db");

dotenv.config();

const app = express();

//JSON
app.use(express.json());

//CORS implementation
const allowedOrigins = [
  "http://localhost:5173",
  "https://e-voting-system-9ee3a91d16bb.herokuapp.com",
];

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
app.use("/e-voting-system/v1/applications", applicationRoute);
app.use("/e-voting-system/v1/vote", voteRoute);
app.use("/e-voting-system/v1/ballot", ballotRoute);
app.use("/e-voting-system/v1/position", positionsRoute);
app.use("/e-voting-system/v1/users", usersRoute);
app.use("/e-voting-system/v1/profiles", profileRoute);
app.use("/e-voting-system/v1/voters", votersRoute);
app.use("/e-voting-system/v1/results", resultsRoute);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "client", "dist");
  app.use(express.static(clientDistPath));

  // Fallback for frontend routes
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/e-voting")) {
      res.sendFile(path.join(clientDistPath, "index.html"));
    } else {
      next();
    }
  });
}

// Start the server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 6300;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
