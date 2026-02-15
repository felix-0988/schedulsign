# E-Signature Feature - User Flows

## Overview

These user flows cover the complete e-signature experience for SchedulSign. The e-signature module is currently schema-ready (Document model exists in Prisma) but not yet fully implemented. These flows define the target experience for sending, signing, and managing documents.

### Document Lifecycle (from schema)
```
DRAFT -> SENT -> VIEWED -> SIGNED -> COMPLETED -> VOIDED
```

---

## 1. Document Upload & Preparation Flow (Sender)

```mermaid
flowchart TD
    A[Dashboard] --> B[Click "Documents" in Sidebar]
    B --> C{Any Documents?}
    C -->|No| D[Empty State: "Send your first document for signing"]
    C -->|Yes| E[Document List View]

    D --> F[Click "New Document"]
    E --> F

    F --> G[Upload Step]
    G --> G1{Upload Method}
    G1 -->|Drag & Drop| H[Drop Zone Area]
    G1 -->|File Picker| I[Click "Browse Files"]
    G1 -->|Template| J[Select from Templates]

    H --> K{Valid File?}
    I --> K
    K -->|PDF| L[File Accepted]
    K -->|Word .doc/.docx| L2[Convert to PDF]
    K -->|Image .png/.jpg| L3[Convert to PDF]
    K -->|Invalid Type| M[Show Error: Supported formats]
    K -->|Too Large > 10MB| N[Show Error: File size limit]

    L --> O[Document Uploaded to Storage]
    L2 --> O
    L3 --> O
    J --> O

    O --> P[Document Preparation View]
    P --> Q[PDF Rendered in Canvas/Viewer]
    Q --> R[Field Placement Toolbar]
```

### Key Design Decisions
- Support PDF, Word, and image uploads (convert non-PDF to PDF server-side)
- Drag-and-drop upload zone is primary; file picker is fallback
- 10MB file size limit balances usability with storage costs
- Templates allow reuse of common documents (contracts, NDAs)

---

## 2. Field Placement Flow (Sender - Document Preparation)

```mermaid
flowchart TD
    A[Document Preparation View] --> B[Left Panel: Add Recipients]
    B --> B1[Recipient 1: Name + Email]
    B --> B2[Click "+ Add Recipient"]
    B2 --> B3[Recipient 2: Name + Email]
    B3 --> B4{More Recipients?}
    B4 -->|Yes| B2
    B4 -->|No| B5[Recipients List Complete]

    B5 --> C{Sequential Signing?}
    C -->|Yes| C1[Set Signing Order via Drag Reorder]
    C -->|No| C2[All Sign in Parallel]

    A --> D[Right Panel: Document Viewer]
    D --> E[Page Navigation]
    E --> E1[Page thumbnails sidebar]
    E --> E2[Prev/Next page buttons]
    E --> E3[Zoom in/out]

    A --> F[Field Toolbar]
    F --> F1[Signature Field]
    F --> F2[Initials Field]
    F --> F3[Date Field]
    F --> F4[Text Field]
    F --> F5[Checkbox Field]
    F --> F6[Name Field - auto-fill]
    F --> F7[Email Field - auto-fill]

    F1 --> G[Drag Field onto Document]
    G --> H[Field Placed on Page]
    H --> I[Assign Field to Recipient]
    I --> I1[Color-coded by recipient]
    H --> J[Resize Field]
    H --> K[Reposition Field]
    H --> L[Mark as Required/Optional]
    H --> M[Delete Field]

    H --> N{More Fields?}
    N -->|Yes| F
    N -->|No| O[Review Placement]

    O --> P{All Recipients Have Fields?}
    P -->|No| Q[Warning: Recipient X has no fields]
    P -->|Yes| R[Ready to Send]
```

### Key Design Decisions
- Recipients added before field placement so fields can be assigned
- Each recipient gets a unique color for visual distinction on the document
- Sequential signing order set by drag-reorder of recipient list
- Field types cover common e-signature needs (signature, initials, date, text, checkbox)
- Auto-fill fields (name, email) reduce signer effort
- Warning if a recipient has no assigned fields prevents sending incomplete documents

---

## 3. Send Document for Signing Flow

