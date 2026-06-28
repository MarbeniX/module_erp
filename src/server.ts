import express from "express";
import "./config/env";
import { verifyMailConnection } from "./config/resend";
import { connectDB } from "./config/db";
import authAdminRoutes from "./routes/admin/auth.route";

verifyMailConnection();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/admin/auth/", authAdminRoutes);

export default app;
