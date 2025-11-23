# Contributing to NestJS E-Commerce Microservices

First off, thank you for considering contributing to this project! It's people like you that make this project great.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

### Our Standards

- **Be Respectful:** Treat everyone with respect and kindness
- **Be Constructive:** Provide helpful, constructive feedback
- **Be Collaborative:** Work together towards common goals
- **Be Professional:** Maintain professionalism in all interactions

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20.x or higher
- npm 10.x or higher
- Docker & Docker Compose
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nestjs-ecommerce-services.git
   cd nestjs-ecommerce-services
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/nestjs-ecommerce-services.git
   ```

## 💻 Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.template .env
   # Edit .env with your local configurations
   ```

3. **Start infrastructure services:**
   ```bash
   npm run docker:up
   ```

4. **Run migrations:**
   ```bash
   npm run migration:run
   ```

5. **Start development server:**
   ```bash
   npm run start:dev
   ```

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- **Clear title:** Describe the bug concisely
- **Description:** Detailed description of the issue
- **Steps to reproduce:** Step-by-step instructions
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Environment:** OS, Node version, etc.
- **Screenshots:** If applicable

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:

- **Clear title:** Describe the feature concisely
- **Use case:** Why is this feature needed?
- **Proposed solution:** How should it work?
- **Alternatives:** Any alternative approaches considered?

### Submitting Changes

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write clean, readable code
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

## 📝 Coding Standards

### TypeScript Style Guide

- Use TypeScript for all new code
- Enable strict mode in tsconfig.json
- Avoid using `any` type (use `unknown` if necessary)
- Use interfaces for object shapes
- Use enums for fixed sets of values

### Code Formatting

We use Prettier for code formatting:

```bash
npm run format
```

### Linting

We use ESLint for code quality:

```bash
npm run lint
```

### Naming Conventions

- **Files:** `kebab-case.ts`
- **Classes:** `PascalCase`
- **Interfaces:** `PascalCase` (prefix with `I` if needed)
- **Functions/Methods:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Private properties:** prefix with `_` or use `#`

### Code Organization

```typescript
// 1. Imports (grouped by type)
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';

// 2. Decorators and class declaration
@Injectable()
export class UserService {
  // 3. Properties
  private readonly logger = new Logger(UserService.name);

  // 4. Constructor
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 5. Public methods
  async findById(id: string): Promise<UserDto> {
    // Implementation
  }

  // 6. Private methods
  private validateUser(user: User): boolean {
    // Implementation
  }
}
```

### Best Practices

- **Single Responsibility:** Each class should have one responsibility
- **DRY:** Don't Repeat Yourself
- **KISS:** Keep It Simple, Stupid
- **YAGNI:** You Aren't Gonna Need It
- **Dependency Injection:** Use NestJS DI system
- **Error Handling:** Always handle errors gracefully
- **Logging:** Log important events and errors
- **Security:** Never commit secrets or sensitive data

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation only changes
- **style:** Code style changes (formatting, missing semi-colons, etc.)
- **refactor:** Code refactoring (neither fixes a bug nor adds a feature)
- **perf:** Performance improvements
- **test:** Adding or updating tests
- **build:** Changes to build system or dependencies
- **ci:** Changes to CI configuration files and scripts
- **chore:** Other changes that don't modify src or test files

### Scope

The scope should be the name of the service or module affected:

- `api-gateway`
- `auth-service`
- `user-service`
- `catalog-service`
- `cart-service`
- `order-service`
- etc.

### Examples

```bash
feat(auth-service): add OAuth2 Google authentication

Implement Google OAuth2 authentication flow
- Add passport-google-oauth20 strategy
- Create OAuth controller
- Update user entity with Google ID

Closes #123
```

```bash
fix(cart-service): prevent negative quantities

Add validation to ensure cart item quantities are always positive

Fixes #456
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Tests pass locally (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional commits
- [ ] No merge conflicts with main branch

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review performed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. At least one maintainer must approve the PR
2. All CI checks must pass
3. All conversations must be resolved
4. Branch must be up to date with main

### After Approval

1. Maintainer will merge the PR
2. Delete your feature branch
3. Pull the latest main branch:
   ```bash
   git checkout main
   git pull upstream main
   ```

## 🧪 Testing Guidelines

### Unit Tests

- Write unit tests for all business logic
- Use Jest for testing
- Aim for >80% code coverage
- Mock external dependencies

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user', async () => {
      // Arrange
      const userId = 'test-id';
      const expectedUser = { id: userId, email: 'test@test.com' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedUser as User);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });
});
```

### Integration Tests

- Test interaction between components
- Use test database
- Clean up after each test

### E2E Tests

- Test complete user flows
- Use Supertest for HTTP testing
- Test both success and error scenarios

```typescript
describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });
});
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex logic
- Keep comments up to date

```typescript
/**
 * Creates a new user account
 *
 * @param createUserDto - User creation data
 * @returns Created user with access token
 * @throws {ConflictException} If email already exists
 * @throws {BadRequestException} If validation fails
 */
async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
  // Implementation
}
```

### API Documentation

- Use Swagger decorators
- Document all endpoints
- Include request/response examples

```typescript
@ApiOperation({ summary: 'Create a new user' })
@ApiCreatedResponse({
  description: 'User created successfully',
  type: UserResponseDto,
})
@ApiBadRequestResponse({ description: 'Invalid input data' })
@ApiConflictResponse({ description: 'Email already exists' })
@Post()
async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
  return this.userService.create(createUserDto);
}
```

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Updating dependencies
- Modifying architecture

## ❓ Questions?

If you have questions:

1. Check the [documentation](./docs)
2. Search [existing issues](https://github.com/OWNER/REPO/issues)
3. Create a new issue with the `question` label
4. Join our [Discord community](https://discord.gg/INVITE)

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Special recognition for significant contributions

Thank you for contributing! 🚀
