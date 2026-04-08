# Android Chrome Fullscreen Viewport Fix

When exiting fullscreen on Android Chrome, the layout viewport width is sometimes corrupted (half expected width). The `fullscreenchange` event fires before the browser finishes updating viewport dimensions, so synchronous fixes don't work.

## Confirmed working fix

1. Set `document.body.style.opacity = '0'` immediately in the `fullscreenchange` handler
2. After 150ms, re-assert the viewport meta: `meta.content = ''; meta.content = c;`
3. In a `requestAnimationFrame`, set `transition: 'opacity 0.15s ease'` and restore `opacity: '1'`
4. After 200ms, clear the transition

## Why this works

The `fullscreenchange` event fires mid-transition. A 150ms delay lets the browser settle. The opacity hide prevents the user seeing the brief narrow state.

## Approaches that failed

- Synchronous meta jiggle
- `resize` event dispatch
- `screen.orientation.unlock()`
- Using `document.documentElement` as fullscreen target
- 300ms delay without hiding (visible flash)

## How to apply

Use this exact pattern if implementing fullscreen on mobile web in future. The bug is intermittent — don't assume it's fixed by a synchronous approach even if testing succeeds initially.
