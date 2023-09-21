## VaultShowcase

A React Native application built with Expo showcasing the Time-Locked Vault using the tech stack provided by @bitcoinerlab.

### Prerequisites

1. Make sure you have [Node.js](https://nodejs.org/) installed.

### Running the App on a Physical Device

1. Clone this repository:
    ```bash
    git clone https://github.com/bitcoinerlab/VaultShowcase.git
    cd VaultShowcase
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the Expo development server:
    ```bash
    npx expo start -c
    ```

    This will start the Metro Bundler and display a QR code in your terminal.

4. **To run the app on your physical device**:
    - **Android**: Scan the QR code with the Expo Go app.
    - **iOS**: Use the Camera app to scan the QR code and open it with the Expo Go app.

### Running the App on an iOS or Android Simulator/Emulator

If you'd like to run the app on a simulator or emulator, follow these additional steps:

**For iOS**:

1. Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from the Mac App Store.
2. Once installed, open Xcode to install the additional required components.
3. Ensure you have iOS simulators installed. You can manage and install simulators via Xcode by navigating to `Xcode > Preferences > Components`.

**For Android**:

4. Install [Android Studio](https://developer.android.com/studio).
5. Make sure you have an Android emulator set up. You can set one up via the AVD Manager in Android Studio.

6. **To run the app on a simulator/emulator**:
    - **iOS Simulator**: Press `i` in the terminal where the Expo server is running.
    - **Android Emulator**: Press `a` in the terminal (ensure you have an emulator set up through Android Studio).
