import React from 'react';

interface PreviewOptionsProps {
  previewMode: 'none' | 'text' | 'html-safe';
  setPreviewMode: (mode: 'none' | 'text' | 'html-safe') => void;
  showPreviewWarning: boolean;
  setShowPreviewWarning: (show: boolean) => void;
  isHTML: boolean;
}

const PreviewOptions: React.FC<PreviewOptionsProps> = ({
  previewMode,
  setPreviewMode,
  showPreviewWarning,
  setShowPreviewWarning,
  isHTML
}) => {
  const handlePreviewModeChange = (mode: 'none' | 'text' | 'html-safe') => {
    if (mode !== 'none' && showPreviewWarning) {
      const confirmed = window.confirm(
        'Email preview is enabled with security measures, but you should only preview emails from trusted sources. Continue?'
      );
      if (confirmed) {
        setShowPreviewWarning(false);
        setPreviewMode(mode);
      }
    } else {
      setPreviewMode(mode);
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Email Preview Options</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="previewMode"
            value="none"
            checked={previewMode === 'none'}
            onChange={() => handlePreviewModeChange('none')}
          />
          <span>No Preview (Headers Only)</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="previewMode"
            value="text"
            checked={previewMode === 'text'}
            onChange={() => handlePreviewModeChange('text')}
          />
          <span>📄 Plain Text Preview (Safe)</span>
        </label>
        {isHTML && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="previewMode"
              value="html-safe"
              checked={previewMode === 'html-safe'}
              onChange={() => handlePreviewModeChange('html-safe')}
            />
            <span>🛡️ HTML Preview (Sandboxed)</span>
          </label>
        )}
      </div>
      <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
        <strong>Security:</strong> Plain text is completely safe. HTML preview uses a sandboxed iframe with no JavaScript execution.
      </p>
    </div>
  );
};

export default PreviewOptions; 