🧭 Workforce Management System

[![CI](https://github.com/JOULifestyle/workforce-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/JOULifestyle/workforce-management-system/actions)
[![codecov](https://codecov.io/gh/JOULifestyle/workforce-management-system/branch/main/graph/badge.svg?token=186099bf-4d41-4e6f-b751-5283604fcad5)](https://codecov.io/gh/JOULifestyle/workforce-management-system)
[![Code Style](https://img.shields.io/badge/code%20style-Prettier-orange)](#)
[![Lint](https://img.shields.io/badge/lint-ESLint-blueviolet)](#)
[![Node](https://img.shields.io/badge/node-%3E%3D18-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)

A Node.js workforce management system featuring REST APIs, async workers, retry strategies, and >80% automated test coverage.
Designed for scalability, resilience, and developer clarity.

🚀 Features

RESTful APIs for:

Employees

Departments

Leave Requests

RabbitMQ Worker for asynchronous leave approvals

Retry Strategies

noRetry, fixedRetry, and exponentialRetry

Centralized Error Handling

Includes a test-only /error route for validating middleware

Comprehensive Test Coverage

13 test suites, 21 total tests, ~81% coverage

Environment-driven configuration

Uses dotenv for safe secret management

🧪 Latest Test Summary
Test Suites: 13 passed, 13 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        6.23 s

📊 Coverage Report
Metric	Coverage
Statements	81.17%
Branches	60%
Functions	68%
Lines	81.77%

✅ Coverage reports are generated automatically after running tests with coverage enabled.

🧱 Architecture Overview
src/
 ├── app.js                  # Express app setup + error handler
 ├── config/                 # Database & environment configuration
 ├── controllers/            # HTTP request controllers
 ├── migrations/             # Sequelize migration files
 ├── models/                 # Sequelize models
 ├── repositories/           # Data access layer
 ├── routes/                 # API routing definitions
 ├── services/               # Business logic layer
 ├── utils/                  # Utility modules (retry, wrappers)
 └── workers/                # RabbitMQ consumers
tests/
 ├── unit/                   # Unit tests
 └── integration/            # Integration tests

⚙️ Installation & Setup
1. Clone the Repository
git clone https://github.com/JOULifestyle/workforce-management-system.git
cd workforce-management

2. Install Dependencies
npm install

3. Create a .env File
cp .env.example .env

4. Run Database Migrations
npm run migrate

5. Start the API Server
npm run dev

6. Start the RabbitMQ Worker
npm run worker

🧭 Running Tests
Run all tests
npm test

Run with coverage
npm test -- --coverage


Coverage reports are saved to:
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
npm run lint	Run ESLint for code quality
npm run format	Auto-format with Prettier
🧾 Example API Endpoints
Method	Endpoint	Description
GET	/api/employees	List all employees
POST	/api/employees	Create an employee
GET	/api/departments	List all departments
POST	/api/leaves	Submit leave request
GET	/api/leaves/:id	Retrieve leave request by ID
🧠 Implementation Highlights

Error Handling Middleware
Captures exceptions globally and returns structured JSON responses.

Retry Strategies (src/utils/retryStrategies.js)
Implements resilient retry policies (noRetry, fixedRetry, exponentialRetry) with logging and delay backoff.

Worker Lifecycle (src/workers/leaveConsumer.js)
Handles queue messages, gracefully shuts down on interrupts, and manages DLQ (dead-letter queue) scenarios.

Test Mode Configuration
/error route exists only under NODE_ENV=test for verifying error propagation.

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

 Add role-based access control (RBAC)

 Introduce caching with Redis

 Add Swagger (OpenAPI) documentation

 Dockerize full stack (API + Worker + RabbitMQ)

 Setup GitHub Actions for CI/CD pipelines

🪪 License

MIT © 2025 — Workforce Management System
Developed by Israel Olasehinde