'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { parseMSGFile, MSGContent } from '@/lib/msg-parser';
import DOMPurify from 'dompurify';

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

/**
 * Main application component for MSG File Viewer
 * Provides drag-and-drop interface for uploading MSG files and displays headers + email content
 */
export default function Home() {
  // State to store parsed MSG file content (headers, body, subject, etc.)
  const [msgContent, setMsgContent] = useState<MSGContent | null>(null);
  
  // State to store the search query for filtering headers
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Handles file drop/upload when user drops an MSG file
   * Parses the file and updates the UI with the content
   * @param acceptedFiles - Array of files dropped by user (we only use the first one)
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Parse the MSG file and extract headers/content
      const parsedContent = await parseMSGFile(file);
      setMsgContent(parsedContent);
      toast.success('File parsed successfully');
    } catch (error: unknown) {
      // Show user-friendly error message with details
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Failed to parse file: ' + errorMessage);
      console.error('MSG parse error:', error);
    }
  }, []);

  /**
   * Configure react-dropzone for file upload functionality
   * Accepts only .msg files and handles drag/drop + click to select
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-outlook': ['.msg'] // Only accept MSG files
    },
    multiple: false // Only allow single file upload
  });

  /**
   * Filter headers based on search query and exclude unwanted headers
   * Filters out:
   * - Headers starting with "<" (HTML tags)
   * - Headers starting with any whitespace (spaces, tabs, etc.)
   * - Then applies search query filter
   */
  const filteredHeaders = msgContent?.headers
    .filter(header => {
      // Remove headers starting with "<" (HTML tags)
      if (header.name.startsWith('<')) return false;
      
      // Remove headers starting with any whitespace characters
      // Check if trimmed version is different from original (indicates leading whitespace)
      if (header.name.trim() !== header.name) return false;
      
      // Also explicitly check for empty or whitespace-only names
      if (header.name.trim() === '') return false;
      
      return true;
    })
    .filter(header =>
      header.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      header.value.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col gap-6">
      <h1 className="text-3xl font-bold">MSG File Viewer by mmarkov</h1>
      
      {/* File Upload Area */}
      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the MSG file here...</p>
          ) : (
            <p>Drag and drop an MSG file here, or click to select one</p>
          )}
        </div>
      </Card>

      {/* Content Display - Only shown when file is loaded */}
      {msgContent && (
        <>
          {/* Headers Table Section - Full Width */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Headers</h2>
              <span className="text-sm text-gray-500">
                {filteredHeaders.length} header{filteredHeaders.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Search Input for filtering headers */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search headers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Headers Table */}
            <div className="flex-1 overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[300px] font-semibold text-gray-900 p-4">
                      Header Name
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 p-4">
                      Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHeaders.length > 0 ? (
                    filteredHeaders.map((header, index) => (
                      <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                        <TableCell 
                          className="font-medium text-sm p-4 border-r bg-gray-25 max-w-[300px]" 
                          title={header.name}
                        >
                          <div className="truncate font-mono text-blue-700">
                            {header.name.trimStart()}
                          </div>
                        </TableCell>
                        <TableCell 
                          className="text-sm p-4 break-words" 
                          title={header.value}
                        >
                          <div className="max-w-full">
                            {header.value}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center p-8 text-gray-500">
                        {searchQuery ? 'No headers match your search' : 'No headers found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Email Content Section - Below Headers */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Email Content</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">Subject</h3>
                  <p className="p-2 bg-gray-50 rounded">{msgContent.subject || 'No subject'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">Date</h3>
                  <p className="p-2 bg-gray-50 rounded">{msgContent.date || 'No date'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">From</h3>
                  <p className="p-2 bg-gray-50 rounded">{msgContent.from || 'No sender'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1">To</h3>
                  <p className="p-2 bg-gray-50 rounded">{msgContent.to || 'No recipients'}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-sm text-gray-500">Body</h3>
                  {msgContent.body && isHTML(msgContent.body) && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">HTML</span>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border max-h-96 overflow-y-auto">
                  {msgContent.body ? (
                    isHTML(msgContent.body) ? (
                      // Render HTML content
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: sanitizeHTML(msgContent.body) 
                        }}
                      />
                    ) : (
                      // Render plain text content
                      <div className="whitespace-pre-wrap text-sm">
                        {msgContent.body}
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 italic">No email body content</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </main>
  );
}
