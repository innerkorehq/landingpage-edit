import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Page, PageComponentInstance } from '@/types';
import { ApiError } from '@/lib/apiClient';

type EditorState = {
  page: Page | null;
  selectedComponentId: string | null;
  isSaving: boolean;
  isLoading: boolean;
  error: {
    message: string;
    code?: number;
    critical: boolean;
  } | null;
};

type EditorActions = {
  setPage: (page: Page) => void;
  selectComponent: (componentId: string | null) => void;
  updateComponentProps: (instanceId: string, newPropsData: Record<string, any>) => void;
  reorderComponents: (orderedComponentIds: string[]) => void;
  setIsSaving: (isSaving: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | ApiError | string | null) => void;
  reset: () => void;
};

const initialState: EditorState = {
  page: null,
  selectedComponentId: null,
  isSaving: false,
  isLoading: false,
  error: null,
};

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set) => ({
    ...initialState,
    setPage: (page) => set({ page }),
    selectComponent: (componentId) => set({ selectedComponentId: componentId }),
    updateComponentProps: (instanceId, newPropsData) => {
      set((state) => {
        if (!state.page?.components) return;
        
        const component = state.page.components.find((c) => c.id === instanceId);
        if (component) {
          // Create a clean deep copy to avoid any potential mutation issues
          component.props_data = JSON.parse(JSON.stringify(newPropsData));
        }
      });
    },
    reorderComponents: (orderedComponentIds) => {
      set((state) => {
        if (!state.page?.components) return;
        
        // Create a mapping from ID to index
        const newOrderMap = new Map(
          orderedComponentIds.map((id, index) => [id, index])
        );
        
        // Update the order_index for each component
        state.page.components.forEach((component) => {
          const newIndex = newOrderMap.get(component.id);
          if (newIndex !== undefined) {
            component.order_index = newIndex;
          }
        });
      });
    },
    setIsSaving: (isSaving) => set({ isSaving }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => {
      if (!error) {
        set({ error: null });
        return;
      }
      
      // Handle different error types
      if (error instanceof ApiError) {
        set({ 
          error: {
            message: error.message,
            code: error.status,
            critical: error.status >= 500 // Server errors are critical
          } 
        });
      } else if (error instanceof Error) {
        set({
          error: {
            message: error.message,
            critical: true // Unknown errors are critical
          }
        });
      } else {
        // String error
        set({
          error: {
            message: error,
            critical: false // String errors are typically warnings
          }
        });
      }
    },
    reset: () => set(initialState),
  }))
);