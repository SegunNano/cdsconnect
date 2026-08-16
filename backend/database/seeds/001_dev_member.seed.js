import pool from '../../src/config/db.js'
import bcrypt from 'bcryptjs'

async function seedDevMember() {
    const pin = '0000'
    const pinHash = await bcrypt.hash(pin, 10)

    // Get first available stream
    const streamResult = await pool.query(
        'SELECT id FROM streams ORDER BY id ASC LIMIT 1'
    )

    if (streamResult.rows.length === 0) {
        console.error('❌ No streams found. Run seed:streams first.')
        process.exit(1)
    }

    const streamId = streamResult.rows[0].id

    const existing = await pool.query(
        'SELECT id FROM members WHERE email = $1',
        ['dev@cdsconnect.com']
    )

    if (existing.rows.length > 0) {
        // Update existing dev member with stream_id
        await pool.query(
            'UPDATE members SET stream_id = $1 WHERE email = $2',
            [streamId, 'dev@cdsconnect.com']
        )
        console.log('✅ Dev member updated with stream_id')
        process.exit(0)
    }

    await pool.query(`
        INSERT INTO members (
            first_name, last_name, state_code,
            email, pin_hash, role, is_dev,
            gender, stream_id, breakout_session,
            is_active
        ) VALUES (
            'CDS', 'Dev', 'DEV/00/0000',
            'dev@cdsconnect.com', $1,
            'member', true, 'male',
            $2, 'Web Development', true
        )
    `, [pinHash, streamId])

    console.log('✅ Dev member seeded')
    console.log('Email: dev@cdsconnect.com')
    console.log('PIN: 0000')
    console.log('⚠️  Change this PIN immediately after first login')
    process.exit(0)
}

seedDevMember()