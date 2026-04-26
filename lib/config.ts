export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agent-md-hub.vercel.app';

export function absoluteSiteUrl(path: string) {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function hasAdminToken() {
  return Boolean(process.env.ADMIN_TOKEN);
}

export function isAdminAuthorized(value: FormDataEntryValue | null) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return process.env.NODE_ENV !== 'production';
  return value === token;
}
