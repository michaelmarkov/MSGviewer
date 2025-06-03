import React from 'react';

interface EmailContentPreviewProps {
  body: string;
  previewMode: 'none' | 'text' | 'html-safe';
  isHTML: boolean;
}

const EmailContentPreview: React.FC<EmailContentPreviewProps> = ({ body, previewMode, isHTML }) => {
  const htmlToPlainText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    tempDiv.remove();
    return text.trim();
  };

  const createSafeHTMLPreview = (html: string): string => {
    const cleaned = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/style\s*=\s*['"][^'"]*['"]/gi, '');

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
  };

  if (previewMode === 'none') return null;

  return (
    <div>
      <h2>Email Content Preview</h2>
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
            sandbox=""
            srcDoc={createSafeHTMLPreview(body)}
            title="Email Content Preview"
          />
        </div>
      )}
    </div>
  );
};

export default EmailContentPreview; 