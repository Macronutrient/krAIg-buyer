# Craigslist Category Selector - Next.js App

A modern web application built with Next.js, TypeScript, and shadcn/ui components that allows users to select from Craigslist "for sale" categories and provide their phone number.

## ✨ Features

- **🎨 Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **🌙 Dark Mode**: Full dark mode support with theme toggle
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **🔧 TypeScript**: Fully typed for better development experience
- **✅ Form Validation**: Client-side validation with user-friendly error messages
- **🎯 Category Selection**: Authentic Craigslist "for sale" categories
- **📞 Phone Formatting**: Automatic phone number formatting
- **🖥️ Console Output**: Form submissions are logged to the server console

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
craigslist-selector/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── submit/
│   │   │       └── route.ts          # API endpoint for form submission
│   │   ├── globals.css               # Global styles with shadcn/ui variables
│   │   ├── layout.tsx                # Root layout with theme provider
│   │   └── page.tsx                  # Main page component
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── select.tsx
│   │   ├── theme-provider.tsx        # Next.js theme provider wrapper
│   │   └── theme-toggle.tsx          # Dark mode toggle component
│   └── lib/
│       └── utils.ts                  # Utility functions
├── components.json                   # shadcn/ui configuration
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
└── tsconfig.json                     # TypeScript configuration
```

## 🎯 Usage

1. **Select Category**: Choose from the dropdown list of authentic Craigslist "for sale" categories
2. **Enter Phone Number**: Input your phone number (automatically formatted as you type)
3. **Submit Form**: Click the submit button to send your information
4. **Check Console**: The selected category and phone number will be printed to the server console

### Example Console Output:
```
=== USER SUBMISSION ===
Selected Category: electronics
Phone Number: (555) 123-4567
========================
```

## 🎨 Theme Support

The application includes full dark mode support:

- **🌞 Light Mode**: Clean, bright interface
- **🌙 Dark Mode**: Elegant dark theme
- **⚙️ System**: Automatically follows your system preference
- **🔄 Toggle**: Manual theme switching with the toggle button (top-right corner)

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📦 Technologies Used

- **Frontend Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Theme**: next-themes
- **Icons**: Lucide React

## 🌟 shadcn/ui Components Used

- **Card**: Container component for the main form
- **Button**: Submit button and theme toggle
- **Input**: Phone number input field
- **Label**: Form field labels
- **Select**: Category dropdown selection

## 📝 API Endpoints

### `POST /api/submit`

Handles form submission and logs data to console.

**Request Body:**
```json
{
  "category": "electronics",
  "phone_number": "(555) 123-4567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully!",
  "data": {
    "category": "electronics",
    "phone_number": "(555) 123-4567"
  }
}
```

---

Built with ❤️ using Next.js and shadcn/ui
