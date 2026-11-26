import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { destinations as seed, type Destination } from "./data";
import type { DestinationInput } from "./validate";

// 파일 기반 저장소. data.ts는 최초 시드로만 사용한다.
const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "japan.json");

let cache: Destination[] | null = null;
let chain: Promise<unknown> = Promise.resolve();

/** 쓰기 작업을 직렬화해 동시 수정으로 인한 id 중복/유실을 막는다. */
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

async function load(): Promise<Destination[]> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(FILE, "utf8")) as Destination[];
  } catch {
    cache = structuredClone(seed);
  }
  return cache;
}

async function persist(items: Destination[]): Promise<void> {
  await mkdir(DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(items, null, 2), "utf8");
  await rename(tmp, FILE); // 원자적 교체
  cache = items;
}

export async function listAll(): Promise<Destination[]> {
  return [...(await load())];
}

export async function getById(id: number): Promise<Destination | undefined> {
  return (await load()).find((d) => d.id === id);
}

export function create(input: DestinationInput): Promise<Destination> {
  return locked(async () => {
    const items = await load();
    const id = items.reduce((m, d) => Math.max(m, d.id), 0) + 1;
    const created: Destination = { id, ...input };
    await persist([...items, created]);
    return created;
  });
}

export function update(
  id: number,
  input: DestinationInput,
): Promise<Destination | undefined> {
  return locked(async () => {
    const items = await load();
    if (!items.some((d) => d.id === id)) return undefined;
    const updated: Destination = { id, ...input };
    await persist(items.map((d) => (d.id === id ? updated : d)));
    return updated;
  });
}

export function remove(id: number): Promise<boolean> {
  return locked(async () => {
    const items = await load();
    if (!items.some((d) => d.id === id)) return false;
    await persist(items.filter((d) => d.id !== id));
    return true;
  });
}
