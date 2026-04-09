# BeatFlow

<p align="center">
  <img src="./assets/images/app_icon.jpg" width="120" alt="BeatFlow app icon" />
</p>

BeatFlow is a React Native music player built with Expo. It combines Deezer preview streaming, offline downloads, local audio scanning, playlist management, and a polished mobile UI in one portfolio app.

The goal of this project is to show practical mobile engineering skills:

- building a multi-screen app with React Navigation
- managing app-wide state with React Context
- handling audio playback, queueing, and background behavior
- supporting offline scenarios and local device media
- shipping a consistent UI across authentication, library, player, and profile flows

## Screenshots

<p align="center">
  <img src="./ss/loginpage.png" width="220" alt="Login screen" />
  <img src="./ss/homepage.png" width="220" alt="Home screen" />
  <img src="./ss/playerpage.png" width="220" alt="Player screen" />
</p>

<p align="center">
  <img src="./ss/drawerpage.png" width="220" alt="Drawer navigation" />
  <img src="./ss/profilepage.png" width="220" alt="Profile screen" />
  <img src="./ss/localplayer%20page.png" width="220" alt="Local player screen" />
</p>

## What The App Does

- Streams 30-second Deezer previews with play, pause, seek, skip, shuffle, and repeat controls
- Shows a persistent mini player across the main app
- Supports favorites, playlists, recent tracks, and downloads
- Detects connectivity and blocks online playback while offline
- Scans local device audio files and lets users play them inside the same player experience
- Supports light, dark, and system theme modes

## Tech Stack

| Area | Choice |
| --- | --- |
| Framework | React Native 0.81 |
| Runtime | Expo SDK 54 |
| Language | TypeScript |
| Navigation | React Navigation 7 |
| Audio | `expo-audio` |
| Media Access | `expo-media-library` |
| Persistence | `@react-native-async-storage/async-storage`, `expo-file-system` |
| Network Awareness | `@react-native-community/netinfo` |
| UI | `expo-image`, `expo-linear-gradient`, `expo-blur`, `expo-haptics` |
| State Management | React Context |

## Architecture Summary

The app is organized by feature-focused layers:

- `screens/`: user-facing views such as Home, Search, Library, Player, Auth, and Profile
- `components/`: reusable UI such as the mini player and song list item
- `contexts/`: shared app state for auth, playback, playlists, theme, local tracks, and network status
- `services/`: API calls and shared data types
- `navigation/`: stack, tab, and drawer navigation definitions
- `constants/`: design tokens and theme values

This structure keeps UI, business logic, and shared state separated well enough for a medium-sized mobile app without adding unnecessary abstraction.

## Key Engineering Areas

### Playback

- Queue-based playback with current track state, seeking, repeat, and shuffle
- Shared player state across screens through `PlayerContext`
- Background audio support configured for mobile playback use cases

### Offline And Local Media

- Offline mode detection using NetInfo
- Downloaded audio playback from local storage
- Device media scanning and classification for local tracks

### UI And Navigation

- Drawer plus bottom tabs plus stack navigation
- Theme-aware styling across screens
- Mini player that stays visible while users move through the app

## Current Product Scope

This is a portfolio project, not a production service. A few parts are intentionally lightweight:

- Authentication is local/demo-oriented rather than backed by a real auth provider
- Streaming uses Deezer preview URLs, not full licensed playback
- The project currently focuses more on mobile product quality than backend depth

Being explicit about that scope makes the repo more credible than pretending it is already production-ready.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- Android Studio emulator, iOS simulator, or Expo Go

### Install

```bash
git clone https://github.com/DevEslam1/BeatFlow.git
cd BeatFlow
npm install
```

### Run

```bash
npm run start
```

Then launch one of:

- `npm run android`
- `npm run ios`
- `npm run web`

## API

BeatFlow uses the [Deezer Public API](https://developers.deezer.com/api).

Main endpoints used:

- `GET /search?q=`
- `GET /chart/0/tracks`
- `GET /track/{id}`
- `GET /artist/{id}/top`

## What I Would Improve Next

- Replace local demo auth with a real backend or hosted auth provider
- Add automated tests for contexts and service functions
- Add CI for linting and test execution
- Reduce Android permissions to the minimum required set
- Remove leftover template files and unused dependencies

## Project Structure

```text
BeatFlow/
|-- screens/
|-- components/
|-- contexts/
|-- navigation/
|-- services/
|-- constants/
|-- assets/
|-- ss/
|-- App.tsx
|-- app.json
`-- package.json
```

## Contact

- Email: `xdev.eslam@gmail.com`
- LinkedIn: [linkedin.com/in/deveslam-mahmoud](https://linkedin.com/in/deveslam-mahmoud)
- GitHub: [github.com/DevEslam1](https://github.com/DevEslam1)
