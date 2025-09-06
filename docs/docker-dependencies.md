# Docker Dependencies Resolution

## Issue
The project was including Docker-related dependencies (`is-docker` package) in production builds, which was not desired.

## Root Cause
The `@capacitor/cli` package depends on the `open` utility, which in turn depends on `is-docker` for environment detection. The `is-docker` package is a small utility that detects if code is running inside a Docker container - it doesn't actually install Docker.

## Solution
Moved `@capacitor/cli` from `dependencies` to `devDependencies` in `package.json`. This ensures:

- Production builds (`npm install --omit=dev`) don't include Docker-related detection utilities
- Development functionality remains intact - Capacitor CLI is still available for development tasks
- CI/CD workflows continue to work as they install all dependencies including devDependencies

## Verification
- ✅ Build process works correctly
- ✅ Capacitor CLI commands work in development (`npx cap copy`, etc.)
- ✅ Production installs exclude `is-docker` package
- ✅ All development scripts continue to function
- ✅ CI/CD workflows remain unaffected

## Commands
```bash
# Development (includes all dependencies)
npm install

# Production (excludes dev dependencies, no Docker-related packages)
npm install --omit=dev
```