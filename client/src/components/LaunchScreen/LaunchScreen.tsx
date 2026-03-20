import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { getSupabase } from '@promptscape/core/utils/supabaseClient';
import { AuthModal } from '../AuthModal';
import { PromptDissector } from './PromptDissector';
import { PromptDissectorErrorBoundary } from './PromptDissectorErrorBoundary';
import { ApiLLMService } from '@promptscape/core/services/ApiLLMService';
import type { PromptAnalysis } from '../../lib/simplePromptParser';
import type { Node, Edge } from 'reactflow';
import './LaunchScreen.css';

export type LaunchPayload =
  | { kind: 'analysis'; analysis: PromptAnalysis }
  | { kind: 'template'; graph: { nodes: Node[]; edges: Edge[] } }
  | { kind: 'empty' }
  | { kind: 'tutorial' };

interface LaunchScreenProps {
  onLaunch: (payload: LaunchPayload) => void;
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onLaunch }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [promptText, setPromptText] = useState('');
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llmGraph, setLlmGraph] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Supabase auth session
  useEffect(() => {
    let unsub: { subscription: { unsubscribe: () => void } } | null = null;
    (async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      setAuthEmail(data.session?.user?.email ?? null);
      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthEmail(session?.user?.email ?? null);
      });
      unsub = listener.data as { subscription: { unsubscribe: () => void } };
    })();
    return () => {
      unsub?.subscription?.unsubscribe();
    };
  }, []);

  const hasSupabase = useMemo(() => Boolean(getSupabase()), []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const handlePromptChange = useCallback((text: string) => {
    const trimmed = text.trim();
    setPromptText(text);
    if (trimmed.length === 0) {
      setAnalysis(null);
      setIsAnalyzing(false);
    }
  }, []);

  const handleAnalysisComplete = useCallback((newAnalysis: PromptAnalysis) => {
    setAnalysis(newAnalysis);
    setIsAnalyzing(false);
  }, []);

  const handleLaunchEditor = useCallback(() => {
    if (llmGraph) {
      onLaunch({ kind: 'template', graph: llmGraph });
    } else if (analysis) {
      onLaunch({ kind: 'analysis', analysis: { ...analysis, imageUrl: imageUrl ?? undefined } });
    } else {
      onLaunch({ kind: 'empty' });
    }
  }, [analysis, imageUrl, llmGraph, onLaunch]);

  const handleContinueToReview = useCallback(async () => {
    if (imageUrl) {
      setIsAnalyzing(true);
      try {
        const llmService = new ApiLLMService({});
        const response = await llmService.draftGraphFromPrompt({
          prompt: promptText.trim() || 'Describe this image and create a graph',
          mode: 'draft',
          imageUrl: imageUrl,
          options: { maxNewNodes: 10 }
        });
        
        if (response.ok && response.operations?.[0]?.kind === 'insertNodes') {
          const { nodes, edges } = response.operations[0];
          
          // Apply native auto-layout to prevent overlapping nodes
          const incomingEdgeCounts = new Map<string, number>();
          (nodes as Node[]).forEach(n => incomingEdgeCounts.set(n.id, 0));
          (edges as Edge[]).forEach(e => {
            incomingEdgeCounts.set(e.target, (incomingEdgeCounts.get(e.target) || 0) + 1);
          });
          
          const levels = new Map<string, number>();
          const queue: {id: string, level: number}[] = [];
          
          (nodes as Node[]).forEach(n => {
            if (incomingEdgeCounts.get(n.id) === 0) queue.push({id: n.id, level: 0});
          });

          if (queue.length === 0 && nodes.length > 0) queue.push({id: nodes[0].id, level: 0});

          while (queue.length > 0) {
            const {id, level} = queue.shift()!;
            if (!levels.has(id)) {
              levels.set(id, level);
              const outgoingEdges = (edges as Edge[]).filter(e => e.source === id);
              outgoingEdges.forEach(e => queue.push({id: e.target, level: level + 1}));
            }
          }

          const levelBuckets: Record<number, Node[]> = {};
          (nodes as Node[]).forEach(n => {
            const level = levels.get(n.id) || 0;
            if (!levelBuckets[level]) levelBuckets[level] = [];
            levelBuckets[level].push(n);
          });

          const X_SPACING = 350;
          const Y_SPACING = 200;
          
          const positionedNodes = (nodes as Node[]).map(n => {
            const level = levels.get(n.id) || 0;
            const bucket = levelBuckets[level];
            const index = bucket.findIndex(b => b.id === n.id);
            const totalHeight = (bucket.length - 1) * Y_SPACING;
            const startY = -totalHeight / 2;
            return {
              ...n,
              position: {
                x: 100 + level * X_SPACING,
                y: 300 + startY + (index * Y_SPACING) 
              }
            };
          });

          setLlmGraph({ nodes: positionedNodes, edges: edges as Edge[] });
        }
      } catch (e) {
        console.error('Failed to generate graph from image:', e);
      } finally {
        setIsAnalyzing(false);
        setStep(2);
      }
    } else {
      setStep(2);
    }
  }, [imageUrl, promptText]);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="bg-background text-text font-body antialiased min-h-screen relative flex flex-col">
      <div className="fixed inset-0 bg-dot-grid opacity-70 pointer-events-none z-0"></div>
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/10 px-6 py-1 bg-black/40">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="text-white text-[1rem] font-display font-bold tracking-tight uppercase leading-none">
            Prompt Spaghetti
            <span className="text-[8px] font-mono text-muted ml-2 tracking-[0.22em] uppercase align-middle">Beta</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {hasSupabase ? (
            authEmail ? (
              <button className="border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[11px] uppercase text-muted hover:text-white" onClick={signOut}>
                Sign out ({authEmail})
              </button>
            ) : (
              <button className="border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-[11px] uppercase text-primary hover:bg-primary/20" onClick={() => setIsAuthModalOpen(true)}>
                Sign in
              </button>
            )
          ) : null}
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 flex min-h-[calc(100vh-44px)] flex-1">
        
        {/* Simplified Sidebar */}
        <aside className="bg-surface w-14 border-r border-white/10 flex flex-col items-center gap-4 py-4 z-20 shadow-panel">
           <div className="relative rounded p-2 text-primary hover:bg-primary/10 cursor-pointer" title="Text Block">
             <span className="material-symbols-outlined block text-[20px]">description</span>
           </div>
           <div className="relative rounded p-2 text-primary hover:bg-primary/10 cursor-pointer" title="Weighted Choice">
             <span className="material-symbols-outlined block text-[20px]">balance</span>
           </div>
           <div className="relative rounded p-2 text-primary hover:bg-primary/10 cursor-pointer" title="Concatenate">
             <span className="material-symbols-outlined block text-[20px]">merge</span>
           </div>
        </aside>

        {/* Content Area */}
        <main className="relative flex-1 px-6 py-5 overflow-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-[#06070A33] to-[#06070A7A] z-0"></div>
          
          <div className="relative z-10 mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-84px)] max-w-[1520px]">
            <div className="flex w-full max-w-[1480px] items-start justify-center gap-6 flex-col lg:flex-row">
              
              {/* STEP 1 PANEL */}
              <div className={`min-w-0 flex-1 transition-opacity duration-300 ${step === 2 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted border border-white/10 bg-white/5">
                    <span className="text-primary">Step 1</span>
                    <span>Enter prompt / image</span>
                  </div>
                </div>

                <div className="bg-[#0F1319F5] border border-white/10 shadow-panel rounded-[10px] relative overflow-hidden text-left">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                    <div>
                      <div className="font-display text-[29px] font-bold leading-none text-primary">PROMPT WIZARD</div>
                      <p className="mt-3 max-w-[52ch] text-[13px] leading-[1.55] text-muted">Enter a prompt below. Add an image if you want one. This is the first screen in the launch flow.</p>
                    </div>
                  </div>

                  <section className="p-5">
                     <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="group transition-all">
                          <label className="mb-3 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Prompt</label>
                          <div className="border border-white/10 bg-black/20 focus-within:border-primary/40 p-1">
                            <div className="min-h-[208px] text-[14px] text-white">
                              <PromptDissectorErrorBoundary>
                                <PromptDissector
                                  value={promptText}
                                  onChange={handlePromptChange}
                                  onAnalysisComplete={handleAnalysisComplete}
                                  onAnalysisStart={() => setIsAnalyzing(true)}
                                  selectedNodeId={null}
                                  onSelectNode={() => {}}
                                  focusOnValueChange
                                  placeholder="Type or paste an archetype prompt..."
                                />
                              </PromptDissectorErrorBoundary>
                            </div>
                          </div>
                          <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                            <span className="border border-white/10 bg-white/[0.03] px-2 py-1">Cmd+Enter analyze</span>
                          </div>
                        </div>

                        <div className="transition-all">
                          <div className="mb-3 flex items-center justify-between">
                            <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Image</label>
                            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Optional</span>
                          </div>
                          
                          <div 
                            className="bg-[#141922E0] border border-dashed border-white/10 flex min-h-[152px] flex-col items-center justify-center px-5 text-center relative overflow-hidden"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleImageDrop}
                          >
                            {imageUrl ? (
                              <img src={imageUrl} alt="Uploaded preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                            ) : null}
                            <span className="material-symbols-outlined text-[40px] text-primary/80 z-10 relative">add_photo_alternate</span>
                            <div className="mt-3 text-[16px] font-medium text-white z-10 relative">
                              {imageUrl ? 'Image uploaded' : 'Drop image or browse'}
                            </div>
                            <label className="mt-5 border border-white/10 bg-black/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white hover:border-primary/30 hover:text-primary cursor-pointer z-10 relative">
                              Browse files
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                            </label>
                          </div>
                        </div>
                     </div>

                     <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Step 1 of 2</div>
                        <button 
                          className="flex h-11 items-center justify-center gap-2 border border-primary/30 bg-primary px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-black shadow-glow hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleContinueToReview}
                          disabled={(!analysis && !imageUrl) || isAnalyzing}
                        >
                          {isAnalyzing ? 'Analyzing Image...' : 'Continue to review'}
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                      </div>
                  </section>
                </div>
              </div>

              {/* ARROW INDICATOR */}
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 lg:flex mt-32">
                <span className="material-symbols-outlined text-primary">east</span>
              </div>

              {/* STEP 2 PANEL */}
              <div className={`min-w-0 flex-1 transition-opacity duration-300 ${step === 1 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted border border-white/10 bg-white/5">
                    <span className="text-primary">Step 2</span>
                    <span>Review before main screen</span>
                  </div>
                </div>

                <div className="bg-[#0F1319F5] border border-white/10 shadow-panel rounded-[10px] relative overflow-hidden text-left">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                    <div>
                      <div className="font-display text-[29px] font-bold leading-none text-primary">REVIEW LAUNCH</div>
                      <p className="mt-3 max-w-[48ch] text-[13px] leading-[1.55] text-muted">Review the graph breakdown, then open the main workspace.</p>
                    </div>
                  </div>

                  <section className="p-4">
                    <div className="mb-4">
                      <div className="bg-[#141922E0] px-4 py-3 border border-white/10">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Graph breakdown</div>
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{llmGraph ? llmGraph.nodes.length : analysis?.nodes?.length || 0} nodes</div>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="border border-white/10 bg-white/5 px-3 py-2.5">
                            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">01</div>
                            <div className="mt-1 text-[13px] text-white">Source prompt</div>
                            <div className="mt-1 text-[12px] leading-[1.4] text-muted">{imageUrl ? 'Image analyzed successfully.' : 'Primary text block with the initial concept string.'}</div>
                          </div>
                          <div className="border border-white/10 bg-white/5 px-3 py-2.5">
                            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">02</div>
                            <div className="mt-1 text-[13px] text-white">Trait splits</div>
                            <div className="mt-1 text-[12px] leading-[1.4] text-muted">{llmGraph ? 'Nodes generated by AI agent.' : 'Choice nodes extracted from prompt variations.'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-white/10 pt-3.5">
                      <button 
                        className="flex h-11 items-center justify-center border border-white/20 bg-transparent px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-white hover:bg-white/10"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                      <button 
                        className="flex h-11 items-center justify-center gap-2 border border-primary/30 bg-primary px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-black shadow-glow hover:bg-white"
                        onClick={handleLaunchEditor}
                      >
                        Open main screen
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
            
            <div className="mt-10 font-mono text-[12px] uppercase text-muted tracking-widest cursor-pointer hover:text-white" onClick={() => onLaunch({kind: 'empty'})}>
               Skip to Editor &rarr;
            </div>

          </div>
        </main>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
