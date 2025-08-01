# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup
```bash
# Install dependencies
yarn install

# Development server with .env.dev
yarn dev

# Development server (alternative)
yarn start

# Production build with .env.prod
yarn build

# Development build with .env.host.dev
yarn build:dev
```

### Code Quality
```bash
# Type checking
yarn type-check

# Format code
yarn format

# Lint TypeScript/JavaScript files
yarn lint

# Generate new components/pages
yarn generate
```

### Testing
```bash
# Run tests (configured with jsdom environment)
yarn test
```

## Project Architecture

### Technology Stack
- **Framework**: React 17 with TypeScript
- **State Management**: DVA (Redux + Redux-Saga wrapper)
- **UI Library**: Ant Design 4.16.13
- **Build Tool**: Create React App with react-app-rewired
- **Styling**: LESS with theme customization
- **Internationalization**: React Intl

### Core Architecture Patterns

#### DVA State Management
The project uses DVA for state management, combining Redux and Redux-Saga:
- Models are located in `src/models/`
- Each model follows DVA conventions with `state`, `effects`, `reducers`
- Global store is accessible via `window._store`

#### Dynamic Form & List System
The project implements a sophisticated configuration-driven system:

**List System** (`src/controls/layouts/gridTemplate/`):
- Configuration-driven data grids with ProTable
- Supports filtering, sorting, pagination
- Schema-based column definitions
- Model selection widgets for relationships

**Form System** (`src/controls/layouts/schemaTemplate/`):
- Dynamic form generation from JSON schema
- 20+ widget types (Text, DateTime, Model selection, etc.)
- Conditional field visibility with `hideExpression`
- Flexible layouts (1-4 columns)

#### Component Organization
- **`src/components/`**: Reusable UI components organized by domain
- **`src/containers/`**: Layout containers and application shells
- **`src/routes/`**: Route-specific components and views
- **`src/controls/`**: Configuration-driven components (forms, lists, editors)

### Key Directories

#### Services (`src/services/`)
API service modules following a consistent pattern:
- Each service handles specific domain logic
- Uses centralized request utility from `src/util/request.ts`
- Examples: `dashboard.ts`, `auth.ts`, `customer.ts`

#### Models (`src/models/`)
DVA models for state management:
- `global.ts`: Application-wide state
- `auth.ts`: Authentication state
- `menu.ts`: Navigation state
- Domain-specific models follow same pattern

#### Utilities (`src/util/`)
Helper functions and utilities:
- `request.ts`: HTTP client configuration
- `helpers.tsx`: Common utility functions
- `config.ts`: Application configuration
- `Socket.ts`: WebSocket integration

### Configuration System

#### Page Configuration
The project uses a page-based configuration system:
- Pages are defined with `pageInfo` objects containing grid, schema, and button configs
- Forms and lists are generated from these configurations
- API endpoints are configurable per page

#### Theme & Styling
- LESS variables in `src/theme.less` control the design system
- Ant Design theme customization via `config-overrides.js`
- Modular styles organized in `src/styles/`

#### Internationalization
- Multi-language support with React Intl
- Language files in `src/lngProvider/locales/`
- Supports English and Vietnamese

### Gaming Domain
The project includes gaming-specific components:
- **Games**: 5D Game, K3 Game, Wingo Game, TRX Wingo
- **Features**: Betting statistics, game results, user management
- **Components**: Game-specific tables, filters, and statistics

### Development Patterns

#### Component Creation
Use the Plop generator for consistent component creation:
```bash
yarn generate
```

#### API Integration
Services follow a consistent pattern:
- Import from `src/util/request.ts`
- Use TypeScript interfaces for request/response types
- Handle errors consistently

#### Form Widgets
When creating new form widgets:
1. Add to `src/packages/pro-component/schema/`
2. Register in `SchemaEditor.tsx`
3. Handle in `Base.tsx`
4. Export in `Widgets.tsx`

#### Styling
- Use LESS modules for component-specific styles
- Follow existing variable naming conventions
- Utilize Ant Design's design tokens

### Environment Configuration
- **Development**: Uses `.env.dev` with `yarn dev`
- **Production**: Uses `.env.prod` with `yarn build`
- **Host Development**: Uses `.env.host.dev` with `yarn build:dev`

### Build Configuration
- Uses `react-app-rewired` for customization
- Webpack aliases: `@src` points to `src/`
- LESS loader with theme variable injection
- Babel plugins for decorators and class properties