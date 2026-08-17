import pool from '../../src/config/db.js'
import bcrypt from 'bcryptjs'

async function seedCoordinator() {
    console.log("seeding coordinator")
    const pin = '0000'
    const pinHash = await bcrypt.hash(pin, 10)

    const existing = await pool.query(
        'SELECT id FROM members WHERE email = $1',
        ['coordinator@cdsconnect.com']
    )

    if (existing.rows.length > 0) {
        console.log('Coordinator already exists — skipping')
        process.exit(0)
    }

    await pool.query(`
        INSERT INTO members (
            first_name, last_name, state_code,
            email, pin_hash, role,
            gender, member_type, is_active
        ) VALUES (
            'CDS', 'Coordinator', 'COORD/00/0000',
            'coordinator@cdsconnect.com', $1,
            'coordinator', 'female',
            'staff', true
        )
    `, [pinHash])

    console.log('✅ Coordinator seeded')
    console.log('Email: coordinator@cdsconnect.com')
    console.log('PIN: 0000')
    console.log('⚠️  Change this PIN immediately after first login')
    process.exit(0)
}

seedCoordinator()