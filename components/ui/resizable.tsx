'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import './resizable.scss';

interface ResizablePanelGroupProps {
  className?: string;
  direction?: 'horizontal' | 'vertical';
  children: ReactNode;
  onLayout?: (sizes: number[]) => void;
}

const ResizablePanelGroup = ({
  className,
  direction = 'horizontal',
  children,
  onLayout,
  ...props
}: ResizablePanelGroupProps) => {
  return (
    <div
      className={`resizable-panel-group ${direction === 'vertical' ? 'resizable-panel-group--vertical' : 'resizable-panel-group--horizontal'} ${className || ''}`}
      data-panel-group-direction={direction}
      {...props}
    >
      {children}
    </div>
  );
};

interface ResizablePanelProps {
  className?: string;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  children: ReactNode;
  id?: string;
}

const ResizablePanel = ({
  className,
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  children,
  id,
  ...props
}: ResizablePanelProps) => {
  return (
    <div
      className={`resizable-panel ${className || ''}`}
      style={{ 
        '--panel-size': `${defaultSize}%`, 
        '--panel-min-size': `${minSize}%`,
        '--panel-max-size': `${maxSize}%`
      } as React.CSSProperties}
      data-min-size={minSize}
      data-max-size={maxSize}
      id={id}
      {...props}
    >
      {children}
    </div>
  );
};

interface ResizableHandleProps {
  className?: string;
  onResize?: (sizes: number[]) => void;
}

const ResizableHandle = ({
  className,
  onResize,
  ...props
}: ResizableHandleProps) => {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // Store panel references and initial sizes
  const panelRefs = useRef<{
    parent: HTMLElement | null;
    prev: HTMLElement | null;
    next: HTMLElement | null;
    initialSizes: { prev: number; next: number };
  }>({
    parent: null,
    prev: null,
    next: null,
    initialSizes: { prev: 0, next: 0 }
  });

  // Handle mouse/touch move during drag
  const handleMove = (clientX: number, clientY: number) => {
    const { parent, prev, next, initialSizes } = panelRefs.current;
    if (!parent || !prev || !next) return;
    
    const isVertical = parent.getAttribute('data-panel-group-direction') === 'vertical';
    const containerSize = isVertical ? parent.offsetHeight : parent.offsetWidth;
    
    // Calculate movement as percentage of container
    const currentPos = isVertical ? clientY : clientX;
    const startPosition = isVertical ? startPos.y : startPos.x;
    const movementPx = currentPos - startPosition;
    const movementPercent = (movementPx / containerSize) * 100;
    
    // Get min and max sizes
    const prevMinSize = parseFloat(prev.getAttribute('data-min-size') || '10');
    const nextMinSize = parseFloat(next.getAttribute('data-min-size') || '10');
    const prevMaxSize = parseFloat(prev.getAttribute('data-max-size') || '90');
    const nextMaxSize = parseFloat(next.getAttribute('data-max-size') || '90');
    
    // Calculate new sizes
    let newPrevSize = initialSizes.prev + movementPercent;
    let newNextSize = initialSizes.next - movementPercent;
    
    // Enforce minimum and maximum sizes
    if (newPrevSize < prevMinSize) {
      newPrevSize = prevMinSize;
      newNextSize = initialSizes.prev + initialSizes.next - prevMinSize;
    } else if (newNextSize < nextMinSize) {
      newNextSize = nextMinSize;
      newPrevSize = initialSizes.prev + initialSizes.next - nextMinSize;
    } else if (newPrevSize > prevMaxSize) {
      newPrevSize = prevMaxSize;
      newNextSize = initialSizes.prev + initialSizes.next - prevMaxSize;
    } else if (newNextSize > nextMaxSize) {
      newNextSize = nextMaxSize;
      newPrevSize = initialSizes.prev + initialSizes.next - nextMaxSize;
    }
    
    // Apply new sizes
    prev.style.setProperty('--panel-size', `${newPrevSize}%`);
    next.style.setProperty('--panel-size', `${newNextSize}%`);
    
    // Force layout recalculation
    window.requestAnimationFrame(() => {
      prev.style.setProperty('--panel-size', `${newPrevSize}%`);
      next.style.setProperty('--panel-size', `${newNextSize}%`);
    });
    
    if (onResize) {
      onResize([newPrevSize, newNextSize]);
    }
  };

  // Mouse events
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, onResize]);
  
  // Touch events
  useEffect(() => {
    if (!isDragging) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, startPos, onResize]);

  // Start dragging on mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDragging(e.clientX, e.clientY);
  };

  // Start dragging on touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    e.preventDefault();
    startDragging(e.touches[0].clientX, e.touches[0].clientY);
  };

  // Common function to start dragging
  const startDragging = (clientX: number, clientY: number) => {
    if (!handleRef.current) return;
    
    const parent = handleRef.current.parentElement;
    const prev = handleRef.current.previousElementSibling as HTMLElement;
    const next = handleRef.current.nextElementSibling as HTMLElement;
    
    if (!parent || !prev || !next) return;
    
    // Store references
    panelRefs.current.parent = parent;
    panelRefs.current.prev = prev;
    panelRefs.current.next = next;
    
    // Get current flex basis values
    const prevStyle = window.getComputedStyle(prev);
    const nextStyle = window.getComputedStyle(next);
    
    // Get the current sizes (remove 'px' and convert to percentage of parent)
    const parentWidth = parent.offsetWidth;
    const parentHeight = parent.offsetHeight;
    const isVertical = parent.getAttribute('data-panel-group-direction') === 'vertical';
    
    // Get the actual pixel sizes
    const prevSize = isVertical ? prev.offsetHeight : prev.offsetWidth;
    const nextSize = isVertical ? next.offsetHeight : next.offsetWidth;
    const totalSize = prevSize + nextSize;
    
    // Convert to percentages
    const prevPercentage = (prevSize / totalSize) * 100;
    const nextPercentage = (nextSize / totalSize) * 100;
    
    // Store initial sizes
    panelRefs.current.initialSizes = {
      prev: prevPercentage,
      next: nextPercentage
    };
    
    // Start dragging
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    
    // Set cursor and prevent text selection
    const cursorStyle = isVertical ? 'row-resize' : 'col-resize';
    document.body.style.cursor = cursorStyle;
    document.body.style.userSelect = 'none';
  };

  return (
    <div
      ref={handleRef}
      className={`resizable-handle ${isDragging ? 'resizable-handle--dragging' : ''} ${className || ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      {...props}
    />
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
