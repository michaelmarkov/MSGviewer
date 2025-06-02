import MsgReader from '@kenjiuno/msgreader';

/**
 * Interface representing a single header from an email file
 */
export interface MSGHeader {
  name: string;  // Header name (e.g., "Subject", "From", "To")
  value: string; // Header value (e.g., "Meeting reminder", "john@example.com")
}

/**
 * Interface representing the complete content of a parsed email file (MSG or EML)
 * Contains both structured data (subject, from, to, date) and raw headers
 */
export interface MSGContent {
  headers: MSGHeader[];  // Array of all extracted headers
  body: string;          // Email body content
  subject: string;       // Email subject line
  from: string;          // Sender email/name
  to: string;            // Recipient email/name
  date: string;          // Date when email was sent
  fileType: 'MSG' | 'EML'; // Type of file parsed
}

/**
 * Parses an EML file (RFC 822 format) and extracts headers and content
 * EML files are text-based and much simpler to parse than MSG files
 * 
 * @param content - The EML file content as a string
 * @returns MSGContent with extracted data
 */
function parseEMLFile(content: string): MSGContent {
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
          const sanitizedName = currentHeaderName.replace(/[<>]/g, '').substring(0, 500);
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
          const sanitizedName = currentHeaderName.replace(/[<>]/g, '').substring(0, 500);
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
    const sanitizedName = currentHeaderName.replace(/[<>]/g, '').substring(0, 500);
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

/**
 * Parses an MSG file and extracts headers and content using @kenjiuno/msgreader
 * 
 * This uses a proper MSG parser that can handle binary MSG formats correctly
 * and extract headers in a clean, structured way.
 * 
 * @param file - The MSG file to parse (File object from input or drag-drop)
 * @returns Promise that resolves to MSGContent with extracted data
 * @throws Error if file cannot be read or parsed
 */
export async function parseEmailFile(file: File): Promise<MSGContent> {
  // Security: Validate input
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (file.size === 0) {
    throw new Error('File is empty');
  }

  const fileName = file.name.toLowerCase();
  const isEML = fileName.endsWith('.eml');
  const isMSG = fileName.endsWith('.msg');

  if (!isEML && !isMSG) {
    throw new Error('Unsupported file type');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    /**
     * Handle successful file read
     */
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        
        if (!result) {
          throw new Error('Failed to read file content');
        }

        if (isEML) {
          // Parse EML file (text-based)
          const content = result as string;
          const parsedContent = parseEMLFile(content);
          resolve(parsedContent);
        } else {
          // Parse MSG file (binary)
          const buffer = result as ArrayBuffer;
          
          if (buffer.byteLength === 0) {
            throw new Error('Failed to read file content');
          }
          
          // Create MSG reader instance
          const msgReader = new MsgReader(buffer);
          const msgData = msgReader.getFileData();
          
          // Remove debug logging for security
          // Only log in development environment if needed
          if (process.env.NODE_ENV === 'development') {
            console.log('MSG Data keys:', Object.keys(msgData));
          }
          
          // Parse headers from the headers string if available
          const headers: MSGHeader[] = [];
          if (msgData.headers) {
            // The headers come as a single string with \r\n separators
            const headerLines = msgData.headers.split(/\r?\n/);
            
            for (const line of headerLines) {
              // Skip empty lines
              if (!line.trim()) continue;
              
              // Look for header pattern "Name: Value"
              const colonIndex = line.indexOf(':');
              if (colonIndex > 0) {
                const name = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                
                // Security: Sanitize header names and values
                const sanitizedName = name.replace(/[<>]/g, '').substring(0, 500); // Limit length
                const sanitizedValue = value.substring(0, 2000); // Limit length
                
                // Only add if both name and value exist
                if (sanitizedName && sanitizedValue) {
                  headers.push({ name: sanitizedName, value: sanitizedValue });
                }
              }
            }
          }
          
          // Extract recipient information
          const recipients = msgData.recipients || [];
          const toEmails = recipients
            .filter((r: unknown) => {
              const recipient = r as { recipType?: string };
              return recipient.recipType === 'to' || !recipient.recipType;
            })
            .map((r: unknown) => {
              const recipient = r as { email?: string; name?: string };
              return recipient.email || recipient.name;
            })
            .filter(Boolean)
            .slice(0, 10) // Security: Limit number of recipients to prevent DoS
            .join(', ');
          
          // Extract body content - try multiple sources
          let body = '';
          if (msgData.body) {
            body = msgData.body;
          } else if (msgData.bodyHtml) {
            body = msgData.bodyHtml;
          } else if (msgData.html) {
            // Many MSG files store the body in the 'html' field as Uint8Array
            // Convert from Uint8Array to string
            const decoder = new TextDecoder('utf-8');
            body = decoder.decode(msgData.html);
          } else if (msgData.compressedRtf) {
            body = '[RTF content detected - not displayed]';
          }
          
          // Security: Limit body content size to prevent DoS
          if (body.length > 1000000) { // 1MB limit
            body = body.substring(0, 1000000) + '\n\n[Content truncated for security reasons]';
          }
          
          // Remove debug logging for security
          if (process.env.NODE_ENV === 'development') {
            console.log('Final body length:', body.length);
          }
          
          // Return the complete parsed content with security limits
          resolve({
            headers: headers.slice(0, 1000), // Limit number of headers
            body,
            subject: (msgData.subject || '').substring(0, 500), // Limit subject length
            from: (msgData.senderEmail || msgData.senderName || '').substring(0, 200),
            to: toEmails,
            date: (msgData.messageDeliveryTime || msgData.clientSubmitTime || '').substring(0, 100),
            fileType: 'MSG'
          });
        }
        
      } catch (error) {
        // Security: Don't log detailed error information in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Email parsing error:', error);
        }
        reject(new Error('Failed to parse email file'));
      }
    };
    
    /**
     * Handle file read errors
     */
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read the file based on its type
    if (isEML) {
      reader.readAsText(file, 'utf-8'); // EML files are text
    } else {
      reader.readAsArrayBuffer(file); // MSG files are binary
    }
  });
}

// Maintain backward compatibility
export const parseMSGFile = parseEmailFile; 