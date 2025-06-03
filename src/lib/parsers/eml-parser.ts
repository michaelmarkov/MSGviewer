import { MSGHeader, MSGContent } from './types';

/**
 * Parses an EML file (RFC 822 format) and extracts headers and content
 * EML files are text-based and much simpler to parse than MSG files
 * 
 * @param content - The EML file content as a string
 * @returns MSGContent with extracted data
 */
export function parseEMLFile(content: string): MSGContent {
  const headers: MSGHeader[] = [];
  let subject = '';
  let from = '';
  let to = '';
  let date = '';
  let body = '';

  // Split content into lines
  const lines = content.split(/\r?\n/);
  let headerSection = true;
  let currentHeaderName = '';
  let currentHeaderValue = '';
  const bodyLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (headerSection) {
      // Empty line indicates end of headers
      if (line.trim() === '') {
        // Save the last header if we have one
        if (currentHeaderName && currentHeaderValue) {
          const sanitizedName = currentHeaderName.trim().substring(0, 500);
          const sanitizedValue = currentHeaderValue.trim().substring(0, 2000);
          
          if (sanitizedName && sanitizedValue) {
            headers.push({ name: sanitizedName, value: sanitizedValue });
            
            // Extract key fields
            const lowerName = sanitizedName.toLowerCase();
            if (lowerName === 'subject') subject = sanitizedValue;
            else if (lowerName === 'from') from = sanitizedValue;
            else if (lowerName === 'to') to = sanitizedValue;
            else if (lowerName === 'date') date = sanitizedValue;
          }
        }
        headerSection = false;
        continue;
      }

      // Check if this line starts a new header (has a colon and doesn't start with whitespace)
      if (line.match(/^[^\s]+:/) && !line.match(/^\s/)) {
        // Save previous header if exists
        if (currentHeaderName && currentHeaderValue) {
          const sanitizedName = currentHeaderName.trim().substring(0, 500);
          const sanitizedValue = currentHeaderValue.trim().substring(0, 2000);
          
          if (sanitizedName && sanitizedValue) {
            headers.push({ name: sanitizedName, value: sanitizedValue });
            
            // Extract key fields
            const lowerName = sanitizedName.toLowerCase();
            if (lowerName === 'subject') subject = sanitizedValue;
            else if (lowerName === 'from') from = sanitizedValue;
            else if (lowerName === 'to') to = sanitizedValue;
            else if (lowerName === 'date') date = sanitizedValue;
          }
        }

        // Start new header
        const colonIndex = line.indexOf(':');
        currentHeaderName = line.substring(0, colonIndex).trim();
        currentHeaderValue = line.substring(colonIndex + 1).trim();
      } else if (line.match(/^\s/) && currentHeaderName) {
        // Continuation of previous header (starts with whitespace)
        currentHeaderValue += ' ' + line.trim();
      }
    } else {
      // We're in the body section
      bodyLines.push(line);
    }
  }

  // Don't forget the last header if we ended in header section
  if (headerSection && currentHeaderName && currentHeaderValue) {
    const sanitizedName = currentHeaderName.trim().substring(0, 500);
    const sanitizedValue = currentHeaderValue.trim().substring(0, 2000);
    
    if (sanitizedName && sanitizedValue) {
      headers.push({ name: sanitizedName, value: sanitizedValue });
      
      const lowerName = sanitizedName.toLowerCase();
      if (lowerName === 'subject') subject = sanitizedValue;
      else if (lowerName === 'from') from = sanitizedValue;
      else if (lowerName === 'to') to = sanitizedValue;
      else if (lowerName === 'date') date = sanitizedValue;
    }
  }

  // Join body lines
  body = bodyLines.join('\n');
  
  // Security: Limit body content size
  if (body.length > 1000000) { // 1MB limit
    body = body.substring(0, 1000000) + '\n\n[Content truncated for security reasons]';
  }

  return {
    headers: headers.slice(0, 1000), // Limit number of headers
    body,
    subject: subject.substring(0, 500),
    from: from.substring(0, 200),
    to: to.substring(0, 200),
    date: date.substring(0, 100),
    fileType: 'EML'
  };
} 