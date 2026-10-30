# Customer Spending Insights

A customer spending analytics dashboard built with Angular. The application provides an overview of customer spending patterns, transaction activity, category breakdowns, spending trends and financial goals.

## Features

- **Customer overview** – View customer profile information and spending summaries.
- **Spending analytics** – Track total spending, transaction counts and average transaction values.
- **Category breakdown** – Explore spending across categories.
- **Spending trends** – Visualise spending patterns over time.
- **Transaction history** – Browse transactions with pagination and filtering.
- **Dashboard filters** – Filter spending data by reporting period and transaction criteria.
- **Spending goals** – Monitor financial goals and progress.
- **Responsive interface** – Designed to work across desktop and mobile screen sizes.
- **Loading and error states** – Provides feedback when data is loading or requests fail.

## Technology Stack

- Angular 21
- TypeScript
- RxJS
- Angular Material / Angular CDK
- Chart.js and ng2-charts
- SCSS
- Vitest
- Node.js and npm

## Prerequisites

Ensure the following are installed:

- Node.js (compatible with the Angular 21 toolchain)
- npm
- Angular CLI (optional, as the project uses the local CLI)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PagezLwando/Capitec-Assessment
cd customer-spending-insights
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

The development server automatically reloads when source files change.

## Available Commands

| Command | Description |
|---|---|
| `npm start` | Start the development server |
| `npm test` | Run unit tests |
| `npm test -- --watch=false` | Run unit tests once |
| `npm run build` | Generate a production build |

Production build files are generated in:

```text
dist/customer-spending-insights/
```

## Testing

The project uses Vitest through Angular's unit testing integration.

Run the tests:

```bash
npm test
```

Run once without watch mode:

```bash
npm test -- --watch=false
```

The test suite covers the spending API service, data retrieval, filtering, pagination, validation and application setup.

## Project Structure

```text
src/
└── app/
    ├── core/
    │   ├── data/
    │   ├── models/
    │   └── services/
    ├── features/
    │   └── dashboard/
    │       ├── components/
    │       └── pages/
    ├── app.config.ts
    ├── app.routes.ts
    └── app.ts
```

## Data

The dashboard currently uses mock customer and transaction data through the spending API service. This allows the application and its analytics features to operate without an external backend service.

## Production Build

Generate an optimised production build:

```bash
npm run build
```

## Docker

A `Dockerfile` and `.dockerignore` are included to support containerised deployment.

### Build the Docker image

```bash
docker build -t customer-spending-insights .
```

### Run the container

```bash
docker run -d -p 8080:80 --name customer-spending-insights customer-spending-insights
```

Open [http://localhost:8080](http://localhost:8080) to access the application.

### Docker verification

The Docker configuration has been added to the project, but the Docker image build and container execution have not yet been verified because Docker Desktop is not installed in the development environment.

## Future Improvements

- Integrate a live backend API.
- Add authentication and customer account management.
- Support exporting transaction and spending reports.
- Expand automated testing and end-to-end coverage.

## License

This project was developed as part of a software development assessment.
