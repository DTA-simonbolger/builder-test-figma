const DEFAULT_RECIPIENT = "contact@deltatango.com.au";
const MAX_FIELD_LENGTH = 4000;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

const cleanValue = (value) => String(value || "").trim().slice(0, MAX_FIELD_LENGTH);

const escapeHtml = (value) => cleanValue(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const getFormValue = (formData, name) => cleanValue(formData.get(name));

const buildRows = (fields) => fields
  .filter(([, value]) => value)
  .map(([label, value]) => `
    <tr>
      <th align="left" style="padding:8px 12px;border-bottom:1px solid #e5e7eb;background:#f9fafb;width:180px;">${escapeHtml(label)}</th>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(value).replace(/\n/g, "<br>")}</td>
    </tr>
  `)
  .join("");

const buildPlainText = (fields) => fields
  .filter(([, value]) => value)
  .map(([label, value]) => `${label}: ${value}`)
  .join("\n");

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("application/x-www-form-urlencoded") && !contentType.includes("multipart/form-data")) {
    return json({ error: "Unsupported form submission." }, 415);
  }

  const formData = await request.formData();

  if (getFormValue(formData, "Website")) {
    return json({ ok: true });
  }

  const firstName = getFormValue(formData, "First name");
  const lastName = getFormValue(formData, "Last name");
  const email = getFormValue(formData, "Email");
  const message = getFormValue(formData, "Message");
  const consent = getFormValue(formData, "Consent");

  if (!firstName || !lastName || !email || !consent) {
    return json({ error: "Please complete the required fields." }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  const sourcePage = getFormValue(formData, "Source page") || "Website enquiry";
  const fields = [
    ["Source page", sourcePage],
    ["First name", firstName],
    ["Last name", lastName],
    ["Email", email],
    ["Phone", getFormValue(formData, "Phone")],
    ["Organisation", getFormValue(formData, "Organisation")],
    ["Service of interest", getFormValue(formData, "Service of interest")],
    ["Message", message],
    ["Consent", consent]
  ];

  const apiKey = env.RESEND_API_KEY;
  const from = env.ENQUIRY_FROM_EMAIL;
  const to = env.ENQUIRY_TO_EMAIL || DEFAULT_RECIPIENT;

  if (!apiKey || !from) {
    return json({ error: "Email delivery is not configured." }, 500);
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const subject = `Website enquiry from ${fullName}`;
  const plainText = buildPlainText(fields);
  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h1 style="font-size:20px;margin:0 0 16px;">New website enquiry</h1>
      <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;width:100%;max-width:720px;">
        ${buildRows(fields)}
      </table>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject,
      text: plainText,
      html
    })
  });

  if (!response.ok) {
    return json({ error: "The enquiry could not be sent. Please email contact@deltatango.com.au directly." }, 502);
  }

  return json({ ok: true });
}
