import colors from "colors";
import { prisma } from "../lib/prisma";

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log(colors.cyan.bold("Db connected"));
    } catch (error) {
        console.error(
            colors.red.bold(`Error on DB connection: ${error.message}`),
        );
        process.exit(1);
    }
};
