import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Helper to send an email via SendGrid
async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      // deno-lint-ignore no-undef
      "Authorization": `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "bearbites@asuc.org" }, // your verified sender
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });
  return res.status === 202;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { club_name, food_type, building, room, available_until } = await req.json();
    // deno-lint-ignore no-undef
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // deno-lint-ignore no-undef
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const res = await fetch(`${supabaseUrl}/rest/v1/subscribers?select=email`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    });
    if (!res.ok) {
      return new Response("Failed to fetch subscribers", {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
    const subscribers = await res.json();
    const subject = "New Food Alert on BearBites!";
    const html = `
      <strong>${club_name}</strong> just posted a new food alert:<br>
      <ul>
        <li><b>Food:</b> ${food_type}</li>
        <li><b>Location:</b> ${building}, Room ${room}</li>
        <li><b>Available until:</b> ${available_until}</li>
      </ul>
      <br>
      <a href="http://YOUR_IP_ADDRESS:8080/">View all alerts</a>
    `;
    let sent = 0;
    for (const sub of subscribers) {
      if (await sendEmail(sub.email, subject, html)) sent++;
    }
    return new Response(`Sent to ${sent} subscribers`, {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(`Internal error: ${err}`, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});