```mermaid
flowchart TD
    A[Fields Placed - Ready to Send] --> B[Click "Send for Signing"]
    B --> C[Send Confirmation Dialog]

    C --> D[Review Summary]
    D --> D1[Document title]
    D --> D2[Number of pages]
    D --> D3[Recipients list with order]
    D --> D4[Number of fields per recipient]

    C --> E[Optional: Add Email Message]
    E --> E1[Subject line - default provided]
    E --> E2[Personal message body]

    C --> F[Optional: Set Expiration Date]
    F --> F1[Default: 30 days]
    F --> F2[Custom date picker]

    C --> G[Optional: Set Reminders]
    G --> G1[Auto-remind every X days]

    C --> H[Click "Send"]
    H --> I[Document Status: DRAFT -> SENT]

    I --> J{Sequential Signing?}
    J -->|Yes| K[Send Email to First Recipient Only]
    J -->|No| L[Send Email to All Recipients]

    K --> M[Email Contains:]
    L --> M
    M --> M1[Document title]
    M --> M2[Sender name and message]
    M --> M3[Unique signing link]
    M --> M4[Expiration date]

    I --> N[Create Audit Trail Entry]
    N --> N1[Timestamp]
    N --> N2[Action: "Document sent"]
    N --> N3[IP address]
    N --> N4[Sender identity]

    I --> O[Fire Webhook: document.sent]
    I --> P[Update Contact Record]
```

### Key Design Decisions
- Confirmation dialog prevents accidental sends
- Custom email message adds personal touch
- Expiration date creates urgency and auto-voids expired documents
- Sequential signing sends to next recipient only after previous completes
- Audit trail begins at send time for legal compliance

---

## 4. Document Signing Flow (Signer Perspective)

```mermaid
flowchart TD
    A[Signer Receives Email] --> B[Click "Review & Sign"]
    B --> C[Open Signing Page - /sign/{token}]

    C --> D{Token Valid?}
    D -->|Expired| E[Show "This document has expired"]
    D -->|Already Signed| F[Show "You have already signed"]
    D -->|Voided| G[Show "This document has been voided"]
    D -->|Valid| H[Load Signing View]

    H --> I[Document Header]
    I --> I1[Document title]
    I --> I2[Sent by: Sender name]
    I --> I3[Message from sender]

    H --> J[Document Viewer]
    J --> K[PDF Rendered with Highlighted Fields]
    K --> K1[Required fields highlighted in yellow]
    K --> K2[Optional fields highlighted in light blue]
    K --> K3[Completed fields turn green]

    H --> L[Document Status: SENT -> VIEWED]
    L --> L1[Audit trail: "Document viewed by signer"]

    K --> M[Navigate to First Required Field]
    M --> N{Field Type?}

    N -->|Signature| O[Click Signature Field]
    O --> P[Signature Modal]
    P --> P1[Tab 1: Draw Signature]
    P1 --> P1a[Canvas with touch/mouse drawing]
    P --> P2[Tab 2: Type Signature]
    P2 --> P2a[Enter name - rendered in script font]
    P2 --> P2b[Choose from 4-5 font styles]
    P --> P3[Tab 3: Upload Signature]
    P3 --> P3a[Upload image file]
    P --> P4[Click "Apply"]
    P4 --> Q[Signature Placed on Document]
    Q --> Q1[Reuse same signature for remaining fields]

    N -->|Initials| R[Click Initials Field]
    R --> S[Initials Modal - Similar to Signature]
    S --> T[Initials Placed]

    N -->|Date| U[Click Date Field]
    U --> V[Auto-fill with Today's Date]
    V --> W[Editable if needed]

    N -->|Text| X[Click Text Field]
    X --> Y[Type Text Inline]

    N -->|Checkbox| Z[Click to Toggle]

    N -->|Name| AA[Auto-filled from Signer Info]
    N -->|Email| AB[Auto-filled from Signer Info]

    Q --> AC{All Required Fields Complete?}
    T --> AC
    W --> AC
    Y --> AC
    Z --> AC
    AA --> AC
    AB --> AC

    AC -->|No| AD[Progress Indicator: "3 of 7 fields completed"]
    AD --> AE[Scroll/Navigate to Next Field]
    AE --> N

    AC -->|Yes| AF[Enable "Finish Signing" Button]
    AF --> AG[Click "Finish Signing"]

    AG --> AH[Legal Consent Dialog]
    AH --> AH1["I agree this is my electronic signature"]
    AH --> AH2[Show signer's name + email]
    AH --> AH3[Click "I Agree"]

    AH3 --> AI[Document Status: VIEWED -> SIGNED]
    AI --> AJ[Create Audit Trail Entry]
    AJ --> AJ1[Timestamp]
    AJ --> AJ2[Action: "Document signed"]
    AJ --> AJ3[IP address]
    AJ --> AJ4[Browser/device info]
    AJ --> AJ5[Signature image hash]

    AI --> AK[Signing Confirmation Page]
    AK --> AK1["Document signed successfully"]
    AK --> AK2[Download signed PDF option]
    AK --> AK3[Powered by SchedulSign]

    AI --> AL{All Recipients Signed?}
    AL -->|No - Sequential| AM[Send Email to Next Recipient]
    AL -->|No - Parallel| AN[Wait for Others]
    AL -->|Yes| AO[Document Status: SIGNED -> COMPLETED]

    AO --> AP[Send Completed Document to All Parties]
    AP --> AP1[PDF with all signatures embedded]
    AP --> AP2[Signing certificate PDF attached]

    AI --> AQ[Fire Webhook: document.signed]
    AO --> AR[Fire Webhook: document.completed]
```

