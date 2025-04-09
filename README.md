# ScarFit

ScarFit is a comprehensive fitness and nutrition tracking application built with React Native and Expo. The app helps users track their macronutrients, meals, and workouts to achieve their fitness goals.

![ScarFit Screenshot](./assets/images/Screenshot.jpg)

## Features

- **Macro Tracking**: Calculate and track daily macronutrient intake (protein, carbs, fat)
- **Meal Logging**: Log meals with detailed nutrition information
- **Progress Visualization**: View daily and weekly progress with intuitive charts
- **User Profiles**: Create and manage user profiles with personalized goals
- **Dark Mode**: Toggle between light and dark themes
- **Authentication**: Secure user authentication with Supabase

## Tech Stack

- **Frontend**: React Native, Expo Router, NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (Auth, Database)
- **State Management**: React Context API
- **Styling**: NativeWind/TailwindCSS
- **Icons**: Feather Icons
- **Navigation**: Expo Router

## Prerequisites

- Node.js >= 14.x
- Expo CLI
- Supabase account

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/scar-fit.git
   cd scar-fit
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Fill in your Supabase URL and anonymous key

4. Start the development server:
   ```
   npm start
   ```

## Project Structure

```
scar-fit/
├── app/                    # Application source code
│   ├── (tabs)/             # Main tab navigation screens
│   ├── auth/               # Authentication screens
│   ├── components/         # Reusable components
│   ├── context/            # React Context providers
│   ├── lib/                # Utilities and configuration
│   ├── models/             # Data models and API functions
│   ├── screens/            # Application screens
│   └── theme/              # Theme configuration
├── assets/                 # Static assets (images, fonts)
└── ...config files         # Various configuration files
```

## Main Features Breakdown

### Authentication

- Login, Register, Password Reset functionality
- Secured with Supabase Auth

### Macro Calculator

- Personalized macro calculation based on:
  - Age, weight, height, gender
  - Activity level
  - Fitness goals (lose weight, maintain, gain muscle)

### Food Tracking

- Search food database
- Log meals by meal type (breakfast, lunch, dinner, snacks)
- View daily nutrition summary

### User Profile

- Edit user information
- Change password
- View fitness statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.io/)
- [NativeWind](https://www.nativewind.dev/)
- [Feather Icons](https://feathericons.com/)
