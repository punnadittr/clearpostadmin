// Returns a staff member to the dashboard page they opened before signing in.
// Only plain dashboard paths are accepted, so a crafted link cannot send them to another site.
export function safeNextPath(value: unknown) {
    return typeof value === 'string' && /^\/dashboard(?:\/[\w-]+)*$/.test(value) ? value : null
}
