# Todo Expo Frontend

This is the frontend application for the Todo Expo app built with Expo and React Native.

## Application Logo

The application logo displayed after installing the Android APK is configured in the `app.json` file. The logo images are stored in the `assets` folder.

- The main app icon is set via the `icon` field in `app.json`.
- The Android adaptive icon is set via the `android.adaptiveIcon.foregroundImage` field in `app.json`.

To update the application logo:

1. Replace the image files in the `assets` folder with your desired logo images. Ensure the images meet the recommended sizes:
   - `icon.png` or your chosen icon image: 512x512 pixels, PNG format.
   - `adaptive-icon.png` or your chosen adaptive icon image: transparent PNG, recommended size 108x108 dp for foreground.

2. Update the `app.json` file to point to the new icon files if you use different filenames.

3. Rebuild the Android APK using EAS or Expo build commands to apply the changes.

## Building the APK

To build the Android APK with the updated logo, run:

```bash
eas build -p android --profile production
```

This will upload your project to EAS Build and generate the APK with the configured application logo.

## Additional Information

- The splash screen image is configured separately in `app.json` under the `splash` field.
- For more details on configuring app icons and splash screens, refer to the [Expo documentation](https://docs.expo.dev/guides/app-icons/).

## Recommended VSCode Extension for Markdown to PDF

To convert markdown files like this README to PDF directly within VSCode, you can use the following extension:

- **Markdown PDF** by yzane  
  Install it from the VSCode marketplace:  
  https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf

This extension allows you to export markdown files to PDF, HTML, PNG, and more with ease.

## How to use the Markdown PDF extension

1. Open the markdown file in VSCode.
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the command palette.
3. Type `Markdown PDF: Export (pdf)` and select it.
4. The PDF will be generated and saved in the same directory as the markdown file.

This is a convenient way to generate PDF documentation from your markdown files.
