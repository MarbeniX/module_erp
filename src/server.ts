import express from "express";
import "./config/env";
import { verifyMailConnection } from "./config/resend";
import { connectDB } from "./config/db";
import authAdminRoutes from "./routes/admin/auth.route";
import authRoutes from "./routes/auth.route";
import supplierRoutes from "./routes/supplier.route";
import productRoutes from "./routes/product.route";

verifyMailConnection();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/admin/auth", authAdminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/product", productRoutes);

export default app;
