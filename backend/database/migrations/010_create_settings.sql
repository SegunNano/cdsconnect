CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    registration_open BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (registration_open) VALUES (false);