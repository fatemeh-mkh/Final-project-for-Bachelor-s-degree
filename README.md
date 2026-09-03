# Interno — Intelligent Internship Platform

**Interno** is a full-stack internship platform designed to connect students and companies while providing personalized internship recommendations based on skills, interests, and personality.

*Built as a Bachelor's Degree Final Project in Computer Engineering.*

---


## Overview

Finding a suitable internship is often more complicated than simply searching through job listings. Students need opportunities that match their technical skills, interests, and working preferences, while companies need a structured way to publish opportunities and manage applicants.

**Interno** addresses this problem by providing a centralized internship platform with:

- Student and company accounts
- Secure authentication and authorization
- Internship/job advertisement management
- Internship applications
- Internship experience sharing
- Personality-based onboarding
- Skill and interest matching
- Personalized internship recommendations
- Saved opportunities
- Notifications
- Administrative management
- Interactive REST API documentation with Swagger/OpenAPI

The project follows a layered backend architecture and uses a relational PostgreSQL database.

---

## Project Objectives

The main objectives of Interno are to:

1. Create a centralized platform for internship opportunities.
2. Help students discover opportunities relevant to their skills and interests.
3. Incorporate personality information into the recommendation process.
4. Allow students to share and evaluate internship experiences.
5. Provide companies with tools for publishing opportunities and managing applications.
6. Provide a maintainable and extensible backend architecture.

---

## Core Features

### 1. Student

- Account registration and login
- Profile management
- Skill management
- Interest management
- Personality/MBTI information
- Browse internship opportunities
- Apply for internships
- Save internship opportunities
- View personalized recommendations
- Register and manage internship experiences
- Rate internship experiences
- Receive notifications

### 2. Company

- Company registration
- Company profile
- Publish internship/job advertisements
- Update and manage advertisements
- Manage applicants
- Review internship applications

### 3. Admin

- Administrative access
- User management
- Company management
- Internship advertisement management
- Platform-level control and monitoring

### 4. Recommendation System

Interno includes a rule-based recommendation engine that evaluates internship opportunities using three main dimensions:

| Factor | Weight |
|---|---:|
| Skills | 50% |
| Personality | 30% |
| Interests | 20% |

The resulting score is converted into a match percentage and used to rank recommendations.

The system currently returns the top matching active opportunities that reach the minimum recommendation threshold.

> **Note:** The current recommendation engine is intentionally rule-based. It provides a foundation that can later be extended with machine-learning or more advanced recommendation techniques.

---

## Personality-Based Matching

Interno incorporates **MBTI personality types** into its recommendation logic.

The system maps personality types to relevant keywords and evaluates whether those keywords appear in an internship's:

- Title
- Skills
- Description

This information contributes to the overall recommendation score.

The current implementation supports all **16 MBTI personality types** through a keyword-based mapping approach.

---

## Authentication & Security

The backend uses **Spring Security** and **JWT (JSON Web Token)** based authentication.

The system supports role-based access for different user types, including:

- `STUDENT`
- `COMPANY`
- `ADMIN`
- `GUEST`

Passwords are stored using secure hashing rather than plain text.

JWT-based authentication is used to protect secured API endpoints and control access according to user roles.

---

## System Architecture

Interno follows a layered architecture in the Spring Boot backend:

```text
Client / Frontend
       │
       ▼
REST Controllers
       │
       ▼
   Services
       │
       ▼
  Repositories
       │
       ▼
 JPA / Hibernate
       │
       ▼
  PostgreSQL
```

The backend is organized into separate responsibilities such as:

```text
Controller
Service
Repository
Entity
DTO
Mapper
Security
Config
```

This separation improves maintainability, readability, and future extensibility.

---

## Data Model

The application uses **PostgreSQL** as its relational database.

The main domain concepts include:

- Users
- Student profiles
- Companies
- Skills
- Internship/job advertisements
- Applications
- Internship experiences
- Personality information
- Notifications
- Saved internships

The relationships between these entities are handled using **JPA/Hibernate**.

---

## Technology Stack

