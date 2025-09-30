import shared from '../index.js';

const port =  process.env.PORT || 8080;

Bun.serve({
  port,
  reusePort: true,
  hostname: '0.0.0.0',
  fetch() {
    return new Response('Hello, world!');
  },
});

if (typeof shared === 'function') {
  console.log(`Single server is running on port ${port}`);
  console.log(`http://localhost:${port}/`);
}
else await shared.logOnce(port);
