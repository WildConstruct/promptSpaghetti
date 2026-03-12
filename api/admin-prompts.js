import { respondLegacySurfaceDisabled } from './_disabled.js';

export default function handler(_req, res) {
  return respondLegacySurfaceDisabled(res);
}
