# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Development
```bash
# Development with .env.dev
yarn dev

# Type checking (run before commits)
yarn type-check

# Format code
yarn format

# Lint code
yarn lint

# Generate components/pages
yarn generate
```

### Building
```bash
# Production build with .env.prod
yarn build

# Development build with .env.host.dev
yarn build:dev
```

### Testing
```bash
# Run tests
yarn test
```

## Technology Stack

- **Framework**: React 17 + TypeScript 4.3.5
- **State Management**: DVA (Redux + Redux-Saga)
- **UI Library**: Ant Design 4.16.13
- **Build Tool**: react-app-rewired with custom config
- **Styling**: LESS with theme customization
- **HTTP Client**: Axios with centralized request handler
- **i18n**: React Intl

## Core Architecture

### DVA State Management Pattern

DVA wraps Redux and Redux-Saga with a model-based architecture. All models follow this structure:

```typescript
{
  namespace: 'modelName',
  state: {},
  effects: {
    *effectName({ payload }, { call, put, select }) {}
  },
  reducers: {
    reducerName(state, { payload }) {}
  },
  subscriptions: {
    setup({ dispatch, history }) {}
  }
}
```

**Key Points**:
- Models are in `src/models/`
- Effects are generators for async operations
- Reducers are pure functions for state updates
- Global store accessible via `window._store`
- Dispatch actions: `dispatch({ type: 'namespace/action', payload })`

### Configuration-Driven Architecture

This project uses a sophisticated **pageInfo-based configuration system** that eliminates manual component creation for standard CRUD operations.

#### Grid System (`src/controls/layouts/gridTemplate/`)
- **Purpose**: Dynamic data tables with filtering, sorting, pagination
- **Configuration**: `GridEditor.tsx` defines columns, filters, actions
- **Component**: `ListCtrl.tsx` renders ProTable from configuration
- **Entry Point**: `ListViewer.tsx` loads pageInfo and displays grid

**Column Configuration Example**:
```typescript
{
  key: 'customerId',
  dataIndex: 'customerId',
  title: 'Customer ID',
  valueType: 'text',
  hideInSearch: false,
  sorter: true
}
```

#### Form System (`src/controls/layouts/schemaTemplate/`)
- **Purpose**: Dynamic form generation from JSON schema
- **Configuration**: `SchemaEditor.tsx` defines fields, validation, layout
- **Component**: `FormCtrl.tsx` handles form logic and submission
- **Widgets**: 20+ types in `src/packages/pro-component/schema/`

**Widget Types**: Text, TextArea, DateTime, Date, Time, Enum, EnumByUser, Checkbox, RadioGroup, SingleSelect, SingleModel, ArrayModel, ArraySelect, Image, RichText, Password, NumberMask, Location, Upload, ColorPicker, Icon

**Schema Configuration Example**:
```typescript
{
  key: 'email',
  title: 'Email',
  widget: 'Text',
  required: true,
  hideExpression: 'model.type === "guest"',
  col: 2  // 1-4 column layout
}
```

### Request Handler Pattern

All API calls use the centralized `src/util/request.ts`:

```typescript
import request from '@src/util/request';

const response = await request<ResponseType>({
  url: '/admin/endpoint',
  options: {
    method: 'post',
    data: { ... }
  }
});

// Handle response
if (response?.status === 200 && response.data?.code === 0) {
  return response.data;
} else {
  return { errorCode: response.data?.code, message: response.data?.message };
}
```

**Request Features**:
- Automatic token injection from `localStorage`
- 5-minute timeout
- Auto-refresh token from response headers
- 403 handling with auto logout
- Centralized error handling
- FormData support for file uploads

## Project Structure

### Critical Directories

#### `src/models/` - DVA State Management
- `global.ts` - App-wide state (collapsed sidebar, notices)
- `auth.ts` - Authentication state and effects
- `menu.ts` - Navigation and menu state
- Domain models follow same pattern

#### `src/services/` - API Layer
Each service module exports functions for specific domain:

```typescript
// Pattern
export const functionName = async (params) => {
  const res = await request({ url, options });
  return handleResponse(res);
}
```

**Naming Convention**:
- `get*` for GET requests
- `create*`, `update*`, `delete*` for mutations
- `*Request` suffix for explicit request functions

#### `src/controls/` - Configuration-Driven Components
- `layouts/gridTemplate/` - Grid/list rendering
- `layouts/schemaTemplate/` - Form rendering
- `layouts/detailTemplate/` - Detail view templates
- `editors/` - Configuration editors (GridEditor, SchemaEditor, ButtonEditor, APIEditor)
- `settings/` - Layout and behavior settings

