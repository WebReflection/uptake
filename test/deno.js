import shared from '../index.js';

const port =  process.env.PORT || 8080;

Deno.serve(
  {
    port,
    reusePort: true, // important for clusters!
    hostname: '0.0.0.0',
  },
  () => new Response('Hello, world!')
);

// usable both as single file or as part of a cluster
if (!shared.logOnce) {
  console.log(`Single server is running on port ${port}`);
  console.log(`http://localhost:${port}/`);
}
// logs only once in console
else await shared.logOnce(port);
