import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface JsonStore {
  read<T>(name: string): Promise<T[]>;
  update<T, R>(name: string, change: (list: T[]) => { list: T[]; result: R }): Promise<R>;
}

export function createJsonStore(dir: string): JsonStore {
  const queues = new Map<string, Promise<unknown>>();
  const fileOf = (name: string) => path.join(dir, `${name}.json`);

  async function read<T>(name: string): Promise<T[]> {
    try {
      const parsed: unknown = JSON.parse(await readFile(fileOf(name), "utf8"));
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  function update<T, R>(name: string, change: (list: T[]) => { list: T[]; result: R }): Promise<R> {
    const run = async () => {
      const { list, result } = change(await read<T>(name));
      await mkdir(dir, { recursive: true });
      const file = fileOf(name);
      const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
      await writeFile(tmp, JSON.stringify(list, null, 2) + "\n", "utf8");
      await rename(tmp, file);
      return result;
    };
    const next = (queues.get(name) ?? Promise.resolve()).then(run, run);
    queues.set(
      name,
      next.catch(() => undefined),
    );
    return next;
  }

  return { read, update };
}

let shared: JsonStore | undefined;

export function getStore(): JsonStore {
  shared ??= createJsonStore(path.resolve(process.env.DATA_DIR ?? "data"));
  return shared;
}
