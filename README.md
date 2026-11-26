# WebNora digital studio
A React web app built with JSX function components and Vite with original amethyst artwork, a Three.js device scene, seven labelled concept case studies, isolated playground demos, a project estimator, PDF export, customer workspace and administration.

## React structure
The entry point is `src/main.jsx`. Public pages share a React context for published content. The project inquiry form, playground, client workspace and editor use React state and event handlers. Firebase access and Three.js rendering stay in dedicated JavaScript modules.

## Local development
Use Node 24 and Java 21 (for Firestore emulator tests). Run `npm ci`, then `npm run dev`. Vite serves the site at http://localhost:4173. Public pages and all playground tools work without credentials. A missing Firebase connection produces an explicit error for sign-in and submissions.

For a local backend, run `npx firebase emulators:start --only auth,firestore --project demo-webnora` in another terminal and start Vite with `VITE_USE_EMULATORS=1 npm run dev` on localhost.

Run `npm test` to test Firestore rules against a disposable emulator, then `npm run build && npm run check:ui` for production output and DOM interaction checks. The generated dist contains route-specific entry documents, a sitemap, robots.txt and a 404 document. The Firebase and Three.js bundles are loaded separately.

## Connect web-nora
1. In Firebase project **web-nora** (431773625883), register a web app if needed. Set up Cloud Firestore in Native mode and choose a data location appropriate for the business. Review any existing rules before replacing them. Use the existing no-cost plan where supported.
2. Enable Google sign-in for staff/clients and Anonymous sign-in for public inquiries under Authentication. Add the actual domain to Authorized domains.
3. On Firebase Hosting, the client reads the public web configuration from `/__/firebase/init.json`. For a separate preview, put the public Firebase web configuration JSON in `VITE_FIREBASE_CONFIG` in .env.local before running/building. Never put FIREBASE_TOKEN or administrative credentials in a VITE variable.
4. Use the Firebase Admin SDK in a trusted administrative environment to assign the custom claim `admin: true` to the verified studio owner's UID. Preserve any other existing claims. Sign out and back in. Clients sign in at /portal and provide the displayed UID for assignment to their projects, quotes and invoices.
5. Review firestore.rules before release. Guest submissions and their cooldown records commit atomically; the cooldown is per identity. Anonymous identities can be renewed. For stronger protection enable and verify Firebase App Check before production traffic.
6. Portfolio images and inquiry reference images are resized and validated. Document links should point to files with matching per-client access controls at their host. Portfolio video upload requires an existing Firebase Storage bucket and the included storage.rules. A hosted HTTPS video link is an alternative. No subscription or billing upgrade is required by the code.
7. After merging and authorizing publication, manually run **Publish WebNora** on main. Publish firestore:rules before accepting inquiries, then hosting. Storage rules are a separate optional target. The workflow uses the existing FIREBASE_TOKEN secret. Deploying rules replaces rules for the selected target. Opening a PR or merging does not publish the website.

## Studio operations
Use /admin to set the studio's real contact details and edit content. Save a draft to preview it before publishing. Portfolio entries can be added, reordered, hidden, given status and technology details, and assigned an image, video or live URL. The default seven entries are concept visualizations based on the brief. Confirm delivery statuses and stacks before publishing those claims. Demo sales, customers and inventory exist only in the playground.

Inquiry exports contain personal contact details. Only administrators can access them. Client project documents, proposals and invoices are assigned by Firebase UID. Each invoice's payment status is explicitly entered by staff. Proposed add-on prices are editable estimates. Client PDFs and printed estimates use INR.

## Verification scope
The checks cover project configurator plan handoff, pricing, contact controls, design customization, demo record deletion, production page entries, private records, restricted writes and inquiry cooldown. A live Firebase sign-in, submission and release, browser visual review and validation of actual business content are release checks. No production database writes or public Hosting deployment were made during development.
