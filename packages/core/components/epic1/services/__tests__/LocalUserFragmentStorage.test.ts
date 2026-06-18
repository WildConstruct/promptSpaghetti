import {
  LOCAL_USER_FRAGMENT_FOLDER_COOKIE,
  getUserFragmentFolderFromCookie,
  saveLocalUserFragment,
  setUserFragmentFolderCookie
} from '../LocalUserFragmentStorage';

describe('LocalUserFragmentStorage', () => {
  beforeEach(() => {
    document.cookie = `${LOCAL_USER_FRAGMENT_FOLDER_COOKIE}=; Max-Age=0; path=/`;
  });

  it('persists the selected documents folder in a cookie', () => {
    setUserFragmentFolderCookie('C:/Users/example/Documents/Prompt Spaghetti');

    expect(getUserFragmentFolderFromCookie()).toBe(
      'C:/Users/example/Documents/Prompt Spaghetti'
    );
  });

  it('sends local fragment saves to the local-fragments endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        filename: 'family-dna.psg',
        savedPath: 'C:/Docs/fragments/family-dna.psg'
      })
    });

    const result = await saveLocalUserFragment({
      folderPath: 'C:/Docs',
      filename: 'family-dna.psg',
      content: '{"name":"Family DNA"}',
      fetchImpl: fetchMock
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/local-fragments/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folderPath: 'C:/Docs',
        filename: 'family-dna.psg',
        content: '{"name":"Family DNA"}'
      })
    });
    expect(result.savedPath).toBe('C:/Docs/fragments/family-dna.psg');
  });

  it('throws the local route error when a save fails', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Folder path must be absolute' })
    });

    await expect(
      saveLocalUserFragment({
        folderPath: 'Docs',
        filename: 'family-dna.psg',
        content: '{}',
        fetchImpl: fetchMock
      })
    ).rejects.toThrow('Folder path must be absolute');
  });
});
