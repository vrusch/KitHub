# **Architektura dat barev**

Tento dokument definuje pravidla pro správu dat o modelech, barvách a výrobcích v aplikaci.

## **Struktura složky src/data/paints/**

* index.js: Centrální API rozcestník. Komponenty by měly importovat data pouze odsud.  
* {vyrobce}.json: Surová data barev (např. tamiya.json).  
* {vyrobce}\_spec.json: Technické specifikace řad (např. tamiya\_spec.json).

## **Pravidla pro JSON soubory**

1. **Single Line Objects**: Každý objekt barvy musí být na JEDNOM řádku.  
   * Správně: "TAMIYA\_X1": { "displayCode": "X-1", "name": "Black", ... },  
   * Důvod: Snadná údržba a přehlednost při velkém množství dat.  
2. **Klíče**: Klíče musí být unikátní a v uppercase formátu (např. BRAND\_CODE).

## **Postup přidání nové značky**

1. Vytvořit soubory {brand}.json a {brand}\_spec.json.  
2. Přidat importy do index.js.  
3. Aktualizovat konstantu BRANDS a exportní funkce v index.js.

## **Práce s AI (Gemini Code Assist)**

* Při požadavku na změnu vždy odkazuj na tento soubor pomocí @ARCHITECTURE.md.  
* Vyžaduj dodržování formátu "každý objekt na jeden řádek".