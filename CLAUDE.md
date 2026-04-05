# CLAUDE.md

This file provides guidance to AI assistants when working with code in this repository.

## Project Overview

CEX Admin (cex-admin) is a cryptocurrency exchange administration dashboard for managing customers, deposits/withdrawals, games (Wingo, K3, 5D, TRX), VIP tiers, commission rates, wheel spins, and house wallets. The UI is built with React + Ant Design + DVA framework, serving Vietnamese-language admin users.

**Tech Stack**: React 17.0.2 + TypeScript 4.3.5 + Ant Design 4.16.13 + DVA 2.6.0-beta.21 (Redux-Saga) + LESS + react-app-rewired + Axios 0.21.1

**Runtime**: Node.js ≥14, Yarn preferred, Port 4334 (dev)

## Development Commands

```bash
# Development
yarn dev                # Start dev server (loads .env.dev via dotenv-cli)
yarn start              # Start with --openssl-legacy-provider flag

# Code Quality
yarn type-check         # TypeScript check (tsc --pretty --noEmit)
yarn lint               # ESLint for .ts, .tsx, .js files
yarn format             # Prettier format all files

# Code Generation
yarn generate           # Run Plop generators (page, crud, models, select)

# Build
yarn build              # Production build (loads .env.prod)
yarn build:dev          # Dev-hosted build (loads .env.host.dev)
```

## Architecture

### DVA + Redux-Saga Architecture

The app uses **DVA** (a Redux-Saga framework) for state management. DVA models combine namespace, state, reducers, effects (saga generators), and subscriptions into single files.

```
src/
├── index.tsx           # DVA app bootstrap, model registration
├── NextApp.tsx          # ConnectedRouter entry point
├── nav.ts              # Static sidebar menu definitions
├── routes.ts            # Legacy route config (partially used)
├── routes/              # Route components (the actual pages)
│   ├── index.tsx        # Main route switch
│   ├── home/            # Dashboard pages
│   ├── customer/        # Customer detail pages
│   ├── game/            # Game management (wingo, k3, 5d, trx)
│   ├── games/           # Game sub-routes
│   ├── houseWallet/     # House wallet management
│   ├── main/            # System admin (roles, users, agencies)
│   └── default/         # CMS pages (PageEditor, FormViewer, ListViewer)
├── models/              # DVA models (state management)
├── services/            # API service functions
├── components/          # Reusable UI components
├── containers/          # Layout containers (App, Sidebar, Topbar)
├── constants/           # Enums, action types, theme settings
├── interfaces/          # TypeScript interfaces per domain
├── types/               # Additional TypeScript type definitions
├── packages/            # Internal packages (pro-table, pro-component)
├── util/                # Utilities (request, helpers, Socket, enums)
├── lngProvider/         # i18n setup (vi_VN, en_US)
├── styles/              # Global LESS styles
├── assets/              # Static assets (images, vendor styles)
└── controls/            # Control components
```

### State Management (DVA Models)

Models are registered in `src/index.tsx` and follow the DVA model pattern:

```typescript
// ✅ Correct DVA model pattern
const authModel: Model = {
  namespace: 'auth',         // unique namespace for dispatch
  state: { /* initial state */ },
  effects: {
    *userSignIn({ payload }, { put, call }) {
      const res = yield call(serviceFunction, payload);
      yield put({ type: 'reducerName', payload: res });
    },
  },
  reducers: {
    reducerName(state, { payload }) {
      return { ...state, ...payload };
    },
  } as ReducersMapObject<any, any>,
};
```

**Registered Models**: `auth`, `global`, `common`, `settings`, `modal`, `menu`, `role`, `user`, `houseWallet`, `chat`

**Dispatching Actions**:
```typescript
// From connected components
dispatch({ type: 'namespace/effectName', payload: { ... } });

// Cross-model dispatch within effects
yield put({ type: 'otherNamespace/reducerName', payload: data });
```

### API Layer

All API calls go through `src/util/request.ts` — a centralized Axios wrapper.

