/**
 * Tests for Drag and Drop functionality - Story 6.1
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the serialization utilities
const mockDeserializeProject = jest.fn<unknown, unknown>();
jest.mock('../utils/projectSerialization', () => ({ )
  deserializeProject: mockDeserializeProject }
}));

// Mock the graph store
const mockUseGraphStore = {}))
};
jest.mock('../graphStore', () => ({ )
  useGraphStore: mockUseGraphStore }
}));
describe('Drag and Drop PSG Files', () => {
  let handleDrop: (event: DragEvent) => Promise<void>;
  let setNodes: jest.MockedFunction<any>;
  let setEdges: jest.MockedFunction<any>;
  let setStatusMessage: jest.MockedFunction<any>;
  beforeEach(() => {
    setNodes = jest.fn<unknown, unknown>();
    setEdges = jest.fn<unknown, unknown>();
    setStatusMessage = jest.fn<unknown, unknown>();
    // Simulate the handleDrop function from GraphEditor
    handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      // Check if files are being dropped
      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        // Check if it's a .psg file
        if (file.name.toLowerCase().endsWith('.psg')) {
          try {
            const content = await (file as any).text();
            const { deserializeProject } = await import('../utils/projectSerialization');
            const result = deserializeProject(content, { )
  skipValidation: false
  autoMigrate: true
  preserveIds: true }
});
            if (result.success && result.data) {
              // Load the project data
              setNodes(result.data.graph.nodes);
              setEdges(result.data.graph.edges);
              // Update project state
              const { setCurrentProject, updateProjectSettings, markProjectSaved } = mockUseGraphStore.getState();
              setCurrentProject(result.data.metadata);
              updateProjectSettings(result.data.settings);
              markProjectSaved();
              setStatusMessage(`Project "${result.data.metadata.name}" loaded successfully!`);}
 else {
              setStatusMessage(`Failed to load project: ${result.error}`);}
 catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setStatusMessage(`Failed to load project: ${errorMessage}`);}
          return;
 else { setStatusMessage('Only .psg files are supported for drag and drop');
          return };
    jest.clearAllMocks();
  });
  test('handles .psg file drop successfully', async () => { const mockFile = {
      name: 'test-project.psg' }
      text: jest.fn<unknown, unknown>().mockResolvedValue('{"fileType":"psg","formatVersion":"1.0.0"}' as unknown)
    };
    const mockSuccessResult = { success: true
      data: { }
  graph: { nodes: [], edges: [] }
        metadata: { name: 'Test Project' }
        settings: { autoSave: true }
    };
    mockDeserializeProject.mockReturnValue(mockSuccessResult as unknown);
    const event = { preventDefault: jest.fn<unknown, unknown>()
  dataTransfer: {
  files: [mockFile] }
 as any;
    await handleDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockFile.text).toHaveBeenCalled();
    expect(mockDeserializeProject).toHaveBeenCalledWith()
      '{"fileType":"psg","formatVersion":"1.0.0"}'
      { skipValidation: false
  autoMigrate: true }
  preserveIds: true);
  expect(setNodes).toHaveBeenCalledWith([]);
  expect(setEdges).toHaveBeenCalledWith([]);
  expect(setStatusMessage).toHaveBeenCalledWith('Project "Test Project" loaded successfully!');
});
  test('handles non-.psg file drop', async () => { const mockFile = {
  name: 'not-a-project.txt'
  text: jest.fn<unknown, unknown>() }
};
    const event = { preventDefault: jest.fn<unknown, unknown>()
  dataTransfer: {
  files: [mockFile] }
 as any;
    await handleDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockFile.text).not.toHaveBeenCalled();
    expect(setStatusMessage).toHaveBeenCalledWith('Only .psg files are supported for drag and drop');
  });
  test('handles case-insensitive .psg extension', async () => { const mockFile = {
      name: 'TEST-PROJECT.PSG' }
      text: jest.fn<unknown, unknown>().mockResolvedValue('{"fileType":"psg"}' as unknown)
    };
    const mockSuccessResult = { success: true
      data: { }
  graph: { nodes: [], edges: [] }
        metadata: { name: 'Test Project' }
        settings: { autoSave: true }
    };
    mockDeserializeProject.mockReturnValue(mockSuccessResult as unknown);
    const event = { preventDefault: jest.fn<unknown, unknown>()
  dataTransfer: {
  files: [mockFile] }
 as any;
    await handleDrop(event);
    expect(mockFile.text).toHaveBeenCalled();
    expect(setStatusMessage).toHaveBeenCalledWith('Project "Test Project" loaded successfully!');
  });
  test('handles deserialization failure', async () => { const mockFile = {
  name: 'invalid-project.psg'
  text: jest.fn<unknown, unknown>().mockResolvedValue('invalid json' as unknown) }
};
    const mockFailureResult = { success: false
  error: 'Invalid JSON format' }
};
    mockDeserializeProject.mockReturnValue(mockFailureResult as unknown);
    const event = { preventDefault: jest.fn<unknown, unknown>()
  dataTransfer: {
  files: [mockFile] }
 as any;
    await handleDrop(event);
    expect(setStatusMessage).toHaveBeenCalledWith('Failed to load project: Invalid JSON format');
    expect(setNodes).not.toHaveBeenCalled();
    expect(setEdges).not.toHaveBeenCalled();
  });
  test('handles file reading error', async () => { const mockFile = {
  name: 'error-project.psg'
  text: jest.fn<unknown, unknown>().mockRejectedValue(new Error('File read error')) }
};
    const event = { preventDefault: jest.fn<unknown, unknown>()
  dataTransfer: {
  files: [mockFile] }
 as any;
    await handleDrop(event);
    expect(setStatusMessage).toHaveBeenCalledWith('Failed to load project: File read error');
  });
  test('handles no files dropped', async () => { const event = {
  preventDefault: jest.fn<unknown, unknown>()
  dataTransfer: {
  files: [] }
 as any;
    await handleDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(setStatusMessage).not.toHaveBeenCalled();
  });
  test('handles null dataTransfer', async () => { const event = {
  preventDefault: jest.fn<unknown, unknown>()
  dataTransfer: null }
 as any;
    await handleDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(setStatusMessage).not.toHaveBeenCalled();
  });
  test('updates graph store state correctly on successful load', async () => { const mockFile = {
      name: 'test-project.psg' }
      text: jest.fn<unknown, unknown>().mockResolvedValue('{"fileType":"psg"}' as unknown)
    };
    const mockSetCurrentProject = jest.fn<unknown, unknown>();
    const mockUpdateProjectSettings = jest.fn<unknown, unknown>();
    const mockMarkProjectSaved = jest.fn<unknown, unknown>();
    mockUseGraphStore.getState.mockReturnValue({ )
  setCurrentProject: mockSetCurrentProject
  updateProjectSettings: mockUpdateProjectSettings
  markProjectSaved: mockMarkProjectSaved }
 as unknown);
    const mockSuccessResult = { success: true
      data: { }
  graph: { nodes: [{ id: 'test' }], edges: [{ id: 'edge1' }] }
        metadata: { name: 'Test Project', author: 'Test Author' }
        settings: { autoSave: false, backupInterval: 10 }
    };
    mockDeserializeProject.mockReturnValue(mockSuccessResult as unknown);
    const event = { preventDefault: jest.fn<unknown, unknown>()
  dataTransfer: {
  files: [mockFile] }
 as any;
    await handleDrop(event);
    expect(mockSetCurrentProject).toHaveBeenCalledWith({ name: 'Test Project', author: 'Test Author' });
    expect(mockUpdateProjectSettings).toHaveBeenCalledWith({ autoSave: false, backupInterval: 10 });
    expect(mockMarkProjectSaved).toHaveBeenCalled();
  });
});