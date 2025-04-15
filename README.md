# Yrgo Branschevent

**Yrgo Branschevent** is a web application developed by students from Yrgo’s Web Development and Digital Design programs. It serves as an interactive invitation and networking platform for an industry event that connects developers, designers, and companies.

## 🧩 Project Description

The site allows:

- **Companies** to register, RSVP to the event, and share information about their company and what they’re looking for in an intern.
- **Students** to register and explore companies using a Tinder-like interface where they can swipe through and favorite the ones they’re interested in.

The app was built collaboratively by a team of five students using modern web technologies and tools, with a focus on usability, design, and functionality.

## ⚙️ Tech Stack

- **Frontend**: React (v19) + Vite
- **Routing**: React Router DOM (v7)
- **State Management**: React hooks
- **Styling**: Styled Components
- **Animation**: Framer Motion
- **Calendar Integration**: Add-to-calendar-button
- **Image Uploads**: Uploadcare React Widget
- **Backend**: Supabase (Database + Auth)

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v18+ recommended)
- npm

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/yrgo-branschevent.git
   cd yrgo-branschevent
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. The app will be available at `http://localhost:5173`.

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Route-based views
├── routes/           # React Router DOM setup
├── services/         # Supabase and API logic
├── assets/           # Images, fonts, etc.
└── App.jsx           # Main app component
```

## ✨ Features

- User authentication via Supabase
- Company registration with detailed profile input
- Student registration and swipe-based discovery
- Favorites list for students
- Clean, responsive UI with animations
- Calendar integration for adding the event
- Uploadcare integration for profile images

## 🧑‍🤝‍🧑 Team

Built by:

- Filip Lyrheden (Web Development)
- Jack Svensson (Web Development)
- Fanny Gjergji (Digital Design)
- Kajsa Ströby (Digital Design)
- Sofi Svensson (Digital Design)

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ at Yrgo**
