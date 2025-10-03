import React, { useCallback, useState, useEffect } from 'react';
import Modal from 'react-modal';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { toast } from 'react-hot-toast';
import { useEditorStore } from '@/stores/editorStore';

// Set app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

interface RJSFModalProps {
  isOpen: boolean;
  onClose: () => void;
  instanceId: string;
  initialData: Record<string, any>;
  schema: Record<string, any>;
  title: string;
}

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    borderRadius: '8px',
    padding: '20px'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000
  }
};

export const RJSFModal: React.FC<RJSFModalProps> = ({
  isOpen,
  onClose,
  instanceId,
  initialData,
  schema,
  title
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const updateComponentProps = useEditorStore((state) => state.updateComponentProps);
  
  // Reset form data when initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [initialData, isOpen]);

  const handleSubmit = useCallback(({ formData }) => {
    try {
      updateComponentProps(instanceId, formData);
      toast.success('Component updated successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to update component:', error);
      toast.error('Failed to update component properties');
    }
  }, [instanceId, updateComponentProps, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel={`Edit ${title}`}
    >
      <div className="rjsf-modal">
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <Form
          schema={schema}
          formData={formData}
          validator={validator}
          onChange={({ formData }) => setFormData(formData)}
          onSubmit={handleSubmit}
          onError={(errors) => console.error('Form validation errors:', errors)}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={handleCancel}
              style={{ 
                padding: '8px 16px',
                background: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer' 
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ 
                padding: '8px 16px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};