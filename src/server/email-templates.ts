import { formatPrice } from "@/lib/money";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const BRAND = "Z2R Herbal";
const TAGLINE = "Natural Care, Better Life.";
const C = {
  page: "#f4eee4",
  card: "#ffffff",
  ink: "#10221a",
  muted: "#55625a",
  line: "#e7dccb",
  forest: "#0f4a1e",
  forestDark: "#062b12",
  lime: "#c6ec2e",
  soft: "#f8f4ec",
};
const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "Arial,Helvetica,sans-serif";

const esc = (value: string | number | undefined | null) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export const formatPkTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("en-PK", {
        timeZone: "Asia/Karachi",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
};

function shell({
  preheader,
  label,
  heading,
  body,
  accent = C.forest,
}: {
  preheader: string;
  label: string;
  heading: string;
  body: string;
  accent?: string;
}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${esc(heading)}</title>
<style>@media (max-width:620px){.card{padding:28px 20px!important}.h1{font-size:24px!important}.stack td{display:block!important;width:100%!important;text-align:left!important}}</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr><td align="center" style="padding:6px 0 18px;">
      <img src="cid:z2r-logo" width="58" height="76" alt="${esc(BRAND)}" style="display:block;border:0;">
    </td></tr>
    <tr><td style="background:${accent};height:6px;border-radius:14px 14px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td class="card" style="background:${C.card};padding:36px 40px;border-radius:0 0 14px 14px;border:1px solid ${C.line};border-top:0;">
      <p style="margin:0 0 10px;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${C.forest};">${esc(label)}</p>
      <h1 class="h1" style="margin:0 0 18px;font-family:${SERIF};font-size:28px;line-height:1.25;font-weight:bold;color:${C.ink};">${esc(heading)}</h1>
      ${body}
    </td></tr>
    <tr><td align="center" style="padding:22px 10px 6px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};">
      <strong style="color:${C.forest};">${esc(BRAND)}</strong> &nbsp;·&nbsp; ${esc(TAGLINE)}
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

const p = (html: string, extra = "") =>
  `<p style="margin:0 0 14px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};${extra}">${html}</p>`;

const subheading = (text: string) =>
  `<p style="margin:26px 0 10px;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;color:${C.forest};">${esc(text)}</p>`;

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 8px;"><tr>
<td style="background:${C.lime};border-radius:999px;">
<a href="${esc(href)}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:bold;color:${C.forestDark};text-decoration:none;">${esc(label)}</a>
</td></tr></table>`;
}

function facts(rows: [string, string | undefined][]) {
  const shown = rows.filter((r): r is [string, string] => Boolean(r[1]));
  if (shown.length === 0) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};border:1px solid ${C.line};border-radius:12px;">
${shown
  .map(
    ([k, v], i) => `<tr class="stack">
<td style="padding:11px 16px;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${SANS};font-size:13px;color:${C.muted};width:38%;vertical-align:top;">${esc(k)}</td>
<td style="padding:11px 16px;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${SANS};font-size:14px;color:${C.ink};font-weight:bold;vertical-align:top;">${esc(v).replace(/\n/g, "<br>")}</td>
</tr>`,
  )
  .join("")}
</table>`;
}

const quote = (text: string) =>
  `<div style="margin:0;padding:16px 18px;background:${C.soft};border-left:4px solid ${C.forest};border-radius:8px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">${esc(text).replace(/\n/g, "<br>")}</div>`;

export interface OrderEmailData {
  number: string;
  placedAt: string;
  status?: string;
  paymentMethod?: string;
  items: { name: string; variantLabel?: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  total?: number;
  shippingAddress?: string;
  note?: string;
  customer: { name: string; email?: string; phone?: string };
}

function itemsTable(order: OrderEmailData) {
  if (order.items.length === 0) return "";
  const rows = order.items
    .map(
      (i) => `<tr>
<td style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.ink};">
<strong>${esc(i.name)}</strong>${i.variantLabel ? `<br><span style="color:${C.muted};font-size:13px;">${esc(i.variantLabel)}</span>` : ""}
<br><span style="color:${C.muted};font-size:13px;">${esc(i.quantity)} × ${esc(formatPrice(i.unitPrice))}</span></td>
<td align="right" style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;font-weight:bold;color:${C.ink};white-space:nowrap;vertical-align:top;">${esc(formatPrice(i.unitPrice * i.quantity))}</td>
</tr>`,
    )
    .join("");
  const total = (label: string, value: number | undefined, strong = false) =>
    value === undefined
      ? ""
      : `<tr><td style="padding:6px 0;font-family:${SANS};font-size:${strong ? 16 : 14}px;color:${strong ? C.ink : C.muted};${strong ? "font-weight:bold;" : ""}">${esc(label)}</td>
<td align="right" style="padding:6px 0;font-family:${SANS};font-size:${strong ? 16 : 14}px;color:${C.ink};font-weight:bold;white-space:nowrap;">${esc(formatPrice(value))}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
${total("Subtotal", order.subtotal)}
${order.discount ? total("Discount", -order.discount) : ""}
${total("Delivery", order.shipping)}
${total("Total", order.total, true)}
</table>`;
}

const itemsText = (order: OrderEmailData) =>
  [
    ...order.items.map(
      (i) =>
        `- ${i.quantity} × ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""}: ${formatPrice(i.unitPrice * i.quantity)}`,
    ),
    `Subtotal: ${formatPrice(order.subtotal)}`,
    ...(order.discount ? [`Discount: -${formatPrice(order.discount)}`] : []),
    ...(order.shipping !== undefined ? [`Delivery: ${formatPrice(order.shipping)}`] : []),
    ...(order.total !== undefined ? [`Total: ${formatPrice(order.total)}`] : []),
  ].join("\n");

export function orderConfirmationEmail(order: OrderEmailData, accountUrl?: string): EmailContent {
  const subject = `Order received – ${order.number} | ${BRAND}`;
  const html = shell({
    preheader: `Thank you for your order ${order.number}.`,
    label: "Order Confirmation",
    heading: "Thank you for your order",
    body: [
      p(`Hi ${esc(order.customer.name)},`),
      p(`Thank you for shopping with ${esc(BRAND)}. We have received your order. Here are its details.`),
      facts([
        ["Order ID", order.number],
        ["Order date", formatPkTime(order.placedAt)],
        ["Status", order.status],
        ["Payment", order.paymentMethod],
      ]),
      order.items.length ? subheading("Your items") + itemsTable(order) : "",
      subheading("Delivery details"),
      facts([
        ["Deliver to", order.shippingAddress],
        ["Phone", order.customer.phone],
        ["Note", order.note],
      ]),
      accountUrl ? button(accountUrl, "View My Orders") : "",
    ].join(""),
  });
  const text = [
    `Hi ${order.customer.name},`,
    "",
    `Thank you for shopping with ${BRAND}. We have received your order.`,
    "",
    `Order ID: ${order.number}`,
    `Order date: ${formatPkTime(order.placedAt)}`,
    ...(order.status ? [`Status: ${order.status}`] : []),
    ...(order.paymentMethod ? [`Payment: ${order.paymentMethod}`] : []),
    "",
    ...(order.items.length ? [itemsText(order), ""] : []),
    ...(order.shippingAddress ? [`Deliver to: ${order.shippingAddress}`] : []),
    ...(order.customer.phone ? [`Phone: ${order.customer.phone}`] : []),
    ...(order.note ? [`Note: ${order.note}`] : []),
    ...(accountUrl ? ["", `View your orders: ${accountUrl}`] : []),
    "",
    `${BRAND} – ${TAGLINE}`,
  ].join("\n");
  return { subject, html, text };
}

export function adminOrderEmail(order: OrderEmailData): EmailContent {
  const totalText = order.total !== undefined ? ` – ${formatPrice(order.total)}` : "";
  const subject = `New order ${order.number}${totalText} – ${order.customer.name}`;
  const html = shell({
    preheader: `New order ${order.number} from ${order.customer.name}.`,
    label: "New Order Notification",
    heading: `New order ${order.number}`,
    accent: C.lime,
    body: [
      p(`A new order was placed on the website at ${esc(formatPkTime(order.placedAt))}.`),
      subheading("Customer"),
      facts([
        ["Name", order.customer.name],
        ["Email", order.customer.email],
        ["Phone", order.customer.phone],
        ["Deliver to", order.shippingAddress],
        ["Note", order.note],
      ]),
      subheading("Order"),
      facts([
        ["Order ID", order.number],
        ["Status", order.status],
        ["Payment", order.paymentMethod],
        ["Total", order.total !== undefined ? formatPrice(order.total) : undefined],
      ]),
      order.items.length ? subheading("Items") + itemsTable(order) : "",
    ].join(""),
  });
  const text = [
    `New order ${order.number}`,
    `Placed: ${formatPkTime(order.placedAt)}`,
    "",
    `Customer: ${order.customer.name}`,
    ...(order.customer.email ? [`Email: ${order.customer.email}`] : []),
    ...(order.customer.phone ? [`Phone: ${order.customer.phone}`] : []),
    ...(order.shippingAddress ? [`Deliver to: ${order.shippingAddress}`] : []),
    ...(order.note ? [`Note: ${order.note}`] : []),
    "",
    ...(order.status ? [`Status: ${order.status}`] : []),
    ...(order.paymentMethod ? [`Payment: ${order.paymentMethod}`] : []),
    "",
    ...(order.items.length ? [itemsText(order)] : []),
  ].join("\n");
  return { subject, html, text };
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  submittedAt: string;
}

export function contactConfirmationEmail(data: ContactEmailData): EmailContent {
  const subject = `We have received your message | ${BRAND}`;
  const html = shell({
    preheader: "Thank you for contacting Z2R Herbal.",
    label: "Message Received",
    heading: "Thank you for contacting us",
    body: [
      p(`Hi ${esc(data.name)},`),
      p(
        `Thank you for getting in touch with ${esc(BRAND)}. We have received your message. Here is a copy for your records.`,
      ),
      subheading("Your message"),
      quote(data.message),
      subheading("Your details"),
      facts([
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Sent", formatPkTime(data.submittedAt)],
      ]),
    ].join(""),
  });
  const text = [
    `Hi ${data.name},`,
    "",
    `Thank you for getting in touch with ${BRAND}. We have received your message.`,
    "",
    "Your message:",
    data.message,
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    ...(data.phone ? [`Phone: ${data.phone}`] : []),
    `Sent: ${formatPkTime(data.submittedAt)}`,
    "",
    `${BRAND} – ${TAGLINE}`,
  ].join("\n");
  return { subject, html, text };
}

export function adminContactEmail(data: ContactEmailData): EmailContent {
  const subject = `New contact form message from ${data.name}`;
  const html = shell({
    preheader: `${data.name} sent a message through the website.`,
    label: "New Contact Form Submission",
    heading: `Message from ${data.name}`,
    accent: C.lime,
    body: [
      facts([
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Submitted", formatPkTime(data.submittedAt)],
        ["Form", "Contact Us (website)"],
      ]),
      subheading("Message"),
      quote(data.message),
      p(
        `Reply to this email to answer ${esc(data.name)} directly.`,
        `margin-top:18px;color:${C.muted};font-size:13px;`,
      ),
    ].join(""),
  });
  const text = [
    "New contact form submission",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    ...(data.phone ? [`Phone: ${data.phone}`] : []),
    `Submitted: ${formatPkTime(data.submittedAt)}`,
    "",
    "Message:",
    data.message,
  ].join("\n");
  return { subject, html, text };
}

export function passwordResetCodeEmail(data: {
  name: string;
  code: string;
  expiresInMinutes: number;
}): EmailContent {
  const subject = `Your password reset code | ${BRAND}`;
  const html = shell({
    preheader: `Your ${BRAND} password reset code is ${data.code}.`,
    label: "Password Reset",
    heading: "Reset your password",
    body: [
      p(`Hi ${esc(data.name)},`),
      p(
        `We received a request to reset the password of your ${esc(BRAND)} account. Enter this code on the reset page:`,
      ),
      `<p style="margin:20px 0;text-align:center;"><span style="display:inline-block;padding:14px 26px;border-radius:14px;background:${C.forest};color:#ffffff;font-size:30px;font-weight:700;letter-spacing:8px;font-family:Consolas,Menlo,monospace;">${esc(data.code)}</span></p>`,
      p(
        `This code expires in ${esc(data.expiresInMinutes)} minutes. Never share it with anyone, our team will never ask for it.`,
        `color:${C.muted};font-size:13px;`,
      ),
      p(
        "If you did not ask to reset your password, you can ignore this email. Your password stays the same.",
        `color:${C.muted};font-size:13px;margin-top:18px;`,
      ),
    ].join(""),
  });
  const text = [
    `Hi ${data.name},`,
    "",
    `We received a request to reset the password of your ${BRAND} account. Your code: ${data.code}`,
    "",
    `This code expires in ${data.expiresInMinutes} minutes. Never share it with anyone.`,
    "If you did not ask to reset your password, you can ignore this email.",
    "",
    `${BRAND} – ${TAGLINE}`,
  ].join("\n");
  return { subject, html, text };
}

export function verificationEmail(data: {
  name: string;
  email: string;
  link: string;
  expiresInHours: number;
}): EmailContent {
  const subject = `Verify your email address | ${BRAND}`;
  const html = shell({
    preheader: "Confirm your email address to finish setting up your account.",
    label: "Email Verification",
    heading: "Verify your email address",
    body: [
      p(`Hi ${esc(data.name)},`),
      p(
        `Thank you for creating your ${esc(BRAND)} account. Please confirm that <strong>${esc(data.email)}</strong> is your email address.`,
      ),
      button(data.link, "Verify Email Address"),
      p(
        `This link expires in ${esc(data.expiresInHours)} hours and can be used once.`,
        `color:${C.muted};font-size:13px;`,
      ),
      p(
        `If the button does not work, copy this address into your browser:<br><a href="${esc(data.link)}" style="color:${C.forest};word-break:break-all;">${esc(data.link)}</a>`,
        `color:${C.muted};font-size:13px;`,
      ),
      p(
        "If you did not create an account, you can ignore this email.",
        `color:${C.muted};font-size:13px;margin-top:18px;`,
      ),
    ].join(""),
  });
  const text = [
    `Hi ${data.name},`,
    "",
    `Thank you for creating your ${BRAND} account. Please confirm that ${data.email} is your email address:`,
    data.link,
    "",
    `This link expires in ${data.expiresInHours} hours and can be used once.`,
    "If you did not create an account, you can ignore this email.",
    "",
    `${BRAND} – ${TAGLINE}`,
  ].join("\n");
  return { subject, html, text };
}
