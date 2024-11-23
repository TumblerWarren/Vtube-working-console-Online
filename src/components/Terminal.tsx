import React, { useState, useRef, useEffect } from 'react';
import { socketService } from '../services/socketService';

interface TerminalProps {
  output: string[];
}

export default function Terminal({ output }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      socketService.sendInput(input);
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const formatOutput = (line: string) => {
    const cleanLine = line.replace(/\u001b\[\d+m|\u001b\[1m/g, '');

    if (cleanLine.toLowerCase().includes('error') || cleanLine.toLowerCase().includes('warning')) {
      return <span className="text-red-500">{cleanLine}</span>;
    } else if (cleanLine.startsWith('>>>')) {
      return <span className="text-yellow-400">{cleanLine}</span>;
    } else if (cleanLine.includes('YOU :')) {
      return <span className="text-green-500">{cleanLine.replace('YOU :', '>>>')}</span>;
    } else {
      return <span>{cleanLine}</span>;
    }
  };

  return (
    <div className="bg-gray-900 text-green-400 rounded-lg h-[300px] sm:h-[400px] font-mono text-xs sm:text-sm flex flex-col">
      {/* Header */}
      <div className="p-2 bg-gray-800 rounded-t-lg border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Output Area */}
      <div
        ref={outputRef}
        onClick={focusInput}
        className="flex-1 overflow-y-auto p-3 sm:p-4"
      >
        {output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap py-0.5 sm:py-1 break-words">
            {formatOutput(line)}
          </div>
        ))}
        {output.length === 0 && (
          <div className="text-gray-500">Terminal ready. Type your commands...</div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2 bg-gray-800 border-t border-gray-700 rounded-b-lg">
        <div className="flex items-center">
          <span className="text-yellow-400 mr-2 text-xs sm:text-sm">&gt;&gt;&gt; </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-green-400 font-mono text-xs sm:text-sm"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}