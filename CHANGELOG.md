# Changelog

## [2.30.1] - 2026-02-18

### Přidáno

- **Data:** Implementovány technické specifikace pro barvy Tamiya a Gunze (ředidla, bezpečnost, použití) v `src/data/*_spec.json`.
- **Dokumentace:** Přidána dokumentace architektury dat barev (`Architektura dat barev.md`).
- **App:** Přidána globální proměnná `import.meta.env.PACKAGE_VERSION` pro zobrazení verze v aplikaci.

### Změněno

- **Build:** Zvýšen limit varování velikosti chunku ve Vite na 1000 kB (řeší warningy při buildu).
- **Config:** Dynamické načítání verze aplikace z `package.json` do Vite konfigurace.
