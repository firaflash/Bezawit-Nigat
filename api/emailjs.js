export const sendConfirmationEmail = async (templateParams) => {
  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_USER_ID,
    template_params: templateParams,
    accessToken: process.env.EMAILJS_PRIVATE_KEY
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const text = await res.text();   // "OK"
      console.log('EmailJS REST →', res.status, text);
      return { success: true, text };
    } else {
      const err = await res.text();
      throw new Error(`EmailJS ${res.status}: ${err}`);
    }
  } catch (err) {
    console.error('EmailJS REST failed:', err.message);
    throw err;
  }
};