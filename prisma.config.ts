import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";

dotenv.config();
const envFile =
    process.env.NODE_ENV === "production"
        ? ".env.production"
        : ".env.development";

dotenv.config({ path: envFile });
export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: env("DATABASE_BASE_URL"),
    },
});
