'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Page, PageComponentInstance } from '@/types';
import EditableComponentWrapper from '@/components/EditableComponentWrapper';
import RJSFModal from '@/components/RJSFModal';

interface PreviewPageProps {
  params: {
    pageId: string;
  };
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { apiClient } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Find the component being edited
  const editingComponent = editingComponentId && page?.components 
    ? page.components.find(c => c.id === editingComponentId)
    : null;

  // Load page data
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const pageData = await apiClient.getPageForEditor(params.pageId);
        setPage(pageData);
        
        // Inform parent window that the preview is ready
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
        }
      } catch (err) {
        console.error('Failed to load page:', err);
        setError('Failed to load page data. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [params.pageId, apiClient]);

  // Handle messages from parent window (editor)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PAGE_UPDATE' && event.data.payload) {
        setPage(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle editing a component
  const handleEditComponent = (instanceId: string) => {
    setEditingComponentId(instanceId);
    setIsModalOpen(true);
  };

  // Handle form submission from modal
  const handleFormSubmit = (formData: any) => {
    if (!editingComponentId) return;
    
    // Update component props locally
    if (page && page.components) {
      const updatedComponents = page.components.map(comp => 
        comp.id === editingComponentId 
          ? { ...comp, props_data: formData } 
          : comp
      );
      
      setPage(prev => prev ? { ...prev, components: updatedComponents } : null);
    }
    
    // Send update to parent window (editor)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ 
        type: 'COMPONENT_PROPS_UPDATE', 
        payload: { 
          instanceId: editingComponentId, 
          newPropsData: formData 
        } 
      }, '*');
    }
    
    setEditingComponentId(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading preview...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  if (!page || !page.components || page.components.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No Content Yet</h2>
        <p>This page has no components to preview.</p>
      </div>
    );
  }

  // Sort components by order_index
  const sortedComponents = [...page.components].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="preview-container">
      {/* Page title */}
      <header style={{ padding: '20px 0', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
        <h1>{page.title || page.name}</h1>
        {page.description && <p>{page.description}</p>}
      </header>

      {/* Components */}
      <main>
        {sortedComponents.map((instance) => (
          <EditableComponentWrapper
            key={instance.id}
            instance={instance}
            onEdit={handleEditComponent}
            isEditing={editingComponentId === instance.id}
          />
        ))}
      </main>

      {/* Edit modal */}
      {editingComponent && editingComponent.component_variation && (
        <RJSFModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingComponentId(null);
          }}
          onSubmit={handleFormSubmit}
          schema={editingComponent.component_variation.json_schema}
          formData={editingComponent.props_data}
          title={`Edit ${editingComponent.instance_name}`}
          componentName={editingComponent.component_variation.name}
        />
      )}
    </div>
  );
}