CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);