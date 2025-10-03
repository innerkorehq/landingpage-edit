// Enhanced types based on OpenAPI schema

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  role: 'admin' | 'editor' | 'viewer';
}

export enum ComponentVariationType {
  DEFAULT = "default",
  VARIANT = "variant",
  THEME = "theme",
  SIZE = "size",
  STYLE = "style"
}

export enum Status {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED"
}

export enum Visibility {
  PUBLIC = "public",
  PRIVATE = "private"
}

export interface ComponentVariation {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string | null;
  variation_type: ComponentVariationType;
  props_schema: Record<string, any>;
  default_props: Record<string, any>;
  category?: string | null;
  tags: string[];
  json_schema: Record<string, any>;
  component_code: string;
  css_classes: string[];
  custom_css?: string | null;
  visibility: Visibility;
  status: Status;
  component_id: string;
  created_by: string;
}

export interface PageComponentInstance {
  id: string;
  created_at: string;
  updated_at: string;
  instance_name: string;
  props_data: Record<string, any>;
  order_index: number;
  container_id?: string | null;
  is_visible: boolean;
  conditional_logic?: Record<string, any> | null;
  page_id: string;
  component_variation_id: string;
  component_variation?: ComponentVariation; // For joined data
}

export interface Page {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  title?: string | null;
  description?: string | null;
  genai_prompt?: string | null;
  meta_keywords: string[];
  og_image?: string | null;
  is_homepage: boolean;
  is_404_page: boolean;
  status: Status;
  project_id: string;
  created_by: string;
  components?: PageComponentInstance[]; // For joined data
}

export interface EditorState {
  page: Page | null;
  selectedComponent: string | null;
  isSaving: boolean;
  error: string | null;
}