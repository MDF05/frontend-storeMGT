# Frontend Documentation - Store Management System

This directory contains the client-side application for the Store Management System, built with **Vue.js 3** and **Vite**.

## 🚀 Tech Stack

-   **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **State Management**: [Pinia](https://pinia.vuejs.org/)
-   **Routing**: [Vue Router](https://router.vuejs.org/)
-   **HTTP Client**: [Axios](https://axios-http.com/)
-   **Charting**: [Chart.js](https://www.chartjs.org/) with `vue-chartjs`
-   **PDF Generation**: `jspdf` & `jspdf-autotable`

## 📂 Project Structure

```bash
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, fonts, and global styles
│   ├── components/         # Reusable Vue components (Buttons, Cards, Inputs)
│   ├── router/             # Vue Router configuration
│   ├── stores/             # Pinia state stores (Cart, Products, Auth)
│   ├── views/              # Page components (Dashboard, POS, Inventory)
│   ├── App.vue             # Main application entry component
│   └── main.js             # Application initialization
├── index.html              # Entry HTML file
├── package.json            # Project dependencies and scripts
└── vite.config.js          # Vite configuration
```

## 🛠️ Setup & Installation

### Prerequisites

Ensure you have Node.js (v18+) and npm installed.

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Development Server

To start the application in development mode with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The output files will be in the `dist/` directory.

### Previewing Production Build

To preview the production build locally:

```bash
npm run preview
```

## 🧩 Key Features & Components

### State Management (Pinia)
We use Pinia for global state management. Stores are located in `src/stores/`.
-   **AuthStore**: Handles user login state and tokens.
-   **ProductStore**: Manages product inventory data.
-   **CartStore**: Manages items in the POS shopping cart.

### Styles
The project uses **Vanilla CSS** with a robust set of CSS variables for theming (located in `src/assets/base.css` or similar). We focus on a "glassmorphism" aesthetic with dark transparencies and blur effects.

## 🔗 connecting to Backend
The application expects the backend API to be running at `http://localhost:5000`. This is typically configured in the Axios instance setup (e.g., `src/api.js` or `src/main.js`).
