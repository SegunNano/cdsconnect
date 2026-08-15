CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    amount_naira INTEGER NOT NULL,
    description TEXT NOT NULL,
    performed_by INTEGER REFERENCES members(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);