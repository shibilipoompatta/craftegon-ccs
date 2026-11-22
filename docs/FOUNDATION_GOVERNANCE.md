# CCS Foundation Governance

## Release principle

The public website is a static-first customer information and enquiry experience. Do not represent a form as an accepted lead unless a configured backend returns a confirmed success response and a non-empty lead reference. The current static enquiry flow presents WhatsApp and email handoff options; the visitor must review and send through the selected external provider.

## Pricing approval

- \`data/pricing.json\` is an internal working dataset, not a public price list.
- Historical observed prices remain unverified until independently checked against the current service scope, statutory charges, tax treatment and commercial approval.
- Build scripts must never change verification or commercial-approval statuses.
- A price may be published only after a designated business approver records the approval, evidence source, effective date, inclusions, exclusions and tax treatment.
- Do not describe a fee as a statutory fee unless the amount and legal basis are verified for the relevant entity, filing and date.
- The internal pricing dataset is excluded from the public static build. Approved public prices must be published in reviewed service-page content or a separately approved public data contract.

## Regulatory content

- Each material legal claim must have a source, effective date, jurisdiction, scope and review status in the regulatory claim register.
- Claims requiring professional judgment must remain unpublished or clearly qualified until reviewed by an appropriately qualified professional.
- Never treat a passing automated test as a substitute for legal review.
- Re-check filing deadlines, fees and procedural requirements against current MCA, Income Tax, GST, RBI or other official sources before publication.

## Privacy and enquiry handling

- Explicit, unchecked consent is required before enabling a lead form to proceed.
- Do not transmit initial enquiry data to an unverified webhook or use opaque \`no-cors\` requests.
- Do not collect PAN, Aadhaar, bank credentials, DSC credentials or other sensitive identifiers in initial enquiry forms unless a separately reviewed and secure onboarding workflow requires them.
- A static enquiry page is not a CRM and must not claim that an enquiry has been stored or received.
- Re-enable advertising pixels only after real vendor identifiers, a consent-management mechanism and a documented data-flow review are in place.

## Branch and deployment policy

1. Create feature branches from the latest \`main\`.
2. Run \`npm ci\`, \`npm test\`, \`npm run test:accuracy\`, \`npm run build\` and \`npm run test:build\`.
3. Open a pull request and review the complete diff.
4. Require all CI checks to pass and obtain the relevant business/professional approval.
5. Merge only after review.
6. Verify the exact commit deployed to Cloudflare Pages and perform production smoke tests.
7. Never infer production deployment success from a GitHub merge alone.
