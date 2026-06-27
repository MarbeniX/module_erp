import express from "express";
import "./config/env";
import { verifyMailConnection } from "./config/resend";
import { connectDB } from "./config/db";

verifyMailConnection();
connectDB();

const app = express();
app.use(express.json());

export default app;
