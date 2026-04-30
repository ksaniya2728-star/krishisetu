## KrishiSetu Mobile (Expo)

### Requirements
- Node.js + npm
- Expo Go app installed on your phone
- Backend running on your LAN (same Wi‑Fi as your phone)

### Configure API base URL (required for Expo Go)
Set an environment variable before starting:

**PowerShell**
```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://<YOUR_LAN_IP>:5000/api"
```

Example:
```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://192.168.1.10:5000/api"
```

### Install
```powershell
cd mobile
npm install
```

### Start (Expo Go)
```powershell
npx expo start
```

### Clear Metro cache
```powershell
npx expo start --clear
```

### Open in Expo Go
- Start the server
- In the terminal/DevTools, scan the QR code with Expo Go (Android) or Camera (iOS)

### Android emulator
```powershell
npx expo start --android
```

### Web preview
```powershell
npx expo start --web
```

