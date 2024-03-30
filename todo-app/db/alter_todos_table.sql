ALTER TABLE todos
    ADD COLUMN user_id INT;
ALTER TABLE todos
    ADD CONSTRAINT fk_user_id
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE;
UPDATE todos
SET user_id = 1 -- User ID for 'Marc'
WHERE title = 'Get Milk';

UPDATE todos
SET user_id = 2 -- User ID for 'Diesel'
WHERE title = 'Walk Dog';