import { Resend } from "resend";
import colors from "colors";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const verifyMailConnection = async () => {
    try {
        console.log(colors.green.bold("Resend API ready"));
    } catch (error) {
        console.log(colors.red.bold("Resend API connection failed"));
        console.error(error);
    }
};
