# Game AnDo Admin

A modern admin dashboard and management system for projects, users, roles, and more. Built with React, Ant Design, and DVA, this project provides a robust platform for managing data, visualizing metrics, and handling business logic for a variety of use cases.

## Features

- Modular and scalable project structure
- User authentication and role management
- Project, class, and document management
- Dashboard with metrics and reporting
- Reusable UI components and containers
- API integration with centralized request handling
- Theming and custom styles with LESS
- Internationalization support

## Getting Started

### Prerequisites

- Node.js (>=14)
- Yarn or npm

### Installation


Install dependencies:

```bash
yarn install
# or
npm install
```

### Running the App

Start the development server:

```bash
yarn dev
# or
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000) (or the port specified in your environment).

### Building for Production

```bash
yarn build
# or
npm run build
```

## Project Structure

See the [Project Structure Guide](.cursor/rules/project-structure.mdc) for a detailed overview. Key directories:

- `src/components/`: Reusable UI components
- `src/containers/`: Container components and layouts
- `src/routes/`: Application routes
- `src/services/`: API and business logic modules
- `src/models/`: State management and data models
- `src/util/`: Utility functions and helpers
- `src/constants/`: Application-wide constants
- `src/styles/`: Global and modular styles
- `src/assets/`: Static assets