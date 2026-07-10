import { Module, Slide } from '../types';
import { Cpu, ChevronRight, ChevronDown, CheckCircle2, GraduationCap, Layout } from 'lucide-react';

interface SidebarProps {
  modules: Module[];
  currentModuleId: string;
  currentSlideId: string;
  completedSlides: string[];
  onSelectSlide: (moduleId: string, slideId: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({
  modules,
  currentModuleId,
  currentSlideId,
  completedSlides,
  onSelectSlide,
  isOpen,
  setIsOpen
}: SidebarProps) {
  // Compute progress percent
  const totalSlides = modules.reduce((acc, m) => acc + m.slides.length, 0);
  const completedCount = completedSlides.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalSlides) * 100));

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 bg-white text-slate-800 flex flex-col justify-between border-slate-200 transition-all duration-300 ease-in-out h-full shrink-0 overflow-hidden ${
        isOpen
          ? 'w-72 opacity-100 translate-x-0 border-r'
          : 'w-0 opacity-0 -translate-x-full md:translate-x-0 border-r-0'
      } md:static`}
    >
      <div className="w-72 h-full flex flex-col justify-between shrink-0">
        {/* Sidebar Header */}
        <div>
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between h-16 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xs tracking-wider uppercase text-slate-900 leading-tight">
                  8086 Microprocessor
                </h1>
                <span className="text-[9px] text-indigo-600 font-mono tracking-wider font-semibold uppercase">UNIT-1: SYSTEM ARCHITECTURE</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Progress summary */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Learning Progress</span>
              <span className="text-xs font-bold text-indigo-600 font-mono">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-indigo-600 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono">
              <span>{completedCount} of {totalSlides} slides studied</span>
              <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                <GraduationCap className="w-3 h-3 text-indigo-600" />
                UNIT-1: System Architecture
              </span>
            </div>
          </div>

          {/* Course Navigation items */}
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-180px)] space-y-3">
            <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest px-1">
              Learning Modules
            </div>

            <div className="space-y-2">
              {modules.map((m, mIdx) => {
                const isCurrentModule = m.id === currentModuleId;
                const moduleCompletedCount = m.slides.filter(s => completedSlides.includes(s.id)).length;
                const isModuleFullyStudied = moduleCompletedCount === m.slides.length;
                const displayIdx = (mIdx + 1).toString().padStart(2, '0');

                return (
                  <div key={m.id} className="space-y-1">
                    <button
                      onClick={() => onSelectSlide(m.id, m.slides[0].id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-medium cursor-pointer text-left ${
                        isCurrentModule
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-800 font-semibold shadow-xs'
                          : 'border-slate-100 bg-slate-50/30 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate flex items-center gap-2.5">
                        <span className={`font-mono text-[10px] ${isCurrentModule ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {displayIdx}
                        </span>
                        {isModuleFullyStudied ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrentModule ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
                        )}
                        <span className={`truncate ${isCurrentModule ? 'font-bold text-slate-900' : ''}`}>
                          {m.title.replace('Module ', '')}
                        </span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {moduleCompletedCount}/{m.slides.length}
                      </span>
                    </button>

                    {/* List of slides within the current selected module */}
                    {isCurrentModule && (
                      <div className="pl-4 pr-1 border-l border-slate-200 space-y-1 py-1 ml-3 mt-1">
                        {m.slides.map((slide) => {
                          const isCurrentSlide = slide.id === currentSlideId;
                          const isSlideCompleted = completedSlides.includes(slide.id);

                          return (
                            <button
                              key={slide.id}
                              onClick={() => onSelectSlide(m.id, slide.id)}
                              className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-between group border-l-2 ${
                                isCurrentSlide
                                  ? 'bg-indigo-600 text-white font-semibold shadow-xs border-indigo-400 pl-2'
                                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border-transparent'
                              }`}
                            >
                              <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform duration-150">{slide.title}</span>
                              {isSlideCompleted && !isCurrentSlide && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-400 font-mono text-center flex items-center justify-center gap-2 h-14 shrink-0">
          <Layout className="w-3.5 h-3.5 text-indigo-600" />
          <span className="uppercase tracking-wider">Lab Presentation mode</span>
        </div>
      </div>
    </div>
  );
}
