import React from 'react';
import Modal from 'react-modal';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { ComponentVariation } from '@/types';

// Set app element for screen readers
if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

interface RJSFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  schema: Record<string, any>;
  formData: Record<string, any>;
  title: string;
  componentName: string;
}

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #eee',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
};

// Custom theme for RJSF
const theme = {
  tagName: 'div',
  widgets: {
    // Additional custom widgets could be added here
  },
  templates: {
    // Custom templates could be added here
  },
};

export function RJSFModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  schema, 
  formData, 
  title,
  componentName
}: RJSFModalProps) {
  const handleSubmit = ({ formData }: { formData: any }) => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel={`Edit ${componentName}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>

      <Form
        schema={schema}
        validator={validator}
        formData={formData}
        onSubmit={handleSubmit}
        liveValidate
        // @ts-ignore - The theme type isn't properly recognized
        uiSchema={{
          'ui:submitButtonOptions': {
            props: {
              className: 'submit-button',
            },
            submitText: 'Save Changes',
          },
        }}
      />
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button 
          onClick={onClose}
          style={{ 
            padding: '8px 16px', 
            background: '#f0f0f0', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export default RJSFModal;