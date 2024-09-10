import { drizzle } from "drizzle-orm/postgres-js";
import  postgres from "postgres"
import * as schema from "./schema";
import { env } from "../env";

export const Client = postgres(env.DATABASE_URL);
export const db = drizzle(Client, { schema, logger: true });