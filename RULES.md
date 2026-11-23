# LiliSare - Architecture, Infrastructure, and Compliance Rules

This document outlines the high-level architecture, infrastructure, deployment procedures, and strict compliance requirements (HIPAA and COPPA) for the LiliSare project. All team members, regardless of role, must adhere to these rules.

## 1. High-Level Architecture
- **Framework:** Next.js (App Router) with React and TypeScript.
- **Database:** PostgreSQL (accessed via Prisma ORM).
- **Authentication:** Secure Identity Provider (e.g., NextAuth, Auth0, or AWS Cognito) with Multi-Factor Authentication (MFA) support.
- **Infrastructure:** Vercel (for frontend/edge delivery) and AWS (for HIPAA-compliant data storage and backend processing).
- **File Storage:** AWS S3 (Encrypted at rest) for storing medical records, consent forms, and sensitive documents.

## 2. Infrastructure & Deployment Rules
- **Environment Isolation:** Strict separation between `Development`, `Staging`, and `Production` environments. Real user data must NEVER be used in Development or Staging.
- **CI/CD Pipeline:** 
  - Automated testing, static code analysis, and security scanning (e.g., Snyk, SonarQube) must pass before merging.
  - No direct commits to the `main` branch. All changes require a Pull Request with at least one peer review.
- **Deployment:** Production deployments must be automated, require explicit approval, and be easily roll-backable.
- **Secrets Management:** Environment variables, API keys, and database credentials must be stored in a secure vault (e.g., AWS Secrets Manager). Never hardcode secrets or commit `.env` files containing sensitive data.
- **Monitoring & Observability:** Centralized logging (e.g., Datadog, AWS CloudWatch). **Rule:** Absolutely NO Personally Identifiable Information (PII) or Protected Health Information (PHI) may be printed to application logs.

## 3. HIPAA Compliance (Health Insurance Portability and Accountability Act)
As a healthcare application, protecting Protected Health Information (PHI) is critical.
- **Encryption:** All PHI must be encrypted **at rest** (using AES-256) and **in transit** (using TLS 1.2 or higher).
- **Audit Trails:** Every action involving PHI (view, create, update, delete) must be securely logged. Logs must include the user ID, timestamp, IP address, and the specific action taken.
- **Data Minimization:** Only collect, process, and retain the minimum amount of PHI necessary to perform the required service.
- **Business Associate Agreements (BAAs):** We must have signed BAAs with all third-party vendors that touch PHI (e.g., AWS, Vercel, Database providers).

## 4. COPPA Compliance (Children's Online Privacy Protection Act)
Since LiliSare may process data of children under 13 years of age:
- **Verifiable Parental Consent:** The application must obtain and record verifiable consent from a parent or legal guardian *before* collecting, using, or disclosing any personal information from a child.
- **Clear Privacy Notice:** A prominent, easy-to-read privacy policy must dictate exactly what information is collected from children and how it is utilized.
- **Parental Rights:** Parents must be provided a mechanism to review their child's data, request its deletion, and withdraw consent for future data collection.
- **No Third-Party Tracking:** Strictly prohibit behavioral advertising, marketing trackers, or third-party data brokers on any child-facing interfaces.

## 5. Role-Based Requirements & Access Control (RBAC)
Access to systems and data is granted on a strict Principle of Least Privilege (PoLP).

### DevOps & Infrastructure Administrators
- Manage all infrastructure securely and apply security patches promptly.
- Enforce MFA for all infrastructure and database access.
- Review and audit access logs and security alerts regularly.

### Software Developers & QA
- Must complete mandatory HIPAA and COPPA compliance training before accessing the codebase.
- Must use synthetic, anonymized, or mock data for all local development and testing.
- Must ensure all new features undergo a privacy and security review prior to deployment.

### Support & Operations Staff
- Must verify the identity of the user (Parent/Guardian) before discussing any account or patient details.
- May only access user data strictly when necessary to resolve a documented support ticket.

### End Users (Parents, Guardians, & Healthcare Providers)
- Must complete verified onboarding, including accepting Terms of Service and Privacy Policies.
- Required to use strong passwords. MFA is highly recommended for Parents and mandatory for Healthcare Providers.

