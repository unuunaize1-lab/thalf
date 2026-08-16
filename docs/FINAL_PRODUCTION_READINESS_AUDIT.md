THALF — RETURNS, REPLACEMENTS & REFUNDS POLICY

Implement the customer-facing Returns, Replacements & Refunds policy
for THALF Artisanal Chocolates.

IMPORTANT:
This is a FOOD / CHOCOLATE business.

Do not use a generic e-commerce 7-day return policy.

The policy must reflect the fact that chocolate is a food product and
returns are generally not accepted for change of mind or taste
preference.

==================================================
POLICY
==================================================

TITLE:

Returns, Replacements & Refunds

GENERAL RETURN POLICY

Because THALF products are food items, delivered chocolate products
are generally not eligible for return or exchange.

Returns will not be accepted for:

- Change of mind
- Taste preference
- Ordering the wrong product
- Ordering the wrong quantity
- Customer no longer wanting the product

==================================================
ELIGIBLE CUSTOMER ISSUES
==================================================

THALF will review requests involving:

- Damaged products
- Incorrect products delivered
- Missing products
- Products significantly damaged during transit
- Chocolate arriving melted or unusable due to delivery/handling
- Other genuine order-fulfillment issues

All requests are subject to review.

==================================================
REPORTING WINDOW
==================================================

Customers should contact THALF within 48 HOURS of delivery for
damage, melting, missing-item or incorrect-product claims.

Requests submitted after this period may be declined unless THALF
determines that an exception is appropriate.

==================================================
WHATSAPP SUPPORT PROCESS
==================================================

Do NOT create a separate automated return portal.

Customers should contact THALF through the official WhatsApp
customer-support channel.

The customer should provide:

1. Order number
2. Registered mobile number
3. Reason for the request
4. Photos of the package/product where applicable
5. Video evidence where useful for damaged/melted products

THALF will manually review the request.

==================================================
POSSIBLE RESOLUTIONS
==================================================

If the request is approved, THALF may provide:

1. Replacement
2. Refund
3. Other appropriate resolution agreed by THALF

The final resolution is subject to verification of the claim.

==================================================
REFUNDS
==================================================

Do NOT pretend that an automated refund gateway exists.

Refund requests are initiated through WhatsApp support and reviewed
manually by THALF.

Once THALF approves a refund, the refund should be processed through
the applicable payment/order mechanism.

The customer should be informed once the refund has been initiated.

Do not mark an order as REFUNDED merely because the customer requested
a refund.

The Admin must explicitly approve/process the refund.

==================================================
MELTED CHOCOLATE
==================================================

Include a dedicated explanation that chocolate can be temperature
sensitive.

Do not automatically reject every melted-chocolate complaint.

If the product arrives melted or unusable, the customer can contact
THALF within 48 hours with evidence.

THALF will assess the condition and determine the appropriate
resolution.

==================================================
CUSTOMER WEBSITE UX
==================================================

Add the policy to the website footer.

Create:

/returns-refunds

or the project's existing equivalent legal route.

Use THALF's existing premium visual design.

Do NOT make this page look like a generic legal template.

Use clear sections:

- Returns
- What qualifies for assistance
- Damaged or melted chocolate
- Incorrect or missing products
- How to request help
- Refunds
- Reporting window
- Contact THALF

==================================================
WHATSAPP CTA
==================================================

Add a premium CTA:

"Need help with your order?"

"Contact our Concierge team on WhatsApp for returns,
replacements and refund assistance."

Button:

"Contact THALF on WhatsApp"

The WhatsApp link must use the existing configured business
WhatsApp number/settings.

Do not hardcode a phone number into the frontend.

Generate a prefilled message similar to:

"Hello THALF, I need assistance with my order.

Order Number:
Request: Return / Replacement / Refund

Please guide me."

If an authenticated customer is available, prefill appropriate
non-sensitive order/customer information where safe.

Do not expose passwords, session tokens or payment secrets.

==================================================
ADMIN INTEGRATION
==================================================

Check the existing Admin Orders system.

The Admin should be able to see:

- Customer return/refund request
- Order number
- Request reason
- Request date
- Request status

If a return/refund-request workflow does not currently exist,
DO NOT create a large new subsystem.

Use the existing order/audit architecture and implement only what is
required for Phase 1.

Possible request states:

REQUESTED
UNDER_REVIEW
APPROVED
REJECTED
RESOLVED

Keep these separate from actual OrderStatus and PaymentStatus unless
the existing architecture already supports the distinction.

==================================================
SECURITY
==================================================

Customer requests must not allow:

- Customer A to view Customer B's requests
- Customer to approve their own refund
- Customer to mark an order as REFUNDED
- Client-side manipulation of refund status
- Forged order/customer IDs

Customer identity must come from the authenticated session where
available.

Admin authorization must be server-side.

All administrative approval actions must be audit logged.

==================================================
IMPORTANT PAYMENT RULE
==================================================

PhonePe integration remains PAUSED.

WhatsApp ordering/payment remains PAUSED.

WhatsApp is being used ONLY as the customer-support channel for
return/replacement/refund requests.

Do not implement payment processing.

Do not implement automated WhatsApp ordering.

Do not invent a payment gateway.

==================================================
LEGAL CONTENT
==================================================

This is operational website copy, not legal advice.

Do not claim that the policy guarantees a refund in every case.

Use language such as:

"will be reviewed"
"subject to verification"
"THALF may provide a replacement or refund"

Do not copy another company's policy verbatim.

==================================================
VERIFICATION
==================================================

After implementation:

Run:

npx tsc --noEmit
npm run lint
npm test
npm run build

Verify manually:

1. Footer contains Returns & Refunds
2. Policy page loads
3. WhatsApp CTA works
4. WhatsApp number comes from configuration
5. No payment integration was introduced
6. No WhatsApp checkout was introduced
7. Customer cannot approve/refund their own order
8. Admin authorization works
9. Refund/return administrative actions are audit logged
10. Mobile layout works at 320px, 375px, 390px and 430px

Create:

docs/RETURNS_REFUNDS_IMPLEMENTATION.md

Document exactly what was implemented.

Do not start unrelated features.

STOP after implementation and verification.