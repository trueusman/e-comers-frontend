/** Default initials avatar (SVG) */
export function getDefaultAvatarUrl(name: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name || "user"
  )}&backgroundColor=0f172a&textColor=ffffff&fontSize=40`;
}

/** Pick the best URL to show for a user avatar */
export function getAvatarSrc(avatar?: string | null, name?: string) {
  const trimmed = avatar?.trim();
  if (trimmed) return trimmed;
  return getDefaultAvatarUrl(name || "User");
}
