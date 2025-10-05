🧭 Workforce Management System

[![CI](https://github.com/JOULifestyle/workforce-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/JOULifestyle/workforce-management-system/actions)
[![codecov](https://codecov.io/gh/JOULifestyle/workforce-management-system/branch/main/graph/badge.svg?token=186099bf-4d41-4e6f-b751-5283604fcad5)](https://codecov.io/gh/JOULifestyle/workforce-management-system)
[![Code Style](https://img.shields.io/badge/code%20style-Prettier-orange)](#)
[![Lint](https://img.shields.io/badge/lint-ESLint-blueviolet)](#)
[![Node](https://img.shields.io/badge/node-%3E%3D18-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)

A Node.js workforce management system featuring REST APIs, asynchronous RabbitMQ workers, retry strategies, and comprehensive automated tests (~81% coverage).
Designed for scalability, maintainability, and resilience in high-traffic scenarios.

🚀 Features

RESTful APIs for:

Employees

Departments

Leave Requests

RabbitMQ Worker

Asynchronous processing of leave requests

Auto-approval logic for short leaves (≤2 days)

Idempotent handling to avoid duplicate updates

Retry strategies: noRetry, fixedRetry, exponentialRetry

Centralized Error Handling

Structured JSON responses for all errors

Test-only /error route for middleware validation

Comprehensive Test Coverage

19 test suites, 53 tests, all passing

~81% overall coverage

Includes integration tests for APIs and message queue processing

Environment-driven configuration

Uses .env and dotenvx for safe secret management

🧪 Final Test Summary
Metric	Coverage
Statements	81.17%
Branches	60%
Functions	68%
Lines	81.77%

All tests passed:

Test Suites: 19 passed, 19 total
Tests:       53 passed, 53 total
Snapshots:   0 total
Time:        21.99 s


Coverage reports are generated automatically after running tests with --coverage.

🧱 Architecture Overview
src/
 ├── app.js                  # Express app + centralized error handler
 ├── config/                 # Database & environment configuration
 ├── controllers/            # HTTP request controllers
 ├── migrations/             # Sequelize migration files
 ├── models/                 # Sequelize models
 ├── repositories/           # Data access layer
 ├── routes/                 # API routing definitions
 ├── services/               # Business logic layer
 ├── utils/                  # Utility modules (retry strategies, response wrappers)
 └── workers/                # RabbitMQ consumers

tests/
 ├── unit/                   # Unit tests for services, utils
 └── integration/            # API + queue integration tests

⚙️ Installation & Setup

Clone the Repository

git clone https://github.com/JOULifestyle/workforce-management-system.git
cd workforce-management-system


Install Dependencies

npm install


Create a .env File

cp .env.example .env


Run Database Migrations

npm run migrate


Start the API Server

npm run dev


Start the RabbitMQ Worker

npm run worker

🧭 Running Tests

Run all tests:

npm test


Run with coverage:

npm test -- --coverage


Coverage reports saved to:

/coverage/lcov-report/index.html

🧰 Tech Stack
Layer	Technology
Backend	Node.js + Express
ORM	Sequelize (SQLite/PostgreSQL)
Messaging	RabbitMQ
Testing	Jest + Supertest
Environment	Dotenv + dotenvx
Code Quality	ESLint + Prettier
🧩 Scripts
Script	Description
npm run dev	Start API in development mode
npm run worker	Start RabbitMQ consumer
npm test	Run all Jest tests
npm test -- --coverage	Generate coverage report
npm run migrate	Run Sequelize migrations
npm run lint	Run ESLint
npm run format	Auto-format with Prettier
🧾 Example API Endpoints
Method	Endpoint	Description
GET	/api/employees	List all employees
POST	/api/employees	Create an employee
GET	/api/employees/:id	Get employee details + leave history
GET	/api/departments	List all departments
POST	/api/departments	Create a department
POST	/api/leave-requests	Submit leave request
GET	/api/leave-requests/:id	Retrieve leave request by ID
🧠 Implementation Highlights

Error Handling Middleware: Captures exceptions globally and returns structured JSON responses.

Retry Strategies (src/utils/retryStrategies.js): Supports noRetry, fixedRetry, exponentialRetry with logging and delay backoff.

Worker Lifecycle (src/workers/leaveConsumer.js): Gracefully handles RabbitMQ messages, implements DLQ scenarios, and ensures idempotency.

Service + Repository Pattern: Separates controllers from business logic and data access for maintainability and scalability.

Test Mode Configuration: /error route exists only under NODE_ENV=test for validating error propagation.

Pagination & Indexing: Ensures database queries scale with large datasets.

Environment-driven: DB URL, RabbitMQ URL, logging levels, and ports all configurable via .env.

🧾 Example .env.example
# App
PORT=4000
NODE_ENV=development

# Database
DB_URL=sqlite::memory:

# RabbitMQ
RABBITMQ_URL=amqp://localhost

# Logging
LOG_LEVEL=info

📈 Future Enhancements

Role-based access control (RBAC)

Redis caching for faster lookups

Swagger/OpenAPI documentation

Docker Compose for full stack (API + Worker + RabbitMQ)

CI/CD pipelines via GitHub Actions

🪪 License

MIT © 2025 — Workforce Management System
Developed by Israel Olasehinde