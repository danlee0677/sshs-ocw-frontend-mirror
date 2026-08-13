interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

/**
 * The app version, substituted at build time by the `define` block in
 * vite.config.ts from package.json's `version` field.
 *
 * A `declare const`, not an `import.meta.env` entry: `define` performs a
 * literal text replacement on the identifier, so there is no runtime object to
 * hang it off. This file is a global script (no top-level import/export), which
 * is what puts the declaration in scope everywhere without an import.
 */
declare const __APP_VERSION__: string;

interface ImportMeta{
  readonly env: ImportMetaEnv;
}
