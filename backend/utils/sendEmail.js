const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.SENDGRID_MAIL;

    // Email is optional for local/demo deployments.
    if (!apiKey || !from || !options?.email || !options?.templateId) {
        console.log("Email skipped: SendGrid is not configured.");
        return;
    }

    sgMail.setApiKey(apiKey);

    const msg = {
        to: options.email,
        from,
        templateId: options.templateId,
        dynamic_template_data: options.data || {},
    };

    await sgMail.send(msg);
};

module.exports = sendEmail;
