# EmailJS Setup Guide

This guide will help you set up EmailJS to send adoption status notifications to users.

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Sign up for a free account (100 emails/month free)
3. Verify your email address

## Step 2: Add Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Copy your **Service ID** (you'll need this later)

## Step 3: Create Email Templates

### Template 1: Adoption Accepted

1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Use the following template:

**Subject:** Congratulations! Your Adoption Application Has Been Approved

**Body (HTML):**

```html
<h2>Congratulations, {{to_name}}!</h2>

<p>
  We're excited to inform you that your adoption application for
  <strong>{{pet_name}}</strong> has been approved!
</p>

<p>
  Please contact the shelter using the following details to proceed with the
  adoption:
</p>

<div
  style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;"
>
  <h3>Shelter Contact Information</h3>
  <p><strong>Shelter Name:</strong> {{shelter_name}}</p>
  <p><strong>Email:</strong> {{shelter_email}}</p>
  <p><strong>Phone:</strong> {{shelter_phone}}</p>
  <p><strong>Location:</strong> {{shelter_location}}</p>
  {{#shelter_website}}
  <p>
    <strong>Website:</strong>
    <a href="{{shelter_website}}">{{shelter_website}}</a>
  </p>
  {{/shelter_website}}
</div>

<p>{{message}}</p>

<p>Thank you for choosing to adopt through our platform!</p>

<p>
  Best regards,<br />
  The Pawthway Team
</p>
```

4. Save the template and copy the **Template ID**

### Template 2: Adoption Rejected

1. Create another template
2. Use the following template:

**Subject:** Update on Your Adoption Application

**Body (HTML):**

```html
<h2>Dear {{to_name}},</h2>

<p>
  We regret to inform you that your adoption application for
  <strong>{{pet_name}}</strong> has not been approved at this time.
</p>

<p>{{message}}</p>

<p>
  We encourage you to explore other wonderful pets available for adoption on our
  platform.
</p>

<div
  style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;"
>
  <h3>Shelter Contact Information</h3>
  <p>If you have any questions, please contact:</p>
  <p><strong>Shelter Name:</strong> {{shelter_name}}</p>
  <p><strong>Email:</strong> {{shelter_email}}</p>
  <p><strong>Phone:</strong> {{shelter_phone}}</p>
  <p><strong>Location:</strong> {{shelter_location}}</p>
  {{#shelter_website}}
  <p>
    <strong>Website:</strong>
    <a href="{{shelter_website}}">{{shelter_website}}</a>
  </p>
  {{/shelter_website}}
</div>

<p>Thank you for your interest in pet adoption!</p>

<p>
  Best regards,<br />
  The Pawthway Team
</p>
```

3. Save the template and copy the **Template ID**

## Step 4: Get Your Public Key

1. Go to **Account** → **General** in EmailJS dashboard
2. Find your **Public Key** (also called API Key)
3. Copy it

## Step 5: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add the following variables:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ACCEPTED=your_accepted_template_id_here
VITE_EMAILJS_TEMPLATE_REJECTED=your_rejected_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

3. Replace the placeholder values with your actual IDs and keys from EmailJS
4. **Important:** Never commit your `.env` file to version control. It should already be in `.gitignore`

## Step 6: Restart Your Development Server

After adding the environment variables, restart your Vite development server:

```bash
npm run dev
```

## Testing

1. Go to the Admin Dashboard
2. Open an adoption request
3. Click "Accept" or "Reject"
4. Check the user's email inbox for the notification

## Troubleshooting

- **Emails not sending:** Check browser console for errors
- **Template variables not working:** Make sure variable names match exactly (case-sensitive)
- **Service not found:** Verify your Service ID is correct
- **Rate limit:** Free tier allows 100 emails/month. Upgrade if needed.

## Notes

- The free tier includes 100 emails per month
- For production, consider upgrading to a paid plan
- EmailJS doesn't require backend setup - it works entirely client-side
- All email sending happens from the browser, so it uses your EmailJS account quota
