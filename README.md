# Dynamic Dashboard

The **Dynamic Dashboard** is a web application built using Angular (version 14.2.8). It provides a customizable and interactive dashboard interface where users can manage shortcuts, notifications, and other dashboard components. The application leverages PrimeNG for UI components, PrimeFlex for layout utilities, and Angular's robust framework for scalability and performance.

## How to Use

### Demo Link

Experience the live demo of the Dynamic Dashboard here:
[Dynamic Dashboard Demo](https://mrbharatsingh.github.io/dynamic-dashboard/#/home)

### Development Server (Run locally)

To run the development server locally in your browser, follow the steps below:

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-repo/dynamic-dashboard.git
   ```
2. Navigate to the project directory:
   ```bash
   cd dynamic-dashboard
   ```
3. Install the required Node.js modules:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:4200/
   ```
   The application will automatically reload when you make changes to the source files.

### Building the Project

To build the project for production, use:

```bash
npm run prod
```

The build artifacts will be stored in the `dist/dashboard` directory.

### Running Tests

To execute unit tests, run:

```bash
npm test
```

The tests are powered by Karma and Jasmine.

### Packaging

To package the application, use:

```bash
npm run package
```

## Key Features

- **Dynamic Dashboard Tabs**: Add, sync, and manage dashboard tabs dynamically.
- **Shortcut Management**: Create and manage shortcuts for quick access to frequently used features.
- **Notifications**: View and manage notifications in a dedicated section.
- **Responsive Design**: Built with PrimeFlex for a mobile-friendly and responsive layout.
- **Customizable Components**: Easily extendable with new components and features.

## Technologies Used

- **Angular**: Framework for building the application.
- **PrimeNG**: UI components for a modern look and feel.
- **PrimeFlex**: CSS utilities for responsive design.
- **FileSaver**: For downloading files directly from the browser.
- **Angular Grid Layout**: For managing grid-based layouts.

## Folder Structure

- **src/app**: Contains all the application components, services, and modules.
- **src/assets**: Stores static assets like images and JSON files.
- **src/environments**: Configuration files for different environments (e.g., development, production).

## Contribution

Feel free to contribute to this project by creating new components, fixing bugs, or improving documentation. Use the Angular CLI commands to scaffold new components or services.
