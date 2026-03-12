import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetBrowser } from '../src/components/AssetBrowser';
import { PresetCard } from '../src/components/PresetCard';

class DT {
  data: Record<string, string> = {};
  effectAllowed = '';
  setData(type: string, val: string) {
    this.data[type] = val;
  }
  getData(type: string) {
    return this.data[type];
  }
}

describe('Drag and keyboard insert', () => {
  test('drag handle sets preset payload', async () => {
    render(
      <PresetCard
        preset={{
          id: 'fragment-1',
          name: 'Fragment 1',
          tags: ['fragment'],
          type: 'graph',
          path: '/assets/library/fragment-1.psg',
          metadata: {
            file: '/assets/library/fragment-1.psg'
          }
        }}
      />
    );
    const handle = await screen.findByTestId('preset-drag-handle');
    const dt = new DT();
    fireEvent.dragStart(handle, { dataTransfer: dt as any });
    const payload = dt.getData('application/x-preset');
    expect(payload).toBeTruthy();
    const parsed = JSON.parse(payload);
    expect(parsed).toHaveProperty('id');
    expect(parsed).toHaveProperty('name');
    expect(parsed.path).toBe('/assets/library/fragment-1.psg');
    expect(parsed.metadata?.file).toBe('/assets/library/fragment-1.psg');
  });

  test('Insert button triggers onInsert callback', async () => {
    const onInsert = jest.fn();
    render(<AssetBrowser onInsert={onInsert} />);
    const insertButtons = await screen.findAllByRole('button', {
      name: /insert preset/i
    });
    expect(insertButtons.length).toBeGreaterThan(0);
    fireEvent.click(insertButtons[0]);
    expect(onInsert).toHaveBeenCalledTimes(1);
    expect(onInsert.mock.calls[0][0]).toHaveProperty('id');
  });
});
