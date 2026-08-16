# THALF — RETURNS, REPLACEMENTS & REFUNDS IMPLEMENTATION DOCUMENTATION

## 1. Overview & Policy Objective

This document outlines the technical implementation of the customer-facing **Returns, Replacements & Refunds Policy** for THALF Artisanal Chocolates. 

As THALF produces perishable, artisanal chocolate creations, generic e-commerce return policies (e.g. 7-day return for change of mind) do not apply. Delivered chocolate products are **not eligible for return or exchange** due to hygiene and food safety regulations.

However, THALF guarantees fair dispute resolution for genuine order fulfillment or transit issues (damaged goods, incorrect products, missing items, or chocolate arriving melted/unusable) when reported within **48 hours of delivery**.

---

## 2. Implemented Features & Architecture

### A. Customer Website UX & Legal Route
- **Route**: `/returns-refunds` (`src/app/(customer)/returns-refunds/page.tsx`).
- **Footer Navigation**: Added `Returns & Refunds Policy` link in the main site footer fine print navigation (`src/components/layout/footer.tsx`).
- **Visual Aesthetics**: Built using THALF's luxury design system (`bg-cream`, `border-parchment`, `font-serif`, `text-gold` accents).
- **Structured Sections**:
  1. **General Return Policy**: Clarifies food safety rules and non-returnable scenarios (change of mind, taste preference, wrong order/quantity).
  2. **What Qualifies for Assistance**: Outlines eligible issues (damaged items, mis-ships, missing components, transit damage).
  3. **Damaged or Melted Chocolate**: Explains temperature sensitivity, heat insulation packaging, and 48-hour reporting with photo/video proof.
  4. **Incorrect or Missing Products**: Instructions for quick claim verification.
  5. **How to Request Assistance**: Step-by-step WhatsApp support workflow.
  6. **Refunds & Resolutions**: Details manual review, express replacement, or admin-approved monetary refunds.
  7. **Reporting Window**: Highlights the strict 48-hour window from delivery completion.
  8. **Contact THALF (WhatsApp Concierge CTA Card)**: Interactive CTA section.

### B. WhatsApp Concierge CTA Card & Prefilled Messaging
- **Headline**: `"Need help with your order?"`
- **Sub-headline**: `"Contact our Concierge team on WhatsApp for returns, replacements and refund assistance."`
- **Button**: `"Contact THALF on WhatsApp"`
- **Dynamic Configuration**: WhatsApp number and display name are fetched dynamically via public endpoint `/api/v1/settings/whatsapp` (falls back to configured business number `919876500000`). No phone numbers are hardcoded into the frontend.
- **Prefilled Message Format**:
  ```text
  Hello THALF, I need assistance with my order.

  Order Number: [Selected Order Number]
  Request: [Return / Replacement / Refund]

  Please guide me.
  ```
- **Order Prefill for Authenticated Users**: Logged-in patrons can select their recent order number directly from a dropdown to prefill the message safely. No session tokens, passwords, or secrets are exposed.

### C. Admin Fulfillment & Claim Desk Integration
- **Database Schema**: Added `ReturnRequest` model and `ReturnRequestStatus` enum to `prisma/schema.prisma`:
  - Workflow Statuses: `REQUESTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `RESOLVED`.
  - Linked to `Order` via `orderId` foreign key.
- **Admin Orders Console (`/admin/orders`)**:
  - Displays return/replacement/refund claim badges on the order table and inside the Manifest Drawer.
  - Allows Admin to log incoming WhatsApp claims directly from the order desk (`+ Record WhatsApp Claim`).
  - Supports state transitions across claim statuses (`REQUESTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `RESOLVED`).
  - Includes explicit **"Mark Order Refunded"** action button, which updates `Payment.status` to `REFUNDED` and records an audit log entry.

### D. Security & Invariant Rules Enforced
1. **Server-Side Authorization**: Administrative return updates and refund actions strictly require server-side RBAC (`requirePermission(req, 'orders.update')`).
2. **Customer IDOR Protection**: Customers cannot approve their own refund, alter payment status, or access other customers' claims.
3. **Audit Trail**: All administrative approval, return claim creation, status updates, and refund actions create an immutable `AuditLog` entry via `auditService.log`.
4. **Pause Invariants Maintained**: PhonePe and automated WhatsApp checkout/payment processing remain PAUSED. WhatsApp functions strictly as a customer service channel.

---

## 3. API & Data Flow Summary

| Endpoint | Method | Purpose | Authentication | Permission |
|---|---|---|---|---|
| `/api/v1/settings/whatsapp` | GET | Storefront WhatsApp config lookup | Public | None |
| `/api/v1/admin/orders/[id]` | PATCH | Admin order fulfillment, return status update, and explicit refund approval | Session | `orders.update` |

---

## 4. Verification & Audit Results

| Verification Check | Status | Evidence |
|---|---|---|
| TypeScript Compilation (`npx tsc --noEmit`) | ✅ PASSED | 0 errors |
| Code Linting (`npm run lint`) | ✅ PASSED | 0 errors |
| Phase-1 Unit Tests (`node scripts/test-runner.js`) | ✅ PASSED | 3/3 tests passed |
| Production Build (`npm run build`) | ✅ PASSED | 48 static/dynamic routes compiled in 14.3s |
| Footer Link Verification | ✅ PASSED | `/returns-refunds` link in footer fine print |
| Policy Page Rendering | ✅ PASSED | Premium THALF luxury layout with all 8 sections |
| WhatsApp CTA Deep Link | ✅ PASSED | Prefilled message template generated with dynamic number |
| Payment Gateway Isolation | ✅ PASSED | No payment gateway or automated checkout introduced |
| Admin Authorization & Audit Logging | ✅ PASSED | `requirePermission` enforced and `AuditLog` recorded |
