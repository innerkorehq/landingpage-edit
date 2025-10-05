'use client';

import React, { useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEditorStore } from '@/stores/editorStore';
import { ApiError } from '@/lib/apiClient';
import { Button } from '@/components/ui';

interface EditorPageProps {
  params: {
    projectId: string;
    pageId: string;
  };
}

function EditorFatalErrorFallback({ error }: { error: Error }) {
  // This is a non-recoverable error
  return (
    <div role="alert" style={{ color: '#ff3333', backgroundColor: '#2a0000', padding: '20px', margin: '1rem', border: '1px solid red', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>A Fatal Error Occurred</h2>
      <p>The editor cannot continue. This is likely due to an API or configuration problem.</p>
      <p><strong>Error:</strong> {error.message}</p>
      {'status' in error && <p><strong>Status:</strong> {(error as ApiError).status}</p>}
      <p>Please check the browser console and network tab, verify the API is running, and then refresh the page.</p>
    </div>
  );
}

function EditorHeader() {
  const { apiClient } = useAuth();
  const { page, isSaving, setIsSaving } = useEditorStore();

  const handleSave = async () => {
    if (!page?.components) {
      toast.error("No components to save.");
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading('Saving all changes...');

    const updatePromises = page.components.map(instance =>
      apiClient.updatePageComponentProps(instance.id, instance.props_data)
        .catch(err => ({ error: err, instanceId: instance.id }))
    );
    
    const results = await Promise.all(updatePromises);
    const failedUpdates = results.filter(res => res && 'error' in res) as Array<{ error: Error, instanceId: string }>;

    if (failedUpdates.length > 0) {
      const errorMessages = failedUpdates.map(f => `Component ${f.instanceId.substring(0, 8)}: ${f.error.message}`).join('\n');
      toast.error(`Failed to save ${failedUpdates.length} component(s):\n${errorMessages}`, { id: toastId, duration: 6000 });
    } else {
      toast.success('All changes saved successfully!', { id: toastId });
    }
    setIsSaving(false);
  };

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
      <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Editing: {page?.name || '...'}</h1>
      <Button 
        onClick={handleSave} 
        disabled={isSaving} 
        variant="primary"
      >
        {isSaving ? 'Saving...' : 'Save All Changes'}
      </Button>
    </header>
  );
}

export default function EditorPage({ params }: EditorPageProps) {
  const { apiClient } = useAuth();
  const { page, setPage, updateComponentProps, error, setError, reset } = useEditorStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isIframeReady = useRef(false);

  // Reset store on component unmount
  useEffect(() => () => reset(), [reset]);

  // Fetch initial page data
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const data = await apiClient.getPageForEditor(params.pageId);
        setPage(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading page';
        setError(errorMessage);
        console.error('Error fetching page:', err);
      }
    };

    fetchPageData();
  }, [params.pageId, setPage, setError, apiClient]);
  
  // Communication with iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow || event.source !== iframeWindow) return;

      if (event.data.type === 'PREVIEW_READY') {
        isIframeReady.current = true;
        if (page) {
          iframeWindow.postMessage({ type: 'PAGE_UPDATE', payload: page }, '*');
        }
      }

      if (event.data.type === 'COMPONENT_PROPS_UPDATE') {
        const { instanceId, newPropsData } = event.data.payload;
        updateComponentProps(instanceId, newPropsData);
        toast.success('Component updated!', { position: 'bottom-right', duration: 1500 });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [page, updateComponentProps]);

  // Push state to iframe whenever it changes
  useEffect(() => {
    if (page && isIframeReady.current && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'PAGE_UPDATE', payload: page }, '*');
    }
  }, [page]);
  
  if (error) {
    return <EditorFatalErrorFallback error={new Error(error)} />;
  }

  if (!page) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading Editor...</h2>
          <p>Please wait while we prepare your editing experience.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={EditorFatalErrorFallback}>
      <Toaster position="top-center" reverseOrder={false} />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f2f5' }}>
        <EditorHeader />
        <iframe
          ref={iframeRef}
          src={`/preview/${params.pageId}`}
          style={{ flex: 1, border: 'none', width: '100%', background: 'white' }}
          title="Live Preview"
        />
      </div>
    </ErrorBoundary>
  );
}