# THALF Artisanal Chocolates - Production Product Content Template (P1.1)

**Purpose:** Standardized schema template for collecting, validating, and entering official THALF product data into the PostgreSQL database.

---

## 1. Production Product Content Template Schema

Every production product entry must adhere to the following schema structure prior to database insertion:

```json
{
  "productName": "String (Required. e.g., 'Signature Dark Truffle Box')",
  "slug": "String (Required. URL-safe slug. Auto-generated if omitted)",
  "sku": "String (Required. Unique SKU format, e.g., 'THF-TRF-012')",
  "shortDescription": "String (Required. 1-2 sentence catalog summary, max 160 chars)",
  "fullDescription": "String (Required. Detailed product narrative & craftsmanship details)",
  "category": "String (Required. e.g., 'Dark Chocolate', 'Truffles & Pralines', 'Gift Hampers')",
  "collection": "String (Optional. e.g., 'Signature Reserve', 'Bespoke Atelier')",
  "sellingPrice": "Number (Required. In INR ₹, e.g., 1850)",
  "comparePrice": "Number (Optional. Original MRP for strikethrough, e.g., 2100)",
  "weightGrams": "Number (Optional/Recommended. Net weight in grams, e.g., 250)",
  "dimensions": "String (Optional. Box dimensions L x W x H in cm, e.g., '20 x 15 x 5 cm')",
  "ingredients": [
    "Array of Strings (Required. Full ingredient list in descending order of weight)"
  ],
  "allergenInfo": [
    "Array of Strings (Required. e.g., 'Contains Dairy, Tree Nuts (Hazelnuts). Made in a facility handling gluten.')"
  ],
  "flavourProfile": [
    "Array of Strings (Required. Key tasting notes, max 4 items, e.g., ['Rich Cocoa', 'Toasted Hazelnut', 'Warm Vanilla'])"
  ],
  "cacaoPercentage": "Number (Optional. e.g., 70)",
  "storageInstructions": "String (Required. e.g., 'Store in a cool, dry place between 15°C - 18°C away from direct sunlight.')",
  "shelfLifeDays": "Number (Optional. Shelf life from manufacturing date, e.g., 90)",
  "stockQuantity": "Number (Required. Initial inventory count, e.g., 50)",
  "status": "Enum (Required. 'ACTIVE' | 'DRAFT' | 'ARCHIVED')",
  "featured": "Boolean (Required. True to display in homepage showcase)",
  "images": [
    {
      "url": "String (Required. Relative path or Cloudinary CDN URL)",
      "alt": "String (Required. Descriptive alt text for accessibility)",
      "isDefault": "Boolean (Required. True for primary thumbnail)"
    }
  ]
}
```

---

## 2. Sample Production Entry Formats

### Sample 1: Box Assortment
```json
{
  "productName": "Artisan Truffles Gift Box (12 Pieces)",
  "slug": "artisan-truffles-gift-box-12-pieces",
  "sku": "THF-TRF-12-BOX",
  "shortDescription": "Handcrafted chocolate truffles presented in an elegant gift-ready box, crafted for celebrations and thoughtful surprises.",
  "fullDescription": "A curated 12-piece box of velvet ganache truffles enrobed in dark chocolate shells. Hand-finished and packaged in THALF's signature rigid presentation box with warm gold accents.",
  "category": "Truffles & Pralines",
  "collection": "Signature Reserve",
  "sellingPrice": 3450,
  "comparePrice": 3800,
  "weightGrams": 240,
  "dimensions": "22 x 16 x 4 cm",
  "ingredients": [
    "Dark Cocoa Mass (70%)",
    "Fresh Dairy Cream",
    "Pure Cocoa Butter",
    "Cane Sugar",
    "Natural Bourbon Vanilla Extract"
  ],
  "allergenInfo": [
    "Contains Milk",
    "May contain traces of tree nuts and sesame"
  ],
  "flavourProfile": [
    "Velvety Cocoa",
    "Bourbon Vanilla",
    "Creamy Ganache"
  ],
  "cacaoPercentage": 70,
  "storageInstructions": "Store in a cool, dry place between 15°C and 18°C. Do not refrigerate directly.",
  "shelfLifeDays": 45,
  "stockQuantity": 40,
  "status": "ACTIVE",
  "featured": true,
  "images": [
    {
      "url": "/images/truffles.png",
      "alt": "THALF Artisan Truffles Gift Box 12 Pieces Primary View",
      "isDefault": true
    }
  ]
}
```

### Sample 2: Artisanal Chocolate Bar
```json
{
  "productName": "Signature Dark Chocolate Slab (150g)",
  "slug": "signature-dark-chocolate-slab-150g",
  "sku": "THF-BAR-75-SIG",
  "shortDescription": "Rich 75% dark chocolate slab crafted with selected cocoa nibs and natural cardamom essence.",
  "fullDescription": "Hand-tempered 75% dark chocolate bar offering a crisp snap and a long, warming finish infused with subtle green cardamom notes.",
  "category": "Dark Chocolate",
  "collection": "Signature Reserve",
  "sellingPrice": 1650,
  "comparePrice": 1850,
  "weightGrams": 150,
  "dimensions": "18 x 9 x 1.5 cm",
  "ingredients": [
    "Cocoa Nibs (75%)",
    "Organic Cane Sugar",
    "Pure Cocoa Butter",
    "Green Cardamom Essence"
  ],
  "allergenInfo": [
    "Dairy-Free",
    "May contain traces of tree nuts and peanuts"
  ],
  "flavourProfile": [
    "Warm Cardamom",
    "Deep Cocoa",
    "Subtle Floral"
  ],
  "cacaoPercentage": 75,
  "storageInstructions": "Keep sealed in original foil wrap at 16°C - 20°C.",
  "shelfLifeDays": 120,
  "stockQuantity": 60,
  "status": "ACTIVE",
  "featured": true,
  "images": [
    {
      "url": "/images/hero-chocolate.png",
      "alt": "THALF Signature Dark Chocolate Slab 150g",
      "isDefault": true
    }
  ]
}
```
