import { resend } from "../../config/resend";

const ROLE_PERMISSIONS: Record<
    string,
    { label: string; permissions: string[] }
> = {
    purchases: {
        label: "Purchases",
        permissions: [
            "Create and edit purchase orders",
            "View order history",
            "Track order delivery status",
        ],
    },
    finance: {
        label: "Finance",
        permissions: [
            "Capture and register invoices",
            "Validate invoices",
            "Register payments",
            "View invoice status",
        ],
    },
    director: {
        label: "Director",
        permissions: [
            "View account statements",
            "View debt per supplier",
            "Approve or reject invoices",
            "View full financial dashboard",
        ],
    },
    admin: {
        label: "Administrator",
        permissions: [
            "Full access to purchase orders",
            "Full access to invoices and payments",
            "View account statements and financial dashboard",
            "Create and deactivate users",
            "Assign and change user roles",
        ],
    },
};

export class AuthEmail {
    static sendConfirmationEmail = async (
        email: string,
        role: string,
        name: string,
        password: string,
    ) => {
        try {
            const { data, error } = await resend.emails.send({
                from: `"MODULE_ERP" <${process.env.EMAIL_FROM}>`, //Cambiar esto por mi dominio verificado
                to: email,
                subject: `Welcome to MODULE_ERP ${name}`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #111827;">This account has been registered to MODULE_ERP</h2>
                    <p style="color: #6b7280;">Now you have access to the system, your role is ${role}</p>
                    <p style="color: #6b7280;">Your credentials are email: ${email} and password: ${password}</p>
                    <p style="color: #6b7280;">Access the next link to updated your password: </p>
                    
            
                    <p style="color: #6b7280; font-size: 12px;">If you have anny issues with your account, contact support at support@moduleerp.com</p>
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

    static sendDeactivationAccountEmail = async (
        email: string,
        name: string,
    ) => {
        try {
            const { data, error } = await resend.emails.send({
                from: `"MODULE_ERP" <${process.env.EMAIL_FROM}>`, //Cambiar esto por mi dominio verificado
                to: email,
                subject: `Dear ${name}`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #111827;">This account has been deactivated from MODULE_ERP</h2>
                    <p style="color: #6b7280;">You are not longer part of this org</p>
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

    static sendReactivationAccountEmail = async (
        email: string,
        name: string,
    ) => {
        try {
            const { data, error } = await resend.emails.send({
                from: `"MODULE_ERP" <${process.env.EMAIL_FROM}>`, //Cambiar esto por mi dominio verificado
                to: email,
                subject: `Hello again ${name}!`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #111827;">This account has been activated again to MODULE_ERP</h2>
                    <p style="color: #6b7280;">Welcome on board ${name}</p>
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

    static sendChangeUserRoleEmail = async (
        email: string,
        name: string,
        role: string,
    ) => {
        try {
            const roleInfo = ROLE_PERMISSIONS[role] ?? {
                label: role,
                permissions: [],
            };

            const permissionsHtml = roleInfo.permissions
                .map(
                    (permission) => `
        <li style="padding: 6px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
            <span style="color: #16a34a; font-weight: bold;">✓</span>
            ${permission}
        </li>
        `,
                )
                .join("");

            const { data, error } = await resend.emails.send({
                from: `"MODULE_ERP" <${process.env.EMAIL_FROM}>`,
                to: email,
                subject: `Your role has been updated — ${roleInfo.label}`,
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">

        <h2 style="color: #111827; margin-bottom: 4px;">Hi ${name},</h2>
        <p style="color: #6b7280; margin-top: 0;">Your role in the organization has been updated.</p>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px 20px; margin: 24px 0;">
        <p style="margin: 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">New role</p>
        <p style="margin: 4px 0 0; font-size: 20px; font-weight: 600; color: #111827;">${roleInfo.label}</p>
        </div>

        <p style="color: #374151; font-weight: 600; margin-bottom: 8px;">Your permissions:</p>
        <ul style="list-style: none; padding: 0; margin: 0;">
        ${permissionsHtml}
        </ul>

        <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">
        If you have questions about your access, contact your administrator.
        </p>
        </div>
        `,
            });

            if (error) {
                console.error("Error sending email: ", error);
                throw new Error("Failed to send email");
            }

            console.log("Email sent successfully: ", data?.id);
            return data;
        } catch (error) {
            console.log("Email error: ", error);
            throw error;
        }
    };
}
