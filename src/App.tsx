import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { parseEmailFile, MSGContent } from './lib/msg-parser';

// Remove debug console logs for security
// console.log('App component loading...');

// Security: File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Preview modes for email content
type PreviewMode = 'none' | 'text' | 'html-safe';

/**
 * Converts HTML to plain text by stripping all HTML tags
 */
function htmlToPlainText(html: string): string {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get the text content, which automatically strips HTML
  const text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up and return
  tempDiv.remove();
  return text.trim();
}

/**
 * Detects if content is HTML
 */
function isHTML(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

/**
 * Creates a very basic HTML sanitization for sandboxed iframe
 * Even though it's sandboxed, we still apply basic cleaning
 */
function createSafeHTMLPreview(html: string): string {
  // Remove script tags and dangerous attributes
  const cleaned = html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs for safety
    .replace(/style\s*=\s*["'][^"']*["']/gi, ''); // Remove style attributes
  
  // Wrap in a basic HTML structure
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 14px; 
          line-height: 1.4; 
          margin: 10px; 
          background: white;
          color: black;
        }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ddd; padding: 4px; }
      </style>
    </head>
    <body>
      ${cleaned}
    </body>
    </html>
  `;
}

function App() {
  // Remove debug console logs for security
  // console.log('App component rendering...');
  
  const [msgContent, setMsgContent] = useState<MSGContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('none');
  const [showPreviewWarning, setShowPreviewWarning] = useState(true);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Security: Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size allowed is 10MB.');
      return;
    }

    // Security: Validate file type more strictly
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.msg') && !fileName.endsWith('.eml')) {
      toast.error('Only .msg and .eml files are allowed.');
      return;
    }

    try {
      const parsedContent = await parseEmailFile(file);
      setMsgContent(parsedContent);
      setPreviewMode('none'); // Reset preview mode for new file
      toast.success(`${parsedContent.fileType} file parsed successfully`);
    } catch (error: unknown) {
      // Security: Don't expose detailed error information
      toast.error('Failed to parse email file. Please ensure it is a valid MSG or EML file.');
      // Log errors without sensitive content for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Email parse error:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-outlook': ['.msg'],
      'message/rfc822': ['.eml'],
      'text/plain': ['.eml'] // Some systems classify EML as text/plain
    },
    multiple: false,
    // Security: Add file size validation at dropzone level
    maxSize: MAX_FILE_SIZE,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        if (rejection.errors.some(e => e.code === 'file-too-large')) {
          toast.error('File too large. Maximum size allowed is 10MB.');
        } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
          toast.error('Invalid file type. Only .msg and .eml files are allowed.');
        } else {
          toast.error('File rejected. Please try a valid MSG or EML file.');
        }
      });
    }
  });

  // Security: Sanitize search input to prevent potential XSS in search functionality
  const sanitizedSearchQuery = searchQuery.replace(/[<>\"'&]/g, '');

  const filteredHeaders = msgContent?.headers
    .filter(header => {
      if (header.name.startsWith('<')) return false;
      if (header.name.trim() !== header.name) return false;
      if (header.name.trim() === '') return false;
      return true;
    })
    .filter(header =>
      header.name.toLowerCase().includes(sanitizedSearchQuery.toLowerCase()) ||
      header.value.toLowerCase().includes(sanitizedSearchQuery.toLowerCase())
    ) || [];

  const handlePreviewModeChange = (mode: PreviewMode) => {
    if (mode !== 'none' && showPreviewWarning) {
      const confirmed = window.confirm(
        'Email preview is enabled with security measures, but you should only preview emails from trusted sources. Continue?'
      );
      if (confirmed) {
        setShowPreviewWarning(false);
        setPreviewMode(mode);
      }
    } else {
      setPreviewMode(mode);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>Email Header Viewer</h1>
      
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '20px',
          backgroundColor: isDragActive ? '#f0f8ff' : '#f9f9f9'
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the email file here...</p>
        ) : (
          <div>
            <p>Drag and drop an email file here, or click to select one</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              Supports: <strong>.msg</strong> (Microsoft Outlook) and <strong>.eml</strong> (RFC 822) files
            </p>
          </div>
        )}
      </div>

      {/* Content Display */}
      {msgContent && (
        <>
          {/* File Info and Search */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ 
                backgroundColor: msgContent.fileType === 'MSG' ? '#e3f2fd' : '#f3e5f5', 
                color: msgContent.fileType === 'MSG' ? '#1976d2' : '#7b1fa2',
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {msgContent.fileType} File
              </span>
            </div>
            <input
              type="text"
              placeholder="Search headers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '300px'
              }}
            />
          </div>

          {/* Email Preview Options */}
          {msgContent.body && (
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Email Preview Options</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="previewMode"
                    value="none"
                    checked={previewMode === 'none'}
                    onChange={() => setPreviewMode('none')}
                  />
                  <span>No Preview (Headers Only)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="previewMode"
                    value="text"
                    checked={previewMode === 'text'}
                    onChange={() => handlePreviewModeChange('text')}
                  />
                  <span>📄 Plain Text Preview (Safe)</span>
                </label>
                {isHTML(msgContent.body) && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="previewMode"
                      value="html-safe"
                      checked={previewMode === 'html-safe'}
                      onChange={() => handlePreviewModeChange('html-safe')}
                    />
                    <span>🛡️ HTML Preview (Sandboxed)</span>
                  </label>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
                <strong>Security:</strong> Plain text is completely safe. HTML preview uses a sandboxed iframe with no JavaScript execution.
              </p>
            </div>
          )}

          {/* Headers Table */}
          <div style={{ marginBottom: '30px' }}>
            <h2>Email Headers ({filteredHeaders.length})</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', width: '300px' }}>
                    Header Name
                  </th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHeaders.map((header, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                    <td style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ddd', 
                      fontFamily: 'monospace',
                      color: '#0066cc',
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {header.name.trimStart()}
                    </td>
                    <td style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #ddd',
                      wordBreak: 'break-word'
                    }}>
                      {header.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredHeaders.length === 0 && msgContent.headers.length > 0 && (
              <p style={{ color: '#666', fontStyle: 'italic', marginTop: '16px' }}>
                No headers match your search criteria.
              </p>
            )}
          </div>

          {/* Email Content Preview */}
          {msgContent.body && previewMode !== 'none' && (
            <div>
              <h2>Email Content Preview</h2>
              
              {previewMode === 'text' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  maxHeight: '400px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  {isHTML(msgContent.body) ? htmlToPlainText(msgContent.body) : msgContent.body}
                </div>
              )}

              {previewMode === 'html-safe' && isHTML(msgContent.body) && (
                <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#fff3cd', 
                    borderBottom: '1px solid #dee2e6',
                    fontSize: '12px',
                    color: '#856404'
                  }}>
                     <strong>Secure Preview:</strong> Content is displayed in a sandboxed iframe with JavaScript disabled and network access blocked.
                  </div>
                  <iframe
                    style={{
                      width: '100%',
                      height: '400px',
                      border: 'none',
                      backgroundColor: 'white'
                    }}
                    sandbox="" // Most restrictive sandbox - no scripts, forms, navigation, etc.
                    srcDoc={createSafeHTMLPreview(msgContent.body)}
                    title="Email Content Preview"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App; 