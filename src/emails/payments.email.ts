import { resend } from "../config/resend";

export class PaymentEmail {
    static sendInvoiceFullyPaidEmail = async (
        email: string,
        name: string,
        invoiceId: string,
        invoiceTotal: number,
        currency: string,
    ) => {
        try {
            const { data, error } = await resend.emails.send({
                from: `"MODULE_ERP" <${process.env.EMAIL_FROM}>`,
                to: email,
                subject: `Invoice fully paid — ${currency} ${invoiceTotal.toFixed(2)}`,
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827; margin-bottom: 4px;">Hi ${name},</h2>
          <p style="color: #6b7280; margin-top: 0;">An invoice has been fully settled.</p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px 20px; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #15803d; text-transform: uppercase; letter-spacing: 0.05em;">Total paid</p>
            <p style="margin: 4px 0 0; font-size: 24px; font-weight: 600; color: #14532d;">${currency} ${invoiceTotal.toFixed(2)}</p>
          </div>

          <p style="font-size: 13px; color: #6b7280;">
            Invoice ID: <span style="font-family: monospace; color: #374151;">${invoiceId}</span>
          </p>

          <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">
            You can review the full payment breakdown in the ERP system.
          </p>
        </div>
      `,
            });

            if (error) throw new Error("Failed to send invoice paid email");
            return data;
        } catch (error) {
            console.error("Email error:", error);
            throw error;
        }
    };
}
