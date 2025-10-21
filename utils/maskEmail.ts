export default function maskEmail(email: string): string {
  const [username, domain] = email.split('@');

  if (username.length <= 2) {
    // if too short, just return first char and mask the rest
    return `${username[0] + '*'.repeat(username.length - 1)}@${domain}`;
  }

  const firstChar = username[0];
  const lastChar = username[username.length - 1];
  const masked = '*'.repeat(username.length - 2);

  return `${firstChar}${masked}${lastChar}@${domain}`;
}
