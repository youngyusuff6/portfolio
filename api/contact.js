const SENDLIB_URL = 'https://sendlib.samueltuoyo.com/api/send';
const CONTACT_EMAIL = process.env.CONTACT_TO || 'youngyusuff006@gmail.com';
const FROM_EMAIL = 'youngyusuff6@gmail.com';

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[character]);
}

module.exports = async function contactHandler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.SENDLIB_API_KEY) {
    return response.status(503).json({ error: 'The contact form is not configured yet.' });
  }

  const name = clean(request.body?.name, 100);
  const email = clean(request.body?.email, 160);
  const subject = clean(request.body?.subject, 160);
  const message = clean(request.body?.message, 5000);
  const company = clean(request.body?.company, 100);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (company) return response.status(200).json({ ok: true });
  if (!name || !emailPattern.test(email) || !subject || !message) {
    return response.status(400).json({ error: 'Please complete every field with a valid email.' });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  try {
    const sendlibResponse = await fetch(SENDLIB_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDLIB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `"Yusuff AbdulHameed — Portfolio" <${FROM_EMAIL}>`,
        to: CONTACT_EMAIL,
        subject: `Portfolio enquiry: ${subject}`,
        html: `<h2>New portfolio enquiry</h2><p><strong>From:</strong> ${safeName} (${safeEmail})</p><p><strong>Subject:</strong> ${safeSubject}</p><hr><p>${safeMessage}</p>`,
        replyTo: email
      })
    });

    const sendlibResult = await sendlibResponse.json().catch(() => null);

    if (!sendlibResponse.ok || sendlibResult?.success !== true) {
      console.error('Sendlib request failed', sendlibResponse.status, sendlibResult?.message || 'Unknown error');
      return response.status(502).json({ error: 'Your message could not be sent. Please email me directly.' });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form error', error);
    return response.status(500).json({ error: 'Your message could not be sent. Please email me directly.' });
  }
};
