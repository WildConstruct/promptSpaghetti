import Fastify from 'fastify';

const server = Fastify();

server.get('/', async (request, reply) => {
  return { status: 'PromptScape API running' };
});

server.get('/preview', async (request, reply) => {
  // Static dummy bundle for UI
  return {
    bundle: {
      meta: { version: '0.1.0', seed: 12345 },
      nodes: [],
      edges: [],
      preview: 'This is a dummy prompt preview.'
    }
  };
});

server.listen({ port: 8000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`API listening at ${address}`);
});
