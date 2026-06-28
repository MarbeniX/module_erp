import { resend } from "../config/resend";

export class AuthEmail {
    static sendChangePasswordEmail = async (email: string, name: string) => {
        try {
            const { data, error } = await resend.emails.send({
                from: `"MODULE_ERP" <${process.env.EMAIL_FROM}>`, //Cambiar esto por mi dominio verificado
                to: email,
                subject: `Password change`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #111827;">Yous password has changed</h2>
                        <p style="color: #6b7280;">If you did not make this action, contact your provider as soon as possible </p>
                </div>
            `,
            });
            if (error) {
                console.error("Error sending email: ", error);
                throw new Error("Failed to send email");
            }
            console.log("Email send successfully: ", data?.id);
            return data;
        } catch (error) {
            console.log("Email error: ", error);
            throw error;
        }
    };
}
