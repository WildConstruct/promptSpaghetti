import { act } from '@testing-library/react';

/**
 * Toggle a checkbox/radio in jsdom so React's `onChange` actually fires.
 *
 * jsdom only runs an input's "activation behavior" (toggling `.checked` and
 * firing input/change) for the NATIVE `element.click()` — it does NOT run it for
 * the synthetic events that `fireEvent.click`/`userEvent.click` dispatch. So a
 * controlled checkbox's `onChange` never fires under those, and the component
 * state never updates. Using the native click (wrapped in act) makes it work.
 */
export function toggleCheckbox(element: HTMLElement): void {
  act(() => {
    (element as HTMLInputElement).click();
  });
}
