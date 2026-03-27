/**
 * Messaging utility for PHANET KNUST
 * Generates WhatsApp links with pre-filled credential messages.
 */

export function buildWhatsAppCredentialLink(
  name: string,
  phone: string,
  email: string,
  tempPassword: string,
  department?: string
): string {
  const message = [
    `Hello ${name} 👋`,
    ``,
    `You have been added as a *Department Lead* on the PHANET KNUST platform.`,
    ...(department ? [``, `🏢 *Department:* ${department}`] : []),
    ``,
    `🔐 *Your Login Credentials:*`,
    `Email: ${email}`,
    `Temporary Password: ${tempPassword}`,
    ``,
    `⚠️ You will be required to *change your password* on your first login.`,
    ``,
    `— PHANET KNUST · Pastor Stefan Danquah`,
  ].join('\n');

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildCredentialMessage(
  name: string,
  email: string,
  tempPassword: string,
  department?: string
): string {
  return [
    `Hello ${name},`,
    ``,
    `You have been added as a Department Lead on the PHANET KNUST platform.`,
    ...(department ? [``, `Department: ${department}`] : []),
    ``,
    `Your Login Credentials:`,
    `Email: ${email}`,
    `Temporary Password: ${tempPassword}`,
    ``,
    `You will be required to change your password on your first login.`,
    ``,
    `— PHANET KNUST`,
  ].join('\n');
}
