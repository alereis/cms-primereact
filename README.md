# CMS PrimeReact

A modern Course Management System built with React and PrimeReact, featuring a clean and intuitive interface for managing students, sessions, and enrollments.

## Features

- 📚 Student Management
- 🗓️ Session Management
- ✍️ Enrollment Tracking
- 🔐 User Authentication with Supabase
- 🎨 Modern UI with PrimeReact Components
- 📱 Responsive Design with PrimeFlex

## Tech Stack

- React 19
- PrimeReact 10.9
- Supabase
- Vite
- React Router DOM
- Date-fns

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd cms-primereact
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── helper/         # Helper components and utilities
│   ├── InputField.jsx
│   ├── Sidebar.jsx
│   └── supabaseClient.js
├── pages/          # Main application pages
│   ├── Dashboard.jsx
│   ├── Students.jsx
│   ├── Sessions.jsx
│   ├── Enrollments.jsx
│   └── ...
└── images/         # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Student Management
- Add, edit, and view student profiles
- Track student information and enrollment status

### Session Management
- Create and manage course sessions
- Schedule and track session details

### Enrollment System
- Manage student enrollments in different sessions
- Track enrollment status and history

## Authentication

The application uses Supabase for authentication and data storage. Users need to register and log in to access the system features.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [PrimeReact](https://primereact.org/) - For the amazing UI components
- [Supabase](https://supabase.io/) - For the backend services
- [Vite](https://vitejs.dev/) - For the blazing fast build tool
