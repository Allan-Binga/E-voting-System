const client = require("../config/db");
const {
  sendAdminApplicationApprovalEmail,
  sendCandidateApplicationEmail,
  sendApprovalOrRejectionEmail,
} = require("./emailService");

// Get Applications
const getApplications = async (req, res) => {
  try {
    // Applications Query
    const applicationQuery = "SELECT * FROM applications";
    const applicationResult = await client.query(applicationQuery);

    return res.status(200).json({
      message: "Applications retrieved successfully.",
      applications: applicationResult.rows,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Apply as a delegate
const applyDelegates = async (req, res) => {
  const candidateId = req.candidateId;
  const { facultyRepresented, manifesto } = req.body;

  if (!facultyRepresented || !manifesto) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 1. Get the candidate's actual faculty and email
    const facultyCheckQuery = `
      SELECT faculty, email FROM candidates WHERE candidate_id = $1
    `;
    const facultyResult = await client.query(facultyCheckQuery, [candidateId]);

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    const { faculty: actualFaculty, email: candidateEmail } =
      facultyResult.rows[0];

    // 2. Check if candidate is applying to represent the correct faculty
    if (actualFaculty !== facultyRepresented) {
      return res.status(403).json({
        message: "You cannot apply to represent a different faculty.",
      });
    }

    // 3. Check for existing application in the same faculty
    const checkQuery = `
      SELECT * FROM applications 
      WHERE candidate_id = $1 AND faculty_represented = $2
    `;
    const existingApplication = await client.query(checkQuery, [
      candidateId,
      facultyRepresented,
    ]);

    if (existingApplication.rows.length > 0) {
      return res.status(409).json({
        message: "You have already applied for this position.",
      });
    }

    // 4. Insert the application
    const insertQuery = `
      INSERT INTO applications 
      (candidate_id, position_contested, faculty_represented, manifesto, approval_status, submitted_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const values = [
      candidateId,
      "Delegate",
      facultyRepresented,
      manifesto,
      "Pending",
    ];
    await client.query(insertQuery, values);

    // 5. Decrease delegate positions by 1
    const updatePositionsQuery = `
      UPDATE positions
      SET delegates_positions = delegates_positions - 1
      WHERE id = 1 AND delegates_positions > 0
      RETURNING delegates_positions
    `;
    const updated = await client.query(updatePositionsQuery);

    if (updated.rowCount === 0) {
      return res.status(400).json({
        message: "No delegate positions left. Please try again later.",
      });
    }

    // Admin
    const adminQuery = `SELECT email FROM admins LIMIT 1`;
    const adminResult = await client.query(adminQuery);
    const adminEmail = adminResult.rows[0]?.email;

    // Send Emails - Parallel
    await Promise.all([
      sendCandidateApplicationEmail(candidateEmail),
      adminEmail ? sendAdminApplicationApprovalEmail(adminEmail) : null,
    ]);

    //Response
    res.status(201).json({
      message:
        "Application submitted successfully and awaiting review from the admins.",
    });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Apply as an executive
const applyExecutive = async (req, res) => {
  const candidateId = req.candidateId;
  const { facultyRepresented, executivePositionContested, manifesto } =
    req.body;

  if (!facultyRepresented || !executivePositionContested || !manifesto) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Allowed executive positions
    const allowedPositions = [
      "Chairperson",
      "Chairlady",
      "Secretary General",
      "Finance",
      "Education",
    ];

    // 1. Get the candidate's faculty
    const facultyCheckQuery = `SELECT faculty, email FROM candidates WHERE candidate_id = $1`;
    const facultyResult = await client.query(facultyCheckQuery, [candidateId]);

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    const { faculty: actualFaculty, email: candidateEmail } =
      facultyResult.rows[0];

    // 2. Validate faculty match
    if (actualFaculty !== facultyRepresented) {
      return res.status(403).json({
        message: "You cannot apply to represent a different faculty.",
      });
    }

    // 3. Check if position is valid
    if (!allowedPositions.includes(executivePositionContested)) {
      return res.status(400).json({
        message: "Invalid executive position selected.",
      });
    }

    // 4. Check if the executive position is already taken
    const takenQuery = `
      SELECT executive_position FROM applications 
      WHERE position_contested = 'Executive'
    `;
    const takenResult = await client.query(takenQuery);
    const takenPositions = takenResult.rows.map(
      (row) => row.executive_position
    );

    if (takenPositions.includes(executivePositionContested)) {
      return res.status(409).json({
        message: `${executivePositionContested} position is already taken. Please choose another.`,
      });
    }

    // 5. Check if all positions are filled
    if (takenPositions.length >= allowedPositions.length) {
      return res.status(400).json({
        message: "All positions are filled. Please try again soon.",
      });
    }

    // 6. Check for existing application by this candidate
    const checkQuery = `
      SELECT * FROM applications 
      WHERE candidate_id = $1 AND faculty_represented = $2
    `;
    const existingApplication = await client.query(checkQuery, [
      candidateId,
      facultyRepresented,
    ]);

    if (existingApplication.rows.length > 0) {
      return res.status(409).json({
        message: "You have already applied for this position.",
      });
    }

    // 7. Insert new application
    const insertQuery = `
      INSERT INTO applications 
      (candidate_id, position_contested, executive_position, faculty_represented, manifesto, approval_status, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const values = [
      candidateId,
      "Executive",
      executivePositionContested,
      facultyRepresented,
      manifesto,
      "Pending",
    ];
    await client.query(insertQuery, values);

    // 8. Decrease available executive positions
    const updatePositionsQuery = `
      UPDATE positions
      SET executive_positions = executive_positions - 1
      WHERE id = 1 AND executive_positions > 0
      RETURNING executive_positions
    `;
    const updated = await client.query(updatePositionsQuery);

    if (updated.rowCount === 0) {
      return res.status(400).json({
        message: "No executive positions left. Please try again later.",
      });
    }

    // 9. Notify admin and candidate
    const adminQuery = `SELECT email FROM admins LIMIT 1`;
    const adminResult = await client.query(adminQuery);
    const adminEmail = adminResult.rows[0]?.email;

    await Promise.all([
      sendCandidateApplicationEmail(candidateEmail),
      adminEmail ? sendAdminApplicationApprovalEmail(adminEmail) : null,
    ]);

    res.status(201).json({
      message:
        "Application submitted successfully and awaiting review from the admins.",
    });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve an Application
const approveApplication = async (req, res) => {
  const { candidateId } = req.body;

  try {
    // 1. Find candidate application
    const applicationQuery = `
      SELECT * FROM applications WHERE candidate_id = $1
    `;
    const applicationResult = await client.query(applicationQuery, [
      candidateId,
    ]);

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const application = applicationResult.rows[0];

    // 2. Check if already approved
    if (application.approval_status === "Approved") {
      return res.status(400).json({ message: "Candidate already approved" });
    }

    // 3. Approve the application
    const approveQuery = `
      UPDATE applications SET approval_status = 'Approved' WHERE candidate_id = $1
    `;
    await client.query(approveQuery, [candidateId]);

    // 4. Create ballot entry
    const ballotApprovalStatus = "Approved";
    const ballotQuery = `
      INSERT INTO ballot (candidate_id, total_votes, spoilt_votes, ballot_approval_status)
      VALUES ($1, $2, $3, $4)
      RETURNING ballot_approval_status
    `;
    const ballotResult = await client.query(ballotQuery, [
      candidateId,
      0, // total_votes
      0, // spoilt_votes
      ballotApprovalStatus,
    ]);

    const approvalStatus = ballotResult.rows[0].ballot_approval_status;

    // 5. Fetch candidate's email
    const emailQuery = `
      SELECT email FROM candidates WHERE candidate_id = $1
    `;
    const emailResult = await client.query(emailQuery, [candidateId]);

    if (emailResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate email not found" });
    }

    const email = emailResult.rows[0].email;

    // 6. Send email
    await sendApprovalOrRejectionEmail(email, approvalStatus);

    return res.status(200).json({
      message:
        "Candidate approved, ballot created, and email sent successfully.",
    });
  } catch (error) {
    console.error("Approval error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Reject an Application
const rejectApplication = async (req, res) => {
  const { candidateId } = req.body;

  try {
    // 1. Find candidate application
    const applicationQuery = `
      SELECT * FROM applications WHERE candidate_id = $1
    `;
    const applicationResult = await client.query(applicationQuery, [
      candidateId,
    ]);

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const application = applicationResult.rows[0];

    // 2. Check if already rejected
    if (application.approval_status === "Rejected") {
      return res.status(400).json({ message: "Candidate already rejected" });
    }

    // 3. Reject the application
    const rejectQuery = `
      UPDATE applications SET approval_status = 'Rejected' WHERE candidate_id = $1
    `;
    await client.query(rejectQuery, [candidateId]);

    // 4. Fetch candidate's email
    const emailQuery = `
      SELECT email FROM candidates WHERE candidate_id = $1
    `;
    const emailResult = await client.query(emailQuery, [candidateId]);

    if (emailResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate email not found" });
    }

    const email = emailResult.rows[0].email;

    // 5. Send rejection email
    await sendApprovalOrRejectionEmail(email, "Rejected");

    return res.status(200).json({
      message: "Candidate rejected and email sent successfully.",
    });
  } catch (error) {
    console.error("Rejection error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getApplications,
  applyDelegates,
  applyExecutive,
  approveApplication,
  rejectApplication,
};