### Backend

| Technology | Purpose |
|---|---|
| Java 17 | Programming language |
| Spring Boot | Backend framework |
| Spring Web | REST APIs |
| Spring Data JPA | Data access |
| Hibernate | ORM |
| Spring Security | Authentication & authorization |
| JWT | Stateless authentication |
| Lombok | Boilerplate reduction |
| MapStruct | DTO mapping |
| Bean Validation | Input validation |
| PostgreSQL | Relational database |
| Maven | Build & dependency management |

### Frontend

- HTML5
- CSS3
- JavaScript

The frontend is maintained inside the same repository as the backend.

### API Documentation & Testing

- Swagger / OpenAPI
- JUnit
- Mockito
- Maven Wrapper

---

## Project Structure

```text
Internship/
│
├── .github/
│   └── workflows/
│
├── frontend/
│   ├── html/
│   ├── css/
│   └── js/
│
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/example/Internship/
│   │           ├── Controller/
│   │           ├── Service/
│   │           ├── Repository/
│   │           ├── Entity/
│   │           ├── DTO/
│   │           ├── Mapper/
│   │           ├── Security/
│   │           └── Config/
│   │
│   └── test/
│       └── java/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

---

## API Documentation

Interno provides interactive API documentation using **Swagger/OpenAPI**.

Swagger makes it possible to:

- Explore available REST endpoints
- Inspect request and response structures
- Review API parameters
- Test endpoints interactively

When the application is running locally, the OpenAPI JSON is available at:

```text
http://localhost:8080/v3/api-docs
```

---

## Testing

The project includes unit tests for important backend logic.

For example, the recommendation service is tested for:

- Behavior when there are no active job advertisements
- Recommendation score calculation
- Expected recommendation results

Tests can be executed using the Maven Wrapper.

### Windows

```powershell
.\mvnw.cmd test
```

---

## Configuration

The application uses environment variables for sensitive configuration such as database credentials and the JWT secret.

Example:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
app.jwt.secret=${JWT_SECRET}
app.jwt.expiration=${JWT_EXPIRATION:3600000}
```

This approach keeps sensitive values outside the source code.

> Never commit real database passwords, JWT secrets, API keys, or other credentials to the repository.

---

## Getting Started

### Prerequisites

Make sure you have:

- Java 17
- PostgreSQL
- Git

Maven does not need to be installed separately because the project includes the Maven Wrapper.

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Internship
```

### 2. Configure the database

Create a PostgreSQL database and configure the required environment variables:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION
```

### 3. Run the application

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Or build the project:

```powershell
.\mvnw.cmd clean package
```

### 4. Open the application

The backend runs locally on:

```text
http://localhost:8080
```

---

## Development Workflow

The project uses Git for version control.

The development workflow includes:

```text
Development
    ↓
Local Testing
    ↓
Git Commit
    ↓
Git Push
    ↓
GitHub
```

A GitHub Actions workflow is included to automate CI checks, with minor configuration adjustments needed for successful execution.

---

## Future Improvements

Interno is designed to be extensible. Possible future improvements include:

- Machine-learning based recommendation
- More advanced skill similarity analysis
- Semantic matching using NLP
- Improved personality assessment
- Advanced search and filtering
- Company verification
- Richer analytics dashboards
- Automated notification services
- Containerized deployment
- Production deployment and monitoring

These improvements are intentionally outside the scope of the current bachelor's project implementation.

---

## 🎓 Academic Context

**Project:** Interno — Intelligent Internship Platform  
**Degree:** Bachelor's Degree in Computer Engineering  
**Project Type:** Bachelor's Final Project

The project demonstrates practical application of:

- Object-Oriented Programming
- RESTful API Design
- Database Design
- Software Architecture
- Authentication & Authorization
- Backend Development
- Frontend Integration
- Recommendation Systems
- Automated Testing
- Version Control

---

## Author

**Fatemeh Mokhtari, a Computer Engineering graduate from the University of Isfahan.**

---

## License

This project was developed as an academic bachelor's degree final project.
