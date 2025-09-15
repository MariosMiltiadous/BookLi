# 📚 BookLi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.1.

## 🚀 Quick Start

# For local development insall modules: npm install
```bash
# 1) Start the mock API (json-server) on http://localhost:3000
npm run api

# 2) In another terminal start the Angular dev server (with proxy)
ng serve
# or run both together:
npm run dev

🧪 Mock Backend (Development Only)

The app uses a lightweight json-server to persist CRUD across reloads.

How it’s wired

Mock data: mock/db.json

Dev proxy: src/proxy.conf.json rewrites /api/* → http://localhost:3000/* (no CORS)

Environment: environment.apiBaseUrl = '/api'

Interceptor: apiPrefixInterceptor turns relative paths (e.g., '/books') into '/api/books'

HTTP service: HttpBookService performs real HTTP calls (GET/POST/PATCH/DELETE)

Verify it works

http://localhost:3000/books → JSON array from mock/db.json

http://localhost:4200/api/books → same data via Angular proxy


📎 File Map (mock & http)




## Additional Resources
📚 Resources

- Angular CLI Docs: https://angular.dev/tools/cli
- Angular Material: https://material.angular.io/
- json-server: https://github.com/typicode/json-server

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
