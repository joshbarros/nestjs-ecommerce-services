# 🛍️ NestJS E-Commerce Microservices

A production-ready, scalable microservice-based e-commerce platform built with NestJS, following industry best practices and modern architectural patterns.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features
- 🔐 **Authentication & Authorization** - JWT-based auth with refresh tokens
- 👤 **User Management** - User profiles, addresses, preferences
- 📦 **Product Catalog** - Products, categories, variants, search
- 🛒 **Shopping Cart** - Add/remove items, apply coupons
- 📋 **Order Management** - Order creation, tracking, status updates
- 💳 **Payment Processing** - Stripe integration, multiple payment methods
- 📊 **Inventory Management** - Stock tracking, reservations
- 🚚 **Shipping Integration** - Calculate rates, create labels, tracking
- 📧 **Notifications** - Email, SMS, push notifications

### Technical Features
- 🏗️ **Microservices Architecture** - Independent, scalable services
- 🔄 **Event-Driven Communication** - RabbitMQ message broker
- 📊 **CQRS & Event Sourcing** - Separate read/write models
- 🗄️ **Database per Service** - PostgreSQL, MongoDB, Redis
- 🔍 **Distributed Tracing** - OpenTelemetry + Jaeger
- 📈 **Monitoring & Metrics** - Prometheus + Grafana
- 🔒 **Security** - OWASP best practices, rate limiting
- 🐳 **Containerization** - Docker & Docker Compose
- ☸️ **Orchestration** - Kubernetes ready
- 🚀 **CI/CD** - GitHub Actions workflows

## 🏗️ Architecture

This project follows a microservices architecture with the following services:

```
┌─────────────────┐
│   API Gateway   │  - Entry point for all client requests
└────────┬────────┘
         │
    ┌────┴────┬─────────┬──────────┬──────────┬──────────┐
    │         │         │          │          │          │
┌───▼───┐ ┌──▼──┐ ┌────▼────┐ ┌──▼────┐ ┌───▼────┐ ┌──▼────┐
│ Auth  │ │User │ │ Catalog │ │ Cart  │ │ Order  │ │Payment│
│Service│ │Svc  │ │ Service │ │Service│ │Service │ │Service│
└───────┘ └─────┘ └─────────┘ └───────┘ └────────┘ └───────┘
                                              │
                        ┌─────────────────────┼─────────────┐
                        │                     │             │
                  ┌─────▼──────┐      ┌──────▼────┐  ┌─────▼─────┐
                  │ Inventory  │      │ Shipping  │  │Notification│
                  │  Service   │      │  Service  │  │  Service  │
                  └────────────┘      └───────────┘  └───────────┘
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture diagrams.

## 🛠️ Tech Stack

### Core Technologies
- **Runtime:** Node.js 20.x
- **Framework:** NestJS 10.x
- **Language:** TypeScript 5.x

### Databases
- **PostgreSQL 16** - Relational data (users, orders, payments)
- **MongoDB 7** - Document data (products, catalog)
- **Redis 7** - Caching & sessions

### Message Broker
- **RabbitMQ 3.12** - Event-driven communication

### Search
- **Elasticsearch 8** - Product search & analytics

### Monitoring & Observability
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization
- **Jaeger** - Distributed tracing
- **Winston** - Logging

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Terraform** - Infrastructure as Code
- **Helm** - Kubernetes package manager

### CI/CD
- **GitHub Actions** - Automated workflows
- **Docker Hub** - Container registry

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nestjs-ecommerce-services.git
   cd nestjs-ecommerce-services
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.template .env
   # Edit .env with your configurations
   ```

4. **Start infrastructure services**
   ```bash
   npm run docker:up
   ```

   This will start:
   - PostgreSQL (port 5432)
   - MongoDB (port 27017)
   - Redis (port 6379)
   - RabbitMQ (port 5672, management UI: 15672)
   - Elasticsearch (port 9200)
   - Kibana (port 5601)
   - Jaeger (UI: port 16686)
   - Prometheus (port 9090)
   - Grafana (port 3001)

5. **Run database migrations**
   ```bash
   npm run migration:run
   ```

6. **Start development servers**
   ```bash
   npm run start:dev
   ```

### Accessing Services

- **API Gateway:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api
- **RabbitMQ Management:** http://localhost:15672 (admin/admin)
- **Kibana:** http://localhost:5601
- **Jaeger UI:** http://localhost:16686
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001 (admin/admin)
- **PgAdmin:** http://localhost:5050 (admin@admin.com/admin)
- **Mongo Express:** http://localhost:8081

## 📁 Project Structure

```
nestjs-ecommerce-services/
├── apps/                          # Microservices applications
│   ├── api-gateway/              # API Gateway service
│   ├── auth-service/             # Authentication service
│   ├── user-service/             # User management service
│   ├── catalog-service/          # Product catalog service
│   ├── cart-service/             # Shopping cart service
│   ├── order-service/            # Order management service
│   ├── payment-service/          # Payment processing service
│   ├── inventory-service/        # Inventory management service
│   ├── shipping-service/         # Shipping service
│   └── notification-service/     # Notification service
│
├── libs/                          # Shared libraries
│   ├── shared/                   # Common utilities
│   ├── database/                 # Database configurations
│   └── messaging/                # Message broker configurations
│
├── infrastructure/                # Infrastructure as Code
│   ├── docker/                   # Docker configurations
│   ├── kubernetes/               # Kubernetes manifests
│   ├── terraform/                # Terraform modules
│   └── helm/                     # Helm charts
│
├── docs/                          # Documentation
├── scripts/                       # Utility scripts
└── tests/                         # E2E and integration tests
```

## 💻 Development

### Running Individual Services

```bash
# Start API Gateway
cd apps/api-gateway
npm run start:dev

# Start Auth Service
cd apps/auth-service
npm run start:dev
```

### Building Services

```bash
# Build all services
npm run build

# Build specific service
cd apps/api-gateway
npm run build
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Docker

Build and run with Docker Compose:

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Run services
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

Deploy to Kubernetes:

```bash
# Apply configurations
kubectl apply -f infrastructure/kubernetes/

# Or use Helm
helm install ecommerce ./infrastructure/helm/ecommerce-microservices
```

### Production Checklist

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Development Roadmap](./ROADMAP.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build process or auxiliary tool changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - A progressive Node.js framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Docker](https://www.docker.com/) - Containerization platform
- [Kubernetes](https://kubernetes.io/) - Container orchestration
- All the amazing open-source projects that make this possible

## 📞 Support

- 📧 Email: support@yourdomain.com
- 💬 Discord: [Join our community](https://discord.gg/yourinvite)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nestjs-ecommerce-services/issues)

---

**Built with ❤️ using NestJS and TypeScript**
