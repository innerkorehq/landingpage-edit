import React, { useMemo } from 'react';
import { transform } from '@babel/standalone';
import { ErrorBoundary } from 'react-error-boundary';
import * as uiComponents from '@/components/ui';

interface DynamicComponentProps {
  code: string;
  props: Record<string, any>;
  onError?: (error: Error) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div 
    style={{ 
      padding: '1rem', 
      border: '1px dashed #f00', 
      borderRadius: '4px', 
      backgroundColor: 'rgba(255,0,0,0.05)',
      margin: '0.5rem 0'
    }}
  >
    <p style={{ color: '#d00', fontWeight: 'bold' }}>Component Error</p>
    <p style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>
      {error.message}
    </p>
    <button 
      onClick={resetErrorBoundary}
      style={{
        fontSize: '0.75rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '0.5rem'
      }}
    >
      Reload Component
    </button>
  </div>
);

export const DynamicComponent: React.FC<DynamicComponentProps> = ({ 
  code, 
  props, 
  onError 
}) => {
  // Transform and memoize the component to prevent unnecessary re-renders
  const Component = useMemo(() => {
    try {
      // Add React import and wrap in function component for consistency
      const wrappedCode = `
        const React = arguments[0];
        const components = arguments[1];
        return function DynamicComponent(props) {
          ${code}
        }
      `;
      
      // Transform JSX to JS using Babel
      const transformedCode = transform(wrappedCode, {
        presets: ['react'],
        filename: 'dynamic-component.js',
        babelrc: false,
        configFile: false
      }).code;
      
      // Create function from transformed code
      // eslint-disable-next-line no-new-func
      const createComponent = new Function('return ' + transformedCode)();
      
      // Execute the function with React and UI components
      return createComponent(React, uiComponents);
    } catch (error) {
      console.error('Failed to compile component:', error);
      onError?.(error as Error);
      
      // Return placeholder component on compile error
      return () => (
        <div style={{ color: 'red', padding: '1rem', border: '1px dashed red' }}>
          Component Compilation Error
        </div>
      );
    }
  }, [code, onError]);
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={onError}
      resetKeys={[code, JSON.stringify(props)]}
    >
      <Component {...props} />
    </ErrorBoundary>
  );
};