## 6. Enforcement & Incident Response
- **Enforcement:** Failure to adhere to these rules may result in immediate revocation of access and potential disciplinary or legal action.
- **Incident Reporting:** Any suspected data breach, unauthorized access, or compliance violation must be reported immediately to the Security Officer.

## 7. LiliSare – Agency Admin Workflow (Core Journey & Scope Boundaries)
All administrative features, user flows, and intake processes must strictly align with the 10-stage Agency Admin Journey. Development must never go out of scope beyond these defined stages:

1. **Intake & Referral (New inquiry)**
   - **Trigger:** A family, client, or caregiver contacts LiliSare or a referral arrives from an external partner/organisation.
   - **Data Captured:** Family contact details, Person needing care, Type of care needed, Location, Referral source, Preferred contact method.
   - **System Entity:** `Inquiry` (e.g. `INQ-1001`, Status: `New Lead`).
2. **Client Registration (Client created)**
   - **Entity:** `Client Profile` (The person receiving care, e.g. Child A).
   - **Data Captured:** Demographics, DOB, Address, Responsible family member, Emergency contacts, Service requirements, Programme information, Case manager details.
3. **Caregiver Registration (Caregiver created)**
   - **Entity:** `Caregiver Profile` (The person providing care, e.g. Mother A).
   - **Data Captured:** Personal details, Relationship to client, Contact info, Employment/contractor classification (W-2/1099), Credentials, Training status, Payroll setup info.
   - **Core Relationship:** Client and Caregiver are distinct profiles connected under a **Linked Household Relationship** (Family-centred care model).
4. **Documents & Onboarding (Verification pending)**
   - **Dynamic Checklist:** Identity documents, Agreements, Background screening, CPR/First Aid, Training completion.
   - **Statuses:** `Verified` / `Completed`, `Signed`, `Pending`, `Missing`.
5. **Case Manager & Authorisation (Approval pending)**
   - **Coordination:** Coordinate with case manager, track requested hours/units, approval dates, expiry dates.
   - **Core Rule:** Caregiver onboarding completion does NOT automatically authorize service delivery; applicable approval and payer service rules must be satisfied.
6. **Caregiver Approval & Activation (Ready for activation)**
   - **Prerequisites:** All documents, screening, training, agreements, authorizations, and payroll setup verified.
   - **Status:** Unlocks `Active` caregiver status for scheduled delivery.
7. **Scheduling & EVV (Care in progress)**
   - **Admin:** Caregiver assignments, visit dates/times, shift changes, missed visit alerts, availability.
   - **Caregiver (Mobile App):** Visit checklist, Clock-in, Deliver care, Clock-out, EVV time & location verification.
8. **Care Notes & Clinical Monitoring (Ongoing monitoring)**
   - **Monitoring:** Missing care notes, documentation reviews, RN assessments, supervisory visits.
   - **AI Rule:** AI may assist in drafting care note wording, but a responsible person must review and approve final documentation.
9. **Compliance Management (Continuous monitoring)**
   - **Lifecycle:** Ongoing proactive tracking of expiring credentials (e.g. CPR, First Aid), renewals, supervisory deadlines, and recurring background checks.
10. **Billing & Payroll (Financial processing)**
    - **Billing Team:** Completed visits review, authorization validation, care documentation audit, claim preparation/submission, denials/corrections.
    - **Payroll Team:** Eligible work hours review, worker classification, payroll coordination via ADP, corrections and reconciliation.

