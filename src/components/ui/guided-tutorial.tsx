'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuestionMarkCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface TutorialStep {
  title: string;
  content: React.ReactNode;
  targetSelector?: string; // CSS selector for element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
}

interface GuidedTutorialProps {
  steps: TutorialStep[];
  onComplete?: () => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function GuidedTutorial({
  steps,
  onComplete,
  isOpen: externalIsOpen,
  onOpenChange
}: GuidedTutorialProps) {
  const [isOpen, setIsOpenInternal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  
  // Use external or internal state based on whether controlled externally
  const isOpenState = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const setIsOpen = (newValue: boolean) => {
    if (onOpenChange) {
      onOpenChange(newValue);
    } else {
      setIsOpenInternal(newValue);
    }
  };
  
  // Start the tutorial
  const startTutorial = () => {
    setCurrentStep(0);
    setIsOpen(true);
    
    // Find target element for first step
    if (steps[0].targetSelector) {
      setTargetElement(document.querySelector(steps[0].targetSelector));
    } else {
      setTargetElement(null);
    }
  };
  
  // Navigate to next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      
      // Find target element for next step
      if (steps[nextIndex].targetSelector) {
        setTargetElement(document.querySelector(steps[nextIndex].targetSelector));
      } else {
        setTargetElement(null);
      }
    } else {
      // Tutorial complete
      setIsOpen(false);
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      
      // Find target element for previous step
      if (steps[prevIndex].targetSelector) {
        setTargetElement(document.querySelector(steps[prevIndex].targetSelector));
      } else {
        setTargetElement(null);
      }
    }
  };
  
  // Close the tutorial
  const closeTutorial = () => {
    setIsOpen(false);
  };
  
  // Get position for tooltip
  const getTooltipPosition = () => {
    if (!targetElement || !steps[currentStep].position || steps[currentStep].position === 'center') {
      // Center on screen if no target or position specified
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
    
    const rect = targetElement.getBoundingClientRect();
    const position = steps[currentStep].position;
    
    switch (position) {
      case 'top':
        return {
          bottom: `${window.innerHeight - rect.top + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'right':
        return {
          left: `${rect.right + 10}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)'
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          right: `${window.innerWidth - rect.left + 10}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)'
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };
  
  if (!isOpenState) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={startTutorial}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full"
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
        <span>Help</span>
      </Button>
    );
  }
  
  const currentTutorialStep = steps[currentStep];
  const tooltipPosition = getTooltipPosition();
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={closeTutorial} />
      
      {/* Highlight target element if it exists */}
      {targetElement && (
        <div 
          className="absolute border-2 border-primary z-50 animate-pulse rounded-sm"
          style={{
            top: `${targetElement.getBoundingClientRect().top - 4}px`,
            left: `${targetElement.getBoundingClientRect().left - 4}px`,
            width: `${targetElement.getBoundingClientRect().width + 8}px`,
            height: `${targetElement.getBoundingClientRect().height + 8}px`,
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* Tutorial card */}
      <div 
        className="fixed z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md"
        style={tooltipPosition}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{currentTutorialStep.title}</h3>
          </div>
          <button 
            onClick={closeTutorial}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          {currentTutorialStep.content}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={nextStep}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </>
  );
} 