'use client';
import { useState, useEffect, useRef } from 'react';
import { FileCode } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ code: initialCode, onChange, readOnly = false }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [highlightedCode, setHighlightedCode] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Generate line numbers
  const lineNumbers = code.split('\n').map((_, i) => i + 1);
  
  // Apply syntax highlighting
  useEffect(() => {
    // Simple syntax highlighting
    const highlighted = code
      .replace(/\b(import|export|from|default|function|return|const|let|var|if|else|for|while)\b/g, '<span class="keyword">$1</span>')
      .replace(/(['"])(?:\\.|[^\\])*?\1/g, '<span class="string">$&</span>')
      .replace(/\b(className|onClick|onChange|onSubmit)\b/g, '<span class="property">$1</span>')
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)/g, '$1<span class="tag">$2</span>')
      .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="class-name">$1</span>')
      .replace(/\b(import)\b/g, '<span class="import">$1</span>')
      .replace(/\b(export)\b/g, '<span class="export">$1</span>')
      .replace(/\b(return)\b/g, '<span class="return">$1</span>');
    
    setHighlightedCode(highlighted);
  }, [code]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onChange?.(newCode);
  };
  
  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab at cursor position
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      onChange?.(newCode);
      
      // Move cursor after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };
  
  return (
    <div className="code-editor-container">
      <div className="line-numbers">
        {lineNumbers.map(num => (
          <div key={num} className="line-number">{num}</div>
        ))}
      </div>
      <div 
        className="code-content"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
      {!readOnly && (
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={code}
          onChange={handleChange}
          onKeyDown={handleTab}
          spellCheck={false}
        />
      )}
    </div>
  );
} 