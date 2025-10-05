import React, { useState, useEffect } from 'react';
import { transform } from '@babel/standalone';
import { ErrorBoundary } from 'react-error-boundary';
import * as uiComponents from '@/components/ui';
import { ComponentVariation } from '@/types';

interface DynamicComponentProps {
  code: string;
  componentProps: Record<string, any>;
  onRenderError?: (error: Error) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div 
      role="alert" 
      style={{
        padding: '15px',
        margin: '10px 0',
        color: '#ff3333',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        border: '1px solid #ff6666',
        borderRadius: '4px'
      }}
    >
      <p>Something went wrong with this component:</p>
      <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
        {error.message}
      </pre>
      <button 
        onClick={resetErrorBoundary}
        style={{
          background: '#ff3333',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
};

export function DynamicComponent({ code, componentProps, onRenderError }: DynamicComponentProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const transpileAndCreateComponent = async () => {
      try {
        // Transpile JSX to JavaScript
        const transpiled = transform(code, {
          presets: ['react', 'typescript'],
          filename: 'component.tsx',
        }).code;

        if (!transpiled) {
          throw new Error('Failed to transpile component code');
        }

        // Create a function that returns the component
        const createComponent = new Function(
          'React', 
          'components',
          `${transpiled};
           return Component;`
        );

        // Execute the function to get the component
        if (isMounted) {
          const DynamicComponent = createComponent(React, uiComponents);
          setComponent(() => DynamicComponent);
          setError(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to render dynamic component:', errorMessage);
        
        if (isMounted) {
          setError(errorMessage);
          setComponent(null);
          if (onRenderError && err instanceof Error) {
            onRenderError(err);
          }
        }
      }
    };

    transpileAndCreateComponent();

    return () => {
      isMounted = false;
    };
  }, [code, onRenderError]);

  if (error) {
    return (
      <div style={{ padding: '15px', color: 'red', backgroundColor: '#fff1f0', border: '1px solid #ffa39e', borderRadius: '4px' }}>
        <p>Error rendering component:</p>
        <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>{error}</pre>
      </div>
    );
  }

  if (!Component) {
    return <div>Loading component...</div>;
  }

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback} 
      onError={(error) => {
        console.error('Component runtime error:', error);
        if (onRenderError) onRenderError(error);
      }}
      resetKeys={[code, JSON.stringify(componentProps)]}
    >
      <Component {...componentProps} />
    </ErrorBoundary>
  );
}