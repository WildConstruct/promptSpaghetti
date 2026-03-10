import '../../../tests/utils/browserTestSetup';
import { installConsoleFilter } from './consoleFilter';

const SUPPRESSED_LOG_PATTERNS: RegExp[] = [
  /Warning: An update to .* inside a test was not wrapped in act/i,
  /Not implemented: navigation \(except hash changes\)/i,
  /\[AssetBrowserLoader\] Failed to load integrated asset browser:/i,
  /\[AssetBrowserLoader\] Asset browser module not available, using fallback/i
];

installConsoleFilter(SUPPRESSED_LOG_PATTERNS);
