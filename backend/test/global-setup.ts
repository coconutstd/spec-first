import { PostgreSqlContainer } from '@testcontainers/postgresql';

export default async function globalSetup() {
  const container = await new PostgreSqlContainer('postgres:16-alpine').start();

  process.env.TEST_DATABASE_URL = container.getConnectionUri();
  // Use a high throttle limit so fixture creates don't trip the rate limiter
  process.env.THROTTLE_LIMIT = '1000';
  process.env.THROTTLE_TTL = '60';
  process.env.BCRYPT_ROUNDS = '4'; // Fast hashing in tests
  (global as any).__PG_CONTAINER__ = container;
}