### Key Design Decisions
- Three signature input methods (draw, type, upload) accommodate all users
- "Viewed" status tracked when signer opens the document (legal requirement)
- Progress indicator shows completion and guides signer through fields
- Legal consent dialog with explicit agreement is required for legal validity
- Once a signature is created, it is reused for subsequent signature fields
- Sequential signing automatically triggers the next recipient
- Completed documents are distributed to all parties with signing certificate
- Mobile-friendly: draw works with touch, type works on any device

---

## 5. Document Management Flow (Sender Dashboard)

```mermaid
flowchart TD
    A[Dashboard Sidebar] --> B[Click "Documents"]
    B --> C[Documents List Page]

    C --> D[Filter Tabs]
    D --> D1[All]
    D --> D2[Action Required]
    D --> D3[Waiting for Others]
    D --> D4[Completed]
    D --> D5[Voided / Expired]

    C --> E[Search Bar]
    E --> E1[Search by title, recipient name, or email]

    C --> F[Document Card/Row]
    F --> F1[Document title]
    F --> F2[Status badge with color]
    F --> F3[Recipients with signing status]
    F --> F4[Date sent]
    F --> F5[Expiration date]

    F2 --> G{Status Colors}
    G -->|DRAFT| G1[Gray]
    G -->|SENT| G2[Blue]
    G -->|VIEWED| G3[Yellow]
    G -->|SIGNED| G4[Orange - partial]
    G -->|COMPLETED| G5[Green]
    G -->|VOIDED| G6[Red]

    F --> H[Actions Menu]
    H --> H1[View Document]
    H --> H2[Download PDF]
    H --> H3[Send Reminder]
    H --> H4[Void Document]
    H --> H5[Clone as New]
    H --> H6[View Audit Trail]
    H --> H7[Delete - DRAFT only]

    H1 --> I[Document Detail View]
    I --> I1[PDF preview with signatures]
    I --> I2[Recipient status timeline]
    I --> I3[Audit trail log]

    H3 --> J[Send Reminder Email]
    J --> J1[To unsigned recipients only]
    J --> J2[Include personal message option]

    H4 --> K[Void Confirmation]
    K --> K1["Are you sure? This cannot be undone."]
    K1 --> K2[Document Status -> VOIDED]
    K2 --> K3[Notify all recipients]
    K2 --> K4[Audit trail: "Document voided"]
```

### Key Design Decisions
- "Action Required" filter shows documents the sender needs to act on (e.g., drafts to send)
- "Waiting for Others" shows sent documents pending signatures
- Void is irreversible and notifies all parties
- Clone allows reuse of prepared documents with new recipients
- Audit trail is accessible from the document detail view
- Draft documents can be deleted; sent/completed cannot

---

## 6. Template Management Flow

```mermaid
flowchart TD
    A[Documents Section] --> B[Templates Tab]
    B --> C{Any Templates?}
    C -->|No| D[Empty State: "Create reusable templates"]
    C -->|Yes| E[Template List]

    E --> F[Create Template - Two Methods]
    F --> F1[Upload New + Save as Template]
    F --> F2[Convert Completed Document to Template]

    F1 --> G[Upload Document]
    G --> H[Place Fields with Role-based Assignment]
    H --> H1[Instead of named recipients, use roles]
    H --> H2[Role: "Client" / "Contractor" / "Witness"]
    H --> H3[Roles mapped to actual recipients on use]
    H --> I[Save as Template]
    I --> I1[Template Name]
    I --> I2[Description]
    I --> I3[Category tag]

    F2 --> J[Select Completed Document]
    J --> K[Strip Signatures + Keep Field Positions]
    K --> I

    E --> L[Use Template]
    L --> M[Select Template]
    M --> N[Assign Real Recipients to Roles]
    N --> O[Review Fields - Modify if Needed]
    O --> P[Send for Signing - Standard Flow]
```

