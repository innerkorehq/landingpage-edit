import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { EditorState, EditorActions, Page } from '@/types';

const initialState: EditorState = {
  page: null,
  selectedComponentId: null,
  isSaving: false,
  error: null,
  isModalOpen: false,
};

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set) => ({
    ...initialState,
    setPage: (page) => set({ page }),
    
    setSelectedComponentId: (id) => set({ selectedComponentId: id }),
    
    updateComponentProps: (instanceId, newPropsData) => {
      set((state) => {
        if (!state.page || !state.page.components) return;
        
        const component = state.page.components.find((c) => c.id === instanceId);
        if (component) {
          component.props_data = { ...component.props_data, ...newPropsData };
        }
      });
    },
    
    setIsSaving: (isSaving) => set({ isSaving }),
    
    setError: (error) => set({ error }),
    
    setIsModalOpen: (isOpen) => set({ isModalOpen }),
    
    reset: () => set(initialState),
  }))
);