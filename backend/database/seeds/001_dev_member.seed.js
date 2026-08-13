import pool from '../../src/config/db.js'
import bcrypt from 'bcryptjs'

async function seedDevMember() {
    const pin = '0000'
    const pinHash = await bcrypt.hash(pin, 10)

    const existing = await pool.query(
        'SELECT id FROM members WHERE email = $1',
        ['dev@cdsconnect.com']
    )

    if (existing.rows.length > 0) {
        console.log('Dev member already exists — skipping')
        process.exit(0)
    }

    await pool.query(`
        INSERT INTO members (
            first_name,
            last_name,
            state_code,
            email,
            pin_hash,
            role,
            is_dev,
            gender,
            batch_year,
            batch,
            stream,
            breakout_session,
            date_of_callup,
            service_end,
            is_active
        ) VALUES (
            'CDS',
            'Dev',
            'DEV/00/0000',
            'dev@cdsconnect.com',
            $1,
            'member',
            true,
            'male',
            2024,
            'A',
            1,
            'Web Development',
            '2024-01-01',
            '2099-12-31',
            true
        )
    `, [pinHash])

    console.log('✅ Dev member seeded')
    console.log('Email: dev@cdsconnect.com')
    console.log('PIN: 0000')
    console.log('⚠️  Change this PIN immediately after first login')
    process.exit(0)
}

seedDevMember()