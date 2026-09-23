import "dotenv/config";
import app from "./app.js";
import "./seed.js";

const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`LLD Forge API running at http://localhost:${port}`);
});
