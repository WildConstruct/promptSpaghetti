import {
  LocalImageBatchResponseSchema,
  LocalImageRuntimeStatusSchema,
  type LocalImageBatchRequest,
  type LocalImageBatchResponse,
  type LocalImageRuntimeStatus
} from './contracts';
import {
  getJsonErrorMessage,
  readJsonResponse
} from '../http';

export class ApiLocalImageClient {
  constructor(private readonly baseUrl = '') {}

  async getStatus(): Promise<LocalImageRuntimeStatus> {
    const response = await fetch(`${this.baseUrl}/api/local-image/status`);
    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error('Failed to load local image runtime status');
    }
    return LocalImageRuntimeStatusSchema.parse(payload);
  }

  async generateBatch(
    request: LocalImageBatchRequest
  ): Promise<LocalImageBatchResponse> {
    const response = await fetch(`${this.baseUrl}/api/local-image/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(getJsonErrorMessage(payload));
    }

    return LocalImageBatchResponseSchema.parse(payload);
  }
}
