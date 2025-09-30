import { cpus } from 'node:os';
const { isMainThread } = Bun;
const { url } = import.meta;

let shared, objectURL;

if (isMainThread) {
  const { max } = Math;
  const { stringify } = JSON;
  const { createObjectURL, revokeObjectURL } = URL;
  const mime = { type: 'text/javascript' };
  const workers = [];
  shared = async ({ main, worker, pool = cpus().length - 1 }) => {
    for (const w of workers) w.terminate();
    if (objectURL) revokeObjectURL(objectURL);
    const uid = crypto.randomUUID();
    const module = await import(worker);
    const exports = Object.keys(module).map(key => {
      const value = module[key];
      const type = typeof value;
      return { key, type, value: type === 'function' ? null : value };
    });
    const error = event => {
      console.error(event.error ?? event.message);
    };
    const message = async event => {
      const { currentTarget, data } = event;
      const id = data?.id;
      if (id === uid) {
        event.stopImmediatePropagation();
        const { i, key, args } = data;
        if (id === key) return currentTarget.terminate();
        const result = { id, i, value: null };
        try {
          result.value = await module[key](...args);
        }
        catch (error) {
          result.value = error;
        }
        currentTarget.postMessage(result);
      }
    };
    const { href } = new URL(main, url);
    objectURL = createObjectURL(
      new Blob(
        [`globalThis[${stringify(url)}]=${stringify({ uid, exports })};import(${stringify(href)})`],
        mime
      )
    );
    for (let i = 0, size = max(pool, 1); i < size; i++) {
      const worker = new Worker(objectURL);
      worker.addEventListener('error', error);
      worker.addEventListener('message', message);
    }
    return module;
  };
}
else {
  let listener = false, i = 0;
  const next = new Map;
  const { uid, exports } = globalThis[url];
  delete globalThis[url];
  shared = {};
  for (const { key, type, value } of exports) {
    if (type === 'function') {
      listener = true;
      shared[key] = (...args) => {
        const remote = { id: uid, i, key, args };
        const wr = Promise.withResolvers();
        next.set(`${uid}-${i++}`, wr);
        postMessage(remote);
        return wr.promise;
      };
    }
    else shared[key] = value;
  }
  shared.disconnect = () => {
    postMessage({ id: uid, i, key: uid, args: [] });
  };
  if (listener) {
    addEventListener(
      'message',
      event => {
        const { data } = event;
        if (data?.id === uid) {
          event.stopImmediatePropagation();
          const { i, value } = data;
          const key = `${uid}-${i}`;
          const { resolve, reject } = next.get(key);
          next.delete(key);
          if (value instanceof Error) reject(value);
          else resolve(value);
        }
      },
    );
  }
}

export default shared;
