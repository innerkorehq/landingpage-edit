/**
 * Centralized TypeScript definitions for the component editor
 */

// Base entity interface with common fields
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Component Variation model
export interface ComponentVariation extends BaseEntity {
  name: string;
  description?: string | null;
  variation_type: 'default' | 'variant' | 'theme' | 'size' | 'style';
  props_schema: Record<string, any>;
  default_props: Record<string, any>;
  category?: string | null;
  tags: string[];
  json_schema: Record<string, any>;
  component_code: string;
  css_classes: string[];
  custom_css?: string | null;
  visibility: 'public' | 'private';
  status: 'DRAFT' | 'PUBLISHED';
  component_id: string;
  created_by: string;
}

// Page Component Instance model
export interface PageComponentInstance extends BaseEntity {
  instance_name: string;
  props_data: Record<string, any>;
  order_index: number;
  container_id?: string | null;
  is_visible: boolean;
  conditional_logic?: Record<string, any> | null;
  page_id: string;
  component_variation_id: string;
  component_variation?: ComponentVariation;
}

// Page model
export interface Page extends BaseEntity {
  name: string;
  slug: string;
  title?: string | null;
  description?: string | null;
  genai_prompt?: string | null;
  meta_keywords: string[];
  og_image?: string | null;
  is_homepage: boolean;
  is_404_page: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  project_id: string;
  created_by: string;
  components?: PageComponentInstance[];
}

// API Error model
export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

// API Response model
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Component update input model
export interface ComponentPropsUpdate {
  instanceId: string;
  newPropsData: Record<string, any>;
}

// Editor state
export interface EditorState {
  page: Page | null;
  selectedComponentId: string | null;
  isSaving: boolean;
  error: string | null;
  isModalOpen: boolean;
}

// Editor actions
export interface EditorActions {
  setPage: (page: Page) => void;
  setSelectedComponentId: (id: string | null) => void;
  updateComponentProps: (instanceId: string, newPropsData: Record<string, any>) => void;
  setIsSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  reset: () => void;
}