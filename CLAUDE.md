# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a pnpm monorepo containing multiple packages:

- **lc/**: LeetCode problem solutions (TypeScript/JavaScript)
- **react-hand-write/**: Custom React hooks library with WebWorker utilities
- **micro-fronted/**: Minimal micro-frontend framework
- **playground/**: React + TypeScript + Vite demo application
- **vue-playground/base/**: Vue 3 + TypeScript + Vite demo application

## Development Commands

### Root Level
```bash
# Start React playground (main demo environment)
pnpm dev
# or explicitly:
pnpm dev:playground

# Build React playground
pnpm build:playground
```

### React Playground (playground/)
```bash
# Development server (port typically 5173)
pnpm dev

# Production build with TypeScript checking
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

# Production build with type checking (parallel execution)
pnpm build

# Type checking only (no build)
pnpm type-check

# Lint and auto-fix
pnpm lint

# Format code with Prettier
pnpm format

# Preview production build
pnpm preview
```

## Key Architecture Patterns

### React Custom Hooks Library (react-hand-write/)

#### Core Hooks
- **useLastest**: Returns a ref that always contains the latest value, solving closure staleness issues
- **useUpdate**: Forces component re-renders via setState
- **useRefValue**: Ref-based value management

#### Advanced WebWorker-Based Hooks

**useVideoAnalysis** - Video frame analysis using WebWorker for non-blocking UI:
- Analyzes video frames for brightness, color distribution, scene changes
- Generates thumbnails at key frames
- Returns: `{ isAnalyzing, progress, currentAnalysis, analysisResult, thumbnails, startAnalysis, stopAnalysis, reset }`
- Worker communication pattern: posts `ANALYZE_FRAME`, `GENERATE_THUMBNAIL`, `EXTRACT_KEYFRAMES` messages
- Expected worker at `/workers/videoAnalysisWorker.js`

**useSplitVideo** - Large video chunked upload with MD5 calculation:
- Uses `MD5WorkerPool` for parallel MD5 computation across multiple workers
- Chunks files into configurable sizes (default 10MB)
- Manages upload state: `idle`, `preparing`, `calculating-md5`, `uploading`, `merging`, `completed`, `error`, `paused`, `cancelled`
- Returns: `{ uploadFile, chunkFile, md5Progress, isPaused, error, isUploading, status, progress }`

**useVideoLoader** - Video loading with progress tracking:
- Supports both File objects and URLs
- Tracks loading progress and metadata extraction
- Returns: `{ isLoading, isLoaded, progress, error, metadata, videoElement, loadVideo, cancelLoad, retry, reset }`

#### Worker Pool Pattern (worker/workpool.ts)

The repository implements a reusable Worker Pool pattern:
- `WorkerPool`: Generic worker pool with task queue and worker reuse
- `MD5WorkerPool`: Specialized pool for MD5 calculation tasks
- Workers are initialized once and reused to avoid creation/destruction overhead
- Task queuing system with progress callbacks
- Worker lifecycle: `initialize()` → `execute()` → `releaseWorker()` → `destroy()`

### Micro-Frontend Framework (micro-fronted/)

Simple micro-frontend implementation:
- `registerMicroApps(apps)`: Registers micro-apps array
- `start()`: Initializes router matching via `handleRouter()`
- `getApps()`: Retrieves registered apps
- Core files: `index.ts` (app registry), `handleRoute.ts` (routing logic)

### LeetCode Solutions (lc/)

Algorithm implementations covering:
- **Arrays**: twoSum, threeSum, moveZeros, maxSubArray, rotate, merge
- **Binary Search**: search, searchRange, findMin, findMin_duplicate, searchInsert, searchMatrix
- **Linked Lists**: reverseList, getIntersectionNode, mergeTwoLists, addTwoNumbers, removeNthFromEnd, swapPairs, hasCycle, sortList
- **Trees**: toTree, inorderTraversal, invertTree, diameterOfBinaryTree
- **Hash Tables**: groupAnagrams, singleNumber-hashmap, longestConsecutive
- **Other**: isPalindrome, maxArea, produceExpectSelf, subArraySum, findMedianSortedArray

## Important Notes

### Package Manager
- Uses **pnpm workspaces** exclusively (see `pnpm-workspace.yaml`)
- Workspace packages: `playground`, `vue-playground/base`, `react-hand-write`
- Use `pnpm --filter <package>` to run commands in specific packages

### WebWorker Integration
- Worker files expected in `public/workers/` directory for runtime loading
- Worker Pool pattern avoids repeated worker creation for performance
- Progress callbacks allow UI updates during long-running worker tasks

### Video Processing Demo (playground/src/VideoLoaderDemo.tsx)
- Three-tab interface: "视频加载" (load), "视频分析" (analysis), "大视频分片" (split)
- Demonstrates integration of all three video-related hooks
- Auto-switches to analysis tab when video loads
- Shows real-time progress, frame analysis, thumbnails, and upload chunks
