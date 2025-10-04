"use client";

import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define the props types for the dynamic component
interface DynamicComponentProps {
  componentName: string;
  props?: Record<string, any>;
}

// Map of component names to their corresponding imports
const componentMap: Record<string, React.ComponentType<any>> = {};

// Function to dynamically import a component
const importComponent = async (componentName: string): Promise<React.ComponentType<any> | null> => {
  try {
    // Try to import from ui components first
    try {
      const module = await import(`@/components/ui/${componentName.toLowerCase()}`);
      return module.default || module[componentName];
    } catch (uiError) {
      // If not found in ui, try importing from regular components
      const module = await import(`@/components/${componentName}`);
      return module.default || module[componentName];
    }
  } catch (error) {
    console.error(`Failed to load component: ${componentName}`, error);
    return null;
  }
};

// Component error state
const ErrorComponent: React.FC<{ name: string }> = ({ name }) => {
  return (
    <Alert variant="destructive" className="my-2">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Failed to load component: {name}
      </AlertDescription>
    </Alert>
  );
};

// Loading state
const LoadingComponent: React.FC = () => {
  return <Skeleton className="w-full h-20" />;
};

const DynamicComponent: React.FC<DynamicComponentProps> = ({ componentName, props = {} }) => {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;
    
    const loadComponent = async () => {
      try {
        // Try to get from cache first
        if (componentMap[componentName]) {
          if (isMounted) setComponent(componentMap[componentName]);
          return;
        }
        
        // Import the component
        const loadedComponent = await importComponent(componentName);
        
        if (loadedComponent) {
          // Cache the component for future use
          componentMap[componentName] = loadedComponent;
          
          if (isMounted) setComponent(loadedComponent);
        } else {
          if (isMounted) setError(true);
        }
      } catch (err) {
        console.error(`Error loading component ${componentName}:`, err);
        if (isMounted) setError(true);
      }
    };

    loadComponent();
    
    return () => {
      isMounted = false;
    };
  }, [componentName]);

  if (error) {
    return <ErrorComponent name={componentName} />;
  }

  if (!Component) {
    return <LoadingComponent />;
  }

  return <Component {...props} />;
};

export default DynamicComponent;