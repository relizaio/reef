const pg = require('pg')

const pool = new pg.Pool({
    user: process.env.POSTGRES_USER ? process.env.POSTGRES_USER : `postgres`,
    host: process.env.POSTGRES_HOST ? process.env.POSTGRES_HOST : `localhost`,
    database: process.env.POSTGRES_DATABASE ? process.env.POSTGRES_DATABASE : `postgres`,
    password: process.env.POSTGRES_PASSWORD ? process.env.POSTGRES_PASSWORD : `password`,
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5439,
})

const schema = process.env.POSTGRES_SCHEMA ? process.env.POSTGRES_SCHEMA : `ref`

export function getPool() {
    return pool
}

// TODO throw error if can't connect to postgres on startup - do basic select query

export async function runQuery (query: string, params: string[]) : Promise<any> {
    const client = await pool.connect()
    try {
      return await client.query(query, params)
    } finally {
      client.release()
    }
}

export { schema }