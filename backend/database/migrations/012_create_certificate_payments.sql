CREATE TABLE certificate_payments (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    stream_id INTEGER REFERENCES streams(id),
    tokens_paid INTEGER NOT NULL,
    paid_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cert_payment UNIQUE (member_id, stream_id)
);