# 🗳️ E-Voting System

A secure, cloud-deployed electronic voting system built with PostgreSQL for transparent, efficient, and verifiable elections. Registered users can cast votes for candidates in specific elections, with OTP-based verification for added security.

---

## 📌 Features

- **🧾 Voter Registration & Authentication**
- **🗳️ Secure Voting Process**
- **👤 Candidate Management**
- **📈 Vote Counting & Result Reporting**
- **📨 OTP-Based Voter Verification**
- **📬 Winner Notification System**
- **🕓 Time-Restricted Voting Windows**
- **🛡️ Role-Based Access Control**

---

## ⚙️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | Node.js / Django / Express (choose your stack)  |
| Database   | PostgreSQL (Heroku-hosted)                      |
| Deployment | Heroku                                          |
| Admin Tool | pgAdmin4                                        |
| Auth       | JWT / Sessions / OTP                            |
| Tools      | Sequelize / Prisma / SQLAlchemy (if using ORM)  |

---

## 🧩 Database Schema Overview

**Tables:**

- `users`: Stores registered voters.
- `candidates`: Candidate profiles.
- `elections`: Election metadata (title, date, status).
- `ballot`: Record of votes cast in each election.
- `votes`: Individual vote records.
- `results`: Total vote count per candidate per election.
- `otps`: Tracks OTP codes sent to users for verification.

All tables are relational with foreign key constraints and time zone-aware timestamps.

---

## 🚀 Getting Started

1. **Clone the Repository**
    ```bash
    git clone git@github.com:Allan-Binga/E-voting-System.git
    cd e-voting-system
    ```

2. **Install Dependencies**
    ```bash
    npm install
    # or
    pip install -r requirements.txt
    ```

3. **Set Up Environment Variables**

    Create a `.env` file and add:
    ```env
    DATABASE_URL=your-heroku-postgres-connection-url
    JWT_SECRET=your-jwt-secret
    OTP_EXPIRY_MINUTES=5
    EMAIL_SERVICE_API_KEY=your-key
    ```

4. **Connect to PostgreSQL via pgAdmin4**

    Use your Heroku Postgres credentials to manage your schema and data locally via pgAdmin.

---

## 📋 Usage

- Register & Login
- Request OTP → Verify Email
- Cast Vote (one vote per election per user)

**Admins can:**
- Create elections
- Add candidates
- View results
- Send winner notification email

---

## 📊 Result Logic

Vote totals are calculated by aggregating records from the `votes` table grouped by `election_id` and `candidate_id`. Results are stored in the `results` table once computed.

---

## 🔒 Security Measures

- OTP validation before voting
- Timestamp logging for all actions
- Unique constraints to prevent double voting
- Foreign key constraints to ensure referential integrity

---

## 🧪 Testing

Use Postman or cURL to test the API endpoints. Sample test users and election data can be seeded from SQL scripts or JSON fixtures.

---

## 🌍 Deployment

The application is deployed to Heroku, with PostgreSQL as the managed database.

---

## 📚 License

This project is licensed under the MIT License. Feel free to use, contribute, and adapt it.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you would like to change.

---

## 📧 Contact

For questions, reach out at [evotingsystem323@gmail.com](evotingsystem323@gmail.com) or open an issue on GitHub.