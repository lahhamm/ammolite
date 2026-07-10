const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = { name: 200, email: 200, business: 200, message: 5000 };

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let name, email, business, message, website, startedAt;
  try {
    ({ name, email, business, message, website, startedAt } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  // honeypot: a hidden field real visitors never fill in
  if (website) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  // bots that fill and submit a form in well under a second are a strong signal
  if (typeof startedAt === "number" && Date.now() - startedAt < 1500) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  if (
    typeof name !== "string" || typeof email !== "string" || typeof message !== "string" ||
    (business !== undefined && typeof business !== "string")
  ) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid field types" }) };
  }

  name = name.trim();
  email = email.trim();
  message = message.trim();
  business = (business || "").trim();

  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }
  if (
    name.length > MAX_LEN.name || email.length > MAX_LEN.email ||
    business.length > MAX_LEN.business || message.length > MAX_LEN.message
  ) {
    return { statusCode: 400, body: JSON.stringify({ error: "Field too long" }) };
  }
  if (!EMAIL_RE.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid email" }) };
  }

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // swap to hello@yourdomain once the domain is verified in Resend
      from: "Ammolite Site <onboarding@resend.dev>",
      to: "lahhamadam00@gmail.com",
      reply_to: email,
      subject: `New project inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nBusiness: ${business || "—"}\n\n${message}`,
    }),
  });

  if (!resendRes.ok) {
    console.error("Resend error:", await resendRes.text());
    return { statusCode: 502, body: JSON.stringify({ error: "Failed to send" }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
