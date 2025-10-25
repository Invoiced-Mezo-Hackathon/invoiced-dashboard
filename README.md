# Invoiced Dashboard

A modern, feature-rich invoice management dashboard built with React, TypeScript, and Vite. This application provides a comprehensive solution for creating invoices, tracking payments, managing cryptocurrency vaults, and organizing business transactions.

## 🚀 Features

### 📝 Invoice Management
- **Create Invoices**: Generate professional invoices with automatic codes and MUSD conversion
- **Invoice Tracking**: Monitor invoice status (pending, paid, cancelled)
- **QR Code Generation**: Generate QR codes for easy payment processing
- **Client Management**: Store and manage client information with unique codes

### 💸 Payment Processing
- **Payment Tracking**: Monitor all transactions and payment statuses
- **Wallet Integration**: Withdraw funds directly to your cryptocurrency wallet
- **Transaction History**: Complete audit trail of all financial activities

### 🔐 Vault Management
- **Bitcoin Deposits**: Securely deposit BTC into your vault
- **MUSD Borrowing**: Borrow MUSD against your BTC collateral
- **Collateral Tracking**: Monitor your collateral ratios and positions
- **Risk Management**: Track vault health and borrowing limits

### ⚡ Dashboard & Analytics
- **Real-time Overview**: Get instant insights into your business metrics
- **Activity Monitoring**: Track recent transactions and activities
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable viewing

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom glass morphism effects
- **UI Components**: Radix UI primitives for accessible, customizable components
- **State Management**: React hooks for local state management
- **Routing**: React Router DOM for client-side navigation
- **Icons**: Lucide React for consistent iconography
- **Animations**: Framer Motion for smooth transitions
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast for user feedback
- **QR Codes**: QRCode library for payment code generation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd invoiced-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173) to view the application.

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── invoice/         # Invoice-specific components
│   ├── layout/          # Layout components (Sidebar, etc.)
│   └── ui/              # Base UI components (Button, Input, etc.)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
├── pages/               # Main application pages
│   ├── Dashboard.tsx    # Main dashboard overview
│   ├── Invoices.tsx     # Invoice management page
│   ├── Payments.tsx     # Payment tracking page
│   ├── Vault.tsx        # Vault management page
│   └── Settings.tsx     # Application settings
└── main.tsx            # Application entry point
```

## 🎨 Design Features

- **Glass Morphism**: Modern glass-like UI elements with subtle transparency
- **Responsive Grid**: Adaptive layouts that work on all screen sizes
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Accessible Components**: Built with Radix UI for full accessibility support
- **Custom Theming**: Dark and light mode support with smooth transitions

## 🚀 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code quality issues
- `npm run lint:fix` - Automatically fix ESLint issues where possible

## 🔧 Configuration

The application uses several configuration files:

- `vite.config.ts` - Vite build configuration
- `tailwind.config.cjs` - Tailwind CSS customization
- `tsconfig.json` - TypeScript compiler options
- `eslint.config.mjs` - ESLint rules and settings

## 📱 Browser Support

This application supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues in the repository
2. Create a new issue with detailed information about your problem
3. Include steps to reproduce the issue and your environment details

---

Built with ❤️ using React, TypeScript, and modern web technologies.
