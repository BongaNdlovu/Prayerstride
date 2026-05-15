# PrayerStride

A daily prayer companion app built with React + Vite + Tailwind CSS.

## Features

- **Splash & Onboarding** – Beautiful branded entry with welcome and reminder setup
- **Home Feed** – Daily prayer mission, streak counter, and prayer requests
- **Discover** – Search and browse prayers, people, and testimonies
- **Prayer Detail** – Read full requests, pray with one tap, leave encouragements
- **Create Request** – Share prayer needs with privacy and urgency controls
- **Testimonies (Praise)** – Celebrate answered prayers with the community
- **Profile** – Track your prayer stats and manage settings

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
  components/
    PrayingHandsIcon.jsx   # Custom SVG prayer icon
    PhoneFrame.jsx         # Device mockup wrapper
    TopLogo.jsx            # Branded logo component
    BottomNav.jsx          # Tab navigation
    screens/               # All app screens
      Splash.jsx
      Welcome.jsx
      ReminderSetup.jsx
      HomeScreen.jsx
      Discover.jsx
      Detail.jsx
      Create.jsx
      Praise.jsx
      Profile.jsx
    ui/
      PrayerCard.jsx       # Reusable prayer request card
  data/
    constants.js           # App data and navigation maps
  App.jsx                  # Main app with routing logic
  main.jsx                 # Entry point
  index.css                # Tailwind directives
```

## Design Tokens

| Token  | Value     | Usage                |
|--------|-----------|----------------------|
| Navy   | `#082A4A` | Primary brand, buttons |
| Gold   | `#C8892B` | Accents, highlights  |
| Ivory  | `#F8F3EA` | Page background      |
| Stone  | `#E7DFD2` | Borders, dividers    |
| Ink    | `#101820` | Text, dark elements  |

## License

MIT
