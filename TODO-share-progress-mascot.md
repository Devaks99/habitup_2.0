# TODO: Fix Mascot in ShareProgress Image - COMPLETED ✅

## Changes:
- Created `src/hooks/useImageToBase64.ts`: Converts image src to base64 using Canvas for html-to-image.
- Updated `src/components/ShareProgressDialog.tsx`: `const mascotBase64 = useImageToBase64(mascot.src);` and img `src={mascotBase64 ?? mascot.src}`.

## Verify:
`cd habit-harmony && bun dev` (or PowerShell: `cd habit-harmony; bun dev`), test Share dialog: change mascot, wait briefly, download/share. Mascot appears in PNG.

Task complete.

