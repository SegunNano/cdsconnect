CREATE TABLE excuse_requests (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    meeting_id INTEGER REFERENCES meetings(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by INTEGER REFERENCES members(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_excuse UNIQUE (member_id, meeting_id)
);