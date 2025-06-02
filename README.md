# MSG File Viewer

A modern, web-based viewer for Microsoft Outlook MSG files that extracts and displays email headers and content in a clean, searchable interface.

![MSG File Viewer](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🔍 **Header Analysis** - View and search all email headers including Atlassian headers
- 📧 **Email Content Display** - Renders both HTML and plain text email bodies
- 🎯 **Smart Filtering** - Filter out corrupted headers and search through content
- 🔒 **Secure HTML Rendering** - Safe HTML parsing with XSS protection
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🚀 **Client-Side Processing** - No server uploads, complete privacy
- 💫 **Modern UI** - Beautiful interface built with Shadcn UI components

## 🖥️ Live Demo

**[Try it live on Vercel →](https://msg-144e4fzu5-michael-markovs-projects.vercel.app)**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/msg-file-viewer.git
   cd msg-file-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Upload MSG File**: Drag and drop an MSG file onto the upload area or click to browse
2. **View Headers**: Browse through filtered email headers in the table
3. **Search Headers**: Use the search box to filter headers by name or value
4. **Read Content**: View the formatted email content below the headers

### Supported Formats

- `.msg` - Microsoft Outlook Message files
- Handles both HTML and plain text email bodies
- Extracts all standard and custom headers (including Atlassian headers)

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main application component
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles
├── lib/
│   ├── msg-parser.ts      # MSG file parsing logic
│   ├── utils.ts          # Utility functions
│   └── msgreader.d.ts    # Type declarations
└── components/
    └── ui/               # Shadcn UI components
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **MSG Parsing**: [@kenjiuno/msgreader](https://www.npmjs.com/package/@kenjiuno/msgreader)
- **HTML Sanitization**: [DOMPurify](https://github.com/cure53/DOMPurify)
- **File Upload**: [react-dropzone](https://react-dropzone.js.org/)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Using Vercel CLI**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Using GitHub Integration**
   - Push your code to GitHub
   - Connect your repository to [Vercel](https://vercel.com)
   - Deploy automatically on every push

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag the `out` folder to [Netlify Drop](https://app.netlify.com/drop)
   - Or connect your GitHub repository

### Deploy to Other Platforms

The app can be deployed to any platform that supports Node.js or static sites:
- Cloudflare Pages
- GitHub Pages
- Railway
- Render

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

No environment variables are required. The app runs entirely client-side.

## 🛡️ Security

- **Client-Side Processing**: MSG files are processed entirely in the browser
- **No Data Upload**: Files never leave your device
- **XSS Protection**: HTML content is sanitized before rendering
- **Safe Parsing**: Only safe HTML tags and attributes are allowed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Kenji Uno](https://github.com/kenjiuno) for the excellent msgreader library
- [Shadcn](https://github.com/shadcn) for the beautiful UI components
- [Vercel](https://vercel.com) for hosting and deployment

## 📞 Support

If you have any questions or issues, please:
- Open an [issue](https://github.com/yourusername/msg-file-viewer/issues)
- Check the [documentation](DEVELOPMENT_DOCS.md)

---

**Made with ❤️ by [Michael Markov](https://github.com/yourusername)**
