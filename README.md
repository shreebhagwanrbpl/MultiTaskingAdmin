# Raj Biosis Super-Admin Network Hub 🏥

Centralized Multi-Tenant Management Portal for **Raj Biosis Pvt. Ltd.** & **70 Biomedical E-Commerce & Healthcare Websites**.

---

## 🚀 Features

- **Multi-Tenant Network Management**: Real-time management of all 70 biomedical domain websites from a single unified hub.
- **Dynamic Theme & Layout Engine**: Live customization of brand colors, Google typography, header layouts (Telemetry, Centered Search, Minimalist, Floating Pill), and homepage styles.
- **Centralized Hospital RFQ Leads**: Unified quotation requests and inquiries gathered from all 70 satellite websites.
- **Biomedical Catalog Management**: Synchronized product pricing, specifications, and department categories.
- **Automated VPS & DNS Deployment**: Instant Nginx reverse-proxy script and Cloudflare DNS automation generator for rapid multi-domain rollout.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
raj-biosis-admin/
├── public/                 # Static branding assets & favicon
│   ├── logo.png
│   └── favicon.png
├── src/
│   ├── app/
│   │   ├── globals.css     # Dark medical slate theme & utilities
│   │   ├── layout.jsx      # Admin root layout
│   │   └── page.jsx        # Complete Super-Admin Dashboard Portal
│   └── data/
│       ├── products.js     # Hospital equipment catalog data
│       └── categories.js   # Clinical departments & certification data
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🔒 Security
- Protected by `noindex, nofollow` search engine directives.
- Ready for integration with NextAuth.js or JWT authentication middleware.
