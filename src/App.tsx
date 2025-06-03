import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { parseMSGFile, MSGContent } from './lib/parsers/msg-parser';
import PreviewOptions from './components/PreviewOptions';
import HeadersTable from './components/HeadersTable';
import EmailContentPreview from './components/EmailContentPreview';
import './styles.css';

// Remove debug console logs for security
// console.log('App component loading...');

// Security: File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Preview modes for email content
type PreviewMode = 'none' | 'text' | 'html-safe';

/**
 * Detects if content is HTML
 */
function isHTML(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content);
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
      const parsedContent = await parseMSGFile(file);
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
  const sanitizedSearchQuery = searchQuery.replace(/[<>"'&]/g, '');

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

  return (
    <div className="container mx-auto px-4 sm:px-8">
      <h1 className="text-2xl mb-5">Email Header Viewer</h1>

      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer mb-5 ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the email file here...</p>
        ) : (
          <div>
            <p>Drag and drop an email file here, or click to select one</p>
            <p className="text-sm text-gray-600 mt-2">
              Supports: <strong>.msg</strong> (Microsoft Outlook) and <strong>.eml</strong> (RFC 822) files
            </p>
          </div>
        )}
      </div>

      {/* Content Display */}
      {msgContent && (
        <>
          {/* File Info and Search */}
          <div className="mb-5">
            <div className="mb-2">
              <span className={`px-2 py-1 rounded text-xs font-bold ${msgContent.fileType === 'MSG' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>                {msgContent.fileType} File
              </span>
            </div>
            <input
              type="text"
              placeholder="Search headers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-72"
            />
          </div>

          {/* Email Preview Options */}
          {msgContent.body && (
            <PreviewOptions
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              showPreviewWarning={showPreviewWarning}
              setShowPreviewWarning={setShowPreviewWarning}
              isHTML={isHTML(msgContent.body)}
            />
          )}

          {/* Headers Table */}
          <HeadersTable headers={filteredHeaders} />

          {/* Email Content Preview */}
          {msgContent.body && previewMode !== 'none' && (
            <EmailContentPreview
              body={msgContent.body}
              previewMode={previewMode}
              isHTML={isHTML(msgContent.body)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App; 