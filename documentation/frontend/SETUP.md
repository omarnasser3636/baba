# 🖥️ Frontend Setup Guide

This guide explains how to set up and run the frontend application.

## Prerequisites

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **Git**: For version control

## Installation

1. **Navigate to the client directory**
   ```bash
   cd baba/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## Environment Variables

The frontend doesn't require a `.env` file for local development. The API base URL is configured in `src/Helpers/axiosInstance.js`.

For production, the build process will use the production API URL.

## Project Structure

```
client/src/
├── App.jsx                 # Main application component with routes
├── main.jsx               # Application entry point
├── index.css              # Global styles
├── Components/            # Reusable UI components
│   ├── Navbar.jsx         # Main navigation
│   ├── Footer.jsx         # Site footer
│   ├── Sidebar.jsx        # Admin sidebar
│   └── ...
├── Pages/                 # Page components
│   ├── HomePage.jsx       # Landing page
│   ├── Login.jsx          # Login page
│   ├── Signup.jsx         # Registration page
│   ├── Dashboard/         # Admin dashboard pages
│   ├── Courses/           # Course-related pages
│   └── ...
├── Redux/                 # State management
│   ├── store.js           # Redux store configuration
│   └── Slices/            # Redux toolkit slices
├── Helpers/               # Utility files
│   ├── axiosInstance.js   # Axios configuration
│   └── ...
├── Hooks/                 # Custom React hooks
├── Layout/                # Layout components
├── contexts/              # React contexts
└── utils/                 # Utility functions
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `react-router-dom` | Routing |
| `@reduxjs/toolkit` | State management |
| `axios` | HTTP client |
| `tailwindcss` | CSS framework |
| `daisyui` | UI components |
| `react-icons` | Icon library |
| `react-hot-toast` | Toast notifications |
| `framer-motion` | Animations |

## Styling

The project uses TailwindCSS with custom configuration. Key styling concepts:

- **Light/Dark Mode**: Toggle via Navbar, stored in localStorage
- **RTL Support**: The app is primarily in Arabic with RTL layout
- **Responsive Design**: Mobile-first approach

### Theme Colors

- **Primary (Light)**: red (`green-500`, `green-600`)
- **Primary (Dark)**: Blue (`blue-500`, `blue-600`)
- **Backgrounds**: 
  - Light: `white`, `gray-50`
  - Dark: `gray-800`, `gray-900`

## Troubleshooting

### Common Issues

1. **Port 5173 already in use**
   ```bash
   # Kill the process using port 5173
   npx kill-port 5173
   ```

2. **Module not found errors**
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

3. **Build errors**
   - Make sure you have `terser` installed: `npm install terser --save-dev`

## Next Steps

- Read the [Architecture Overview](./ARCHITECTURE.md)
- Explore [Components Guide](./COMPONENTS.md)
- Understand [Redux State Management](./REDUX.md)
