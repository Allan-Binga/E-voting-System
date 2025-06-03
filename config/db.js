const {Client} = require("pg")
const dotenv = require("dotenv")

dotenv.config()

let client;

if (process.env.DATABASE_URL) {
  //Production Mode
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  //Local/Dev Mode
  client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

client
  .connect()
  .then(() => console.log("Database connected successfully."))
  .catch((error) => console.log("Something is definitely wrong.", error));

module.exports = client;