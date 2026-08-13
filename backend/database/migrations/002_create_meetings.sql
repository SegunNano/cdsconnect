CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    meeting_date DATE NOT NULL,
    sign_in_open TIMESTAMP NOT NULL,
    late_threshold TIMESTAMP NOT NULL,
    sign_in_close TIMESTAMP NOT NULL,
    venue_lat NUMERIC(9,6) NOT NULL,
    venue_lng NUMERIC(9,6) NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    meeting_cost INTEGER NOT NULL DEFAULT 1,
    lateness_cost INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);