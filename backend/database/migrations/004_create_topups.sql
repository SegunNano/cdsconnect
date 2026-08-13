CREATE TABLE topups (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    tokens_added INTEGER NOT NULL,
    naira_value INTEGER NOT NULL,
    performed_by INTEGER REFERENCES members(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);