**Key behaviors**:
- Base URL: `REACT_APP_URL/api` (configured via env vars)
- Auto-attaches Bearer token from `localStorage.getItem('token')`
- 5-minute timeout per request
- Auto-refreshes token from `accesstoken` response header
- **403 response → auto sign-out** (dispatches `auth/userSignOut`)
- Returns `{ status, data }` — never throws

**Service pattern**:
```typescript
// ✅ Service function pattern
export const getCustomerInfo = async (customerId: number) => {
  const token = localStorage.getItem('token')
  const res: any = await request({
    url: '/admin/customer/get-all-customer-info',
    options: {
      method: 'post',
      data: { customerId },
      headers: { Authorization: `Bearer ${token}` }
    }
  })
  if (res && res.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data?.message || DEFAULT_ERROR_MESSAGE,
    }
  }
}
```

**API response convention**: Backend returns `{ code: 0, data: ..., message: ... }`. Code `0` = success.

### Routing

Uses **react-router-dom v5** with DVA's router integration:

- `src/NextApp.tsx` → `ConnectedRouter` → root `<Route>`
- `src/containers/App/index.tsx` → Auth guard (`RestrictedRoute`), locale provider
- `src/routes/index.tsx` → Main `<Switch>` with all authenticated routes
- Routes use both direct imports and `asyncComponent` for code splitting

**Auth flow**: Unauthenticated → `/signin` → 2FA → store token in localStorage → redirect to `/dashboard`

### Internationalization (i18n)

Uses **react-intl** with per-module JSON locale files:

```
src/lngProvider/
├── locales/
│   ├── vi_VN/          # Vietnamese (primary)
│   │   ├── index.js    # Aggregates all locale JSON files
│   │   ├── vi_VN.json  # Core translations
│   │   └── [module]/   # Per-module translation files
│   └── en_US/          # English
└── index.ts            # Locale registry
```

Plop generators auto-create locale files for new pages.

### Code Generation (Plop)

Run `yarn generate` to scaffold new pages. Available generators:

| Generator | Creates |
|-----------|---------|
| `page` | List page + route + model + service + i18n |
| `crud` | CRUD form page (OneCol/TwoCol/ThreeCol layouts) |
| `models` | DVA model + service file |
| `select` | Select component |
| `selectlist` | Select with list component |

**Injection markers** in code (do not remove):
- `/* PLOP_INJECT_IMPORT */` — import statements
- `/* PLOP_INJECT_EXPORT */` — model registrations / route declarations

## Coding Conventions

### File Naming
- **Models**: `camelCase.ts` — e.g. `houseWallet.ts`, `auth.ts`
- **Services**: `camelCase.ts` — e.g. `customer.ts`, `depositService.ts`
- **Components**: `PascalCase/` directories — e.g. `HouseWallet/`, `Deposit/`
- **Routes**: `camelCase/` directories — e.g. `houseWallet/`, `customer/`
- **Interfaces**: `PascalCase.ts` — e.g. `Customer.ts`, `K3Game.ts`

### Component Patterns

The codebase mixes class components (legacy) and functional components:

```typescript
// ✅ Newer functional component pattern
const App: React.FC<AppProps> = ({ match }) => {
  return (
    <div className="gx-main-content-wrapper">
      <Switch>
        <Route path={`/dashboard`} component={HomeIndex} />
      </Switch>
    </div>
  );
};

// Legacy class component (containers/App)
class App extends Component<Props> {
  componentWillMount() { /* ... */ }
  render() { /* ... */ }
}
export default connect(mapStateToProps)(App);
```

### TypeScript Conventions
- `strict: true` in tsconfig
- Experimental decorators enabled
- Heavy use of `any` types (legacy code)
- Interfaces defined in `src/interfaces/` per domain and `src/interfaces.ts` for global store
- Enums use SCREAMING_SNAKE_CASE values

### Import Conventions

**Path Aliases** (defined in `tsconfig.paths.json` + `config-overrides.js`):
```typescript
import request from '@src/util/request'    // @src → src/
import { COLORS } from '@constants/constants' // @constants → src/constants/ (tsconfig only)
```

