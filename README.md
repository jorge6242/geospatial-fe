# Fe-Geospatial

A modern geospatial web application for visualizing French forest data using Next.js, React, and Mapbox GL JS.



https://github.com/user-attachments/assets/c3a997de-34e4-437c-9635-1e0179b2bbce



## 🚀 Features

- **Interactive Maps**: Powered by Mapbox GL JS with smooth navigation and zoom controls
- **Forest Data Visualization**: Display BD Forêt® (French Forest Database) layers with species filtering
- **Administrative Boundaries**: Hierarchical navigation through French regions, departments, and communes
- **Real-time Filtering**: Dynamic layer filtering by tree species and administrative areas
- **Authentication**: JWT-based user authentication with secure token management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Mapping**: Mapbox GL JS, React Map GL
- **State Management**: TanStack Query, React Context, Custom Hooks
- **Styling**: Tailwind CSS, Atomic Design methodology
- **Backend Integration**: Axios
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Mapbox account with access token
- Backend API running and accessible at the configured NEXT_PUBLIC_API_URL (required for authentication and polygon visualization)

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fe-geospatial
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables in `.env.local`:
   ```env
   # Mapbox Configuration
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Default Map View
   NEXT_PUBLIC_DEFAULT_LAT=46.2276
   NEXT_PUBLIC_DEFAULT_LNG=2.2137
   NEXT_PUBLIC_DEFAULT_ZOOM=6
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   │   └── maps/          # Main maps page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── atoms/            # Basic UI elements (Button, Input, etc.)
│   ├── molecules/        # Composite components (InputField, etc.)
│   ├── organisms/        # Complex components (MapViewer, LoginForm)
│   └── templates/        # Page layouts (DashboardLayout, AuthLayout)
├── context/               # React Context providers
│   └── AuthContext.tsx    # Authentication state management
├── hooks/                 # Custom React hooks
│   ├── useAuthMutations.ts # Authentication operations
│   ├── useGeoLayers.ts    # Geospatial data management
│   ├── useMapViewer.ts    # Map component logic
│   └── useMapsPage.ts     # Maps page state orchestration
├── lib/                   # Utility libraries
│   ├── mapUtils.ts        # Map-related utilities
│   ├── utils.ts           # General utilities
│   └── schemas.ts         # Zod validation schemas
├── services/              # API service layer
│   ├── api.ts             # Axios configuration
│   ├── authService.ts     # Authentication API calls
│   └── geoService.ts      # Geospatial data API calls
└── types/                 # TypeScript type definitions
    └── map.ts             # Map and geospatial types
```

## 📚 Best Practices

- **Clean Architecture with SOLID**: Principles applied for maintainable and scalable code.
- **Custom Hooks**: Separation of logic into reusable hooks following SRP.
- **Atomic Design**: Components organized into atoms, molecules, organisms, and templates.
- **Custom Components**: Reusable and consistent following design patterns.


## 🚀 Deployment

### Environment Variables for Production
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_production_token
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm start

# Preview production build
npm run preview
```
---
