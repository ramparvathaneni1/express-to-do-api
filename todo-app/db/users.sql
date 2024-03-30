DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(50)
);

INSERT INTO users (username, password)
VALUES ('Marc', 'pass123'),
    ('Diesel', 'pass123');