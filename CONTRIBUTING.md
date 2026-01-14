# Frontend Contribution Guidelines

## Code Style

-   **Vue 3 Composition API**: Use `<script setup>` syntax for all components.
-   **Component Naming**: Use `PascalCase` for component filenames (e.g., `ProductCard.vue`).
-   **Props**: Define props using `defineProps` with strict type validation.

## Directory Structure

-   **Views vs Components**:
    -   `views/`: Components that represent full pages and are routed to.
    -   `components/`: Reusable UI elements used within views.

## State Management

-   Avoid using `ref` for global state; use Pinia stores instead.
-   Keep business logic inside Pinia actions where possible.

## CSS / Styling

-   Use **Scoped CSS** (`<style scoped>`) for component-specific styles.
-   Use CSS Variables (defined in root) for colors and spacing to maintain consistency.
-   Avoid inline styles; use classes.

## Linting

-   Ensure your code is formatted before committing.
