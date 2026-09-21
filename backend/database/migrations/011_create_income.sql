CREATE TABLE income (
    id SERIAL PRIMARY KEY,
    amount_naira INTEGER NOT NULL,
    description TEXT NOT NULL,
    source TEXT NOT NULL,
    recorded_by INTEGER REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);