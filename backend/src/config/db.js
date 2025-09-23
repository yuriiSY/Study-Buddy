import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "admin",
  host: "localhost", // if running Node outside Docker
  database: "mydb",
  password: "secret",
  port: 5432,
});

export default pool;
