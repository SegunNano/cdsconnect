import pool from '../../src/config/db.js'
import { v4 as uuidv4 } from 'uuid'

async function seedClearanceSlips() {
    // Get all attendance records that qualify for clearance
    // Qualify = signed out OR has excuse OR marked present manually
    const result = await pool.query(`
        SELECT 
            a.id AS attendance_id,
            a.member_id,
            a.meeting_id,
            a.signed_out_at,
            a.excuse_id,
            a.marked_present_by,
            m.first_name,
            m.last_name,
            mt.title AS meeting_title
        FROM attendance a
        JOIN members m ON a.member_id = m.id
        JOIN meetings mt ON a.meeting_id = mt.id
        WHERE 
            a.signed_out_at IS NOT NULL
            OR a.excuse_id IS NOT NULL
            OR a.marked_present_by IS NOT NULL
    `)

    if (result.rows.length === 0) {
        console.log('No qualifying attendance records found')
        process.exit(0)
    }

    let created = 0
    let skipped = 0

    for (const record of result.rows) {
        // Check if clearance already exists
        const existing = await pool.query(
            'SELECT id FROM clearance_slips WHERE member_id = $1 AND meeting_id = $2',
            [record.member_id, record.meeting_id]
        )

        if (existing.rows.length > 0) {
            console.log(`⏭️  Skipped: ${record.first_name} ${record.last_name} — ${record.meeting_title}`)
            skipped++
            continue
        }

        const qrToken = uuidv4()

        await pool.query(
            `INSERT INTO clearance_slips (member_id, meeting_id, qr_token)
            VALUES ($1, $2, $3)`,
            [record.member_id, record.meeting_id, qrToken]
        )

        console.log(`✅ Generated: ${record.first_name} ${record.last_name} — ${record.meeting_title}`)
        created++
    }

    console.log(`\nDone — ${created} created, ${skipped} skipped`)
    process.exit(0)
}

seedClearanceSlips()