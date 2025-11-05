import emailjs from "@emailjs/nodejs";

const emailServiceID = process.env.EMAILJS_SERVICE_ID;
const emailTemplateID = process.env.EMAILJS_TEMPLATE_ID;
const emailPublicKey = process.env.EMAILJS_USER_ID;


export const sendConfirmationEmail = async (params) => {
  try {
    const response = await emailjs.send(
      emailServiceID,
      emailTemplateID,
    { 
        publicKey: emailPublicKey 
    },
      params
    );
    console.log("EmailJS status:", response.status);
  } catch (error) {
    console.error("EmailJS failed:", error);
    throw error;
  }
};
