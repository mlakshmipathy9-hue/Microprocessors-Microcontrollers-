import { useState, useEffect } from 'react';
import { courseData } from './data/courseData';
import Sidebar from './components/Sidebar';
import SlidePresenter from './components/SlidePresenter';
import { Menu, BookOpen, Layers, Award, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation states
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // Sidebar toggle for mobile/responsive layout
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Progress state with localStorage persistence
  const [completedSlides, setCompletedSlides] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('8086_completed_slides');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist completed slides to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('8086_completed_slides', JSON.stringify(completedSlides));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }, [completedSlides]);

  const currentModule = courseData[currentModuleIdx];
  const currentSlide = currentModule.slides[currentSlideIdx];

  // Flat list helper of all slides to handle simple next/prev across modules
  const allSlidesWithModuleInfo = courseData.flatMap((m, mIdx) => 
    m.slides.map((s, sIdx) => ({
      ...s,
      mIdx,
      sIdx
    }))
  );

  const flatCurrentIdx = allSlidesWithModuleInfo.findIndex(
    s => s.moduleId === currentModule.id && s.id === currentSlide.id
  );

  const handleNext = () => {
    if (flatCurrentIdx < allSlidesWithModuleInfo.length - 1) {
      const nextSlide = allSlidesWithModuleInfo[flatCurrentIdx + 1];
      setCurrentModuleIdx(nextSlide.mIdx);
      setCurrentSlideIdx(nextSlide.sIdx);
    }
  };

  const handlePrev = () => {
    if (flatCurrentIdx > 0) {
      const prevSlide = allSlidesWithModuleInfo[flatCurrentIdx - 1];
      setCurrentModuleIdx(prevSlide.mIdx);
      setCurrentSlideIdx(prevSlide.sIdx);
    }
  };

  const handleSelectSlide = (moduleId: string, slideId: string) => {
    const mIdx = courseData.findIndex(m => m.id === moduleId);
    if (mIdx !== -1) {
      const sIdx = courseData[mIdx].slides.findIndex(s => s.id === slideId);
      if (sIdx !== -1) {
        setCurrentModuleIdx(mIdx);
        setCurrentSlideIdx(sIdx);
        // Automatically close sidebar on mobile when selecting a slide
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      }
    }
  };

  const handleMarkComplete = (slideId: string) => {
    if (!completedSlides.includes(slideId)) {
      setCompletedSlides(prev => [...prev, slideId]);
    }
  };

  const totalCourseSlides = allSlidesWithModuleInfo.length;
  const isFirstSlide = flatCurrentIdx === 0;
  const isLastSlide = flatCurrentIdx === totalCourseSlides - 1;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* Navigation Sidebar (Collapsible) */}
      <Sidebar
        modules={courseData}
        currentModuleId={currentModule.id}
        currentSlideId={currentSlide.id}
        completedSlides={completedSlides}
        onSelectSlide={handleSelectSlide}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Classroom Screen */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar / Header banner */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-all"
              title="Toggle Syllabus Directory"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white hidden sm:block">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] md:text-xs font-mono font-extrabold uppercase tracking-widest text-indigo-600 block leading-none">
                  UNIT-1: System Architecture
                </span>
                <h1 className="text-sm md:text-base font-bold tracking-tight text-slate-900 uppercase leading-tight mt-1">
                  {currentSlide.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Stats banner */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Course Progress</span>
              <div className="w-40 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${(completedSlides.length / totalCourseSlides) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-mono text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-150">
              {completedSlides.length.toString().padStart(2, '0')} / {totalCourseSlides.toString().padStart(2, '0')}
            </div>
          </div>
        </header>

        {/* Central PowerPoint Presentation viewport */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <SlidePresenter
            slide={currentSlide}
            onNext={handleNext}
            onPrev={handlePrev}
            isFirst={isFirstSlide}
            isLast={isLastSlide}
            onMarkComplete={handleMarkComplete}
            completedSlides={completedSlides}
          />
        </main>
      </div>
    </div>
  );
}
