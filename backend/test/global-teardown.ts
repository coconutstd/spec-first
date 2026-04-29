export default async function globalTeardown() {
  await (global as any).__PG_CONTAINER__?.stop();
}
