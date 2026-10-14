import pool from '../../src/config/db.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'


async function seedCoordinator() {
    console.log("seeding coordinator")
    const pin = crypto.randomInt(1000, 9999).toString()
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
    console.log(`PIN: ${pin}`)
    console.log(`⚠️  Save this PIN — it will not be shown again`)
    console.log('⚠️  Change this PIN immediately after first login')
    process.exit(0)
}

seedCoordinator()