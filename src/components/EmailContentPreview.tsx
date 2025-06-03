import React from 'react';
import DOMPurify from 'dompurify';

interface EmailContentPreviewProps {
  body: string;
  previewMode: 'none' | 'text' | 'html-safe';
  isHTML: boolean;
}

const EmailContentPreview: React.FC<EmailContentPreviewProps> = ({ body, previewMode, isHTML }) => {
  const htmlToPlainText = (html: string): string => {
    // Use DOMPurify to safely strip HTML tags
    const sanitized = DOMPurify.sanitize(html, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
    return sanitized.trim();
  };

  const createSafeHTMLPreview = (html: string): string => {
    // Use DOMPurify with strict sanitization
    const cleaned = DOMPurify.sanitize(html, {
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
      ALLOW_DATA_ATTR: false
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; font-src 'none';">
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
  };

  if (previewMode === 'none') return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Email Content Preview</h2>
      {previewMode === 'text' && (
        <div className="p-4 bg-gray-100 rounded border max-h-96 overflow-auto whitespace-pre-wrap font-mono text-sm">
          {isHTML ? htmlToPlainText(body) : body}
        </div>
      )}
      {previewMode === 'html-safe' && isHTML && (
        <div className="border rounded overflow-hidden">
          <div className="p-2 bg-yellow-100 border-b text-xs text-yellow-800">
            <strong>Secure Preview:</strong> Content is displayed in a sandboxed iframe with JavaScript disabled and network access blocked.
          </div>
          <iframe
            className="w-full h-96 border-none bg-white"
            sandbox="allow-same-origin"
            srcDoc={createSafeHTMLPreview(body)}
            title="Email Content Preview"
          />
        </div>
      )}
    </div>
  );
};

export default EmailContentPreview; 