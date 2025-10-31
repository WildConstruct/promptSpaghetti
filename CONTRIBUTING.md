# Contributing to Prompt Spaghetti

Thank you for your interest in Prompt Spaghetti! This is a proprietary project by Wild Construct, currently in active development as part of our professional film industry toolset.

## 🔒 License Notice

This is **proprietary software**. All contributions must be made under agreement with Wild Construct. By contributing, you agree that your contributions become the property of Wild Construct.

## 📋 Development Team Guidelines

### For Authorized Contributors

If you're part of the development team or have been granted contributor access:

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/WildConstruct/prompt_spaghetti_the_revenge.git
   cd prompt_spaghetti_the_revenge
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development environment**
   ```bash
   pnpm dev
   ```

### Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Write tests for new functionality
   - Update documentation as needed

3. **Test your changes**

   ```bash
   pnpm test
   pnpm lint
   pnpm build
   ```

4. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add new node type for character generation"
   ```

### Code Standards

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Testing**: Aim for 80% coverage minimum
- **Linting**: ESLint with Airbnb config

### Commit Message Format

We follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or fixes
- `chore:` Maintenance tasks

### Project Structure

```
prompt-spaghetti/
├── client/          # React frontend
├── server/          # Fastify backend
├── packages/
│   ├── core/       # Shared business logic
│   ├── asset-browser/  # Asset management
│   └── cli/        # Command-line interface
└── docs/           # Documentation
```

### Key Technologies

- **Frontend**: React 18, TypeScript, React Flow, Vite
- **Backend**: Node.js, Fastify, TypeScript
- **State**: Zustand
- **Validation**: Zod
- **Testing**: Jest, React Testing Library

## 🐛 Reporting Issues

For internal team members:

1. Check existing issues first
2. Create detailed bug reports with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Browser/environment details

## 💡 Feature Requests

Feature requests should be discussed with the product team before implementation:

1. Create an issue with the `enhancement` label
2. Describe the use case
3. Provide mockups if applicable
4. Wait for approval before starting work

## 📝 Documentation

- Update the Obsidian vault for architectural decisions
- Keep README.md current with new features
- Document complex algorithms inline
- Update API documentation when changing endpoints

## 🔒 Security

- Never commit secrets or API keys
- Report security issues directly to: wildconstruct@wildconstruct.com
- Follow security best practices in `docs/obsidian-vault/08 - Security & Compliance/`

## 📧 Contact

For questions about contributing:

- **Brian Behm**, CEO and Head Creative
- **Wild Construct**
- **Email**: wildconstruct@wildconstruct.com

## ⚖️ Legal

All contributions are subject to our proprietary license. By submitting code, you agree that:

1. Your contributions become the property of Wild Construct
2. You have the right to submit the contributions
3. You waive any claims to the contributed code

---

_This is a living document and will be updated as our development process evolves._
