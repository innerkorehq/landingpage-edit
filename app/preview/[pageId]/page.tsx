'use client';

import React, { useState, useEffect } from 'react';
import { EditableComponentWrapper } from '@/components/EditableComponentWrapper';
import { useEditorStore } from '@/stores/editorStore';
import apiClient, { ApiError } from '@/lib/apiClient';
import { PageComponentInstance, Page } from '@/types';

// Loading state component
const LoadingState = () => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center',
    color: '#666'
  }}>
    <div style={{ 
      display: 'inline-block',
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p>Loading page components...</p>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Error state component
const ErrorState = ({ message }: { message: string }) => (
  <div style={{
    padding: '2rem',
    margin: '1rem',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    backgroundColor: '#f8d7da',
    color: '#721c24'
  }}>
    <h3>Error Loading Preview</h3>
    <p>{message}</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        padding: '8px 16px',
        marginTop: '1rem',
        background: '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Retry
    </button>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div style={{
    padding: '3rem',
    margin: '2rem',
    textAlign: 'center',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    color: '#666'
  }}>
    <h3>No Components Found</h3>
    <p>This page doesn't have any components yet.</p>
    <p>Use the editor to add components to this page.</p>
  </div>
);

export default function PreviewPage({ params }: { params: { pageId: string } }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { page, setPage, setError: setStoreError, isLoading, setIsLoading } = useEditorStore();

  // Initialize communication with parent frame
  useEffect(() => {
    // Signal to the parent that we're ready to receive data
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
      setIsReady(true);
    }
    
    // Handle messages from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PAGE_UPDATE' && event.data.payload) {
        try {
          setPage(event.data.payload);
          setError(null);
        } catch (err) {
          console.error('Error updating page from message:', err);
          setError('Failed to process page data from editor');
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setPage]);
  
  // If we're not in an iframe or haven't received data through messages,
  // fetch the data directly
  useEffect(() => {
    const fetchPageData = async () => {
      if (page) return; // Already have data
      if (window.parent !== window && isReady) return; // Expect data via postMessage
      
      try {
        setIsLoading(true);
        const pageData = await apiClient.getPageForEditor(params.pageId);
        const componentsData = await apiClient.getPageComponents(params.pageId);
        
        // Combine the data
        const fullPageData: Page = {
          ...pageData,
          components: componentsData
        };
        
        setPage(fullPageData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch page data:', err);
        if (err instanceof ApiError) {
          setError(`API Error (${err.status}): ${err.message}`);
          setStoreError(err);
        } else {
          setError('Failed to load page data');
          setStoreError(err as Error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPageData();
  }, [params.pageId, page, isReady, setPage, setStoreError, setIsLoading]);
  
  // Handle component prop updates (for two-way communication)
  const handleComponentUpdate = (instanceId: string, newProps: Record<string, any>) => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'COMPONENT_PROPS_UPDATE',
        payload: { instanceId, newPropsData: newProps }
      }, '*');
    }
  };
  
  // Render states
  if (error) {
    return <ErrorState message={error} />;
  }
  
  if (!page || isLoading) {
    return <LoadingState />;
  }
  
  if (!page.components || page.components.length === 0) {
    return <EmptyState />;
  }
  
  // Sort components by order_index
  const sortedComponents = [...page.components].sort(
    (a, b) => a.order_index - b.order_index
  );
  
  return (
    <div className="page-preview" onClick={() => window.parent !== window && window.parent.postMessage({ type: 'DESELECT_COMPONENT' }, '*')}>
      <div className="components-container" style={{ padding: '1rem' }}>
        {sortedComponents.map(instance => (
          <EditableComponentWrapper 
            key={instance.id} 
            instance={instance}
          />
        ))}
      </div>
    </div>
  );
}