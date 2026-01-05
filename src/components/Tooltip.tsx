'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export default function Tooltip({ 
    content, 
    children, 
    className = '', 
    position = 'top',
    delay = 500 
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
    const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            if (showTimeout) clearTimeout(showTimeout);
            if (hideTimeout) clearTimeout(hideTimeout);
        };
    }, [showTimeout, hideTimeout]);

    const showTooltip = () => {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            setHideTimeout(null);
        }
        
        const timeout = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setShowTimeout(timeout);
    };

    const hideTooltip = () => {
        if (showTimeout) {
            clearTimeout(showTimeout);
            setShowTimeout(null);
        }
        
        const timeout = setTimeout(() => {
            setIsVisible(false);
        }, 100);
        setHideTimeout(timeout);
    };

    // Handle touch events for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        if (isVisible) {
            hideTooltip();
        } else {
            showTooltip();
        }
    };

    // Handle click for mobile (fallback)
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.matchMedia('(pointer: coarse)').matches) {
            // On touch devices
            if (isVisible) {
                hideTooltip();
            } else {
                showTooltip();
            }
        }
    };

    const getPositionClasses = () => {
        const baseClasses = "absolute z-50 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-pre-line shadow-lg border border-gray-600 max-w-xs";
        
        switch (position) {
            case 'top':
                return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
            case 'bottom':
                return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
            case 'left':
                return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
            case 'right':
                return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
            default:
                return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
        }
    };

    const getArrowClasses = () => {
        const baseArrow = "absolute w-0 h-0 border-solid";
        
        switch (position) {
            case 'top':
                return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-700`;
            case 'bottom':
                return `${baseArrow} bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800 dark:border-b-gray-700`;
            case 'left':
                return `${baseArrow} left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-800 dark:border-l-gray-700`;
            case 'right':
                return `${baseArrow} right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-800 dark:border-r-gray-700`;
            default:
                return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-700`;
        }
    };

    if (!content) return <>{children}</>;

    return (
        <div 
            ref={containerRef}
            className={`relative inline-block ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onTouchStart={handleTouchStart}
            onClick={handleClick}
        >
            {children}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={getPositionClasses()}
                    style={{ 
                        animation: 'fadeIn 0.2s ease-in-out',
                        zIndex: 9999 
                    }}
                >
                    {content}
                    <div className={getArrowClasses()} />
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}