#### `src/packages/` - Reusable Packages
- `pro-component/schema/` - Form widgets (20+ types)
- `pro-table/` - Enhanced Ant Design table with ProTable features
- `pro-utils/` - Utility functions

#### `src/components/` - Reusable UI Components
Organized by domain/feature (e.g., `customer/`, `dashboard/`)

#### `src/routes/` - Route Components
- `default/` - Main application routes
- Nested structure mirrors URL paths

#### `src/util/` - Utilities
- `request.ts` - HTTP client (critical)
- `helpers.tsx` - Common utilities
- `config.ts` - App configuration
- `Socket.ts` - WebSocket client
- `local.ts` - localStorage wrapper

#### `src/constants/` - Constants
- `constants.ts` - App-wide constants
- `enums.ts` - Enum definitions
- `HttpStatusCode.ts` - HTTP status codes

## Coding Conventions

### TypeScript Guidelines

1. **Use interfaces for object shapes**:
```typescript
interface CustomerInfo {
  id: number;
  email: string;
  status: string;
}
```

2. **Type service responses**:
```typescript
const response = await request<CustomerInfo>({ url, options });
```

3. **Avoid `any` - use `unknown` or proper types**

4. **Enable strict mode features** (already configured in tsconfig.json)

### Component Patterns

1. **Functional components with hooks**:
```typescript
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  // ...
}
```

2. **Use DVA connect for state**:
```typescript
import { connect } from 'dva';

const Component = ({ dispatch, user }) => { /* ... */ };

export default connect(({ auth }) => ({ user: auth.user }))(Component);
```

3. **Memoize expensive computations**:
```typescript
const expensiveValue = useMemo(() => computeValue(data), [data]);
```

### File Naming

- Components: PascalCase (`CustomerInfo.tsx`)
- Services: kebab-case (`customer-service.ts`)
- Utilities: camelCase (`helpers.ts`)
- Constants: UPPER_SNAKE_CASE for values

### Import Organization

```typescript
// 1. External dependencies
import React from 'react';
import { Button } from 'antd';

// 2. Internal absolute imports (use @src alias)
import request from '@src/util/request';
import { CustomerType } from '@src/types/customer.types';

// 3. Relative imports
import { formatDate } from './utils';
```

## Form Widget Development

### Creating a New Widget

1. **Create widget file** in `src/packages/pro-component/schema/`:

```typescript
// NewWidget.tsx
import React from 'react';
import { IWidgetProps } from './types';

const NewWidget: React.FC<IWidgetProps> = ({ value, onChange, schema }) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default NewWidget;
```

2. **Export in `Widgets.tsx`**:
```typescript
export { default as NewWidget } from './NewWidget';
```

3. **Add to `SchemaEditor.tsx` widget list**:
```typescript
{ label: 'New Widget', value: 'NewWidget' }
```

4. **Update `Base.tsx`** if special rendering needed:
```typescript
case 'NewWidget':
  return <Widgets.NewWidget {...widgetProps} />;
```

### Widget Interface

All widgets receive:
```typescript
interface IWidgetProps {
  value: any;
  onChange: (value: any) => void;
  schema: ISchemaEditorProperties;
  disabled?: boolean;
  formData?: any;  // Access to entire form values
}
```

## Performance Optimization

### 1. List Rendering
- Always use pagination for grids
- Implement virtual scrolling for 500+ rows
- Use `rowKey` prop for unique keys
- Memoize column definitions

### 2. Form Performance
- Use `hideExpression` to conditionally hide fields
- Avoid inline functions in renders
- Implement debounced inputs for search/filters
- Cache pageInfo configurations

### 3. State Management
- Keep component state local when possible
- Use DVA effects for async operations
- Implement proper loading states
- Avoid unnecessary re-renders with `React.memo`

### 4. Bundle Optimization
- Code splitting is configured via react-app-rewired
- Lazy load routes with `React.lazy`
- Use dynamic imports for large dependencies
- Ant Design tree-shaking is enabled

### 5. API Calls
- Implement request cancellation for unmounted components
- Use SWR for data fetching with caching
- Batch related API calls
- Cache stable data in localStorage

## Common Development Patterns

### Creating a New List Page

1. **Define pageInfo** in backend with grid configuration
2. **Add route** in router configuration
3. **Create view component** using `ListViewer` pattern:

```typescript
import ListViewer from '@src/routes/default/list/ListViewer';

const MyListPage = () => {
  const pageId = 123; // Your pageInfo ID
  return <ListViewer pageId={pageId} />;
};
```

4. **Configure columns** via GridEditor in admin panel

### Creating a New Form Page

