## Notes

This App assumes all txs are allways successfully pushed and accepted

It also assumes that mempool === confirmed

Assumes FEE 500 sats for all txs. This is particularly bad for the trigger & unvault & panic tx (we don't know the future fee rates)


```bash
npx create-expo-app Vault
cd Vault
npx expo start
```

```bash
#shims and compatibility stuff:
#note we are using react-native-get-random-values@1.8.0 until this is resolved:
#https://github.com/LinusU/react-native-get-random-values/issues/49
npm install buffer\
    stream\
    events\
    react-native-get-random-values@1.8.0\
    react-native-url-polyfill

#If you want to use electrum client on react-native:
#npm install react-native-tcp-socket
#uncomment this line in init.js: //import './electrumSupport'
#npx expo prebuild
#cd ios && pod install && cd ..
```


```bash
npm install @react-native-async-storage/async-storage@1.18.2
```

```bash
npm install bip39 bip68\
    bitcoinjs-lib \
    @bitcoinerlab/secp256k1 \
    @bitcoinerlab/descriptors \
    @bitcoinerlab/miniscript
```

```bash
npm run updatelocalexplorer
npm run updatelocaldiscovery
```

```bash
#QR codes
npm install react-native-qrcode-svg
npx expo install react-native-svg
```

```bash
#memoize
npm install lodash.memoize
#clipboard
npx expo install expo-clipboard
#share
npx expo install expo-sharing
#deals with SafeAreaView (correct padding for devices with notch)
npx expo install react-native-safe-area-context
```


Create init.js and import it from App.js


```javascript
    await discovery.discover({
      expressions: `addr(${vaultAddress})`,
      network,
      onUsed: (expression) =>
        console.log(`vault address in the chain: ${expression}`),
    });
```

## Run on Expo

```bash
npx expo start -c
```


## Install on device
```bash
#To register your devices
eas device:create
#To debug using expo and dev server using a device:
eas build --profile development --platform ios
#To build an image that can be installed on a device:
eas build --profile preview --platform ios
```
