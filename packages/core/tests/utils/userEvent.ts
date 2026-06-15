/**
 * Re-export @testing-library/user-event from its CommonJS build.
 *
 * Core's jest runs in CJS mode (ts-jest commonjs). The bare specifier
 * `@testing-library/user-event` resolves to the package's ESM build, which jest
 * then mis-interops so `userEvent.setup`/`.type`/`.click` come back undefined —
 * and it evades moduleNameMapper, customExportConditions, a custom resolver, and
 * transform allowlists (the specifier is resolved through a path none of them
 * intercept). Importing the explicit CJS entry works, so tests should import
 * userEvent from this helper instead of the bare package.
 */
// eslint-disable-next-line import/no-unresolved
import userEvent from '@testing-library/user-event/dist/cjs/index.js';

export default userEvent;
