
CREATE TABLE admins (
    admin_id TEXT DEFAULT substr(md5(random()::text), 1, 10) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    gender VARCHAR(6) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(150) UNIQUE NOT NULL,
    residency VARCHAR(50) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE admin_settings (
    admin_id TEXT REFERENCES admins(admin_id),
    theme VARCHAR(20) DEFAULT 'light',
    font_size VARCHAR(20) DEFAULT 'medium',
    language VARCHAR(20) DEFAULT 'english',
    PRIMARY KEY (admin_id)
);

SELECT * FROM admins

