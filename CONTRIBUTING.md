# Contributing to MercaFlow

First off, thank you for considering contributing to MercaFlow! 🎉

It's people like you that make MercaFlow such a great tool for the Brazilian market.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Supabase account

### Development Setup

1. **Fork the repository**

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/mercaflow.git
   cd mercaflow
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**

### ✨ Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Explain why this enhancement would be useful**

### 💻 Code Contributions

1. **Find an issue to work on** - Look for issues labeled `good first issue` or `help wanted`
2. **Comment on the issue** - Let others know you're working on it
3. **Create a branch** - Use descriptive branch names
4. **Make your changes** - Follow our coding standards
5. **Test your changes** - Ensure everything works correctly
6. **Submit a pull request** - Follow our PR template

## 🛠 Development Setup

### Project Structure

```
mercaflow/
├── app/                    # Next.js App Router
├── components/             # React components
├── docs/                   # Documentation
│   └── pt/                # Portuguese docs
├── lib/                   # Utility libraries
├── supabase/              # Database migrations
├── utils/                 # Helper functions
└── public/                # Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 📤 Submitting Changes

### Pull Request Process

1. **Update documentation** - Include relevant documentation updates
2. **Add tests** - Ensure your code is tested
3. **Update CHANGELOG** - Add your changes to the unreleased section
4. **Follow commit conventions** - Use conventional commits format
5. **Fill PR template** - Provide all requested information

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix  
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(auth): add multi-factor authentication
fix(dashboard): resolve data loading issue
docs(readme): update installation instructions
```

## 🎨 Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Prefer functional components with hooks

### CSS/Styling

- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use semantic HTML elements
- Ensure accessibility standards

### Database

- Use descriptive migration names
- Include rollback procedures
- Follow RLS (Row Level Security) patterns
- Document schema changes

## 🧪 Testing

- Write unit tests for utilities
- Add integration tests for API routes
- Test components with React Testing Library
- Ensure accessibility compliance

## 📖 Documentation

- Write documentation in Portuguese (technical docs)
- Keep README and CONTRIBUTING in English
- Include code examples
- Update docs with code changes

## 🔍 Code Review Process

1. **Automated checks** - CI/CD must pass
2. **Manual review** - At least one maintainer review
3. **Testing** - Verify functionality works
4. **Documentation** - Ensure docs are updated
5. **Merge** - Squash and merge when approved

## 🆘 Getting Help

- **Discord**: Join our development community
- **Issues**: Create a GitHub issue
- **Email**: Contact maintainers directly

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MercaFlow! 🚀🇧🇷