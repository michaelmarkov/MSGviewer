import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { parseMSGFile, MSGContent } from './lib/msg-parser';
import DOMPurify from 'dompurify';

console.log('App component loading...');

/**
 * Checks if content contains HTML tags
 */
function isHTML(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

/**
 * Sanitizes HTML content for safe rendering
 */
function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'tr', 'td', 'th', 'tbody', 'thead'],
    ALLOWED_ATTR: ['href', 'title', 'style']
  });
}

function App() {
  console.log('App component rendering...');
  
  const [msgContent, setMsgContent] = useState<MSGContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const parsedContent = await parseMSGFile(file);
      setMsgContent(parsedContent);
      toast.success('File parsed successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Failed to parse file: ' + errorMessage);
      console.error('MSG parse error:', error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-outlook': ['.msg']
    },
    multiple: false
  });

  const filteredHeaders = msgContent?.headers
    .filter(header => {
      if (header.name.startsWith('<')) return false;
      if (header.name.trim() !== header.name) return false;
      if (header.name.trim() === '') return false;
      return true;
    })
    .filter(header =>
      header.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      header.value.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>MSG File Viewer</h1>
      
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
          <p>Drop the MSG file here...</p>
        ) : (
          <p>Drag and drop an MSG file here, or click to select one</p>
        )}
      </div>

      {/* Content Display */}
      {msgContent && (
        <>
          {/* Search */}
          <div style={{ marginBottom: '20px' }}>
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

          {/* Headers Table */}
          <div style={{ marginBottom: '30px' }}>
            <h2>Headers ({filteredHeaders.length})</h2>
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
          </div>

          {/* Email Content */}
          <div>
            <h2>Email Content</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <strong>Subject:</strong>
                <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginTop: '4px' }}>
                  {msgContent.subject || 'No subject'}
                </div>
              </div>
              <div>
                <strong>Date:</strong>
                <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginTop: '4px' }}>
                  {msgContent.date || 'No date'}
                </div>
              </div>
              <div>
                <strong>From:</strong>
                <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginTop: '4px' }}>
                  {msgContent.from || 'No sender'}
                </div>
              </div>
              <div>
                <strong>To:</strong>
                <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginTop: '4px' }}>
                  {msgContent.to || 'No recipients'}
                </div>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <strong>Body:</strong>
                {msgContent.body && isHTML(msgContent.body) && (
                  <span style={{ 
                    fontSize: '12px', 
                    backgroundColor: '#e3f2fd', 
                    color: '#1976d2', 
                    padding: '2px 6px', 
                    borderRadius: '4px' 
                  }}>
                    HTML
                  </span>
                )}
              </div>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {msgContent.body ? (
                  isHTML(msgContent.body) ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(msgContent.body) }} />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                      {msgContent.body}
                    </div>
                  )
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No email body content</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App; 