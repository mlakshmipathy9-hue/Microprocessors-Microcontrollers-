import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Slide, QuizQuestion } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle, HelpCircle, GraduationCap, RefreshCw, Layers, PanelLeftClose, PanelLeftOpen, Sparkles, BookOpen, X, ZoomIn } from 'lucide-react';

// Import simulators
import EvolutionTimeline from './EvolutionTimeline';
import PinConfigurationSimulator from './PinConfigurationSimulator';
import ArchitectureExplorer from './ArchitectureExplorer';
import FlagRegisterSimulator from './FlagRegisterSimulator';
import MemoryCalculationSimulator from './MemoryCalculationSimulator';
import InterruptVectorTableSimulator from './InterruptVectorTableSimulator';
import IntroInterruptsSimulator from './IntroInterruptsSimulator';
import TimingDiagramSimulator from './TimingDiagramSimulator';
import PipeliningSimulator from './PipeliningSimulator';
import OperatingModeSimulator from './OperatingModeSimulator';
import MinimumModeHardwareSimulator from './MinimumModeHardwareSimulator';

// Unit II Simulators
import DevPipelineSimulator from './DevPipelineSimulator';
import AddressingModesSimulator from './AddressingModesSimulator';
import InstructionDecoderSimulator from './InstructionDecoderSimulator';
import DirectiveSandboxSimulator from './DirectiveSandboxSimulator';
import AssemblerPlaygroundSimulator from './AssemblerPlaygroundSimulator';
import AssemblerPassSimulator from './AssemblerPassSimulator';
import AssemblerOutputsSimulator from './AssemblerOutputsSimulator';

interface SlidePresenterProps {
  slide: Slide;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  onMarkComplete: (slideId: string) => void;
  completedSlides: string[];
  revealedPointsCount: number;
  incrementalRevealEnabled: boolean;
  projectorMode?: boolean;
  showInteractive?: boolean;
  activeLabId?: string;
}

