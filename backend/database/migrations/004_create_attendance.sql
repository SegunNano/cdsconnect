CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    meeting_id INTEGER REFERENCES meetings(id),
    sequence_number INTEGER NOT NULL,
    signed_in_at TIMESTAMPTZ,
    signed_out_at TIMESTAMPTZ,
    tokens_deducted INTEGER NOT NULL,
    is_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    marked_present_by INTEGER,
    mark_reason TEXT,
    excuse_id INTEGER
);
