import emailjs from "@emailjs/nodejs";

const emailServiceID = process.env.EMAILJS_SERVICE_ID;
const emailTemplateID = process.env.EMAILJS_TEMPLATE_ID;
const emailPrivateKey = process.env.EMAILJS_PRIVATE_KEY;


emailjs.init({
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});


export const sendConfirmationEmail = async (params) => {
  try {
    const response = await emailjs.send(
      emailServiceID,
      emailTemplateID,
      params
    );
    console.log("EmailJS status:", response.status);
    return response;
  } catch (error) {
    console.error("EmailJS failed:", error);
    throw error;
  }
};