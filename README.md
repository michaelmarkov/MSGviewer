# MSG File Viewer

A modern, web-based viewer for Microsoft Outlook MSG files with comprehensive header analysis and HTML email rendering. Built as a static site for easy deployment anywhere.

## 🌟 Features

- **Drag & Drop Upload**: Simply drag MSG files into the browser
- **Header Analysis**: View all email headers with search and filtering
- **HTML Email Rendering**: Safe rendering of HTML email content with XSS protection
- **Atlassian Headers**: Specifically designed to handle Atlassian email headers
- **Client-Side Processing**: All processing happens in your browser for privacy
- **Responsive Design**: Works on desktop and mobile devices
- **Static Site**: No server required - deploy anywhere

## 🚀 Live Demo

Visit the live application: [MSG File Viewer](https://msg-144e4fzu5-michael-markovs-projects.vercel.app)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **MSG Parsing**: @kenjiuno/msgreader
- **HTML Sanitization**: DOMPurify
- **File Upload**: react-dropzone
- **Notifications**: Sonner

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd msg-file-viewer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Development

### Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/ui/     # Shadcn UI components
├── lib/              # Utilities and MSG parser
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## 🚀 Deployment

This is a static site that can be deployed anywhere:

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### GitHub Pages
```bash
npm run build
# Upload the dist/ folder to your GitHub Pages repository
```

### Any Static Host
```bash
npm run build
# Upload the contents of dist/ to your web server
```

## 🔒 Privacy & Security

- **Client-Side Only**: All MSG file processing happens in your browser
- **No Data Upload**: Files never leave your device
- **XSS Protection**: HTML content is sanitized before rendering
- **No Tracking**: No analytics or tracking scripts

## 📋 Supported Features

### MSG File Support
- ✅ Email headers (including custom Atlassian headers)
- ✅ Email body (plain text and HTML)
- ✅ Subject, From, To, Date fields
- ✅ Binary MSG file format parsing

### Header Filtering
- ✅ Search headers by name or value
- ✅ Automatic filtering of corrupted/invalid headers
- ✅ Clean display of header names and values

### HTML Rendering
- ✅ Safe HTML rendering with DOMPurify
- ✅ Automatic HTML detection
- ✅ Fallback to plain text for non-HTML content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run lint`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [msgreader](https://github.com/kenjiuno/msgreader) for MSG file parsing
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [DOMPurify](https://github.com/cure53/DOMPurify) for XSS protection

---

**Made with ❤️ by mmarkov**
