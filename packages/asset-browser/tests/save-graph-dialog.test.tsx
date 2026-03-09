import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveGraphDialog } from '../src/components/SaveGraphDialog';

const graphSample = { nodes: [{ id: 'n1' }], edges: [] };

function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('read failed'));
    fr.onload = () => resolve(String(fr.result || ''));
    fr.readAsText(blob);
  });
}

function openWith(onSaveBlob?: (blob: Blob, filename: string) => void) {
  render(
    <SaveGraphDialog
      isOpen
      onClose={() => {}}
      graph={graphSample}
      onSaveBlob={onSaveBlob}
    />
  );
}

describe('SaveGraphDialog', () => {
  it('disables Save until valid name and enforces .psg extension', async () => {
    let savedName = '';
    openWith((_blob, name) => (savedName = name));

    const nameInput = screen.getByLabelText('File name') as HTMLInputElement;
    const saveBtn = screen.getByRole('button', { name: 'Save' });

    // Start with default valid name
    expect((saveBtn as HTMLButtonElement).disabled).toBe(false);

    // Invalid: empty
    fireEvent.change(nameInput, { target: { value: '   ' } });
    expect((saveBtn as HTMLButtonElement).disabled).toBe(true);

    // Valid without extension -> will add .psg
    fireEvent.change(nameInput, { target: { value: 'my graph' } });
    expect(saveBtn).toBeEnabled();

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(savedName.endsWith('.psg')).toBe(true);
    });
  });

  it('sanitizes dangerous characters and produces canonical PSG content', async () => {
    let saved: { blob?: Blob; name?: string } = {};
    openWith((blob, name) => {
      saved = { blob, name };
    });

    const nameInput = screen.getByLabelText('File name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'my/..graph*?#' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(async () => {
      expect(saved.name).toBeDefined();
      expect(saved.name!.toLowerCase().endsWith('.psg')).toBe(true);
      const text = await readBlobText(saved.blob!);
      const parsed = JSON.parse(text);
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.name).toBe('my..graph');
      expect(parsed.nodes[0].id).toBe('n1');
      expect(Array.isArray(parsed.edges)).toBe(true);
    });
  });
});
