# 📚 BookLi - Angular Book Library Management System

A modern Angular application demonstrating enterprise-level patterns and best practices. Built with Angular 20.3.1, Material Design, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation & Setup
```bash
# 1. Install dependencies
npm install

# 2. Start the mock API server (Terminal 1)
npm run api
# Serves mock data at http://localhost:3000

# 3. Start Angular dev server with proxy (Terminal 2)  
ng serve
# or run both together:
npm run dev

# App available at http://localhost:4200
```

## 🏗️ Architecture & Features

### Core Technologies
- **Angular 20** - Standalone components, modern reactive patterns
- **Angular Material** - UI components and theming
- **RxJS** - Reactive programming with observables
- **TypeScript** - Type-safe development
- **JSON Server** - Mock REST API for development

### Key Architectural Patterns
- **SOLID Principles** - Interface-based design, dependency injection
- **Reactive Forms** - Type-safe form handling with validation
- **HTTP Interceptors** - Cross-cutting concerns (API prefixing, error handling)
- **Route Resolvers** - Data pre-loading for optimal UX
- **Lazy Loading** - Feature-based code splitting
- **OnPush Change Detection** - Performance optimization

### Features Implemented
- ✅ **CRUD Operations** - Create, read, update, delete books
- ✅ **Advanced Search** - Real-time filtering with debouncing
- ✅ **Smart Pagination** - Context-aware pagination for filtered results
- ✅ **Image Management** - Graceful fallbacks with SVG placeholders
- ✅ **Error Handling** - User-friendly error messages and logging
- ✅ **Responsive Design** - Mobile-first Material Design layout
- ✅ **Performance** - Optimized HTTP calls, image loading, and change detection

## 🔧 Mock Backend Setup

The application uses `json-server` for development with a complete proxy setup:

### How It's Wired
- **Mock Data**: `mock/db.json` - Sample book data
- **Dev Proxy**: `src/proxy.conf.json` - Rewrites `/api/*` → `http://localhost:3000/*`
- **Environment**: `environment.apiBaseUrl = '/api'`
- **Interceptor**: `apiPrefixInterceptor` transforms relative paths to API calls
- **Service Layer**: `HttpBookService` performs real HTTP operations

### Verify Setup
```bash
# Direct API access
http://localhost:3000/books

# Proxied through Angular
http://localhost:4200/api/books
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Singleton services, interceptors
│   │   ├── data/               # Data models and interfaces
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── models/             # TypeScript interfaces/types
│   │   ├── services/           # Business logic services
│   │   ├── utils/              # Logger, notifications
│   │   └── core.module.ts      # Core module configuration
│   ├── features/
│   │   ├── home/               # Home page feature
│   │   └── library/            # Book management feature
│   │       ├── components/     # Smart/container components
│   │       │   ├── book-detail/    # Book create/edit
│   │       │   ├── book-list/      # Books listing with search
│   │       │   └── book-overview/  # Book details view
│   │       ├── resolvers/      # Route data resolvers
│   │       └── library.routes.ts
│   ├── shared/                 # Reusable components, utilities
│   │   ├── material/           # Material Design imports
│   │   └── ui-components/      # Shared UI components
│   ├── app-routing.module.ts   # Root routing configuration
│   ├── app.module.ts          # Root module
│   └── main.ts                # Bootstrap application
├── assets/                     # Static assets
│   ├── covers/                # Book cover images
│   └── bookli-logo.svg        # Application logo
├── environments/               # Environment configurations
├── mock/                      # JSON Server mock data
├── proxy.conf.json            # Development proxy configuration
└── styles.scss               # Global styles
```

## 🛠️ Development Patterns

### Service Architecture
- **Interface-based services** with dependency injection tokens
- **HTTP interceptors** for cross-cutting concerns
- **Error handling** with user-friendly notifications
- **Logging service** with environment-aware levels

### Component Design
- **Standalone components** for modern Angular architecture
- **OnPush change detection** for performance
- **Reactive forms** with proper validation
- **Smart/dumb component** separation

### Data Management
- **Route resolvers** for data pre-loading
- **Client-side filtering** for optimal UX
- **Pagination** with proper state management
- **Image fallback** strategies

## 🔍 Code Quality Features

### SOLID Implementation
- **Single Responsibility** - Focused services and components
- **Open/Closed** - Extensible through interfaces
- **Liskov Substitution** - Interface-based service injection
- **Interface Segregation** - Clean, focused interfaces
- **Dependency Inversion** - Abstraction over concretion

### Angular Best Practices
- **Lazy loading** with feature modules
- **Reactive Forms** with proper validation
- **HTTP interceptors** for consistent behavior
- **Change detection** optimization
- **Memory leak prevention** with `takeUntilDestroyed`

## 🚦 Available Scripts

```bash
npm run api          # Start JSON server on port 3000
npm run dev          # Start both API and Angular dev server
ng serve             # Start Angular dev server only
ng build            # Build for production
ng test             # Run unit tests
ng lint             # Run ESLint
```

## 🎯 Learning Outcomes

This project demonstrates:
- Enterprise-level Angular application structure
- Modern reactive programming patterns with RxJS
- Performance optimization techniques
- Error handling and user experience design
- TypeScript best practices and type safety
- Material Design implementation
- Mock backend integration for development

## 📚 Additional Resources

- [Angular CLI Docs](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [JSON Server](https://github.com/typicode/json-server)

---

**Built with Angular 20.3.1** | **License: MIT**