import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetBrowser } from '../src/components/AssetBrowser';

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
    render(<AssetBrowser />);
    const handle = await screen.findAllByTestId('preset-drag-handle');
    expect(handle.length).toBeGreaterThan(0);
    const dt = new DT();
    fireEvent.dragStart(handle[0], { dataTransfer: dt as any });
    const payload = dt.getData('application/x-preset');
    expect(payload).toBeTruthy();
    const parsed = JSON.parse(payload);
    expect(parsed).toHaveProperty('id');
    expect(parsed).toHaveProperty('name');
  });

  test('Insert button triggers onInsert callback', async () => {
    const onInsert = jest.fn();
    render(<AssetBrowser onInsert={onInsert} />);
    const insertButtons = await screen.findAllByRole('button', { name: /insert preset/i });
    expect(insertButtons.length).toBeGreaterThan(0);
    fireEvent.click(insertButtons[0]);
    expect(onInsert).toHaveBeenCalledTimes(1);
    expect(onInsert.mock.calls[0][0]).toHaveProperty('id');
  });
});
