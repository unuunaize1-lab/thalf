# THALF Artisanal Chocolates - Product Image & Asset Requirements (P1.1)

**Purpose:** Comprehensive inventory of current media assets, aspect ratio specifications, image quality benchmarks, and migration checklist prior to Cloudinary integration in P1.2.

---

## 1. Current Media Asset Inventory

| Image Asset File | Current Use / Location | Resolution / Format | Status / Action |
| :--- | :--- | :--- | :--- |
| `/images/hero-chocolate.png` | Homepage Hero, Product Cards, Craft Section | PNG (Raster) | `DEVELOPMENT PLACEHOLDER` — Requires replacement with high-res studio shot of real THALF product packaging. |
| `/images/truffles.png` | Gifting Section, Truffle Product Thumbnail | PNG (Raster) | `DEVELOPMENT PLACEHOLDER` — Requires replacement with high-res studio shot of real THALF truffle boxes. |
| `/images/cacao-harvest.png` | Our Craft Page, About Section | PNG (Raster) | `DEVELOPMENT PLACEHOLDER` — Requires replacement with real brand craft imagery or license-verified studio asset. |

---

## 2. Image Specifications & Required Aspect Ratios

To ensure visually stunning presentation across mobile, tablet, and desktop viewports, all future imagery uploaded to Cloudinary in P1.2 must meet the following guidelines:

### A. Homepage Hero & Banner Imagery
- **Aspect Ratio:** `16:9` (Desktop) / `4:5` (Mobile Portrait Container)
- **Minimum Resolution:** `1920 x 1080 px`
- **File Format:** WebP or PNG
- **Style Guidelines:** Dark luxury aesthetic, studio lighting focusing on warm gold/charcoal packaging contrast, soft depth-of-field background.

### B. Product Catalog Thumbnail / Card Imagery
- **Aspect Ratio:** `4:3` (Standard Catalog Card) or `1:1` (Square Grid)
- **Minimum Resolution:** `1200 x 900 px`
- **File Format:** WebP (Auto-optimized)
- **Style Guidelines:** Clean cream/parchment background or elegant dark obsidian surface; product centered with subtle shadows.

### C. Product Detail Page Gallery Imagery
- **Aspect Ratio:** `1:1` (Square Detail Zoom) & `4:3` (Secondary Shots)
- **Minimum Resolution:** `1600 x 1600 px`
- **Required Gallery Angles:**
  1. *Primary Shot:* Closed branded gift box or packaged bar.
  2. *Unboxing Shot:* Open box displaying individual chocolates/truffles inside.
  3. *Cross-Section / Texture Shot:* Close-up slice showing ganache filling or cocoa snap.
  4. *Scale / Lifestyle Shot:* Styled arrangement alongside ribbon or tea/coffee setting.

---

## 3. Product Image Migration Checklist (Pre-Cloudinary P1.2)

- [ ] **Step 1:** Receive high-resolution photography files from THALF brand owner.
- [ ] **Step 2:** Organize assets by product SKU (`THF-TRF-012_primary.webp`, `THF-TRF-012_open.webp`).
- [ ] **Step 3:** Perform web optimization (WebP conversion, compressed below 300KB per image without quality degradation).
- [ ] **Step 4:** Define image alt text according to accessibility standards (`"THALF Artisan Truffle Box 12 Pieces open view"`).
- [ ] **Step 5:** Upload images to Cloudinary THALF production folder (`/thalf/products/`).
- [ ] **Step 6:** Update PostgreSQL `ProductImage` database records with secure HTTPS Cloudinary URLs.
