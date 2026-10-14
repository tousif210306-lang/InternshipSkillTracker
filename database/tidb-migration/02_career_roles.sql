-- Run after 01_departments.sql.
-- Step 2 of 4: career_roles depends on departments(id).
CREATE TABLE IF NOT EXISTS career_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(1000) NOT NULL,
    department_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    KEY idx_career_roles_department_id (department_id),
    CONSTRAINT fk_career_roles_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
