import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "#infrastructure/config/env.js";
import { logger } from "#infrastructure/logging/logger.js";
import { subscribeShutdown } from "#infrastructure/shared/shutdown.js";

class DatabaseServer {
    private static instance: DatabaseServer;
    public db: NodePgDatabase;
    private pool: Pool;
    constructor() {
        this.pool = new Pool({
            connectionString: env.DATABASE_URL,
            connectionTimeoutMillis: 5000,
            statement_timeout: 10000,
            query_timeout: 12000,
            max: 15,
            min: 2,
            idleTimeoutMillis: 5000,
        });
        this.db = drizzle(this.pool, {
            casing: "snake_case",
        });
        this.setupEventListeners();
        // Subscribe to shutdown event
        // Bind this to the instance method to ensure correct context
        subscribeShutdown(this.dbDisconnection.bind(this));
    }

    public static getInstance() {
        if (!DatabaseServer.instance) {
            DatabaseServer.instance = new DatabaseServer();
        }
        return DatabaseServer.instance;
    }

    private setupEventListeners(): void {
        // Handle event
        this.pool.on("connect", () => {
            logger.info(
                {
                    event: "database_status",
                    status: "connected",
                },
                "Database connection established successfully",
            );
        });
        this.pool.on("error", (error: any) => {
            logger.error(
                {
                    event: "database_status",
                    status: "error",
                    error: error.message,
                },
                "Database error occurred",
            );
        });
        this.pool.on("acquire", () => {
            logger.info(
                {
                    event: "database_status",
                    status: "acquired",
                },
                "Database client acquired",
            );
        });
        this.pool.on("release", () => {
            logger.info(
                {
                    event: "database_status",
                    status: "released",
                },
                "Database client released",
            );
        });
        this.pool.on("remove", () => {
            logger.info(
                {
                    event: "database_status",
                    status: "removed",
                },
                "Database client removed",
            );
        });
    }

    //Handle Disconnection
    public async dbDisconnection() {
        await this.pool.end();
        logger.info(
            {
                event: "database_status",
                status: "disconnected",
            },
            "Database connection closed gracefully",
        );
    }

    // Inside DatabaseServer class
    public async testConnection() {
        try {
            const client = await this.pool.connect();
            logger.info(
                {
                    event: "database_status",
                    status: "verified",
                },
                "Database Connection: Verified successfully via test query.",
            );
            client.release();
        } catch (error: any) {
            logger.error(
                {
                    event: "database_status",
                    status: "error",
                    error: error.message,
                },
                "Database Connection: Failed to verify connection.",
            );
            throw error; // Rethrow to stop the app if DB is down
        }
    }
}
const dbServer = DatabaseServer.getInstance();
const db = dbServer.db;
export { DatabaseServer, db, dbServer };
