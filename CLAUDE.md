# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a pnpm monorepo containing multiple projects:

- **lc/**: LeetCode problem solutions in TypeScript and JavaScript
- **react-hand-write/**: Custom React hooks and components library
- **micro-fronted/**: Micro-frontend framework implementation
- **playground/**: React + TypeScript + Vite demo project
- **vue-playground/base/**: Vue 3 + TypeScript + Vite demo project

## Development Commands

### Root Level Commands
```bash
# Start React playground development server
pnpm dev
pnpm dev:playground

# Build React playground
pnpm build:playground
```

### React Playground (playground/)
```bash
# Development server
pnpm dev

# Production build with type checking
pnpm build

# Lint code
pnpm lint

# Preview production build
pnpm preview
```

### Vue Playground (vue-playground/base/)
```bash
# Development server
pnpm dev

# Production build with type checking and parallel execution
pnpm build

# Type checking only
pnpm type-check

# Lint and auto-fix
pnpm lint

# Format code with Prettier
pnpm format

# Preview production build
pnpm preview
```

## Architecture Overview

### LeetCode Solutions (lc/)
Contains algorithm implementations focusing on:
- Array manipulation (twoSum, threeSum, moveZeros)
- Binary search variants (search, searchRange, findMin)
- Linked list operations (reverseList, getIntersectionNode)
- Tree operations (toTree)
- String/array processing (groupAnagrams, isPalindrome)

### React Custom Hooks (react-hand-write/)
- **useLastest**: Solves closure issues by always providing the latest ref value
- **useRefValue**: Ref-based value management
- **useUpdate**: Force component re-renders
- **ErrorBoundary**: React error boundary component

### Micro-Frontend Framework (micro-fronted/)
Simple micro-frontend implementation with:
- App registration system (`registerMicroApps`)
- Route handling (`handleRouter`)
- Application lifecycle management

### Development Environments
- **playground/**: React 18 + TypeScript + Vite with ESLint
- **vue-playground/base/**: Vue 3 + Pinia + Vue Router + TypeScript + Vite with ESLint and Prettier

## Package Manager
Uses pnpm with workspace configuration. All projects share dependencies where possible through the monorepo structure.