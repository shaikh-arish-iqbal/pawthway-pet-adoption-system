import emailjs from '@emailjs/browser';

// Initialize EmailJS (you'll need to set these in your .env file)
// Get your service ID, template ID, and public key from https://www.emailjs.com
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID_ACCEPTED = import.meta.env.VITE_EMAILJS_TEMPLATE_ACCEPTED;
const TEMPLATE_ID_REJECTED = import.meta.env.VITE_EMAILJS_TEMPLATE_REJECTED;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Check if EmailJS is configured
const isEmailJSConfigured = () => {
  return SERVICE_ID && 
         TEMPLATE_ID_ACCEPTED && 
         TEMPLATE_ID_REJECTED && 
         PUBLIC_KEY &&
         SERVICE_ID !== 'your_service_id' &&
         TEMPLATE_ID_ACCEPTED !== 'your_template_id_accepted' &&
         TEMPLATE_ID_REJECTED !== 'your_template_id_rejected' &&
         PUBLIC_KEY !== 'your_public_key';
};

/**
 * Send adoption acceptance email
 */
export const sendAdoptionAcceptedEmail = async (userEmail, userName, petName, shelterInfo) => {
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS is not configured. Please set up EmailJS environment variables.');
    return { success: false, error: 'EmailJS not configured' };
  }

  try {
    // Initialize EmailJS
    emailjs.init(PUBLIC_KEY);

    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      pet_name: petName,
      shelter_name: shelterInfo.shelterName || 'The Shelter',
      shelter_email: shelterInfo.contactEmail || 'Not provided',
      shelter_phone: shelterInfo.contactPhone || 'Not provided',
      shelter_location: shelterInfo.location || 'Not provided',
      shelter_website: shelterInfo.website || 'Not provided',
      message: `Congratulations! Your adoption application for ${petName} has been approved. Please contact the shelter using the details provided below to proceed with the adoption process.`,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_ACCEPTED,
      templateParams,
      PUBLIC_KEY
    );

    return { success: true, response };
  } catch (error) {
    console.error('Error sending acceptance email:', error);
    return { success: false, error: error.message || error };
  }
};

/**
 * Send adoption rejection email
 */
export const sendAdoptionRejectedEmail = async (userEmail, userName, petName, shelterInfo) => {
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS is not configured. Please set up EmailJS environment variables.');
    return { success: false, error: 'EmailJS not configured' };
  }

  try {
    // Initialize EmailJS
    emailjs.init(PUBLIC_KEY);

    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      pet_name: petName,
      shelter_name: shelterInfo.shelterName || 'The Shelter',
      shelter_email: shelterInfo.contactEmail || 'Not provided',
      shelter_phone: shelterInfo.contactPhone || 'Not provided',
      shelter_location: shelterInfo.location || 'Not provided',
      shelter_website: shelterInfo.website || 'Not provided',
      message: `We regret to inform you that your adoption application for ${petName} has not been approved at this time. We encourage you to explore other pets available for adoption.`,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_REJECTED,
      templateParams,
      PUBLIC_KEY
    );

    return { success: true, response };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error: error.message || error };
  }
};

