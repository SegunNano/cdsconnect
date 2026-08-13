CREATE TABLE clearance_slips (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    meeting_id INTEGER REFERENCES meetings(id),
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_slip UNIQUE (member_id, meeting_id)
);