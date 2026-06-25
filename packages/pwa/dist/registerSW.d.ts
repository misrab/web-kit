/**
 * Register the PWA service worker. Safe to call on every load (no-op when
 * already registered or unsupported). Required for the app to be installable.
 */
export declare function registerSW(path?: string): void;
