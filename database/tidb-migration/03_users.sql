-- Run after 01_departments.sql and 02_career_roles.sql.
-- Step 3 of 4: isolated users-table test; users depends only on career_roles(id).
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    phone_number VARCHAR(255),
    university VARCHAR(255),
    degree VARCHAR(255),
    graduation_year INT,
    location VARCHAR(255),
    bio VARCHAR(1000),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    career_objective VARCHAR(1000),
    certifications VARCHAR(2000),
    achievements VARCHAR(2000),
    resume_url VARCHAR(255),
    career_role_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    KEY idx_users_career_role_id (career_role_id),
    CONSTRAINT fk_users_career_role FOREIGN KEY (career_role_id) REFERENCES career_roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