## 8. The Three Connected Journeys (Core Product Architecture)
The Agency Admin Portal must NEVER be designed as isolated, fragmented department screens. Instead, it is architected around **three synchronized, interdependent journeys** unified within LiliSare (often tied together by a Household):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. CLIENT JOURNEY                                                                     │
│    Inquiry ──▶ Client Registration ──▶ Assessment ──▶ Service Authorisation ──▶ Care Received │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. CAREGIVER JOURNEY                                                                  │
│    Registration ──▶ Documents ──▶ Screening ──▶ Training ──▶ Approval ──▶ Activation ──▶ Care Delivery │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. AGENCY OPERATIONS JOURNEY                                                          │
│    Intake ──▶ Coordination ──▶ Compliance ──▶ Scheduling ──▶ Monitoring ──▶ Billing & Payroll │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Guidelines:
- **Unified Household/Case Context:** When an Admin views a case (e.g. Family inquiry), they must immediately see where the case stands across all 3 tracks:
  1. Has the Client been assessed and authorised? (Client Journey)
  2. Is the associated Caregiver (e.g., Mother) fully screened, trained, and activated? (Caregiver Journey)
  3. Are scheduling, compliance, EVV, and billing operational for this arrangement? (Agency Operations Journey)
- **Eliminate Silos:** An action or status update in one journey (e.g., Case Manager Authorisation received) automatically updates and unlocks the downstream steps in the connected journeys (e.g., Caregiver Activation and Scheduling eligibility).

## 9. General Development & UI Guidelines
- **Navigation:** Navigate newly built pages from dedicated sidebar menu items for all new pages, matching existing sidebar styling and role-based navigation.
- **Modals vs. Full Pages:** Avoid long, content-heavy modals; implement extensive views (wizards, profiles, detailed record editors) as dedicated full pages instead.
- **Design Consistency:** Maintain uniform styling and layouts across all UI elements (cards, typography, actions/links, tables, and modals) in line with existing pages.
- **Table Column Simplicity & Clean Front Lists:** Front list table columns MUST display concise, single-line primary values without cluttered subtexts or subheadings (e.g. no nested role, demographic, or duplicate status subtext under entity names). All comprehensive, secondary details must be reserved for the dedicated details view/page (`tableDetails`), ensuring no duplicate data is displayed in a single page or row.
- **Brand & Domain Terminology:** Align all copy, service names, sample data, and tone with the LiliSare brand, incorporating clear terminology for Patients/Clients, Caregivers, and Households.
- **Role-Dedicated Routing Architecture:** All routing URLs MUST strictly include the role-dedicated prefix matching the user persona (e.g. `/intake/...`, `/admin/...`, `/hr/...`, `/scheduler/...`, `/billing/...`, `/clinical/...`, `/compliance/...`, `/portal/...`, `/caregiver/...`). Core entities must always be accessed via their role prefix (e.g. `/intake/caregivers/`, `/intake/clients/`, `/intake/households/` for Intake Coordinator, and `/admin/caregivers/`, `/admin/clients/`, `/admin/households/` for Agency Admin). Never introduce un-prefixed or ambiguous root entity URLs. All future pages, sub-routes, and navigation links must strictly follow this role-scoped convention.
- **Global UI Standardization (Cards, Modals & Forms):**
  - **Global Card Outlines:** All cards across the entire application must strictly apply uniform card outline styles: `bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200`.
  - **Global Modal & Form Layouts/Styles:** Standardize all modal and form layouts/styles globally to match `/intake/pipeline/new/` and the shared components in `@/components/ui/Modal` and `@/components/ui/FormControls`:
    - **Modal Shell & Backdrop:** Container: `relative w-full bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col`. Backdrop: `fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4`.
    - **Modal Header:** `border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white` with emerald icon badge `w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22]`, title `text-base sm:text-lg font-bold text-slate-900 tracking-tight`, description `text-xs text-slate-500 font-medium mt-0.5`, close button `p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors`.
    - **Modal Body & Form Inputs:** Inputs: `w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800`. Labels: `text-[13px] font-medium text-slate-700 block mb-1.5`. Section headers: `text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2` with divider line `<div className="h-px bg-slate-100 flex-1"></div>`.
    - **Modal & Form Action Buttons:** Primary button: `inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer`. Secondary / Cancel button: `inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer`.
  - **Common Sidebar and Header Integration:** Every portal section—including the Agency Admin Portal (`/admin/...`), Intake Portal (`/intake/...`), and department workspaces—MUST be wrapped in `<AppLayout>` with the unified sidebar and TopBar header. Never omit portal root layouts.



