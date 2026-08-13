CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    meeting_id INTEGER REFERENCES meetings(id),
    sequence_number INTEGER NOT NULL,
    signed_in_at TIMESTAMP,
    signed_out_at TIMESTAMP,
    tokens_deducted INTEGER NOT NULL,
    is_late BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);