
CREATE TABLE members (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    state_code VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    pin_hash TEXT NOT NULL,
    credential_id TEXT,
    public_key TEXT,
    sign_count INTEGER DEFAULT 0,
    token_balance INTEGER DEFAULT 0,
    role VARCHAR(50) DEFAULT 'member',
    is_dev BOOLEAN DEFAULT FALSE,
    gender VARCHAR(10) NOT NULL,
    breakout_session VARCHAR(50),
    stream_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    webauthn_challenge TEXT,
    member_type VARCHAR(20) DEFAULT 'corps_member',
    reinstatement_count INTEGER DEFAULT 0,
    token_version INTEGER DEFAULT 0
);
