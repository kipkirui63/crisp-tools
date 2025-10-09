import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';
dotenv.config();


const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { ssl: "require" });  // 👈 force SSL
export const db = drizzle(client, { schema });
