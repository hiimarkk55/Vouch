# VOUCH // FONTS

The VOUCH mobile app uses **Space Mono** for its terminal aesthetic.

## Required Font Files

Place these font files in this directory:

- `SpaceMono-Regular.ttf`
- `SpaceMono-Bold.ttf`

## Download

You can download Space Mono from:

- [Google Fonts](https://fonts.google.com/specimen/Space+Mono)
- [Font Squirrel](https://www.fontsquirrel.com/fonts/space-mono)

## Installation

1. Download the font files
2. Place them in `mobile/assets/fonts/`
3. Font loading is handled in `App.tsx`:

```typescript
await Font.loadAsync({
  'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
  'SpaceMono-Bold': require('./assets/fonts/SpaceMono-Bold.ttf'),
});
```

## Usage in Components

```typescript
<Text className="font-mono text-neon-cyan">
  > TERMINAL TEXT
</Text>

<Text className="font-mono-bold text-neon-cyan">
  > BOLD TERMINAL TEXT
</Text>
```

## Why Space Mono?

- **Monospace**: Essential for terminal aesthetic
- **Legibility**: Clear at all sizes
- **Cyberpunk**: Fits the VOUCH brand
- **Open Source**: Free to use

---

**MONOSPACE OR GTFO.**
