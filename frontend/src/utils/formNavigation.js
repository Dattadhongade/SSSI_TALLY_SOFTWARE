export const focusNextElement = (currentElement) => {
  const container = currentElement.closest('form, .navigable-container');
  if (!container) return;
  
  const focusableElements = Array.from(
    container.querySelectorAll(
      'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
    )
  ).filter(el => el.offsetParent !== null);
  
  const currentIndex = focusableElements.indexOf(currentElement);
  if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
    focusableElements[currentIndex + 1].focus();
  }
};

export const handleEnterToNextField = (e) => {
  // Handle Backspace for backwards navigation
  if (e.key === 'Backspace') {
    const isTextInput = e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea';
    const isEmpty = isTextInput ? e.target.value === '' : true;
    
    if (isEmpty) {
      e.preventDefault();
      const container = e.target.closest('form, .navigable-container');
      if (!container) return;
      
      const focusableElements = Array.from(
        container.querySelectorAll(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
        )
      ).filter(el => el.offsetParent !== null);
      
      const currentIndex = focusableElements.indexOf(e.target);
      if (currentIndex > 0) {
        focusableElements[currentIndex - 1].focus();
      }
      return;
    }
  }

  // Handle Enter for forwards navigation
  if (e.key === 'Enter') {
    if (e.target.tagName.toLowerCase() === 'button' || e.target.type === 'submit') {
      return;
    }
    
    e.preventDefault();
    focusNextElement(e.target);
  }
};
