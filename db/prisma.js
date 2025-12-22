/**
 * db/prisma.js
 *
 * Centralized Prisma Client instance using PostgreSQL adapter.
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// Prevent multiple instances in dev (hot reload safety)
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
