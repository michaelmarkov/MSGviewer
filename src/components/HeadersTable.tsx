import React from 'react';

interface Header {
  name: string;
  value: string;
}

interface HeadersTableProps {
  headers: Header[];
}

const HeadersTable: React.FC<HeadersTableProps> = ({ headers }) => {
  const sanitizeHeaderText = (text: string): string => {
    // For email headers, we want to preserve email-specific formatting like angle brackets
    // but prevent actual script injection. Since headers are displayed as text content
    // (not innerHTML), React automatically escapes them. We just need basic cleanup.
    return text
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/data:text\/html/gi, '') // Remove data URLs that could contain HTML
      .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
      .trim();
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      <h2 className="text-lg font-semibold mb-2">Email Headers ({headers.length})</h2>
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
          {headers.map((header, index) => (
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
                {sanitizeHeaderText(header.name.trimStart())}
              </td>
              <td style={{ 
                padding: '8px 12px', 
                border: '1px solid #ddd',
                wordBreak: 'break-word'
              }}>
                {sanitizeHeaderText(header.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {headers.length === 0 && (
        <p style={{ color: '#666', fontStyle: 'italic', marginTop: '16px' }}>
          No headers match your search criteria.
        </p>
      )}
    </div>
  );
};

export default HeadersTable; 