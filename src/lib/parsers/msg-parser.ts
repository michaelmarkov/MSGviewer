import MsgReader from '@kenjiuno/msgreader';
import { MSGHeader, MSGContent } from './types';
import { parseEMLFile } from './eml-parser';

interface MSGRecipient {
  recipType?: string;
  email?: string;
  name?: string;
}

interface MSGData {
  headers?: string;
  transportMessageHeaders?: string;
  internetMessageHeaders?: string;
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  messageDeliveryTime?: string;
  clientSubmitTime?: string;
  messageId?: string;
  conversationTopic?: string;
  conversationIndex?: string;
  recipients?: MSGRecipient[];
  body?: string;
  bodyHtml?: string;
  html?: Uint8Array;
  compressedRtf?: string;
  [key: string]: unknown;
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
          const msgData = msgReader.getFileData() as unknown as MSGData;
          
          // Debug: Log available properties to understand MSG structure
          if (process.env.NODE_ENV === 'development') {
            console.log('MSG Data keys:', Object.keys(msgData));
            console.log('Headers property exists:', 'headers' in msgData);
            console.log('Headers value:', msgData.headers);
            console.log('Available properties with values:');
            Object.keys(msgData).forEach(key => {
              const value = msgData[key];
              if (value && typeof value === 'string' && value.length < 200) {
                console.log(`  ${key}:`, value);
              } else if (value) {
                console.log(`  ${key}:`, typeof value, Array.isArray(value) ? `Array(${value.length})` : '');
              }
            });
          }
          
          // Parse headers from the headers string if available
          const headers: MSGHeader[] = [];
          
          // Try multiple sources for headers
          let headerString = '';
          if (msgData.headers) {
            headerString = msgData.headers;
          } else if (msgData.transportMessageHeaders) {
            headerString = msgData.transportMessageHeaders;
          } else if (msgData.internetMessageHeaders) {
            headerString = msgData.internetMessageHeaders;
          }
          
          if (headerString) {
            // The headers come as a single string with \r\n separators
            const headerLines = headerString.split(/\r?\n/);
            
            for (const line of headerLines) {
              // Skip empty lines
              if (!line.trim()) continue;
              
              // Look for header pattern "Name: Value"
              const colonIndex = line.indexOf(':');
              if (colonIndex > 0) {
                const name = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                
                // Security: Sanitize header names and values
                const sanitizedName = name.trim().substring(0, 500); // Limit length
                const sanitizedValue = value.substring(0, 2000); // Limit length
                
                // Only add if both name and value exist
                if (sanitizedName && sanitizedValue) {
                  headers.push({ name: sanitizedName, value: sanitizedValue });
                }
              }
            }
          } else {
            // If no header string found, try to build headers from individual properties
            const propertyMappings = [
              { prop: 'subject', name: 'Subject' },
              { prop: 'senderName', name: 'From-Name' },
              { prop: 'senderEmail', name: 'From' },
              { prop: 'messageDeliveryTime', name: 'Date' },
              { prop: 'clientSubmitTime', name: 'Date-Submitted' },
              { prop: 'messageId', name: 'Message-ID' },
              { prop: 'conversationTopic', name: 'Thread-Topic' },
              { prop: 'conversationIndex', name: 'Thread-Index' }
            ];
            
            propertyMappings.forEach(({ prop, name }) => {
              const value = msgData[prop as keyof MSGData];
              if (value && String(value).trim()) {
                headers.push({ 
                  name, 
                  value: String(value).trim().substring(0, 2000) 
                });
              }
            });
            
            // Add recipient headers
            if (msgData.recipients && Array.isArray(msgData.recipients)) {
              const toRecipients = msgData.recipients
                .filter((r: MSGRecipient) => r.recipType === 'to' || !r.recipType)
                .map((r: MSGRecipient) => r.email || r.name)
                .filter(Boolean)
                .slice(0, 10);
              
              if (toRecipients.length > 0) {
                headers.push({ name: 'To', value: toRecipients.join(', ') });
              }
              
              const ccRecipients = msgData.recipients
                .filter((r: MSGRecipient) => r.recipType === 'cc')
                .map((r: MSGRecipient) => r.email || r.name)
                .filter(Boolean)
                .slice(0, 10);
              
              if (ccRecipients.length > 0) {
                headers.push({ name: 'Cc', value: ccRecipients.join(', ') });
              }
            }
          }
          
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
            to: (msgData.recipients || []).map((r: MSGRecipient) => r.email || r.name).filter(Boolean).slice(0, 10).join(', '),
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

export type { MSGContent }; 