export function normalizeNamePart(value) {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.+/g, ".");
}

export function buildBaseEmail({ firstName, lastName, domain = "timemanager.com" }) {
  const first = normalizeNamePart(firstName);
  const last = normalizeNamePart(lastName);
  if (!first || !last) return "";
  return `${last}.${first}@${domain}`;
}

export function ensureUniqueEmail(baseEmail, existingEmails) {
  if (!baseEmail) return "";

  const lowerExisting = new Set((existingEmails || []).map((e) => String(e).toLowerCase()));
  const [localPart, domain] = baseEmail.split("@");

  let candidate = baseEmail;
  let suffix = 2;
  while (lowerExisting.has(candidate.toLowerCase())) {
    candidate = `${localPart}${suffix}@${domain}`;
    suffix += 1;
  }

  return candidate;
}
