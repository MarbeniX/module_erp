import dotenv from "dotenv";
import colors from "colors";

const env = process.env.NODE_ENV || "development";

dotenv.config({
    path: `.env.${env}`,
});

console.log(colors.blue.bold(`Running in ${env} mode`));
