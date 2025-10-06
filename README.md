🧭 Workforce Management System

[![CI](https://github.com/JOULifestyle/workforce-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/JOULifestyle/workforce-management-system/actions)
[![codecov](https://codecov.io/gh/JOULifestyle/workforce-management-system/branch/main/graph/badge.svg?token=186099bf-4d41-4e6f-b751-5283604fcad5)](https://codecov.io/gh/JOULifestyle/workforce-management-system)
[![Code Style](https://img.shields.io/badge/code%20style-Prettier-orange)](#)
[![Lint](https://img.shields.io/badge/lint-ESLint-blueviolet)](#)
[![Node](https://img.shields.io/badge/node-%3E%3D18-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)

A Dockerized Node.js workforce management system featuring:

REST APIs for Employees, Departments, and Leave Requests

RabbitMQ worker with asynchronous processing and retry logic

Clean service/repository architecture with error middleware

Robust test suite (~81% coverage across 19 suites)

Built for resilience, maintainability, scalability and testability

Implemented a caching layer, Redis for employee lookups.

A functional role-based access control




🧭 **Reviewer Guide**

This section helps you to quickly explore what matters most:

| Area | Highlights | Where to Look |
|------|-------------|---------------|
| **Architecture** | Modular, layered (Controller → Service → Repository) | `/src` folders (`controllers`, `services`, `repositories`) |
| **Asynchronous Design** | RabbitMQ worker with retry & DLQ logic | `/src/workers/leaveConsumer.js` |
| **Error Handling** | Centralized middleware, consistent JSON output | `/src/middleware/errorHandler.js` |
| **Retry Strategies** | `noRetry`, `fixedRetry`, `exponentialRetry` | `/src/utils/retryStrategies.js` |
| **Tests** | 19 suites, unit + integration, mocks for AMQP | `/tests/unit` and `/tests/integration` |
| **Docker Setup** | Complete environment (API + Worker + RabbitMQ + DB) | `Dockerfile`, `docker-compose.yml` |
| **Code Quality** | ESLint, Prettier, Jest coverage integration | `.eslintrc`, `.prettierrc`, `ci.yml` |
| **Quick Run** | `docker-compose up` to boot everything | Root directory |


🚀 Features

RESTful CRUD APIs (Employees, Departments, Leave Requests)

RabbitMQ Worker with retry and dead-letter support

Automatic approval for short leaves (≤2 days)

Graceful connection recovery and queue resilience

Consistent error responses and environment-based config

Over 80% Jest test coverage with CI + Codecov integration
```
📁 Architecture Overview
src/
 ├── app.js                  # Express app + error middleware
 ├── config/                 # DB & environment setup
 ├── controllers/            # Request handlers
 ├── migrations/             # Sequelize migrations
 ├── models/                 # Sequelize models
 ├── repositories/           # Data access logic
 ├── routes/                 # API routes
 ├── services/               # Business logic
 ├── utils/                  # Retry strategies, response helpers
 └── workers/                # RabbitMQ consumers

tests/
 ├── unit/                   # Service and utility unit tests
 └── integration/            # End-to-end & queue integration tests
```
⚙️ Setup & Installation
```
1. Clone
git clone https://github.com/JOULifestyle/israel_olasehinde.git
cd workforce-management-system
```
```
2. Environment Setup
cp .env.example .env
```
```
3. Local Migration (optional)
npm run migrate
```
🐳 Run with Docker (Recommended)

The project is fully containerized — this runs the API, Worker, RabbitMQ, and PostgreSQL automatically.
```
docker-compose build
docker-compose up
```

Then visit:

API: http://localhost:4000

RabbitMQ UI: http://localhost:15672

(user: guest, password: guest)

🧩 Example docker-compose.yml
```
version: "3.9"
services:
  api:
    build: .
    container_name: workforce_api
    command: npm run dev
    ports:
      - "4000:4000"
    depends_on:
      - rabbitmq
      - db
    env_file:
      - .env

  worker:
    build: .
    container_name: workforce_worker
    command: npm run worker
    depends_on:
      - rabbitmq
      - db
    env_file:
      - .env

  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"

  db:
    image: postgres:14
    container_name: workforce_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: workforce
    ports:
      - "5432:5432"
```
🧪 Running Tests
```
npm test
```
```
With coverage:
```
```
npm test -- --coverage
```

Coverage report available in:
```
coverage/lcov-report/index.html
```

✅ Summary

📊 **Coverage Metrics**

| Metric | Coverage |
|---------|-----------|
| **Statements** | 80.43% |
| **Branches** | 63.43% |
| **Functions** | 65.43% |
| **Lines** | 82.07% |

```
All tests passing:

Test Suites: 19 passed, 19 total
Tests:       53 passed, 53 total
```
🧰 Tech Stack
🧰 **Tech Stack**

| Layer | Technology |
|--------|-------------|
| **Backend** | Node.js + Express |
| **ORM** | MySQL (Sequelize) |
| **Messaging** | RabbitMQ |
| **Testing** | Jest + Supertest |
| **Environment** | dotenv + dotenvx |
| **Code Quality** | ESLint + Prettier |

🧾 Example Endpoints
🧾 **Example API Endpoints**

| Method | Endpoint | Description |
|---------|-----------|-------------|
| **POST** | `/api/departments` | Create a department |
| **POST** | `/api/employees` | Create new employee |
| **GET** | `api/departments/:id/employees?page=2&limit=20` (you can adjust the figures based on the length you want)| List employees in a department (paginated). |
| **GET** | `/api/employees/:id` | Get employee details + leave history |
| **POST** | `/api/leave-requests` | Submit leave request |
| **PATCH** | `api/leave-requests/:id/approve` | Approve leave request by ID (Admin only) |
| **PATCH** | `api/leave-requests/:id/reject` | Reject leave request by ID (Admin only) |
| **GET** | `/api/health` | Health Check |

🧠 Implementation Highlights

Centralized error middleware

Configurable retry strategies

Resilient RabbitMQ message consumer

Layered Service + Repository design

Fully Dockerized for CI/CD environments

Test-ready with mocked AMQP and integration queues

🧾 Example .env.example
# App
PORT=4000
NODE_ENV=development


# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Logging
LOG_LEVEL=info


## 🧭 Key Points

If you’re reviewing this project, check out:

🧱 System Design → src/workers/, src/utils/retryStrategies.js

🔄 Async Reliability → RabbitMQ reconnects, retry strategies

🧩 Test Engineering → tests/unit/leaveService.test.js, tests/integration/

🧪 Mocks & Isolation → Custom Jest mocks for amqplib

🐳 Deployment Ready Setup → Dockerfile + docker-compose

🧠 Code Clarity & Maintainability → service/repo layering & clean interfaces

🪪 License

MIT © 2025 — Workforce Management System
Developed by Israel Olasehinde