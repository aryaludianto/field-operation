import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const { Pool } = pkg;

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ecofieldops';

export const pool = new Pool({ connectionString });
export const db = drizzle(pool);