1. **Define pageInfo** with schema configuration
2. **Add route** in router configuration
3. **Create view component** using `FormViewer` pattern:

```typescript
import FormViewer from '@src/routes/default/form/FormViewer';

const MyFormPage = () => {
  const pageId = 124; // Your pageInfo ID
  return <FormViewer pageId={pageId} />;
};
```

4. **Configure fields** via SchemaEditor in admin panel

### Adding New Service

```typescript
// src/services/my-feature.ts
import request from '@src/util/request';
import HttpStatusCode from '@src/constants/HttpStatusCode';
import { DEFAULT_ERROR_MESSAGE } from '@src/constants/constants';

export interface MyFeatureParams {
  id: number;
  name: string;
}

export const getMyFeature = async (id: number) => {
  const res: any = await request({
    url: `/admin/my-feature/${id}`,
    options: { method: 'get' }
  });

  if (res?.status === HttpStatusCode.OK && res.data?.code === 0) {
    return res.data;
  } else {
    return {
      errorCode: res.data?.code || HttpStatusCode.UNKNOW_ERROR,
      message: res.data?.message || DEFAULT_ERROR_MESSAGE,
    };
  }
};
```

### Adding New DVA Model

```typescript
// src/models/my-feature.ts
import { Model } from 'dva';
import { getMyFeature } from '@src/services/my-feature';

const myFeatureModel: Model = {
  namespace: 'myFeature',

  state: {
    data: null,
    loading: false,
  },

  effects: {
    *fetchData({ payload }, { call, put }) {
      yield put({ type: 'updateState', payload: { loading: true } });
      const response = yield call(getMyFeature, payload.id);
      yield put({ type: 'updateState', payload: { data: response, loading: false } });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};

export default myFeatureModel;
```

## Build Configuration

### Webpack Aliases
- `@src` points to `src/` directory
- Use absolute imports: `import { X } from '@src/util/helpers'`

### Environment Variables
- `.env.dev` - Development environment
- `.env.prod` - Production environment
- `.env.host.dev` - Host development environment
- Access via `process.env.REACT_APP_*`

### LESS Theming
- Theme variables in `src/theme.less`
- Ant Design variables can be overridden
- LESS modules for component-specific styles

## Common Pitfalls

### 1. DVA Namespace Collisions
Always use unique namespaces in models. Check `src/models/` for existing names.

### 2. Token Management
- Token is stored in `localStorage` with key `'token'`
- Auto-refreshed from response headers
- Use `local.get('token')` and `local.set('token', value)`

### 3. Form Schema Configuration
- `hideExpression` uses string expressions evaluated at runtime
- Reference form values via `model.fieldName`
- Complex expressions: `model.type === 'A' && model.status === 'active'`

### 4. Grid Column Configuration
- `dataIndex` must match API response field
- `valueType` determines cell rendering
- `hideInSearch` controls filter visibility
- `sorter: true` enables backend sorting

### 5. Type Safety with Request Handler
Always provide type parameter to `request<T>()` for type-safe responses.

## Gaming Domain Features

This project includes gaming-specific components:

- **5D Game**: Number prediction game with digit analysis
- **K3 Game**: Dice game with statistics
- **Wingo Game**: Color/number prediction with time configs (30s, 1m, 3m, 5m, 10m)
- **TRX Wingo**: TRX blockchain-based Wingo variant

Game components typically include:
- Result history tables
- Statistics and analytics
- Betting management
- Winner calculations
- Real-time updates via WebSocket

## Debugging Tips

### DVA State Inspection
Access global store in browser console:
```javascript
window._store.getState()
```

### API Debugging
Enable debug mode in browser console:
```javascript
window.debug = true
```

### Form Schema Debugging
- Check `FormCtrl.tsx` for data flow
- Verify schema configuration in `SchemaEditor`
- Test widgets independently in isolation

### Grid Debugging
- Inspect pageInfo configuration
- Verify API response structure matches column dataIndex
- Check ProTable console warnings
- Use React DevTools to inspect ProTable props

## Key Dependencies

- **antd**: 4.16.13 - UI component library
- **dva**: 2.6.0-beta.21 - State management
- **axios**: 0.21.1 - HTTP client
- **react-intl**: 5.20.13 - Internationalization
- **socket.io-client**: 4.4.0 - WebSocket client
- **dayjs**: 1.11.13 - Date manipulation
- **lodash**: 4.17.11 - Utility functions

## Additional Resources

For detailed architecture guides, see `.cursor/rules/`:
- `form-system.mdc` - Comprehensive form system guide
- `list-system.mdc` - Grid/list system guide
- `services.mdc` - Service layer patterns
- `project-structure.mdc` - Full project structure
