export interface Slide {
  id: string;
  title: string;
  moduleTitle: string;
  moduleId: string;
  points?: string[];
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  interactiveType?: 'evolution' | 'pins' | 'architecture' | 'flags' | 'memory-calc' | 'interrupts' | 'timing' | 'modes' | 'min-mode-hardware' | 'quiz';
  quizQuestions?: QuizQuestion[];
  diagramLabel?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  isGateQuestion?: boolean;
  gateYear?: string;
}

export interface Module {
  id: string;
  title: string;
  slides: Slide[];
}
