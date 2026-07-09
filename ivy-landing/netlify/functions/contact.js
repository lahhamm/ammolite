exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let name, email, business, message;
  try {
    ({ name, email, business, message } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
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
