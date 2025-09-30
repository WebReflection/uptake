import shared from '../index.js';

const port =  process.env.PORT || 8080;

Bun.serve({
  port,
  reusePort: true, // important for clusters!
  hostname: '0.0.0.0',
  fetch() {
    return new Response('Hello, world!');
  },
});

// usable both as single file or as part of a cluster
if (Bun.isMainThread) {
  console.log(`Single server is running on port ${port}`);
  console.log(`http://localhost:${port}/`);
}
// logs only once in console
else await shared.logOnce(port);
