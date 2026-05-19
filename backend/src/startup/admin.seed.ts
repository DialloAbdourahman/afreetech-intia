import bcrypt from "bcryptjs";
import { Admin } from "../schemas/admin.schema";
import { logger } from "../utils/winston";

export async function ensureInitialAdmin(): Promise<void> {
  const existingCount = await Admin.countDocuments({}).exec();

  if (existingCount > 0) {
    logger.info("Admin user already exists, skipping initial admin seeding");
    return;
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    logger.error("ADMIN_EMAIL or ADMIN_PASSWORD is not set; cannot create initial admin user");
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = new Admin({
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    name: "Admin",
  });

  await admin.save();

  logger.info("Initial admin user created", { email: admin.email });
}
