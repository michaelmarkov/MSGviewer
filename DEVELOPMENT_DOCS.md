# MSG File Viewer - Developer Documentation

## Overview

This is a Next.js application that allows users to upload MSG files and view their headers and content in a clean, searchable interface. The application provides drag-and-drop functionality and displays both the email content and technical headers.

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main application component
│   ├── layout.tsx         # Root layout with toast provider
│   └── globals.css        # Global styles
├── lib/
│   ├── msg-parser.ts      # MSG file parsing logic
│   ├── utils.ts          # Utility functions (Shadcn)
│   └── msgreader.d.ts    # Type declarations for external libraries
└── components/
    └── ui/               # Shadcn UI components
```

## Core Components

### 1. Main Application (`src/app/page.tsx`)

The main component handles:
- File upload via drag-and-drop
- MSG file parsing
- Content display in two-column layout
- Header search functionality

#### Key Functions:

- **`onDrop()`**: Handles file upload and parsing
- **`filteredHeaders`**: Filters headers based on search query

#### State Management:
- `msgContent`: Stores parsed MSG file data
- `searchQuery`: Stores the current search filter

### 2. MSG Parser (`src/lib/msg-parser.ts`)

Handles the parsing of MSG files using a text-based approach.

#### Key Functions:

- **`parseMSGFile(file: File)`**: Main parsing function
  - Reads file as ArrayBuffer
  - Converts to text using TextDecoder
  - Extracts headers using regex
  - Separates body content

#### Interfaces:

- **`MSGHeader`**: Represents a single header (name/value pair)
- **`MSGContent`**: Complete parsed MSG file data

## Customization Guide

### 1. Adding Header Filters

To filter out unwanted headers, modify the `filteredHeaders` logic in `src/app/page.tsx`:

```typescript
// Example: Filter out headers starting with special characters
const filteredHeaders = msgContent?.headers
  .filter(header => {
    // Only include headers starting with letters
    return /^[A-Za-z]/.test(header.name);
  })
  .filter(header =>
    header.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    header.value.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
```

### 2. Customizing the Parser

The current parser is text-based. For better MSG support, you can:

#### Option A: Improve Text Parsing
```typescript
// In src/lib/msg-parser.ts, modify the headerRegex
const headerRegex = /^([A-Za-z-]+):\s*(.*)$/gm; // Only alphanumeric headers
```

#### Option B: Use a Dedicated Library
```bash
npm install @extractus/msg-parser
```

Then update `src/lib/msg-parser.ts`:
```typescript
import { extract } from '@extractus/msg-parser';

export async function parseMSGFile(file: File): Promise<MSGContent> {
  const buffer = await file.arrayBuffer();
  const data = extract(buffer);
  
  return {
    headers: Object.entries(data.headers || {}).map(([name, value]) => ({
      name,
      value: String(value)
    })),
    body: data.body || '',
    subject: data.subject || '',
    from: data.from || '',
    to: data.to || '',
    date: data.date || ''
  };
}
```

### 3. UI Customization

#### Changing Layout:
In `src/app/page.tsx`, modify the grid layout:
```typescript
// Single column layout
<div className="flex flex-col gap-6">

// Three column layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
```

#### Adding New Sections:
```typescript
{/* Add after existing cards */}
<Card className="p-6">
  <h2 className="text-xl font-semibold mb-4">Attachments</h2>
  {/* Attachment list */}
</Card>
```

### 4. Search Enhancement

To add advanced search capabilities:

```typescript
// In src/app/page.tsx
const [searchType, setSearchType] = useState<'all' | 'headers' | 'values'>('all');

const filteredHeaders = msgContent?.headers.filter(header => {
  const query = searchQuery.toLowerCase();
  switch (searchType) {
    case 'headers':
      return header.name.toLowerCase().includes(query);
    case 'values':
      return header.value.toLowerCase().includes(query);
    default:
      return header.name.toLowerCase().includes(query) ||
             header.value.toLowerCase().includes(query);
  }
}) || [];
```

### 5. Export Functionality

To add CSV export:

```typescript
// Add to src/app/page.tsx
const exportToCSV = () => {
  const csv = [
    ['Header Name', 'Value'],
    ...filteredHeaders.map(h => [h.name, h.value])
  ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'headers.csv';
  a.click();
};
```

## Troubleshooting

### Common Issues:

1. **"Failed to parse file"**
   - File may be corrupted or not a valid MSG file
   - Try with a different MSG file
   - Check browser console for detailed error

2. **Headers showing garbled text**
   - MSG file contains binary data that can't be parsed as text
   - Consider using a dedicated MSG parsing library

3. **No headers showing**
   - The regex pattern may not match the file format
   - Try adjusting the `headerRegex` in `msg-parser.ts`

4. **Performance issues with large files**
   - Add file size limits in the dropzone configuration
   - Consider chunked reading for very large files

### Debugging:

Enable detailed logging by adding to `src/lib/msg-parser.ts`:
```typescript
console.log('File size:', file.size);
console.log('Content preview:', content.substring(0, 500));
console.log('Headers found:', headers.length);
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## Dependencies

### Core:
- Next.js 14
- React 18
- TypeScript

### UI:
- Tailwind CSS
- Shadcn UI components
- Lucide React icons

### Functionality:
- react-dropzone (file upload)
- sonner (toast notifications)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: File API and FileReader are required for operation. 