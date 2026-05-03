# Pit-Stop Live 🏎️💨

Pit-Stop Live is a real-time garage finder application. It is designed to help users quickly locate nearby garages, view their services, and request assistance, especially during emergencies. The platform connects customers in need of immediate vehicle assistance with reliable, professional mechanics in their vicinity.

## Live Demo 🚀
[Live Demo Link (Coming Soon after deployment)](#)

## Features 🛠️
- **Real-Time Mapping**: Interactive map to discover garages near your current location.
- **Secure Authentication**: Robust user authentication (Customers & Garage Owners) using OTP verification.
- **Role-based Dashboards**: Dedicated interfaces tailored for standard users and garage managers.
- **SOS Functionality**: Quick emergency requests directly connecting to available mechanics.

## Tech Stack 💻
This project is built using modern web technologies:

- **Frontend Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: PostgreSQL (Hosted on [Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Auth.js)
- **Email/OTP Service**: [Resend](https://resend.com/)
- **Mapping**: [Leaflet](https://leafletjs.com/) via `react-leaflet`
- **Runtime environment**: Node.js

## Getting Started Locally 🏁

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd new-pit-stop-live
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the required variables (refer to `.env.example` if available, or set up your DB/Auth/Email keys).

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
