# Email Header Viewer

A secure, lightweight web-based viewer for email files supporting both Microsoft Outlook MSG files and standard EML files. Features enterprise-grade security with optional safe email content preview for header analysis and forensic investigation.

## 🌟 Features

- **Dual Format Support**: MSG (Microsoft Outlook) and EML (RFC 822) files
- **Drag & Drop Upload**: Simply drag email files into the browser
- **Header Analysis**: View all email headers with real-time search and filtering
- **Secure Email Preview**: Optional plain-text and sandboxed HTML preview modes
- **Multiple Security Layers**: XSS protection, input sanitization, and content isolation
- **Client-Side Processing**: All processing happens in your browser for privacy
- **File Type Detection**: Automatic detection and parsing of MSG vs EML formats
- **Search & Filter**: Real-time header search by name or value
- **Responsive Design**: Works on desktop and mobile devices
- **Static Site**: No server required - deploy anywhere

## 🔒 Security Features

- **Headers-First Approach**: Headers are always safe to display
- **Secure Preview Options**:
  - **Plain Text Mode**: Completely safe, strips all HTML and shows text content only
  - **Sandboxed HTML Mode**: HTML preview in isolated iframe with no JavaScript execution
- **Input Sanitization**: All header content is sanitized and length-limited
- **File Size Limits**: 10MB maximum file size protection
- **Content Security Policy**: Comprehensive CSP headers prevent attacks
- **Type Validation**: Strict file type checking (.msg and .eml only)
- **Privacy First**: No data leaves your browser, no tracking
- **User Consent**: Preview modes require explicit user confirmation

## 📧 Email Preview Modes

### 1. Headers Only (Default)
- ✅ **Completely Safe**: No email content is displayed
- ✅ **Full Header Analysis**: Search, filter, and analyze all email metadata
- ✅ **Zero XSS Risk**: Only sanitized header information shown

### 2. Plain Text Preview
- ✅ **Safe Text Content**: Strips all HTML and shows clean text
- ✅ **No Code Execution**: HTML tags are completely removed
- ✅ **Original Formatting**: Preserves line breaks and basic structure
- ✅ **Perfect for**: Text emails and safe content viewing

### 3. Sandboxed HTML Preview
- 🛡️ **Isolated Environment**: Runs in completely sandboxed iframe
- 🛡️ **No JavaScript**: All scripts stripped and execution blocked
- 🛡️ **No Network Access**: Cannot make external requests
- 🛡️ **No Form Submission**: Cannot submit data anywhere
- 🛡️ **Basic Styling**: Safe CSS for readability
- ⚠️ **Use With Caution**: Only for emails from trusted sources

## 🚀 Live Demo

Visit the live application: [Email Header Viewer](https://your-username.github.io/msg)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Inline styles (no framework dependencies)
- **MSG Parsing**: @kenjiuno/msgreader
- **EML Parsing**: Custom RFC 822 parser
- **File Upload**: react-dropzone
- **Notifications**: Sonner
- **Security**: Sandboxed iframes, Content Security Policy, input validation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd msg

# Install dependencies (minimal - only 362 packages)
npm install

# Start development server (may have PostCSS warnings, but functionality works)
npm run dev

# Build for production (works perfectly)
npm run build

# Preview production build (recommended for testing)
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 🏗️ Development

### Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build (recommended)
- `npm run deploy` - Build and deploy to GitHub Pages
- `npm run lint` - Run ESLint

### Development Notes

- **Production Ready**: `npm run build` and `npm run preview` work perfectly
- **Development Issues**: PostCSS configuration warnings in dev mode (does not affect functionality)
- **Recommendation**: Use `npm run preview` for local testing

### Project Structure

```
src/
├── lib/
│   ├── msg-parser.ts     # Email parsing logic (MSG & EML)
│   └── msgreader.d.ts    # Type definitions
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## 📧 Supported Email Formats

### MSG Files (Microsoft Outlook)
- ✅ Binary MSG format parsing
- ✅ Complete header extraction
- ✅ Email body content (if available)
- ✅ Metadata parsing (Subject, From, To, Date)
- ✅ Handles Outlook-specific headers

### EML Files (RFC 822 Standard)
- ✅ Text-based RFC 822 format
- ✅ Multi-line header support (header folding)
- ✅ Email body content parsing
- ✅ Standard email headers
- ✅ Compatible with Thunderbird, Apple Mail, Gmail exports

### Header Analysis Features
- ✅ Real-time search across header names and values
- ✅ Automatic filtering of malformed headers
- ✅ Length limits for security (headers, values, content)
- ✅ File type indication (MSG/EML badge)
- ✅ Header count display

### Content Preview Features
- ✅ **Plain Text Mode**: Safe text extraction from HTML emails
- ✅ **HTML Preview Mode**: Secure sandboxed rendering
- ✅ **User Consent**: Warning system for preview modes
- ✅ **Content Detection**: Automatic HTML vs plain text detection
- ✅ **Security Warnings**: Clear indicators of security measures

## 🚀 Deployment

This is a static site that can be deployed anywhere:

### GitHub Pages (Recommended)
```bash
# Automatic deployment
npm run deploy
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Any Static Host
```bash
npm run build
# Upload the contents of dist/ to your web server
```

## 🔒 Privacy & Security

### Privacy Protection
- **Client-Side Only**: All email file processing happens in your browser
- **No Data Upload**: Files never leave your device
- **No Tracking**: No analytics, cookies, or tracking scripts
- **No Storage**: Files are not saved or cached

### Security Measures
- **Layered Protection**: Multiple security measures work together
- **Input Sanitization**: All content sanitized and length-limited
- **CSP Headers**: Comprehensive Content Security Policy
- **File Validation**: Strict type checking and size limits
- **Error Handling**: Generic error messages prevent information disclosure
- **Sandbox Isolation**: HTML preview runs in completely isolated context
- **User Consent**: All preview modes require explicit user approval

### Preview Security Details
- **Plain Text**: Uses DOM parsing to strip ALL HTML tags safely
- **HTML Sandbox**: Most restrictive iframe sandbox settings
  - `sandbox=""` - No permissions granted
  - Pre-sanitization removes scripts, styles, event handlers
  - Cannot access parent page or make network requests
  - Cannot execute JavaScript or submit forms

## 🎯 Use Cases

- **Email Forensics**: Analyze email headers and content for investigation
- **Spam Analysis**: Examine email routing and authentication headers
- **Debugging**: Troubleshoot email delivery issues with full header visibility
- **Security Research**: Study email header structures and content safely
- **Migration**: Extract metadata and content during email system migrations
- **Content Analysis**: Safe preview of email content from unknown sources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run lint`
5. Test production build: `npm run build && npm run preview`
6. Commit changes: `git commit -m 'Add feature'`
7. Push to branch: `git push origin feature-name`
8. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [msgreader](https://github.com/kenjiuno/msgreader) for MSG file parsing
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications
- [React Dropzone](https://react-dropzone.js.org/) for file upload
- [Vite](https://vitejs.dev/) for lightning-fast builds

## 📈 Bundle Size

- **Production Build**: ~544KB (gzipped: ~274KB)
- **Dependencies**: 362 packages (minimal, security-focused)
- **No Bloat**: Removed all unused UI libraries and frameworks

## 🔧 Technical Notes

- **Development**: PostCSS configuration has warnings but doesn't affect functionality
- **Production**: Builds and deploys perfectly without issues
- **Testing**: Use `npm run preview` for reliable local testing
- **Security**: All preview modes use multiple layers of protection

---

**Made with ❤️ and 🔒 security in mind**

*Now featuring secure email preview with enterprise-grade protection*
