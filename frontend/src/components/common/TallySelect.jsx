import { useState, useRef, useEffect, useMemo } from 'react';
import { focusNextElement } from '../../utils/formNavigation';

export default function TallySelect({ 
  options = [], 
  value, 
  onChange, 
  name, 
  placeholder = "Select...", 
  className = "",
  autoFocus = false,
  createOption = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // When value changes externally (or internally), update the search term to match the selected name
  useEffect(() => {
    if (value && value !== 'CREATE') {
      const selected = options.find(o => String(o.id) === String(value));
      if (selected) {
        setTimeout(() => setSearchTerm(selected.name), 0);
      }
    } else if (!value) {
      setTimeout(() => setSearchTerm(""), 0);
    }
  }, [value, options]);

  // Combined options: add "CREATE" if provided
  const displayOptions = useMemo(() => {
    return createOption 
      ? [{ id: 'CREATE', name: createOption.label, isCreate: true }, ...options]
      : options;
  }, [createOption, options]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    const selectedOption = options.find(o => String(o.id) === String(value));
    const isSearchMatchingSelected = selectedOption && selectedOption.name === searchTerm;
    
    return isSearchMatchingSelected || !searchTerm
      ? displayOptions 
      : displayOptions.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [displayOptions, options, value, searchTerm]);

  // Reset highlight when search changes or dropdown opens
  useEffect(() => {
    if (isOpen) {
      const currentIndex = filteredOptions.findIndex(o => String(o.id) === String(value));
      setTimeout(() => setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0), 0);
    } else {
      setTimeout(() => setHighlightedIndex(0), 0);
    }
  }, [searchTerm, isOpen, filteredOptions, value]);

  // Handle outside click to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        // If they click outside, reset search to currently selected value
        const current = options.find(o => String(o.id) === String(value));
        setSearchTerm(current ? current.name : "");
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [value, options]);

  const handleSelect = (option) => {
    setIsOpen(false);
    setSearchTerm(option.name);
    // Call onChange with a mock event object
    onChange({ target: { name, value: option.id } });
    
    // Automatically focus the next element!
    setTimeout(() => {
      if (inputRef.current) {
        // Only advance focus if focus hasn't been stolen by a modal opening
        if (document.activeElement === inputRef.current || document.activeElement === document.body) {
          focusNextElement(inputRef.current);
        }
      }
    }, 10); // Small delay to let React process state
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      // If list is open and we have options, select the highlighted one
      if (isOpen && filteredOptions.length > 0) {
        e.preventDefault();
        e.stopPropagation(); // Stop formNavigation from firing twice
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (!isOpen) {
        // If it's closed, let standard enter navigation take over
        // formNavigation.js will handle it.
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      const current = options.find(o => String(o.id) === String(value));
      setSearchTerm(current ? current.name : "");
    }
    // Backspace is natively handled by the input, and formNavigation handles it if empty
  };

  // Scroll to highlighted item
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeItem = listRef.current.children[highlightedIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        id={name}
        name={name}
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={searchTerm}
        autoComplete="off"
        className={`bg-transparent focus:outline-none focus:bg-tally-yellow ${className}`}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          // Highlight the text when focused (like Tally)
          setTimeout(() => inputRef.current?.select(), 10);
        }}
        onBlur={(e) => {
          if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
            setIsOpen(false);
            const current = options.find(o => String(o.id) === String(value));
            setTimeout(() => setSearchTerm(current ? current.name : ""), 0);
          }
        }}
        onKeyDown={handleKeyDown}
      />

      {isOpen && (
        <ul 
          ref={listRef}
          className="absolute z-100 mt-1 max-h-60 overflow-auto bg-white border border-tally-border shadow-lg"
          style={{ minWidth: '100%', right: 0 }} // Dropdown to the right natively fits better
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <li
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`px-3 py-1 cursor-pointer text-sm font-bold truncate ${
                  highlightedIndex === idx ? 'bg-tally-yellow text-tally-blue' : 'text-gray-800 hover:bg-gray-100'
                } ${option.isCreate ? 'text-tally-blue border-b border-gray-200 mb-1' : ''}`}
              >
                {option.name}
              </li>
            ))
          ) : (
            <li className="px-3 py-1 text-sm text-gray-500 italic">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
}
