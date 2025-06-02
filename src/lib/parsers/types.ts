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