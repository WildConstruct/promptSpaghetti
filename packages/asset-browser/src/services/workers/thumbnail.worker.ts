import * as Comlink from 'comlink';

// Placeholder thumbnail worker API
const api = {
  async makeThumb(_id: string) {
    // return a data URL placeholder
    return 'data:image/svg+xml;base64,';
  },
};

Comlink.expose(api);
