# uptake 🙃

```sh
$ bunx uptake --help

uptake 🙃 run a Bun cluster with a shared "worker" module

   usage: uptake --main=main.js --worker=worker.js [--pool=amount]
  ... or: uptake --main main.js --worker worker.js [--pool amount]

 options:
   --main   - main module to run across multiple CPU cores
   --worker - worker module shared across main scripts
   --pool   - amount of main scripts (default: CPU cores - 1)
   --help   - show this help message and exit

 © Andrea Giammarchi - @webreflection - MIT License
 ```

The `main` entry will actually be a worker where each worker can `import shared from 'uptake'` and use the `worker` module utilities exposed through exports.

The concept is that the main program actually runs as cluster but all clusters can delegate to the single *shared worker* one-off operations. Think about this logic as one that allows you to connect remotely to any service once, to any DB once, and offer a way to either register or query such services in a shared way so that a single cache can be shared across clusters with relatively ease.

### Example

```js
// main.js
import shared from 'uptake';

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
else {
  // non-functions are directly available
  shared.direct; // any non-function ....
  // functions can be awaited (roundtrip worker/main)
  await shared.logOnce(port);
}
```

```js
// worker.js

let logged = false;

// either sync or async, it's the same
export const logOnce = (port) => {
  // log this info only once
  if (logged) return;
  logged = true;
  console.log(`Cluster server is running on port ${port}`);
  console.log(`http://localhost:${port}/`);
};

export const direct = `
  any non-function / structured clone
  compatible value
`;
```

Each utility must return a structured clone compatible value or the roundtrip will fail.
