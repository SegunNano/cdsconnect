CREATE TABLE streams (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    batch VARCHAR(5) NOT NULL,
    stream INTEGER NOT NULL,
    callup_date DATE NOT NULL,
    service_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_stream UNIQUE (year, batch, stream)
);