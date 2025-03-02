# Contributing to Tripz

We love your input! We want to make contributing to Tripz as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Issues

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/tripz/issues); it's that easy!

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Environment Setup

Please refer to the [DEVELOPER.md](DEVELOPER.md) document for detailed instructions on setting up your development environment.

## Code Style Guidelines

### JavaScript/TypeScript Style Guide

- We use TypeScript for the entire project
- Follow the ESLint configuration provided in the project
- Use 2 spaces for indentation
- Use camelCase for variables and functions
- Use PascalCase for React components and class names
- Use arrow functions when possible

### React Style Guide

- Use functional components with Hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Destructure props in component parameters
- Use Material-UI components for consistency

### API Development Guidelines

- Follow RESTful principles for API endpoints
- Document API endpoints using JSDoc comments
- Always provide appropriate error responses
- Validate request data
- Implement proper error handling

## Project Structure

Please maintain the existing project structure:

- `/frontend` - React frontend application
- `/backend` - Node.js/Express backend API
- Place new components in appropriate directories
- Create new services in the appropriate service files

## Testing

- Write tests for new features
- Ensure existing tests pass before submitting PR
- Use Jest and React Testing Library for frontend
- Use Jest for backend testing

## Documentation

- Update the README.md with details of changes to the interface
- Update the API documentation when endpoint changes are made
- Comment complex code sections
- Write useful commit messages

## License

By contributing, you agree that your contributions will be licensed under the project's license.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/master/CONTRIBUTING.md).