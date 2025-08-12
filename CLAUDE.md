# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This repository contains a multi-project workspace with the main application located in the `buildathon-vercel-supa-workspaces/` subdirectory.

## Development Commands

Navigate to the main application directory first:
```bash
cd buildathon-vercel-supa-workspaces
```

Then use these commands:
- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build production application (required before deployment)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks (must pass for deployment)

## Architecture Overview

The main application is a **Next.js 15 App Router** collaborative workspace platform with these key characteristics:

### Core Architecture
- **Authentication-Free Design**: No login/signup required - instant workspace access via URLs
- **URL-Based Workspaces**: Each workspace is identified by `/workspace/[workspaceId]` pattern
- **Real-time Collaboration**: Powered by Supabase real-time subscriptions for presence tracking
- **Temporary Sessions**: Browser-generated UUIDs for user identification without accounts

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase for real-time database and presence
- **State Management**: React hooks with localStorage persistence

### Key Components Flow
1. **Home Page** (`app/page.tsx`) - Entry point with workspace creation
2. **Dynamic Workspaces** (`app/workspace/[workspaceId]/page.tsx`) - Main collaboration interface
3. **Real-time Hooks** (`hooks/useWorkspaceActivity.ts`) - Centralized presence management
4. **Database Setup** (`supabase-setup.sql`) - Required schema for workspace_presence and workspace_items tables

### Environment Setup
Required `.env.local` in the main app directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
```

### Development Workflow
1. Set up Supabase project and run `supabase-setup.sql`
2. Configure environment variables
3. Run `npm install` in the main app directory
4. Use `npm run dev` for development
5. Test multi-user functionality by opening workspace URLs in multiple tabs
6. Ensure `npm run lint` and `npm run build` pass before deployment

### Database Schema
- **workspace_presence**: Tracks online users with workspace_id, user_session, user_name, last_seen
- **workspace_items**: Stores collaborative data with JSONB content and position tracking

The application emphasizes rapid development through component reuse and real-time features without authentication complexity.