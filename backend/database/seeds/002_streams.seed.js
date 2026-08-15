import pool from '../../src/config/db.js'

async function seedStreams() {
    const streams = [
        // 2026 streams
        { year: 2026, batch: 'A', stream: 1, callup_date: '2026-01-21', service_end: '2027-01-21' },
        { year: 2026, batch: 'A', stream: 2, callup_date: '2026-04-22', service_end: '2027-04-22' },
        { year: 2026, batch: 'B', stream: 1, callup_date: '2026-06-10', service_end: '2027-06-10' },
        { year: 2026, batch: 'B', stream: 2, callup_date: '2026-08-05', service_end: '2027-08-05' },
    ]

    for (const stream of streams) {
        const existing = await pool.query(
            'SELECT id FROM streams WHERE year = $1 AND batch = $2 AND stream = $3',
            [stream.year, stream.batch, stream.stream]
        )

        if (existing.rows.length > 0) {
            console.log(`⏭️  Skipped: ${stream.year} Batch ${stream.batch} Stream ${stream.stream} — already exists`)
            continue
        }

        await pool.query(
            `INSERT INTO streams (year, batch, stream, callup_date, service_end, is_active)
            VALUES ($1, $2, $3, $4, $5, true)`,
            [stream.year, stream.batch, stream.stream, stream.callup_date, stream.service_end]
        )

        console.log(`✅ Seeded: ${stream.year} Batch ${stream.batch} Stream ${stream.stream}`)
    }

    console.log('Streams seed complete')
    process.exit(0)
}

seedStreams()