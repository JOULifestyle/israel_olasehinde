# Workforce Management System

[![Tests](https://img.shields.io/badge/tests-✔%2012%20passed-brightgreen)](#)
[![Coverage](https://img.shields.io/badge/coverage-78%25-yellowgreen)](#)

A Node.js workforce management system with:

- **RESTful APIs** for employees, departments, and leave requests
- **RabbitMQ worker** for async leave approval processing
- **Retry strategies** (`noRetry`, `fixedRetry`, `exponentialRetry`)
- **Full Jest test suite** with integration & unit tests
- **Test coverage reports** (currently ~78% overall)

---

## 📊 Test Coverage Summary
- Statements: **77.72%**
- Branches: **50%**
- Functions: **71.05%**
- Lines: **78.35%**

> Coverage reports are generated with:
```bash
npm test -- --coverage
Reports are saved in /coverage/lcov-report/index.html.

🚀 Quick Start
bash
Copy code
# Install dependencies
npm install

# Run migrations / sync DB
npm run migrate

# Start API
npm run dev

# Run worker (RabbitMQ)
npm run worker

# Run tests with coverage
npm test -- --coverage
🛠️ Tech Stack
Node.js + Express

Sequelize (SQLite/Postgres)

RabbitMQ for messaging

Jest + Supertest for testing

yaml
Copy code