> **Note**: `@src` is resolved by both Webpack (via `config-overrides.js`) and TypeScript. `@constants` is TypeScript-only.

### CSS/Styling
- Global styles use **LESS** with Ant Design theme variable overrides in `src/theme.less`
- Primary color: `#f03945` (red)
- CSS class prefix: `gx-` (e.g. `gx-main-content-wrapper`, `gx-header-horizontal`)
- Ant Design variables are injected at build time via `less-loader` + `customize-cra`

## Key Non-Obvious Patterns

### Token Management
```typescript
// ✅ Token is stored in localStorage as a raw string
localStorage.getItem('token')    // returns the JWT string directly
localStorage.getItem('user_id')  // returns stringified user object

// The `local` utility auto-JSON-parses:
import local from '@src/util/local'
local.get('token')    // returns parsed token
local.get('user_id')  // returns parsed user object
```

### DVA Store on Window
```typescript
// The DVA store is exposed globally for emergency dispatches
window._store = app?._store;

// Used in request.ts for auto-logout on 403
window._store.dispatch({ type: 'auth/userSignOut' });
```

### Socket.io Integration
`src/util/Socket.ts` provides real-time WebSocket connectivity via `socket.io-client` v4. Used for live game updates.

### Pro-Table (Internal Package)
`src/packages/pro-table/` is an internal adaptation of Ant Design Pro's ProTable, providing configurable data tables with built-in search, pagination, and column management. Column configs are JSON-driven via Plop data templates.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `REACT_APP_URL` | Backend API base URL |
| `REACT_APP_IMAGE_URI` | Image upload/serve URL |
| `REACT_APP_FILE_MANAGER` | File manager URL |
| `REACT_APP_PAGESIZE` / `REACT_APP_PAGE_SIZE` | Default pagination size |
| `REACT_APP_APP_NAME` | Application name identifier |
| `REACT_APP_PAGE_EDITOR_ID` | CMS page editor config ID |
| `REACT_APP_PAGE_SETTING_ID` | CMS page settings config ID |
| `REACT_APP_RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key |
| `REACT_APP_IS_DEV` | Dev mode flag |
| `IS_DEBUG` | Debug logging toggle |

Environment files: `.env`, `.env.dev`, `.env.host.dev`, `.env.prod`

## Important Rules

### State Management
- Always register new DVA models in `src/index.tsx` — both import and `app.model()`
- Use `yield call(serviceFunction)` in effects — never call services directly
- Reducer return types are cast with `as Reducer<any, Action<any>>` (DVA TypeScript workaround)

### API Calls
- All service functions should use the centralized `request()` from `src/util/request.ts`
- Check `res.data?.code === 0` for success, not just HTTP status
- Default error message: `'Hệ thống đang bận vui lòng thực hiện sau'`

### Code Generation
- Never remove `/* PLOP_INJECT_IMPORT */` or `/* PLOP_INJECT_EXPORT */` comments — Plop uses them
- Column data for Plop generators lives in `plop-templates/data/[pageName].json`

### Styling
- Use `gx-` prefixed CSS classes from the global LESS framework
- Theme colors are in `src/theme.less` — don't hardcode color values
- Ant Design component theming is via LESS variable overrides, not CSS-in-JS

### Authentication
- 2FA flow: login → receive temp token → verify 2FA → receive real token
- Token refresh happens silently via response header `accesstoken`
- 403 errors trigger automatic sign-out via `window._store.dispatch`

### Pagination
- Default: `{ skip: 0, limit: 10, total: 0, totalPage: 0, page: 1 }`
- Backend uses `skip`/`limit` (not `page`/`pageSize`)

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **cex-admin** (4399 symbols, 8841 relationships, 114 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/cex-admin/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/cex-admin/context` | Codebase overview, check index freshness |
| `gitnexus://repo/cex-admin/clusters` | All functional areas |
| `gitnexus://repo/cex-admin/processes` | All execution flows |
| `gitnexus://repo/cex-admin/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
