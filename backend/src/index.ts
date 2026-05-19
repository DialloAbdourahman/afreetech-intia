import dotenv from "dotenv";
import app from "./app";
import { connectDatabase } from "./database";
import { ensureInitialAdmin } from "./startup/admin.seed";

dotenv.config();

const port = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectDatabase();

    await ensureInitialAdmin();

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start application", error);
    process.exit(1);
  }
}

bootstrap();
