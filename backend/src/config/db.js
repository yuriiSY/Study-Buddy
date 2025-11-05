import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "mydb",
  password: "secret",
  port: 5432,
});

export default pool;
