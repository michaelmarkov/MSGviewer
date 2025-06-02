import MsgReader from '@kenjiuno/msgreader';

/**
 * Interface representing a single header from an MSG file
 */
export interface MSGHeader {
  name: string;  // Header name (e.g., "Subject", "From", "To")
  value: string; // Header value (e.g., "Meeting reminder", "john@example.com")
}

/**
 * Interface representing the complete content of a parsed MSG file
 * Contains both structured data (subject, from, to, date) and raw headers
 */
export interface MSGContent {
  headers: MSGHeader[];  // Array of all extracted headers
  body: string;          // Email body content
  subject: string;       // Email subject line
  from: string;          // Sender email/name
  to: string;            // Recipient email/name
  date: string;          // Date when email was sent
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
export async function parseMSGFile(file: File): Promise<MSGContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    /**
     * Handle successful file read
     * Uses MsgReader to properly parse binary MSG format
     */
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        
        // Create MSG reader instance
        const msgReader = new MsgReader(buffer);
        const msgData = msgReader.getFileData();
        
        // Debug: Log what's available in msgData
        console.log('MSG Data keys:', Object.keys(msgData));
        console.log('Body fields:', {
          body: msgData.body,
          bodyHtml: msgData.bodyHtml,
          compressedRtf: msgData.compressedRtf ? 'present' : 'missing'
        });
        
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
              
              // Only add if both name and value exist
              if (name && value) {
                headers.push({ name, value });
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
        
        console.log('Final body length:', body.length);
        console.log('Body source:', msgData.html ? 'html field' : msgData.body ? 'body field' : msgData.bodyHtml ? 'bodyHtml field' : 'none');
        
        // Return the complete parsed content
        resolve({
          headers,
          body,
          subject: msgData.subject || '',
          from: msgData.senderEmail || msgData.senderName || '',
          to: toEmails,
          date: msgData.messageDeliveryTime || msgData.clientSubmitTime || ''
        });
        
      } catch (error) {
        console.error('MSG parsing error:', error);
        reject(error);
      }
    };
    
    /**
     * Handle file read errors
     */
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Start reading the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
} 