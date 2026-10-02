Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { orderId, email, customerName, items, total } = body as {
      orderId: string;
      email: string;
      customerName: string;
      items: Array<{ product_name: string; quantity: number; price: number }>;
      total: number;
    };

    if (!orderId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing orderId or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY");
    const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN");
    const mailgunFrom = Deno.env.get("MAILGUN_FROM") || `orders@${mailgunDomain}`;

    if (!mailgunApiKey || !mailgunDomain) {
      console.error("Mailgun credentials not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const itemsHtml = items
      .map(
        (item) =>
          `<tr><td style="padding:6px 0;">${item.product_name}</td><td style="padding:6px 0;text-align:center;">${item.quantity}</td><td style="padding:6px 0;text-align:right;">$${item.price.toFixed(2)}</td></tr>`
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
        <h1 style="color:#0f172a;">Order Confirmed!</h1>
        <p>Hi ${customerName},</p>
        <p>Thank you for your order. We've received it and are preparing it for shipment.</p>
        <p style="font-size:18px;"><strong>Order Number:</strong> ${orderId}</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="border-bottom:2px solid #e2e8f0;">
              <th style="text-align:left;padding:8px 0;">Product</th>
              <th style="text-align:center;padding:8px 0;">Qty</th>
              <th style="text-align:right;padding:8px 0;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <p style="font-size:20px;font-weight:bold;text-align:right;border-top:2px solid #e2e8f0;padding-top:12px;">
          Total: $${total.toFixed(2)}
        </p>
        <p style="color:#64748b;margin-top:24px;">Thank you for shopping with Shopflow!</p>
      </div>
    `;

    const formData = new FormData();
    formData.append("from", mailgunFrom);
    formData.append("to", email);
    formData.append("subject", `Order Confirmation — ${orderId}`);
    formData.append("html", html);

    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
        body: formData,
      }
    );

    if (!mailgunResponse.ok) {
      const errText = await mailgunResponse.text();
      console.error("Mailgun API error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
