import React, { useState } from 'react';
import { DynamicComponent } from '@/components/DynamicComponent';
import { PageComponentInstance } from '@/types';

interface EditableComponentWrapperProps {
  instance: PageComponentInstance;
  onEdit: (instanceId: string) => void;
  isEditing: boolean;
}

export function EditableComponentWrapper({ instance, onEdit, isEditing }: EditableComponentWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!instance.component_variation) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fff1f0', border: '1px dashed #ff7875', color: '#cf1322', borderRadius: '4px' }}>
        <strong>Error:</strong> Component variation not found for this instance.
      </div>
    );
  }
  
  const componentCode = instance.component_variation.component_code;
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        border: isHovered || isEditing ? '2px dashed #1890ff' : '2px solid transparent',
        padding: '4px',
        borderRadius: '4px',
        transition: 'border-color 0.3s',
        marginBottom: '10px',
      }}
    >
      {(isHovered || isEditing) && (
        <div style={{
          position: 'absolute',
          top: '-25px',
          right: '0',
          backgroundColor: '#1890ff',
          color: 'white',
          padding: '2px 8px',
          fontSize: '12px',
          borderRadius: '4px 4px 0 0',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>{instance.instance_name}</span>
          <button 
            onClick={() => onEdit(instance.id)}
            style={{
              background: 'white',
              color: '#1890ff',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '11px',
              padding: '1px 5px',
              marginLeft: '5px'
            }}
          >
            {isEditing ? 'Editing...' : 'Edit'}
          </button>
        </div>
      )}
      
      <DynamicComponent 
        code={componentCode} 
        componentProps={instance.props_data} 
        onRenderError={(error) => console.error(`Error rendering ${instance.instance_name}:`, error)}
      />
    </div>
  );
}

// Make sure we export properly
export default EditableComponentWrapper;