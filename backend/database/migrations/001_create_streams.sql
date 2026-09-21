CREATE TABLE streams (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    batch VARCHAR(5) NOT NULL,
    stream INTEGER NOT NULL,
    callup_date DATE NOT NULL,
    service_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    certificate_unlocked BOOLEAN DEFAULT false,
    certificate_cost_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_stream UNIQUE (year, batch, stream)
);