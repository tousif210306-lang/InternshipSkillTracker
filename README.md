# InternshipSkillTracker

InternshipSkillTracker is a full-stack student career-development platform for engineering students. It brings technical skills, project work, internship applications, and learning progress together in one place.

## Features

- Student registration and login with JWT authentication and BCrypt password hashing
- Student profile and engineering department details
- Skill tracking with Beginner, Intermediate, Advanced, and Expert proficiency levels
- Project portfolio records with technologies, repository/live links, and project status
- Internship applications with company details and application status tracking
- Learning goals, tasks, priorities, and due dates
- Dashboard summaries, skill and progress charts, recent activity, deadlines, and notifications
- Admin dashboard and career-role catalog management

## Technology

- **Frontend:** React 18, Vite, React Router, Axios, and Recharts
- **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA, and REST APIs
- **Database:** H2 for out-of-the-box local development; a MySQL profile is also provided

## Run locally

### Backend

Set a strong JWT signing secret before starting the backend. The admin seed is optional; when configured, its password is used only to create the local admin account the first time the database starts.

```powershell
cd backend
$bytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$adminPassword = Read-Host "Choose the local admin password" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword)
try {
    $env:SKILLTRACKER_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}
mvn spring-boot:run
```

The API listens at `http://localhost:8081/api`.

To run with MySQL, configure `src/main/resources/application-mysql.properties` (or its supported environment variables) and activate the `mysql` profile:

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

### Frontend

From `frontend`:

```powershell
npm install
npm run dev
```

Open `http://localhost:5174`. To point the frontend at a different API URL, set `VITE_API_BASE_URL` in the frontend environment.

If `SKILLTRACKER_ADMIN_PASSWORD` is set when the database is first created, the backend seeds `admin@skilltracker.com` with that password. No default admin password or JWT signing secret is embedded in the project. Keep both values private and do not commit them.

## Project structure

```text
InternshipSkillTracker/
├── backend/
│   ├── src/main/java/com/internship/skilltracker/
│   │   ├── config/       Application and security configuration
│   │   ├── controller/   REST API endpoints
│   │   ├── dto/          Request and response models
│   │   ├── entity/       Persistence entities
│   │   ├── exception/    API error handling
│   │   ├── repository/  Spring Data repositories
│   │   ├── security/    JWT authentication
│   │   └── service/     Business logic
│   ├── src/main/resources/
│   └── pom.xml
├── database/
│   └── schema.sql
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

Generated dependencies and build output (such as `frontend/node_modules`, `frontend/dist`, and `backend/target`) are local-only and ignored by Git. Keep real credentials in environment variables or untracked `.env` files; commit only `.env.example`.
