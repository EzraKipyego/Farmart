# Farmart Frontend

A React-based frontend for the Farmart platform — connecting farmers and buyers in a seamless marketplace experience.

## Tech Stack

- **React 19** with Vite
- **Redux Toolkit** for state management
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Axios** for API requests
- **Jest** + **Testing Library** for testing

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Running the App

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Project Structure

```
src/
├── app/          # Redux store setup
├── components/   # Reusable UI components
├── config/       # App configuration
├── data/         # Static/mock data
├── features/     # Redux slices and feature logic
├── pages/        # Route-level page components
├── services/     # API service calls
├── App.jsx
└── main.jsx
```

## Contributors

| Name | Role |
|------|------|
| Ezra Kipyego | Contributor |
| Hiel Sang | Contributor |
| Felix Macharia | Contributor |
| Emmanuel Torris | Contributor |
