export function respondLegacySurfaceDisabled(res) {
  return res.status(410).json({
    error: 'Legacy admin/debug surface disabled',
    message:
      'This legacy Vercel admin/debug endpoint is disabled. Use the canonical server runtime instead.'
  });
}
