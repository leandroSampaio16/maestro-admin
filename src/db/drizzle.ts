import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
// Import schema and tables explicitly for proper type inference
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

// Create a complete schema object including all tables
const completeSchema = { ...schema };

// Initialize db with the complete schema
export const db = drizzle(sql, { schema: completeSchema });
