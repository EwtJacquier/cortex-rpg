# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cortex RPG is a browser-based tabletop RPG battle grid application built with Next.js. It supports real-time multiplayer sessions where Game Masters (GMs) and players can manage characters, roll dice, engage in combat, and communicate via live chat.

## Common Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Technology Stack
- **Framework:** Next.js 14 with App Router
- **UI:** Material-UI (MUI) 5 with Emotion styling
- **Backend:** Firebase (Realtime Database + Storage + Auth)
- **Dice System:** dddice-js with Three.js/Cannon.js for 3D visualization

### Directory Structure

```
src/
├── app/                 # Next.js App Router (pages and layouts)
├── context/             # React Context for global state
│   └── app-context.tsx  # Central Firebase integration & state management
├── components/          # Reusable UI components (sa-* prefix)
├── parts/               # Page-level sections/forms
├── layouts/             # Layout wrapper components
└── helpers/             # Utility functions (validation, masking)

public/
├── scenes/              # Game map backgrounds (.webp)
├── tokens/              # Character/NPC token images
├── effects/             # Video effects (.webm)
├── sfx/                 # Sound effects
└── js/                  # External libraries (Three.js, dice roller)
```

### Key Files

- `src/context/app-context.tsx` - Central state management hub. Contains all Firebase integration, authentication, and global state (gameData, tokens, messages, users). All real-time data flows through this context.

- `src/components/sa-battle-grid.tsx` - Core gameplay component (~1300 lines). Handles the battle map, token positioning, dice rolling interface, combat actions, and terrain management.

- `src/parts/form-ficha.tsx` - Character sheet form. Manages character attributes, equipment, abilities, and distinctions based on the Cortex RPG system.

- `src/parts/home-content.tsx` - Main game UI layout. Orchestrates the sidebar, battle grid, chat, and scene management.

### State Management Pattern

All global state is managed through `AppContext` in `app-context.tsx`. Key state includes:
- `gameData` - Current game state (active map, doom counter, scene settings)
- `tokens` - All character/NPC tokens with their attributes
- `messages` - Real-time chat and combat log
- `userData` / `userCurrentToken` - Current user and their active character

### Firebase Data Structure

The app uses Firebase Realtime Database with these top-level paths:
- `/game` - Game settings (current map, doom, scene visibility)
- `/users` - Player profiles and permissions
- `/tokens` - Character data (stats, equipment, position)
- `/chat` - Message history

### Component Naming Convention

All custom components use the `sa-` prefix (e.g., `sa-button`, `sa-input`, `sa-modal-basic`). These wrap MUI components with consistent styling.

### Import Path Alias

Use `@/*` for imports from `src/` directory (configured in tsconfig.json).

## Development Notes

- TypeScript build errors are intentionally ignored in production builds (see `next.config.mjs`)
- No testing framework is currently configured
- Firebase credentials are embedded in `app-context.tsx`
