## VaultShowcase

A React Native application built with Expo showcasing the Time-Locked Vault using the tech stack provided by @bitcoinerlab.

### Setup and Run

#### Prerequisites

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Install the Expo CLI: `npm install -g expo-cli`.

#### Steps

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
    npx expo start
    ```

    This will start the Metro Bundler and display a QR code in your terminal.

4. **To run the app on your physical device**:
    - **Android**: Scan the QR code with the Expo Go app.
    - **iOS**: Use the Camera app to scan the QR code and open it with the Expo Go app.

5. **To run the app on a simulator/emulator**:
    - **iOS Simulator**: Press `i` in the terminal where the Expo server is running.
    - **Android Emulator**: Press `a` in the terminal (ensure you have an emulator set up through Android Studio).