### Key Design Decisions
- Templates use roles instead of named recipients for reusability
- Common roles (Client, Contractor, Witness) can be predefined
- Templates can be created fresh or from completed documents
- Field positions are preserved; only recipient mapping changes
- Categories help organize templates (Contracts, NDAs, Proposals, etc.)

---

## 7. Audit Trail & Signing Certificate Flow

```mermaid
flowchart TD
    A[Document Detail View] --> B[Click "Audit Trail"]
    B --> C[Audit Trail Log]

    C --> D[Chronological Event List]
    D --> D1["Document created - Jan 15, 2:30 PM"]
    D --> D2["Document sent to john@example.com - Jan 15, 2:35 PM"]
    D --> D3["Document viewed by john@example.com - Jan 15, 3:10 PM"]
    D --> D4["john@example.com signed - Jan 15, 3:15 PM"]
    D --> D5["Document sent to jane@example.com - Jan 15, 3:15 PM"]
    D --> D6["Document viewed by jane@example.com - Jan 16, 9:00 AM"]
    D --> D7["jane@example.com signed - Jan 16, 9:05 AM"]
    D --> D8["Document completed - Jan 16, 9:05 AM"]

    D --> E[Each Entry Contains]
    E --> E1[Timestamp with timezone]
    E --> E2[Action description]
    E --> E3[Actor email]
    E --> E4[IP address]
    E --> E5[Browser / device info]

    A --> F[Click "Download Certificate"]
    F --> G[Generate Signing Certificate PDF]
    G --> G1[Document ID and title]
    G --> G2[SHA-256 hash of signed document]
    G --> G3[Complete audit trail]
    G --> G4[All signer details]
    G --> G5[Signature images]
    G --> G6[Timestamps for each action]
    G --> G7[SchedulSign verification seal]
```

### Key Design Decisions
- Every action on a document is logged with timestamp, actor, and IP
- Audit trail is immutable once created
- Signing certificate is a separate PDF that can be downloaded independently
- Document hash ensures tamper detection
- Certificate format follows e-signature legal standards (ESIGN Act, eIDAS)

---

## 8. Scheduling + E-Signature Integration Flow

```mermaid
flowchart TD
    A[Booking Confirmed] --> B[Confirmation Page]
    B --> C{Host Has Document Templates?}
    C -->|Yes| D[Option: "Send Contract for Signing"]
    C -->|No| E[Standard Confirmation Only]

    D --> F[Select Template]
    F --> G[Auto-fill Recipient from Booker Info]
    G --> G1[Name from bookerName]
    G --> G2[Email from bookerEmail]
    G --> H[Review & Send]
    H --> I[Document Sent - Linked to Booking]

    I --> J[Booker Receives Signing Email]
    J --> K[Signs Document]
    K --> L[Document Completed]
    L --> M[Contact Updated: source = "booking+signature"]

    E --> N[Standard Post-Booking Flow]

    subgraph Future Enhancement
        O[Auto-send Template on Booking]
        O --> O1[Configure in Event Type Settings]
        O1 --> O2[Select default template]
        O2 --> O3[Auto-send on booking.created]
    end
```

### Key Design Decisions
- Integration bridges the two core features: scheduling and signing
- Booker info auto-fills recipient fields (no re-entry)
- Document is linked to the booking for audit and reference
- Future: auto-send contracts on booking confirmation (event type setting)
- Contact record tracks both booking and signature interactions

---

## 9. Mobile Signing Experience Flow

```mermaid
flowchart TD
    A[Signer Opens Email on Mobile] --> B[Tap "Review & Sign"]
    B --> C[Mobile Signing View]

    C --> D[Responsive Document Viewer]
    D --> D1[Pinch to zoom on document]
    D --> D2[Swipe to navigate pages]
    D --> D3[Fields are tappable targets - min 44x44px]

    C --> E[Field Navigation]
    E --> E1[Bottom bar: "Next Field" button]
    E --> E2[Auto-scroll to next required field]
    E --> E3[Progress dots showing completion]

    E1 --> F[Tap on Signature Field]
    F --> G[Full-screen Signature Modal]
    G --> G1[Draw: Full-width canvas for finger drawing]
    G --> G2[Type: Large text input with font preview]
    G --> G3[Upload: Camera or photo library]
    G --> G4[Clear and redo option]

    G --> H[Tap "Apply"]
    H --> I[Return to Document - Auto-advance]
    I --> J{More Fields?}
    J -->|Yes| E1
    J -->|No| K[Show "Finish Signing" Button]

    K --> L[Legal Consent - Full Screen]
    L --> M[Document Signed]
    M --> N[Confirmation Screen]
    N --> N1[Success message]
    N --> N2[Download PDF link]
```

