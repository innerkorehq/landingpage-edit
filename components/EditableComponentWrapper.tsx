import React, { useState, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { RJSFModal } from '@/components/RJSFModal';
import { DynamicComponent } from '@/components/DynamicComponent';
import { PageComponentInstance } from '@/types';

interface EditableComponentWrapperProps {
  instance: PageComponentInstance;
}

export const EditableComponentWrapper: React.FC<EditableComponentWrapperProps> = ({ 
  instance 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const selectedComponentId = useEditorStore((state) => state.selectedComponentId);
  const selectComponent = useEditorStore((state) => state.selectComponent);
  
  const isSelected = selectedComponentId === instance.id;
  
  // Ensure we have component_variation data
  if (!instance.component_variation) {
    return (
      <div style={{ 
        padding: '1rem',
        border: '1px dashed #f00',
        borderRadius: '4px',
        margin: '0.5rem',
        backgroundColor: '#fff5f5'
      }}>
        Missing component variation data for: {instance.instance_name}
      </div>
    );
  }
  
  const handleComponentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(instance.id);
  }, [instance.id, selectComponent]);
  
  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  }, []);
  
  const handleComponentError = useCallback((error: Error) => {
    console.error(`Error in component ${instance.instance_name}:`, error);
    setHasError(true);
  }, [instance.instance_name]);

  return (
    <div 
      onClick={handleComponentClick}
      style={{
        position: 'relative',
        padding: '0.5rem',
        margin: '0.5rem 0',
        border: `2px ${isSelected ? 'solid' : 'dashed'} ${isSelected ? '#0070f3' : '#ccc'}`,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: isSelected ? 'rgba(0, 112, 243, 0.05)' : 'transparent'
      }}
      data-component-id={instance.id}
      data-component-name={instance.instance_name}
    >
      {/* Component controls */}
      <div style={{
        position: 'absolute',
        top: '-12px',
        right: '10px',
        display: 'flex',
        gap: '5px',
        zIndex: 2
      }}>
        <button
          onClick={handleEditClick}
          style={{
            fontSize: '12px',
            padding: '2px 8px',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Edit
        </button>
      </div>
      
      {/* Component label */}
      <div style={{
        position: 'absolute',
        top: '-12px',
        left: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        background: '#fff',
        padding: '0 5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        zIndex: 2
      }}>
        {instance.instance_name}
      </div>
      
      {/* The actual component */}
      <div style={{ opacity: hasError ? 0.5 : 1 }}>
        <DynamicComponent
          code={instance.component_variation.component_code}
          props={instance.props_data}
          onError={handleComponentError}
        />
      </div>
      
      {/* Edit modal */}
      <RJSFModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        instanceId={instance.id}
        initialData={instance.props_data}
        schema={instance.component_variation.json_schema}
        title={`Edit ${instance.instance_name}`}
      />
    </div>
  );
};