// this should be done by a vite plugin really
const components: [string, string][] = [
  ["../App.tsx", "App"],
];

// no we need to hook this to the vite runtime somehow
// each component would get import twice 1 normally and 1 from passing the payload
// how do we even implement suspense

const cache: Map<string, Promise<Module>> = new Map();

type Module = Record<string, unknown>;

async function load(path: string) {
  let promise = cache.get(path);
  if (promise) {
    return await promise;
  }
  promise = (async () => {
    const module = await import(path);
    return module as Module;
  })();
  cache.set(path, promise);
  return promise;
}

export async function resolveComponet(index: number) {
  const [module, name] = components[index]
  const m = await load(module)
  return m[name];
}

