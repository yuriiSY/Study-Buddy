import "dotenv/config";
import app from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});