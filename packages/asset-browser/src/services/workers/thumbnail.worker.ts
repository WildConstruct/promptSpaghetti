import * as Comlink from 'comlink';

const api = {
  async makeThumb(_id: string) {
    throw new Error('Thumbnail generation is not available in this MVP build.');
  }
};

Comlink.expose(api);