### Key Design Decisions
- Document viewer supports pinch-zoom and swipe for mobile usability
- "Next Field" button eliminates need to manually find fields on small screens
- Signature canvas uses full screen width for comfortable finger drawing
- Auto-advance after each field keeps the flow moving
- All touch targets meet 44x44px minimum accessibility standard
- Camera upload option lets users photograph a handwritten signature

---

## 10. Bulk Send Flow

```mermaid
flowchart TD
    A[Documents Page] --> B[Click "Bulk Send"]
    B --> C[Select Template]
    C --> D[Upload CSV or Enter Recipients]

    D --> D1{Input Method}
    D1 -->|CSV Upload| E[Upload CSV with Name, Email columns]
    D1 -->|Manual| F[Add Recipients One by One]

    E --> G[Preview Recipient List]
    F --> G
    G --> G1[Show count: "24 recipients"]
    G --> G2[Validate all emails]
    G --> G3[Flag duplicates]

    G --> H[Customize Email Message]
    H --> I[Set Expiration]
    I --> J[Click "Send to All"]

    J --> K[Create Individual Document per Recipient]
    K --> L[Send Emails in Batch]
    L --> M[Dashboard Shows Batch Progress]
    M --> M1[Sent: 24]
    M --> M2[Viewed: 12]
    M --> M3[Signed: 8]
    M --> M4[Pending: 4]
```

### Key Design Decisions
- Bulk send uses templates to ensure consistency
- CSV upload for large recipient lists
- Each recipient gets their own document instance
- Batch progress dashboard shows aggregate status
- Useful for company-wide policy acknowledgments, client contracts

---

## Error States & Edge Cases

### Upload Errors
- File too large: "Maximum file size is 10MB. Please compress or split your document."
- Invalid format: "Supported formats: PDF, DOC, DOCX, PNG, JPG. Please upload a supported file."
- Upload failure: "Upload failed. Please check your connection and try again." with retry button.

### Signing Errors
- Expired link: "This document expired on [date]. Contact [sender] for a new copy."
- Voided document: "This document has been voided by [sender] and can no longer be signed."
- Network error during signing: "Your progress has been saved. Please try again." (auto-save field values)

### Concurrent Access
- If two people view the same sequential document, only the current signer's fields are active.
- Real-time status updates via polling or WebSocket show when a preceding signer completes.

### Email Deliverability
- If signing email bounces, notify sender with option to resend or enter alternate email.
- Track email open rates to distinguish "not received" from "not opened."

### Browser Compatibility
- Signature drawing canvas requires modern browser with Canvas API support.
- Fallback to type-to-sign for older browsers.
- PDF rendering uses pdf.js or similar library for cross-browser consistency.

### Legal Considerations
- All signed documents include tamper-evident hash.
- Signing requires explicit consent checkbox.
- Audit trail captures IP and device info for non-repudiation.
- Documents stored with encryption at rest.
- Retention policy: completed documents kept for 7 years by default.

---

## Flow Summary Table

| Flow | Primary User | Entry Point | Happy Path Steps | Key Edge Cases |
|------|-------------|-------------|-----------------|----------------|
| Document Upload | Sender | Dashboard | 3 | Invalid file, size limit |
| Field Placement | Sender | Prep View | 5-10 | No fields for recipient |
| Send Document | Sender | Prep View | 3 | Email bounce |
| Document Signing | Signer | Email Link | 6 | Expired, voided, network |
| Document Management | Sender | Dashboard | 2 | Empty states |
| Templates | Sender | Dashboard | 4 | No templates yet |
| Audit Trail | Sender | Doc Detail | 2 | None |
| Scheduling Integration | Both | Post-booking | 3 | No templates configured |
| Mobile Signing | Signer | Email Link | 6 | Small screen, touch |
| Bulk Send | Sender | Dashboard | 5 | Invalid emails, duplicates |