export default function SlidePresenter({
  slide,
  onNext,
  onPrev,
  isFirst,
  isLast,
  onMarkComplete,
  completedSlides,
  revealedPointsCount,
  incrementalRevealEnabled,
  projectorMode = false,
  showInteractive = false,
  activeLabId
}: SlidePresenterProps) {
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  // Reset quiz states when changing slides
  useEffect(() => {
    setSelectedAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuestionIdx(0);
    setSidebarCollapsed(true);
    setIsExplanationOpen(false);
  }, [slide.id]);

  // Magnifier States
  const [magnifier, setMagnifier] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [magnifierModeEnabled, setMagnifierModeEnabled] = useState(false);
  const longPressTimeoutRef = useRef<any>(null);
  const isMovingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const bentoCardRef = useRef<HTMLDivElement>(null);

  const lensSize = 180;
  const zoomFactor = 2.2;

  // Reset magnifier when slide changes
  useEffect(() => {
    setMagnifier({ x: 0, y: 0, active: false });
    setMagnifierModeEnabled(false);
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, [slide.id]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!slide.interactiveType || slide.interactiveType === 'quiz') return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const card = bentoCardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    startPosRef.current = { x, y };
    isMovingRef.current = false;

    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);

    longPressTimeoutRef.current = setTimeout(() => {
      if (!isMovingRef.current) {
        setMagnifier({ x, y, active: true });
        if (navigator.vibrate) {
          try {
            navigator.vibrate(40);
          } catch (err) {
            // Safe fallback
          }
        }
      }
    }, 450); // 450ms long hold
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!slide.interactiveType || slide.interactiveType === 'quiz') return;

    const card = bentoCardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - startPosRef.current.x;
    const dy = y - startPosRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 12) {
      isMovingRef.current = true;
      if (!magnifier.active) {
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
        }
      }
    }

    if (magnifier.active || magnifierModeEnabled) {
      setMagnifier({
        x: Math.max(0, Math.min(rect.width, x)),
        y: Math.max(0, Math.min(rect.height, y)),
        active: true
      });
    }
  };

  const handlePointerUpOrLeave = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    if (!magnifierModeEnabled) {
      setMagnifier(prev => ({ ...prev, active: false }));
    }
  };

  const handleSelectAnswer = (qIdx: number, oIdx: number, correctIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined && selectedAnswers[qIdx] !== null) return; // already answered
    
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: oIdx
    }));

    if (oIdx === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  const getQuizButtonColor = (qIdx: number, oIdx: number, correctIdx: number) => {
    const selectedIdx = selectedAnswers[qIdx];
    if (selectedIdx === undefined || selectedIdx === null) {
      return 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white hover:border-slate-300 shadow-xs';
    }

    if (oIdx === correctIdx) {
      return 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'; // correct option
    }

    if (selectedIdx === oIdx) {
      return 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'; // user selected wrong option
    }

    return 'opacity-40 border-slate-100 text-slate-400 bg-slate-50/50'; // rest
  };

  // Automatically mark standard slides complete upon reaching them
  useEffect(() => {
    if (slide.interactiveType !== 'quiz') {
      onMarkComplete(slide.id);
    } else if (quizFinished) {
      onMarkComplete(slide.id);
    }
  }, [slide.id, quizFinished, onMarkComplete, slide.interactiveType]);

  const handleFinishQuiz = () => {
    setQuizFinished(true);
    onMarkComplete(slide.id);
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuestionIdx(0);
  };

  // Render the appropriate interactive simulator based on type
  const renderInteractive = (type: string) => {
    switch (type) {
      case 'evolution':
        return <EvolutionTimeline defaultTab={slide.id === 'm1-s3' ? 'vs' : 'timeline'} />;
      case 'pins':
        return <PinConfigurationSimulator />;
      case 'architecture':
        return <ArchitectureExplorer />;
      case 'flags':
        return <FlagRegisterSimulator />;
      case 'memory-calc':
        return <MemoryCalculationSimulator />;
      case 'intro-interrupts':
        return <IntroInterruptsSimulator />;
      case 'interrupts':
        return <InterruptVectorTableSimulator />;
      case 'timing':
        return <TimingDiagramSimulator />;
      case 'pipelining':
        return <PipeliningSimulator />;
      case 'modes':
        return <OperatingModeSimulator />;
      case 'min-mode-hardware':
        return <MinimumModeHardwareSimulator />;
      case 'dev-pipeline':
        return <DevPipelineSimulator />;
      case 'addressing-modes':
        return <AddressingModesSimulator />;
      case 'instruction-decoder':
        return <InstructionDecoderSimulator />;
      case 'directive-sandbox':
        return <DirectiveSandboxSimulator initialLabId={activeLabId} />;
      case 'assembler-playground':
        return <AssemblerPlaygroundSimulator />;
      case 'assembler-passes':
        return <AssemblerPassSimulator />;
      case 'assembler-outputs':
        return <AssemblerOutputsSimulator />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full bg-transparent p-4 md:p-6 overflow-hidden relative">
      {/* Slide Content Arena */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        {/* Core Slide body */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0 items-stretch overflow-y-auto xl:overflow-hidden pr-1 scrollbar-thin">
            {/* Text points (Standard Presentation Layout in a Bento Box) */}
            {!slide.interactiveType && (
              <div className="w-full max-w-full bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-md hover:border-indigo-150 transition-all duration-300 flex flex-col justify-between xl:col-span-12 overflow-hidden">
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase">
                        <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                        {slide.moduleTitle || 'Academic Courseware'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-50 border border-slate-200 text-slate-500 shadow-2xs">
                        Slide ID: {slide.id}
                      </span>
                    </div>
                    <motion.h2
                      key={slide.title}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-display text-2xl md:text-3.5xl font-extrabold text-slate-900 tracking-tight leading-tight"
                    >
                      {slide.title}
                    </motion.h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full mt-3 shadow-sm"></div>
                  </div>

                  {/* Standard points with large, high-contrast, projector-friendly text (>= 12px) */}
                  {slide.points && (
                    slide.id === 'm2-s1' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-2">
                        {/* Left Column: BIU */}
                        <div className="flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                              <h3 className="font-display text-lg md:text-xl font-bold text-slate-900 tracking-tight uppercase">
                                Bus Interface Unit (BIU)
                              </h3>
                            </div>
                            
                            <div className="space-y-3.5 pl-4">
                              {[
                                'Fetches instructions from memory',
                                'Generates physical addresses',
                                'Reads and writes memory',
                                'Stores fetched instruction bytes in the 6-byte prefetch queue',
                                'Handles bus operations'
                              ].map((pt, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                                  className="flex gap-3 items-start group hover:translate-x-1 transition-transform duration-200 cursor-default"
                                >
                                  <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                                  </div>
                                  <p className="text-slate-700 text-[15px] font-medium leading-relaxed">
                                    {pt}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Analogy Block */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all duration-300">
                            <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider mb-1">
                              Analogy
                            </p>
                            <p className="text-slate-600 text-[14.5px] italic leading-relaxed">
                              "Think of the BIU as a delivery person who brings instructions and data from memory."
                            </p>
                          </div>
                        </div>

                        {/* Right Column: EU */}
                        <div className="flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                              <h3 className="font-display text-lg md:text-xl font-bold text-slate-900 tracking-tight uppercase">
                                Execution Unit (EU)
                              </h3>
                            </div>

                            <div className="space-y-3.5 pl-4">
                              {[
                                'Takes instruction bytes from the prefetch queue',
                                'Decodes instructions',
                                'Executes instructions',
                                'Performs arithmetic and logic operations',
                                'Updates registers and flags'
                              ].map((pt, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                                  className="flex gap-3 items-start group hover:translate-x-1 transition-transform duration-200 cursor-default"
                                >
                                  <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                                  </div>
                                  <p className="text-slate-700 text-[15px] font-medium leading-relaxed">
                                    {pt}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Analogy Block */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all duration-300">
                            <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider mb-1">
                              Analogy
                            </p>
                            <p className="text-slate-600 text-[14.5px] italic leading-relaxed">
                              "Think of the EU as the worker who understands and performs the instructions."
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pr-1">
                        {slide.points.map((pt, idx) => {
                          const isRevealed = !incrementalRevealEnabled || idx < revealedPointsCount;
                          if (!isRevealed) return null;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: idx * 0.04 }}
                              className="flex gap-3.5 p-4 rounded-2xl bg-slate-50/40 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 group items-start cursor-default"
                            >
                              <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                              </div>
                              <p className="text-slate-800 text-base md:text-[16px] font-medium leading-relaxed text-justify flex-1 pt-0.5">
                                {pt}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>


              </div>
            )}

            {/* Right side: Interactive component or Quiz in Bento card container */}
            {slide.interactiveType && (
              <div 
                id="interactive-bento-card"
                className="min-h-0 flex flex-col transition-all duration-300 text-slate-900 w-full max-w-full max-h-[82vh] xl:max-h-[85vh] overflow-y-auto relative xl:col-span-12"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.interactiveType}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-h-0"
                  >
                    {slide.interactiveType === 'quiz' ? (
                      /* QUIZ UI */
                      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6 space-y-6 overflow-y-auto h-full max-h-[520px]">
                        {!quizFinished ? (
                          <div className="space-y-6 flex flex-col justify-between h-full min-h-[350px]">
                            <div>
                              {/* Question Progress Tracker */}
                              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                                <span className="text-[13px] font-mono text-slate-700 font-semibold">
                                  Question <strong className="text-indigo-700 font-extrabold">{currentQuestionIdx + 1}</strong> of {slide.quizQuestions?.length || 0}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {slide.quizQuestions?.map((_, idx) => {
                                    const isCurrent = idx === currentQuestionIdx;
                                    const isAnswered = selectedAnswers[idx] !== undefined;
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIdx(idx)}
                                        className={`w-6 h-1.5 rounded-full transition-all cursor-pointer ${
                                          isCurrent
                                            ? 'bg-indigo-700'
                                            : isAnswered
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-slate-200 hover:bg-slate-300'
                                        }`}
                                        title={`Go to Question ${idx + 1}`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Question and Options Area */}
                              {slide.quizQuestions && slide.quizQuestions[currentQuestionIdx] && (
                                <div className="space-y-4">
                                  {slide.quizQuestions[currentQuestionIdx].isGateQuestion && (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs uppercase font-bold tracking-wider font-mono rounded-lg shadow-2xs">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
                                      <span>GATE Exam MCQ {slide.quizQuestions[currentQuestionIdx].gateYear ? `(${slide.quizQuestions[currentQuestionIdx].gateYear})` : ''}</span>
                                    </div>
                                  )}

                                  <h3 className="font-extrabold text-slate-950 text-[13px] md:text-base leading-relaxed flex gap-2">
                                    <span className="text-indigo-700 font-mono">Q{currentQuestionIdx + 1}.</span>
                                    {slide.quizQuestions[currentQuestionIdx].question}
                                  </h3>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {slide.quizQuestions[currentQuestionIdx].options.map((opt, oIdx) => (
                                      <button
                                        key={oIdx}
                                        onClick={() => handleSelectAnswer(currentQuestionIdx, oIdx, slide.quizQuestions![currentQuestionIdx].correctAnswer)}
                                        className={`w-full text-left py-3 px-4 text-[13px] md:text-sm border rounded-xl transition-all cursor-pointer ${getQuizButtonColor(currentQuestionIdx, oIdx, slide.quizQuestions![currentQuestionIdx].correctAnswer)}`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>

                                  {selectedAnswers[currentQuestionIdx] !== undefined && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 text-[13px] md:text-sm text-slate-800 leading-relaxed flex items-start gap-2.5 mt-4"
                                    >
                                      <HelpCircle className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                                      <div>
                                        <strong className="font-bold text-slate-950">Explanation: </strong>
                                        {slide.quizQuestions[currentQuestionIdx].explanation}
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Navigation & Submit footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-6">
                              <button
                                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIdx === 0}
                                className="px-4 py-2 text-[13px] border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-all font-bold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                              </button>

                              {currentQuestionIdx < (slide.quizQuestions?.length || 0) - 1 ? (
                                <button
                                  onClick={() => setCurrentQuestionIdx(prev => Math.min((slide.quizQuestions?.length || 1) - 1, prev + 1))}
                                  className="px-4 py-2 text-[13px] border border-slate-200 rounded-xl text-slate-800 bg-white hover:bg-slate-50 transition-all font-bold flex items-center gap-1.5 cursor-pointer"
                                >
                                  Next Question
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={handleFinishQuiz}
                                  disabled={Object.keys(selectedAnswers).length < (slide.quizQuestions?.length || 0)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                                >
                                  {Object.keys(selectedAnswers).length < (slide.quizQuestions?.length || 0) ? (
                                    <span>Answer all questions ({Object.keys(selectedAnswers).length}/{slide.quizQuestions?.length})</span>
                                  ) : (
                                    <>
                                      <span>Complete Quiz</span>
                                      <CheckCircle className="w-4 h-4" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* QUIZ COMPLETE / RESULTS SCREEN */
                          <div className="text-center py-8 space-y-4 max-w-md mx-auto">
                            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full inline-block border border-emerald-200">
                              <CheckCircle className="w-10 h-10" />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-xl text-slate-950">Module Quiz Completed!</h3>
                              <p className="text-[13px] text-slate-700 mt-1">Excellent effort! Let&apos;s keep studying and master the 8086 micro-course.</p>
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 font-mono">
                              <span className="text-slate-600 text-[13px] block uppercase tracking-wider font-semibold">Your Score</span>
                              <strong className="text-2xl text-indigo-700">{quizScore} / {slide.quizQuestions?.length} Correct</strong>
                            </div>

                            <div className="flex justify-center gap-2">
                              <button
                                onClick={handleRestartQuiz}
                                className="px-4 py-2 text-[13px] border border-slate-200 rounded-xl text-slate-800 bg-white hover:bg-slate-50 transition-all font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Retake Quiz
                              </button>
                              <button
                                onClick={onNext}
                                disabled={isLast}
                                className="px-4 py-2 text-[13px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all font-bold flex items-center gap-1.5 disabled:opacity-45 cursor-pointer"
                              >
                                Next Module
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        ref={bentoCardRef}
                        className="relative select-none overflow-hidden rounded-3xl"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUpOrLeave}
                        onPointerCancel={handlePointerUpOrLeave}
                        onPointerLeave={handlePointerUpOrLeave}
                        style={{ cursor: magnifier.active ? 'crosshair' : 'auto', touchAction: 'none' }}
                      >
                        {/* Original Interactive Component */}
                        {renderInteractive(slide.interactiveType)}

                        {/* Floating Control Button for persistent magnifier toggle */}
                        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextEnabled = !magnifierModeEnabled;
                              setMagnifierModeEnabled(nextEnabled);
                              if (!nextEnabled) {
                                setMagnifier({ x: 0, y: 0, active: false });
                              } else {
                                // start magnifier in the center
                                const card = bentoCardRef.current;
                                if (card) {
                                  setMagnifier({
                                    x: card.clientWidth / 2,
                                    y: card.clientHeight / 2,
                                    active: true
                                  });
                                }
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-md cursor-pointer ${
                              magnifierModeEnabled 
                                ? 'bg-indigo-600 border-indigo-700 text-white' 
                                : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Toggle Magnifying Glass Lens"
                          >
                            <ZoomIn className={`w-3.5 h-3.5 ${magnifierModeEnabled ? 'animate-pulse' : ''}`} />
                            <span>
                              {magnifierModeEnabled ? 'Magnifier: ON' : 'Magnifier'}
                            </span>
                          </button>
                        </div>

                        {/* Small floating tip indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-slate-900/80 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                          <span>💡 Hold down anywhere on this simulator to zoom</span>
                        </div>

                        {/* Circular Lens Overlay */}
                        {magnifier.active && bentoCardRef.current && (
                          <div 
                            className="absolute border-4 border-indigo-600 rounded-full pointer-events-none z-[100] bg-slate-50"
                            style={{
                              width: lensSize,
                              height: lensSize,
                              left: magnifier.x - lensSize / 2,
                              top: magnifier.y - lensSize / 2,
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            <div 
                              className="origin-top-left absolute" 
                              style={{ 
                                transform: `scale(${zoomFactor})`, 
                                left: -magnifier.x * zoomFactor + lensSize / 2, 
                                top: -magnifier.y * zoomFactor + lensSize / 2,
                                width: bentoCardRef.current.clientWidth,
                                height: bentoCardRef.current.clientHeight,
                              }}
                            >
                              {renderInteractive(slide.interactiveType)}
                            </div>
                            {/* Inner target crosshair overlay */}
                            <div className="absolute inset-0 border border-indigo-500/20 rounded-full pointer-events-none flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600/35 border border-indigo-500/50"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      {/* Control Buttons (Next / Prev) */}
      <div className="border-t border-slate-200 pt-4 mt-4 flex flex-col gap-3 shrink-0 w-full">
        {/* Main Navigation Row */}
        <div className="flex items-center justify-between w-full">
          {/* Previous Button Container */}
          <div className="w-36 flex justify-start">
            <button
              onClick={onPrev}
              disabled={isFirst}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-xs py-2.5 px-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          </div>

          {/* Middle Row (Visible on all screens to keep things centered) */}
          <div className="flex flex-1 items-center justify-center gap-4 px-2">
            {/* Progress bar inside controls (Desktop only) */}
            <div className="hidden md:flex items-center gap-2 text-slate-400 font-mono text-xs uppercase tracking-wider font-bold">
              <span>Status:</span>
              {completedSlides.includes(slide.id) ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" /> Studied
                </span>
              ) : (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-150 text-xs">
                  In Progress
                </span>
              )}
            </div>

            {/* Academic Preparedness Banner - Dr. M Lakshmipathy (Desktop only) */}
            {!projectorMode && (
              <div className="hidden md:flex flex-col items-center text-center bg-slate-100/60 border border-slate-200/60 rounded-xl px-4 py-1 max-w-xs">
                <p className="text-[10px] font-bold text-slate-800 tracking-wide">
                  Prepared by: <span className="text-indigo-600 font-extrabold">Dr M Lakshmipathy</span>
                </p>
                <p className="text-[8px] text-slate-500 font-medium tracking-wide font-mono mt-0.5">
                  KEC Kuppam
                </p>
              </div>
            )}

            {slide.points && slide.interactiveType && slide.interactiveType !== 'quiz' && (
              <button
                onClick={() => setIsExplanationOpen(true)}
                className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 font-bold text-xs py-2.5 px-3.5 bg-indigo-50 border border-indigo-150 rounded-xl shadow-xs hover:bg-indigo-100/80 transition-all cursor-pointer shrink-0"
                title="View Lesson Explanation text in large projector-friendly modal"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Theory</span>
              </button>
            )}
          </div>

          {/* Next Button Container */}
          <div className="w-36 flex justify-end">
            <button
              onClick={onNext}
              disabled={isLast}
              className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-xl border border-indigo-150 hover:bg-indigo-100/50 hover:text-indigo-700 transition-colors font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projector-friendly Lesson Explanation Modal */}
      <AnimatePresence>
        {isExplanationOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6"
            onClick={() => setIsExplanationOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl flex flex-col justify-between max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-indigo-600 block leading-none mb-2">
                      {slide.moduleTitle}
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {slide.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsExplanationOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Standard points with high visibility for projector */}
                {slide.points && (
                  slide.id === 'm2-s1' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-2 text-left">
                      {/* Left Column: BIU */}
                      <div className="flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                            <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight uppercase">
                              Bus Interface Unit (BIU)
                            </h3>
                          </div>
                          
                          <div className="space-y-3 pl-4">
                            {[
                              'Fetches instructions from memory',
                              'Generates physical addresses',
                              'Reads and writes memory',
                              'Stores fetched instruction bytes in the 6-byte prefetch queue',
                              'Handles bus operations'
                            ].map((pt, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 items-start group hover:translate-x-1 transition-transform duration-200 cursor-default"
                              >
                                <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                                </div>
                                <p className="text-slate-750 text-[14.5px] font-medium leading-relaxed">
                                  {pt}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Analogy Block */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider mb-1">
                            Analogy
                          </p>
                          <p className="text-slate-600 text-sm italic leading-relaxed">
                            "Think of the BIU as a delivery person who brings instructions and data from memory."
                          </p>
                        </div>
                      </div>

                      {/* Right Column: EU */}
                      <div className="flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                            <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight uppercase">
                              Execution Unit (EU)
                            </h3>
                          </div>

                          <div className="space-y-3 pl-4">
                            {[
                              'Takes instruction bytes from the prefetch queue',
                              'Decodes instructions',
                              'Executes instructions',
                              'Performs arithmetic and logic operations',
                              'Updates registers and flags'
                            ].map((pt, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 items-start group hover:translate-x-1 transition-transform duration-200 cursor-default"
                              >
                                <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-125 group-hover:bg-indigo-600 transition-all duration-200"></span>
                                </div>
                                <p className="text-slate-750 text-[14.5px] font-medium leading-relaxed">
                                  {pt}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Analogy Block */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider mb-1">
                            Analogy
                          </p>
                          <p className="text-slate-600 text-sm italic leading-relaxed">
                            "Think of the EU as the worker who understands and performs the instructions."
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {slide.points.map((pt, idx) => (
                        <div 
                          key={idx} 
                          className="flex gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all duration-200 items-start shadow-3xs"
                        >
                          <div className="flex items-center justify-center w-5 h-5 shrink-0 mt-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                          </div>
                          <p className="text-slate-800 text-sm md:text-base font-semibold leading-relaxed text-justify flex-1 pt-0.5">
                            {pt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsExplanationOpen(false)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm md:text-base rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Got it, Resume Lab!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
