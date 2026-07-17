import React, { useState, useEffect } from 'react';
import { labExperiments, labManualPagesData } from '../data/labExperimentsData';

import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Database,
  Cpu,
  TrendingUp,
  Tag,
  ArrowRight,
  Code2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  RefreshCw,
  FileCode,
  Compass,
  Copy,
  Check,
  ChevronLeft,
  AlertTriangle,
  Key,
  Thermometer,
  HardDrive,
  Terminal,
  ClipboardList,
  Calculator,
  Award,
  Sliders
} from 'lucide-react';

interface DirectiveInfo {
  id: string;
  name: string;
  fullForm: string;
  category: 'Data Definition' | 'Segment Control' | 'General Symbol' | 'Procedure';
  bytesAllocated: string;
  desc: string;
  example: string;
  styleAffiliation: 'Standard Style' | 'Simplified Style' | 'Both Styles';
}

const directivesData: Record<string, DirectiveInfo> = {
  'SEGMENT': {
    id: 'SEGMENT',
    name: 'SEGMENT & ENDS',
    fullForm: 'Segment Boundaries Definition',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Defines the starting and ending boundaries of a logical segment block (e.g., Code, Data, Stack) in Standard programming. Guides the assembler to organize code into memory sections.',
    example: 'DATA SEGMENT\n  ; variables go here\nDATA ENDS',
    styleAffiliation: 'Standard Style'
  },
  'ASSUME': {
    id: 'ASSUME',
    name: 'ASSUME',
    fullForm: 'Assume Segment Association',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Tells the assembler which physical segment register (CS, DS, SS, ES) should point to which logical segment at runtime. This is purely for compile-time syntax check and does NOT load segment registers with addresses (which must be done manually with MOV instructions).',
    example: 'ASSUME CS:CODE, DS:DATA',
    styleAffiliation: 'Standard Style'
  },
  'MODEL': {
    id: 'MODEL',
    name: '.MODEL',
    fullForm: 'Memory Model Directive',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Pre-configures standard segment settings based on the selected memory model (SMALL, MEDIUM, COMPACT, LARGE, FLAT). Eliminates the need for explicit SEGMENT/ENDS boundaries and the ASSUME directive.',
    example: '.MODEL SMALL  ; code fits in 64KB, data in 64KB',
    styleAffiliation: 'Simplified Style'
  },
  'STACK': {
    id: 'STACK',
    name: '.STACK',
    fullForm: 'Stack Allocation Directive',
    category: 'Segment Control',
    bytesAllocated: 'User-specified size (e.g., 256 bytes)',
    desc: 'Allocates a designated stack segment space in memory with the given size. In standard style, you would have to define a STACK segment explicitly.',
    example: '.STACK 100H  ; reserves 256 bytes for stack',
    styleAffiliation: 'Simplified Style'
  },
  'DATA': {
    id: 'DATA',
    name: '.DATA',
    fullForm: 'Data Segment Start',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Marks the beginning of the logical data segment. Behind the scenes, the assembler configures segment offsets for all following variables.',
    example: '.DATA\nVAR_BYTE DB 10H',
    styleAffiliation: 'Simplified Style'
  },
  'CODE': {
    id: 'CODE',
    name: '.CODE',
    fullForm: 'Code Segment Start',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Marks the beginning of the instruction code segment where executable instructions are placed.',
    example: '.CODE\nSTART:\n  MOV AX, @DATA',
    styleAffiliation: 'Simplified Style'
  },
  '@DATA': {
    id: '@DATA',
    name: '@DATA',
    fullForm: 'Predefined Segment Address Constant',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Assembler Constant)',
    desc: 'A special predefined symbol representing the 16-bit segment address of the .DATA segment. In simplified model programming, you MUST load DS using this symbol, compared to the segment identifier used in standard programming.',
    example: 'MOV AX, @DATA\nMOV DS, AX',
    styleAffiliation: 'Simplified Style'
  },
  'DB': {
    id: 'DB',
    name: 'DB (Define Byte)',
    fullForm: 'Define Byte Variable',
    category: 'Data Definition',
    bytesAllocated: '1 Byte per element',
    desc: 'Allocates memory storage space in RAM for 8-bit byte variables. Can initialize variables with a hexadecimal constant, characters inside quotes, or leave it uninitialized using (?) symbol.',
    example: 'MY_BYTE DB 7AH\nCHAR_VAL DB \'A\'',
    styleAffiliation: 'Both Styles'
  },
  'DW': {
    id: 'DW',
    name: 'DW (Define Word)',
    fullForm: 'Define 16-bit Word Variable',
    category: 'Data Definition',
    bytesAllocated: '2 Bytes per element',
    desc: 'Allocates memory storage space in RAM for 16-bit word variables. Uses Little-Endian notation: the lower 8 bits are stored at the lower physical address offset, and the upper 8 bits are stored at the higher offset.',
    example: 'MY_WORD DW 1F04H\nARR_WORD DW 10 DUP(0)',
    styleAffiliation: 'Both Styles'
  },
  'DD': {
    id: 'DD',
    name: 'DD (Define Doubleword)',
    fullForm: 'Define 32-bit Doubleword',
    category: 'Data Definition',
    bytesAllocated: '4 Bytes per element',
    desc: 'Allocates memory storage space in RAM for 32-bit doubleword variables. Excellent for storing far memory pointers (containing both a 16-bit offset and a 16-bit segment base address sequentially).',
    example: 'MY_DWORD DD 12345678H',
    styleAffiliation: 'Both Styles'
  },
  'DUP': {
    id: 'DUP',
    name: 'DUP (Duplicate Operator)',
    fullForm: 'Array Allocation Duplication',
    category: 'Data Definition',
    bytesAllocated: 'Count * element size',
    desc: 'An operator used inside DB, DW, or DD declarations to easily initialize block memory arrays with a uniform initial value.',
    example: 'MY_ARRAY DB 10 DUP(0H)  ; 10 bytes initialized to 0',
    styleAffiliation: 'Both Styles'
  },
  'ORG': {
    id: 'ORG',
    name: 'ORG (Origin)',
    fullForm: 'Origin Pointer Offset Control',
    category: 'General Symbol',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Directs the assembler to set the starting offset address pointer for subsequently defined code instructions or data variables. Often set to ORG 100H for DOS .COM files.',
    example: 'ORG 0100H',
    styleAffiliation: 'Both Styles'
  },
  'EQU': {
    id: 'EQU',
    name: 'EQU (Equate Constant)',
    fullForm: 'Equate Symbolic Constant',
    category: 'General Symbol',
    bytesAllocated: '0 Bytes (Replaced at Compile-Time)',
    desc: 'Creates a text or numeric constant alias. The assembler replaces all occurrences of this name with its value during code assembly. Consumes no physical RAM at runtime.',
    example: 'MAX_LIMIT EQU 100',
    styleAffiliation: 'Both Styles'
  },
  'PROC': {
    id: 'PROC',
    name: 'PROC & ENDP',
    fullForm: 'Procedure Declaration boundaries',
    category: 'Procedure',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Defines the starting and ending boundaries of procedures (subroutines). Can be configured as NEAR (within same segment) or FAR (across segments). Helps structure clean code blocks.',
    example: 'DELAY PROC NEAR\n  ; delay logic\n  RET\nDELAY ENDP',
    styleAffiliation: 'Both Styles'
  }
};

const segmentLayout = [
  { label: 'MY_BYTE', directive: 'DB', value: '7AH', size: 1, offset: '0000H', desc: 'Single 8-bit byte at Offset 0000H' },
  { label: 'MY_WORD', directive: 'DW', value: '1F04H', size: 2, offset: '0001H', desc: '16-bit Word spans 2 bytes (Offsets 0001H & 0002H - stored Little-Endian)' },
  { label: 'MY_DWORD', directive: 'DD', value: '12345678H', size: 4, offset: '0003H', desc: '32-bit Doubleword spans 4 bytes (Offsets 0003H to 0006H)' },
  { label: 'MY_ARRAY', directive: 'DB', value: '3 DUP(0)', size: 3, offset: '0007H', desc: '3 consecutive bytes initialized to 0 (Offsets 0007H to 0009H)' }
];

interface MemoryModel {
  id: string;
  name: string;
  codeSegment: string;
  dataSegment: string;
  stackSegment: string;
  pointers: string;
  desc: string;
  bestFor: string;
  segments: Array<{ name: string; size: string; color: string }>;
}

const memoryModels: MemoryModel[] = [
  {
    id: 'tiny',
    name: 'TINY',
    codeSegment: 'Near (<64KB)',
    dataSegment: 'Near (<64KB)',
    stackSegment: 'Combined',
    pointers: 'Near pointers only',
    desc: 'All code, data, and stack are unified into a single physical 64KB segment. Used specifically for DOS .COM files to produce highly efficient, compact, single-image executables.',
    bestFor: 'Extremely small utilities, quick-start BIOS routines',
    segments: [
      { name: 'CS, DS, SS, ES (Unified)', size: '64 KB Max', color: 'bg-indigo-600/90 border-indigo-500 text-indigo-100' }
    ]
  },
  {
    id: 'small',
    name: 'SMALL',
    codeSegment: 'Near (<64KB)',
    dataSegment: 'Near (<64KB)',
    stackSegment: 'Separate (64KB)',
    pointers: 'Near code, Near data',
    desc: 'The most popular memory model for standard utilities. Allocates exactly one 64KB segment for code, and exactly one 64KB segment for data. Stack is mapped separately.',
    bestFor: 'Typical laboratory exercises, standard tool applications',
    segments: [
      { name: 'Code Segment (CS)', size: '64 KB Max', color: 'bg-emerald-600 border-emerald-500 text-emerald-100' },
      { name: 'Data Segment (DS)', size: '64 KB Max', color: 'bg-amber-600 border-amber-500 text-amber-100' },
      { name: 'Stack Segment (SS)', size: '64 KB Max', color: 'bg-blue-600 border-blue-500 text-blue-100' }
    ]
  },
  {
    id: 'medium',
    name: 'MEDIUM',
    codeSegment: 'Far (No Limit)',
    dataSegment: 'Near (<64KB)',
    stackSegment: 'Separate (64KB)',
    pointers: 'Far code, Near data',
    desc: 'Designed for programs with very large instruction sizes but minimal data storage. Code can span multiple physical segments (calling subroutines requires FAR calls), while all variables reside in a single 64KB block.',
    bestFor: 'Complex algorithmic utilities, protocol processors',
    segments: [
      { name: 'Code Seg 1 (CS)', size: '64 KB', color: 'bg-emerald-600 border-emerald-500 text-emerald-100' },
      { name: 'Code Seg 2 (CS)', size: '64 KB', color: 'bg-emerald-600/80 border-emerald-500 text-emerald-100' },
      { name: 'Data Segment (DS)', size: '64 KB Max', color: 'bg-amber-600 border-amber-500 text-amber-100' },
      { name: 'Stack Segment (SS)', size: '64 KB Max', color: 'bg-blue-600 border-blue-500 text-blue-100' }
    ]
  },
  {
    id: 'compact',
    name: 'COMPACT',
    codeSegment: 'Near (<64KB)',
    dataSegment: 'Far (No Limit)',
    stackSegment: 'Separate (64KB)',
    pointers: 'Near code, Far data',
    desc: 'The exact opposite of the Medium model. Code is restricted to a single 64KB segment (near pointers for calling functions), but data can exceed 64KB across multiple segments. However, no single variable or array can be larger than 64KB.',
    bestFor: 'Small engines analyzing huge memory datasets',
    segments: [
      { name: 'Code Segment (CS)', size: '64 KB Max', color: 'bg-emerald-600 border-emerald-500 text-emerald-100' },
      { name: 'Data Seg 1 (DS)', size: '64 KB', color: 'bg-amber-600 border-amber-500 text-amber-100' },
      { name: 'Data Seg 2 (DS)', size: '64 KB', color: 'bg-amber-600/80 border-amber-500 text-amber-100' },
      { name: 'Stack Segment (SS)', size: '64 KB Max', color: 'bg-blue-600 border-blue-500 text-blue-100' }
    ]
  },
  {
    id: 'large',
    name: 'LARGE',
    codeSegment: 'Far (No Limit)',
    dataSegment: 'Far (No Limit)',
    stackSegment: 'Separate (64KB)',
    pointers: 'Far code, Far data',
    desc: 'Removes segment limits for both instruction blocks and variables. Both code and data are allowed to span multiple segments, requiring 32-bit FAR pointers for all calls and data access. No single array can exceed 64KB.',
    bestFor: 'Enterprise software, system utilities, full compiler systems',
    segments: [
      { name: 'Code Segment (CS)', size: 'Far/Multi', color: 'bg-emerald-600 border-emerald-500 text-emerald-100' },
      { name: 'Data Segment (DS)', size: 'Far/Multi', color: 'bg-amber-600 border-amber-500 text-amber-100' },
      { name: 'Stack Segment (SS)', size: '64 KB Max', color: 'bg-blue-600 border-blue-500 text-blue-100' }
    ]
  },
  {
    id: 'huge',
    name: 'HUGE',
    codeSegment: 'Far (No Limit)',
    dataSegment: 'Far (No Limit)',
    stackSegment: 'Separate (64KB)',
    pointers: 'Far pointer + index updates',
    desc: 'Extends the LARGE memory model by allowing individual arrays and data blocks themselves to exceed the 64KB physical segment boundary. The compiler automatically adds index pointer arithmetic to transition across segment limits.',
    bestFor: 'Massive dataset tables, high-resolution graphic framebuffers',
    segments: [
      { name: 'Code Segment (CS)', size: 'Far/Multi', color: 'bg-emerald-600 border-emerald-500 text-emerald-100' },
      { name: 'Huge Array (DS Span)', size: 'Spans Segments (>64KB)', color: 'bg-purple-600 border-purple-500 text-purple-100 font-bold' },
      { name: 'Stack Segment (SS)', size: '64 KB Max', color: 'bg-blue-600 border-blue-500 text-blue-100' }
    ]
  }
];

interface LabExperiment {
  id: string;
  number: number | string;
  title: string;
  aim: string;
  directivesUsed: string[];
  algorithm: string[];
  standardCode: string;
  simplifiedCode: string;
  bestPracticeTip: string;
}

// labExperiments and labManualPagesData are imported from '../data/labExperimentsData'

const sections = [
  'Aim & Objectives',
  'Components Required',
  'Experimental Procedure',
  'Theory Concepts',
  'Algorithm Steps',
  'Engineering Flowchart',
  'Source Code Program',
  'Expected Output trace',
  'Manual Calculations',
  'Verification Result',
  'Important Precautions',
  'Student Task Challenge',
  'Practical Applications'
];

const getDecisionBranchInfo = (labId: string, label: string) => {
  const normalizedLabel = label.trim().toLowerCase();
  
  if (labId === 'exp1') {
    if (normalizedLabel.includes('cx = 0') || normalizedLabel.includes('cx=0')) {
      return {
        yes: "Move to Save Final Carry/Borrow",
        no: "Loop back to ADD/SBB block (Step 4) for next byte"
      };
    }
  } else if (labId === 'exp3') {
    if (normalizedLabel.includes('al >= [si]') || normalizedLabel.includes('al>=[si]')) {
      return {
        yes: "Skip update, go directly to 'Is CX = 0?' step",
        no: "Update AL = [SI] with the new higher candidate"
      };
    } else if (normalizedLabel.includes('cx = 0') || normalizedLabel.includes('cx=0')) {
      return {
        yes: "Move to STOP (Save AL to MAX_VAL)",
        no: "Loop back to 'INC SI' step to inspect next element"
      };
    }
  } else if (labId === 'exp4') {
    if (normalizedLabel.includes('al <= [si+1]') || normalizedLabel.includes('al<=[si+1]')) {
      return {
        yes: "Skip swap, go directly to 'INC SI, LOOP Inner' step",
        no: "Swap adjacent elements [SI] and [SI+1] via AH buffer"
      };
    } else if (normalizedLabel.includes('dx = 0') || normalizedLabel.includes('dx=0')) {
      return {
        yes: "Move to STOP (Array successfully sorted)",
        no: "Loop back to Outer Loop (re-initialize index SI and CX = DX)"
      };
    }
  } else if (labId === 'exp5') {
    if (normalizedLabel.includes('cx = 0') || normalizedLabel.includes('cx=0')) {
      return {
        yes: "Move to STOP (Verify DEST_BLOCK memory match)",
        no: "Loop back to REP MOVSB block (auto-copies next byte)"
      };
    }
  }
  
  return {
    yes: "Proceed to next step",
    no: "Repeat/Skip loop block"
  };
};

const getBranchTargetIndices = (labId: string, label: string): { yes: number | null; no: number | null } => {
  const normalizedLabel = label.trim().toLowerCase();
  
  if (labId === 'exp1') {
    if (normalizedLabel.includes('cx = 0') || normalizedLabel.includes('cx=0')) {
      return { yes: 6, no: 3 }; // Save Final Carry (6), AL = [SI] + [DI] (3)
    }
  } else if (labId === 'exp3') {
    if (normalizedLabel.includes('al >= [si]') || normalizedLabel.includes('al>=[si]')) {
      return { yes: 6, no: 5 }; // Is CX = 0? (6), Update AL (5)
    } else if (normalizedLabel.includes('cx = 0') || normalizedLabel.includes('cx=0')) {
      return { yes: 7, no: 3 }; // STOP (7), INC SI (3)
    }
  } else if (labId === 'exp4') {
    if (normalizedLabel.includes('al <= [si+1]') || normalizedLabel.includes('al<=[si+1]')) {
      return { yes: 6, no: 5 }; // INC SI (6), Swap [SI] and [SI+1] (5)
    } else if (normalizedLabel.includes('dx = 0') || normalizedLabel.includes('dx=0')) {
      return { yes: 8, no: 2 }; // STOP (8), Outer Loop (2)
    }
  } else if (labId === 'exp5') {
    if (normalizedLabel.includes('cx = 0') || normalizedLabel.includes('cx=0')) {
      return { yes: 6, no: 4 }; // STOP (6), REP MOVSB (4)
    }
  }
  
  return { yes: null, no: null };
};

export function getInstructionsUsed(labId: string): string[] {
  switch (labId) {
    case 'exp1': // Multi-precision Addition & Subtraction
      return ['MOV', 'LEA', 'CLC', 'ADC', 'INC', 'SBB', 'LOOP', 'INT'];
    case 'exp2': // Multiplication & Division
      return ['MOV', 'MUL', 'IMUL', 'XOR', 'DIV', 'CWD', 'IDIV', 'INT'];
    case 'exp_math': // Square, Cube & Factorial
      return ['MOV', 'XOR', 'MUL', 'LOOP', 'INT'];
    case 'exp_bit1': // Positive/Negative
      return ['MOV', 'TEST', 'JS', 'JMP', 'INT'];
    case 'exp_bit2': // Odd/Even
      return ['MOV', 'TEST', 'JZ', 'JMP', 'INT'];
    case 'exp_bit3': // Count Ones/Zeros
      return ['MOV', 'XOR', 'SHR', 'JC', 'INC', 'DEC', 'LOOP', 'INT'];
    case 'exp_arr1': // Addition & Subtraction of N Numbers
      return ['MOV', 'LEA', 'XOR', 'ADD', 'ADC', 'INC', 'LOOP', 'INT'];
    case 'exp3': // Largest/Smallest in Array
      return ['MOV', 'LEA', 'CMP', 'JAE', 'JBE', 'LOOP', 'INT'];
    case 'exp4': // Sort Array
      return ['MOV', 'CMP', 'XCHG', 'JC', 'JNC', 'JZ', 'DEC', 'JNZ', 'LOOP', 'INT'];
    case 'exp_str1': // String Length
      return ['MOV', 'LES', 'DI', 'SCASB', 'CLD', 'REPNE', 'SUB', 'DEC', 'INT'];
    case 'exp_str2': // Display String
      return ['MOV', 'LEA', 'INT'];
    case 'exp_str3': // Compare Strings
      return ['MOV', 'CMPSB', 'REPE', 'CLD', 'JZ', 'JNZ', 'INT'];
    case 'exp_str4': // String Reversal
      return ['MOV', 'CMPSB', 'LOOP', 'INT'];
    case 'exp5': // Block Transfer
      return ['MOV', 'REP', 'MOVSB', 'CLD', 'STD', 'INT'];
    default:
      return ['MOV', 'INT'];
  }
}

interface DirectiveSandboxSimulatorProps {
  initialLabId?: string;
}

export default function DirectiveSandboxSimulator({ initialLabId }: DirectiveSandboxSimulatorProps) {
  const [selectedStyle, setSelectedStyle] = useState<'standard' | 'simplified' | 'com'>('standard');
  const [hoveredDirective, setHoveredDirective] = useState<string>('DB');
  const [selectedVarIdx, setSelectedVarIdx] = useState<number | null>(null);
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('small');
  const [selectedLabId, setSelectedLabId] = useState<string>('exp1');
  const [activeLabStyle, setActiveLabStyle] = useState<'standard' | 'simplified'>('simplified');
  const [activeTab, setActiveTab] = useState<'manual' | 'sandbox'>('manual');
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [hoveredTargetStepIdx, setHoveredTargetStepIdx] = useState<number | null>(null);
  const [showChallengeHint, setShowChallengeHint] = useState<boolean>(false);

  // --- INTERACTIVE LAB SIMULATOR STATE ---
  // Lab 1 (Multi-precision)
  const [exp1Num1, setExp1Num1] = useState<string[]>(['FF', 'FE', 'FD', 'FC']);
  const [exp1Num2, setExp1Num2] = useState<string[]>(['01', '02', '03', '04']);
  const [exp1Op, setExp1Op] = useState<'ADD' | 'SUB'>('ADD');
  const [exp1Step, setExp1Step] = useState<number>(0); // 0, 1, 2, 3, 4 (done)
  const [exp1Carry, setExp1Carry] = useState<number>(0);
  const [exp1Results, setExp1Results] = useState<string[]>(['', '', '', '']);
  const [exp1FinalCarry, setExp1FinalCarry] = useState<number | null>(null);

  // Lab 2 (Multiplication & Division)
  const [exp2Size, setExp2Size] = useState<'8bit' | '16bit'>('16bit');
  const [exp2Op, setExp2Op] = useState<'MUL' | 'IMUL' | 'DIV' | 'IDIV'>('MUL');
  const [exp2Op1, setExp2Op1] = useState<string>('0A12');
  const [exp2Op2, setExp2Op2] = useState<string>('0050');
  const [exp2Step, setExp2Step] = useState<number>(0); // 0: inputs, 1: loaded, 2: completed
  const [exp2ResultAX, setExp2ResultAX] = useState<string>('');
  const [exp2ResultDX, setExp2ResultDX] = useState<string>('');
  const [exp2Remainder, setExp2Remainder] = useState<string>('');
  const [exp2Error, setExp2Error] = useState<string>('');

  // Lab 3 (Max Value Scan)
  const [exp3Array, setExp3Array] = useState<string[]>(['25', '4A', '12', '8B', '05', '92', '31', '15']);
  const [exp3Step, setExp3Step] = useState<number>(0); // 0 to 8 (done)
  const [exp3MaxAL, setExp3MaxAL] = useState<string>('00');
  const [exp3IsGreater, setExp3IsGreater] = useState<boolean | null>(null);

  // Lab 4 (Bubble Sort)
  const [exp4Array, setExp4Array] = useState<string[]>(['88', '11', '55', '22', '44', '33']);
  const [exp4SI, setExp4SI] = useState<number>(0);
  const [exp4Pass, setExp4Pass] = useState<number>(1);
  const [exp4StepActive, setExp4StepActive] = useState<'compare' | 'swap' | 'next' | 'done'>('compare');
  const [exp4Swapped, setExp4Swapped] = useState<boolean>(false);
  const [exp4AnySwappedThisPass, setExp4AnySwappedThisPass] = useState<boolean>(false);

  // Lab 5 (Block Transfer Copy)
  const [exp5Array, setExp5Array] = useState<string[]>(['10', '20', '30', '40', '50']);
  const [exp5Overlap, setExp5Overlap] = useState<'none' | 'forward' | 'backward'>('none');
  const [exp5Step, setExp5Step] = useState<number>(0); // 0 to 5
  const [exp5DestArray, setExp5DestArray] = useState<string[]>(['00', '00', '00', '00', '00', '00', '00']);

  // Lab 1C (Square, Cube & Factorial of a Number)
  const [expMathInput, setExpMathInput] = useState<number>(5);

  const resetSimulator = (labId: string) => {
    if (labId === 'exp_math') {
      setExpMathInput(5);
    } else if (labId === 'exp1') {
      setExp1Step(0);
      setExp1Carry(0);
      setExp1Results(['', '', '', '']);
      setExp1FinalCarry(null);
    } else if (labId === 'exp2') {
      setExp2Step(0);
      setExp2ResultAX('');
      setExp2ResultDX('');
      setExp2Remainder('');
      setExp2Error('');
    } else if (labId === 'exp3') {
      setExp3Step(0);
      setExp3MaxAL('00');
      setExp3IsGreater(null);
    } else if (labId === 'exp4') {
      setExp4SI(0);
      setExp4Pass(1);
      setExp4StepActive('compare');
      setExp4Swapped(false);
      setExp4AnySwappedThisPass(false);
      setExp4Array(['88', '11', '55', '22', '44', '33']);
    } else if (labId === 'exp5') {
      setExp5Step(0);
      if (exp5Overlap === 'forward') {
        setExp5DestArray(['10', '20', '00', '00', '00', '00', '00']); // overlapped from index 2
      } else {
        setExp5DestArray(['00', '00', '00', '00', '00', '00', '00']);
      }
    }
  };

  const stepSimulator = (labId: string) => {
    if (labId === 'exp1') {
      if (exp1Step >= 4) {
        resetSimulator('exp1');
        return;
      }
      const i = exp1Step;
      const aVal = parseInt(exp1Num1[i] || '0', 16);
      const bVal = parseInt(exp1Num2[i] || '0', 16);
      const prevCarry = exp1Carry;
      
      let resVal = 0;
      let nextCarry = 0;
      
      if (exp1Op === 'ADD') {
        const sum = aVal + bVal + prevCarry;
        resVal = sum & 0xFF;
        nextCarry = sum > 255 ? 1 : 0;
      } else {
        const diff = aVal - bVal - prevCarry;
        resVal = (diff + 256) & 0xFF;
        nextCarry = diff < 0 ? 1 : 0;
      }
      
      const newRes = [...exp1Results];
      newRes[i] = resVal.toString(16).toUpperCase().padStart(2, '0');
      setExp1Results(newRes);
      
      if (i === 3) {
        setExp1FinalCarry(nextCarry);
        setExp1Step(4);
      } else {
        setExp1Carry(nextCarry);
        setExp1Step(i + 1);
      }
    }
    
    else if (labId === 'exp2') {
      if (exp2Step === 2) {
        setExp2Step(0);
        return;
      }
      if (exp2Step === 0) {
        setExp2Step(1);
        return;
      }
      const op1Hex = exp2Op1.trim();
      const op2Hex = exp2Op2.trim();
      
      const is16 = exp2Size === '16bit';
      const isSigned = exp2Op === 'IMUL' || exp2Op === 'IDIV';
      const isDiv = exp2Op === 'DIV' || exp2Op === 'IDIV';
      
      let val1 = parseInt(op1Hex, 16);
      let val2 = parseInt(op2Hex, 16);
      
      if (isNaN(val1) || isNaN(val2)) {
        setExp2Error('Invalid Hexadecimal input!');
        setExp2Step(2);
        return;
      }
      
      let sVal1 = val1;
      let sVal2 = val2;

      if (isDiv) {
        if (is16) {
          // 16-bit division: Dividend DX:AX is 32-bit.
          // Since user inputs 16-bit AX, we sign-extend or zero-extend to 32-bit.
          if (isSigned) {
            sVal1 = (val1 & 0x8000) !== 0 ? val1 - 65536 : val1;
            sVal2 = (val2 & 0x8000) !== 0 ? val2 - 65536 : val2;
          } else {
            sVal1 = val1;
            sVal2 = val2;
          }
        } else {
          // 8-bit division: Dividend is AX (16-bit). Divisor is BL (8-bit).
          if (isSigned) {
            sVal1 = (val1 & 0x8000) !== 0 ? val1 - 65536 : val1; // AX is 16-bit signed
            sVal2 = (val2 & 0x80) !== 0 ? val2 - 256 : val2;     // BL is 8-bit signed
          } else {
            sVal1 = val1;          // AX is 16-bit unsigned
            sVal2 = val2 & 0xFF;   // BL is 8-bit unsigned
          }
        }
      } else {
        // Multiplication
        if (is16) {
          // 16-bit multiplication: AX * BX
          if (isSigned) {
            sVal1 = (val1 & 0x8000) !== 0 ? val1 - 65536 : val1;
            sVal2 = (val2 & 0x8000) !== 0 ? val2 - 65536 : val2;
          } else {
            sVal1 = val1;
            sVal2 = val2;
          }
        } else {
          // 8-bit multiplication: AL * BL
          if (isSigned) {
            sVal1 = (val1 & 0x80) !== 0 ? val1 - 256 : val1;
            sVal2 = (val2 & 0x80) !== 0 ? val2 - 256 : val2;
          } else {
            sVal1 = val1 & 0xFF;
            sVal2 = val2 & 0xFF;
          }
        }
      }
      
      if (isDiv) {
        if ((isSigned ? sVal2 : val2) === 0) {
          setExp2Error('Division by zero! INT 00H exception.');
          setExp2Step(2);
          return;
        }
        
        let quotient = 0;
        let remainder = 0;
        
        if (isSigned) {
          quotient = Math.trunc(sVal1 / sVal2);
          remainder = sVal1 % sVal2;
          
          const qMax = is16 ? 32767 : 127;
          const qMin = is16 ? -32768 : -128;
          if (quotient > qMax || quotient < qMin) {
            setExp2Error('Divide Overflow! Result exceeds register bounds.');
            setExp2Step(2);
            return;
          }
        } else {
          const uDivisor = is16 ? val2 : (val2 & 0xFF);
          quotient = Math.floor(val1 / uDivisor);
          remainder = val1 % uDivisor;
          
          const qMax = is16 ? 65535 : 255;
          if (quotient > qMax) {
            setExp2Error('Divide Overflow! Result exceeds register bounds.');
            setExp2Step(2);
            return;
          }
        }
        
        const qMask = is16 ? 0xFFFF : 0xFF;
        const rMask = is16 ? 0xFFFF : 0xFF;
        
        const qHex = (quotient & qMask).toString(16).toUpperCase().padStart(is16 ? 4 : 2, '0');
        const rHex = (remainder & rMask).toString(16).toUpperCase().padStart(is16 ? 4 : 2, '0');
        
        setExp2ResultAX(qHex);
        setExp2Remainder(rHex);
        setExp2ResultDX(is16 ? '0000' : '00');
        setExp2Error('');
      } else {
        let product = 0;
        if (isSigned) {
          product = sVal1 * sVal2;
        } else {
          const uVal1 = is16 ? val1 : (val1 & 0xFF);
          const uVal2 = is16 ? val2 : (val2 & 0xFF);
          product = uVal1 * uVal2;
        }
        
        const pMask = is16 ? 0xFFFFFFFF : 0xFFFF;
        const uProd = product & pMask;
        
        if (is16) {
          const lower = uProd & 0xFFFF;
          const upper = (uProd >> 16) & 0xFFFF;
          setExp2ResultAX(lower.toString(16).toUpperCase().padStart(4, '0'));
          setExp2ResultDX(upper.toString(16).toUpperCase().padStart(4, '0'));
        } else {
          setExp2ResultAX(uProd.toString(16).toUpperCase().padStart(4, '0'));
          setExp2ResultDX('0000');
        }
        setExp2Remainder('');
        setExp2Error('');
      }
      
      setExp2Step(2);
    }
    
    else if (labId === 'exp3') {
      if (exp3Step >= 8) {
        resetSimulator('exp3');
        return;
      }
      
      const i = exp3Step;
      const currentValHex = exp3Array[i];
      const currentVal = parseInt(currentValHex, 16);
      const currentMax = parseInt(exp3MaxAL, 16);
      
      const isGreater = currentVal > currentMax;
      setExp3IsGreater(isGreater);
      
      if (isGreater || i === 0) {
        setExp3MaxAL(currentValHex.toUpperCase().padStart(2, '0'));
      }
      
      setExp3Step(i + 1);
    }
    
    else if (labId === 'exp4') {
      const size = exp4Array.length;
      
      if (exp4StepActive === 'done') {
        resetSimulator('exp4');
        return;
      }
      
      if (exp4StepActive === 'compare') {
        const val1 = parseInt(exp4Array[exp4SI], 16);
        const val2 = parseInt(exp4Array[exp4SI + 1], 16);
        const shouldSwap = val1 > val2;
        
        setExp4Swapped(shouldSwap);
        setExp4StepActive('swap');
      } 
      else if (exp4StepActive === 'swap') {
        if (exp4Swapped) {
          const newArray = [...exp4Array];
          const temp = newArray[exp4SI];
          newArray[exp4SI] = newArray[exp4SI + 1];
          newArray[exp4SI + 1] = temp;
          setExp4Array(newArray);
          setExp4AnySwappedThisPass(true);
        }
        setExp4StepActive('next');
      } 
      else if (exp4StepActive === 'next') {
        const limit = size - exp4Pass;
        if (exp4SI < limit - 1) {
          setExp4SI(exp4SI + 1);
          setExp4StepActive('compare');
        } else {
          if (exp4Pass < size - 1 && exp4AnySwappedThisPass) {
            setExp4SI(0);
            setExp4Pass(exp4Pass + 1);
            setExp4AnySwappedThisPass(false);
            setExp4StepActive('compare');
          } else {
            setExp4StepActive('done');
          }
        }
      }
    }
    
    else if (labId === 'exp5') {
      const size = exp5Array.length;
      if (exp5Step >= size) {
        resetSimulator('exp5');
        return;
      }
      
      const isBack = exp5Overlap === 'backward';
      const isForwardOverlap = exp5Overlap === 'forward';
      
      if (isBack) {
        const stepNum = exp5Step;
        const i = size - 1 - stepNum;
        
        const sourceVal = exp5Array[i];
        const newDest = [...exp5DestArray];
        newDest[i + 2] = sourceVal;
        setExp5DestArray(newDest);
        setExp5Step(stepNum + 1);
      } 
      else if (isForwardOverlap) {
        const stepNum = exp5Step;
        const newDest = [...exp5DestArray];
        let sourceVal = '';
        if (stepNum < 2) {
          sourceVal = exp5Array[stepNum];
        } else {
          sourceVal = newDest[stepNum];
        }
        
        newDest[stepNum + 2] = sourceVal;
        setExp5DestArray(newDest);
        setExp5Step(stepNum + 1);
      } 
      else {
        const i = exp5Step;
        const sourceVal = exp5Array[i];
        const newDest = [...exp5DestArray];
        newDest[i] = sourceVal;
        setExp5DestArray(newDest);
        setExp5Step(i + 1);
      }
    }
  };

  useEffect(() => {
    if (initialLabId) {
      setSelectedLabId(initialLabId);
      setActiveTab('manual');
    }
  }, [initialLabId]);

  useEffect(() => {
    setCurrentPageIdx(0);
    setShowChallengeHint(false);
    resetSimulator(selectedLabId);
  }, [selectedLabId, exp1Op, exp2Size, exp2Op, exp5Overlap]);

  const standardSkeletonCode = `; --- 1. STANDARD SEGMENT STYLE (EXE) ---
DATA_SEG SEGMENT
    VAR1 DB 25H         ; Define 8-bit byte
    ARR1 DW 10 DUP(0)   ; Define 10-word array
DATA_SEG ENDS

STACK_SEG SEGMENT STACK
    DB 100H DUP(0)      ; Reserve 256 bytes for Stack
STACK_SEG ENDS

CODE_SEG SEGMENT
    ASSUME CS:CODE_SEG, DS:DATA_SEG, SS:STACK_SEG

START:
    ; Load Data Segment address into DS
    MOV AX, DATA_SEG
    MOV DS, AX

    ; Application logic here
    MOV AL, VAR1

    ; Clean DOS exit
    MOV AH, 4CH
    INT 21H
CODE_SEG ENDS
END START`;

  const simplifiedSkeletonCode = `; --- 2. SIMPLIFIED DOT-MODEL STYLE (EXE) ---
.MODEL SMALL            ; Set Memory Model size
.STACK 100H             ; Allocate 256-byte stack

.DATA                   ; Start of Data Segment
    VAR1 DB 25H         ; Define 8-bit byte
    ARR1 DW 10 DUP(0)   ; Define 10-word array

.CODE                   ; Start of Code Segment
START:
    ; Load predefined symbol @DATA into DS
    MOV AX, @DATA
    MOV DS, AX

    ; Application logic here
    MOV AL, VAR1

    ; Clean DOS exit
    MOV AH, 4CH
    INT 21H
END START`;

  const tinySkeletonCode = `; --- 3. TINY .COM STYLE (SINGLE SEGMENT) ---
.MODEL TINY             ; Unified CS, DS, SS and ES
.CODE
ORG 0100H               ; Executable starts at offset 100h

START:
    JMP MAIN_RUN        ; Skip past variable storage

    ; Inline variable definitions inside Code Segment
    VAR1 DB 25H         ; Define 8-bit byte
    ARR1 DW 10 DUP(0)   ; Define 10-word array

MAIN_RUN:
    ; NO Segment loading needed! CS = DS = SS = ES.
    MOV AL, VAR1

    ; Clean DOS exit
    MOV AH, 4CH
    INT 21H
END START`;

  const renderApplicationIcon = (iconName: string) => {
    switch (iconName) {
      case 'key':
        return <Key className="w-4 h-4 text-indigo-600 shrink-0" />;
      case 'thermometer':
        return <Thermometer className="w-4 h-4 text-indigo-600 shrink-0" />;
      case 'hard-drive':
        return <HardDrive className="w-4 h-4 text-indigo-600 shrink-0" />;
      case 'cpu':
      default:
        return <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />;
    }
  };

  const renderDynamicCarryRipple = () => {
    return (
      <div className="w-full flex flex-col gap-4 text-xs font-mono">
        {/* Presets and Inputs */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 text-[10px]">MODE:</span>
            <select
              value={exp1Op}
              onChange={(e) => setExp1Op(e.target.value as 'ADD' | 'SUB')}
              className="bg-white border border-slate-200 px-2 py-1 rounded text-[11px] font-bold text-indigo-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ADD">Addition (ADC)</option>
              <option value="SUB">Subtraction (SBB)</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setExp1Num1(['FF', 'FE', 'FD', 'FC']);
                setExp1Num2(['01', '02', '03', '04']);
                resetSimulator('exp1');
              }}
              className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
            >
              Max Carry Ripple
            </button>
            <button
              onClick={() => {
                setExp1Num1(['A5', '4C', '28', 'D1']);
                setExp1Num2(['1B', 'E3', '90', '22']);
                resetSimulator('exp1');
              }}
              className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
            >
              Custom Values
            </button>
            <button
              onClick={() => {
                const r1 = Array.from({length:4}, () => Math.floor(Math.random()*256).toString(16).toUpperCase().padStart(2, '0'));
                const r2 = Array.from({length:4}, () => Math.floor(Math.random()*256).toString(16).toUpperCase().padStart(2, '0'));
                setExp1Num1(r1);
                setExp1Num2(r2);
                resetSimulator('exp1');
              }}
              className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Random
            </button>
          </div>
        </div>

        {/* Core Schematic Representation */}
        <div className="grid grid-cols-4 gap-2 text-center relative py-2 bg-white/40 p-2 rounded-2xl border border-slate-100">
          {[3, 2, 1, 0].map((idx) => {
            const isActive = exp1Step === idx;
            const isProcessed = exp1Step > idx;
            return (
              <div 
                key={idx} 
                className={`flex flex-col border rounded-xl p-2 transition-all duration-300 relative ${
                  isActive 
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-400/20 scale-[1.03]' 
                    : isProcessed
                    ? 'border-emerald-200 bg-emerald-50/20 text-slate-600'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="text-[9px] font-black text-slate-400 mb-1">Byte {idx} {idx === 3 ? '(MSB)' : idx === 0 ? '(LSB)' : ''}</div>
                
                {/* Input 1 */}
                <input 
                  type="text"
                  maxLength={2}
                  value={exp1Num1[idx]}
                  onChange={(e) => {
                    const next = [...exp1Num1];
                    next[idx] = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');
                    setExp1Num1(next);
                    resetSimulator('exp1');
                  }}
                  className="w-full text-center bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded p-1 text-[11.5px] font-black text-slate-900 focus:outline-none"
                  disabled={exp1Step > 0}
                />
                
                <div className="my-1.5 font-bold text-slate-400 text-[10px]">{exp1Op === 'ADD' ? '+' : '-'}</div>

                {/* Input 2 */}
                <input 
                  type="text"
                  maxLength={2}
                  value={exp1Num2[idx]}
                  onChange={(e) => {
                    const next = [...exp1Num2];
                    next[idx] = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');
                    setExp1Num2(next);
                    resetSimulator('exp1');
                  }}
                  className="w-full text-center bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded p-1 text-[11.5px] font-black text-slate-900 focus:outline-none"
                  disabled={exp1Step > 0}
                />

                <div className="h-[1px] bg-slate-200 my-2" />

                {/* Result */}
                <div className={`font-mono font-bold text-center text-xs p-1 rounded ${
                  exp1Results[idx] 
                    ? 'bg-emerald-600 text-white font-extrabold shadow-3xs' 
                    : 'bg-slate-100 text-slate-400 italic font-medium'
                }`}>
                  {exp1Results[idx] ? `${exp1Results[idx]}H` : '??H'}
                </div>

                {/* Active index indicators */}
                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs whitespace-nowrap animate-bounce">
                    SI, DI Pointer
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Carry Ripple Pathway */}
        <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border border-amber-300 rounded-xl text-[11px] font-extrabold text-amber-950 shadow-3xs">
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-100 border border-amber-400 text-amber-950 px-1.5 py-0.5 rounded text-[9px] font-black">CARRY IN</span>
            <span className="font-mono text-xs font-black text-amber-950 bg-white/80 border border-amber-250 px-1.5 py-0.5 rounded">{exp1Carry}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-950 font-black">
            <span className="text-amber-900 font-bold">Ripple Propagation:</span>
            <span className="font-mono bg-amber-100/40 px-2 py-0.5 rounded border border-amber-200">CF = {exp1Carry} ➔ [ADC/SBB] ➔ Next Carry</span>
          </div>
          {exp1FinalCarry !== null && (
            <div className="flex items-center gap-1">
              <span className="bg-emerald-100 border border-emerald-400 text-emerald-950 px-1.5 py-0.5 rounded text-[9px] uppercase font-black">Final Flags</span>
              <span className="font-mono text-xs font-black text-emerald-900 bg-white/80 border border-emerald-200 px-1.5 py-0.5 rounded">CY = {exp1FinalCarry}</span>
            </div>
          )}
        </div>

        {/* Live Simulator Operations Console */}
        <div className="bg-slate-950 text-slate-200 p-3 rounded-2xl border border-slate-800 text-left font-mono">
          <div className="text-[9px] text-indigo-400 font-bold border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>TRACE CONTROLLER (ALP RUNTIME)</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-black">STEP {exp1Step}/4</span>
          </div>
          
          <div className="mt-2 text-[12px] leading-relaxed font-mono">
            {exp1Step === 4 ? (
              <p className="text-emerald-400 font-bold">
                ✓ Run Complete! Full 32-bit {exp1Op === 'ADD' ? 'Addition' : 'Subtraction'} performed successfully.
                <br />
                <span className="text-slate-400 text-[11px]">Final Output Value: {exp1Results.slice().reverse().join('')}H with {exp1Op === 'ADD' ? 'Carry' : 'Borrow'} = {exp1FinalCarry}.</span>
              </p>
            ) : (
              <div>
                <p className="text-slate-300">
                  <span className="text-indigo-400 font-bold">Executing Code:</span> {exp1Op === 'ADD' ? 'ADC AL, [DI]' : 'SBB AL, [DI]'} (Byte {exp1Step})
                </p>
                <p className="text-indigo-300 mt-1">
                  AL = {exp1Num1[exp1Step]}H, [DI] = {exp1Num2[exp1Step]}H, {exp1Op === 'ADD' ? 'CarryIn' : 'BorrowIn'} (CF) = {exp1Carry}
                </p>
                <p className="text-amber-400 mt-1 font-bold">
                  ➔ Calculation: {exp1Num1[exp1Step]}H {exp1Op === 'ADD' ? '+' : '-'} {exp1Num2[exp1Step]}H {exp1Op === 'ADD' ? '+' : '-'} {exp1Carry} (Carry) = {(parseInt(exp1Num1[exp1Step], 16) + (exp1Op === 'ADD' ? 1 : -1) * (parseInt(exp1Num2[exp1Step], 16) + exp1Carry)).toString(16).toUpperCase()}H
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-900 pt-2.5">
            <button
              onClick={() => resetSimulator('exp1')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-[10.5px] font-bold cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={() => stepSimulator('exp1')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-[10.5px] font-extrabold cursor-pointer flex items-center gap-1 shadow-xs"
            >
              {exp1Step >= 4 ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </>
              ) : (
                <>
                  <span>Execute Step {exp1Step + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDynamicRegisterPair = () => {
    const is16 = exp2Size === '16bit';
    const isSigned = exp2Op === 'IMUL' || exp2Op === 'IDIV';
    const isDiv = exp2Op === 'DIV' || exp2Op === 'IDIV';

    const op1BitSize = isDiv ? 16 : (is16 ? 16 : 8);
    const op2BitSize = is16 ? 16 : 8;

    const parseHex = (hex: string, bits: 8 | 16 | 32) => {
      const cleanHex = hex.trim();
      if (!cleanHex) return { unsigned: 0, signed: 0, isValid: false };
      const uVal = parseInt(cleanHex, 16);
      if (isNaN(uVal)) return { unsigned: 0, signed: 0, isValid: false };
      const limit = Math.pow(2, bits);
      const signBit = Math.pow(2, bits - 1);
      const sVal = uVal >= signBit ? uVal - limit : uVal;
      return { unsigned: uVal, signed: sVal, isValid: true };
    };

    const op1Parsed = parseHex(exp2Op1, op1BitSize);
    const op2Parsed = parseHex(exp2Op2, op2BitSize);

    const getDecString = (hexVal: string, bitSize: 8 | 16 | 32, signed: boolean) => {
      if (!hexVal) return '0';
      const parsed = parseInt(hexVal, 16);
      if (isNaN(parsed)) return '0';
      if (signed) {
        const limit = Math.pow(2, bitSize);
        const signBit = Math.pow(2, bitSize - 1);
        const sVal = parsed >= signBit ? parsed - limit : parsed;
        return `${sVal}`;
      } else {
        return `${parsed}`;
      }
    };

    const getComparisonData = () => {
      if (!op1Parsed.isValid || !op2Parsed.isValid) return null;
      const u1 = op1Parsed.unsigned;
      const u2 = op2Parsed.unsigned;
      const s1 = op1Parsed.signed;
      const s2 = op2Parsed.signed;

      if (isDiv) {
        if (u2 === 0) {
          return {
            unsignedExpr: `${u1} ÷ ${u2}`,
            unsignedResult: 'Division by Zero (INT 00H)',
            signedExpr: `${s1} ÷ ${s2}`,
            signedResult: 'Division by Zero (INT 00H)'
          };
        }
        
        // Unsigned Div
        const uQuot = Math.floor(u1 / u2);
        const uRem = u1 % u2;
        const uQuotLimit = is16 ? 65535 : 255;
        const uResultStr = uQuot > uQuotLimit ? 'Divide Overflow Error' : `Quotient = ${uQuot}, Remainder = ${uRem}`;

        // Signed Div
        let sResultStr = '';
        if (s2 === 0) {
          sResultStr = 'Division by Zero (INT 00H)';
        } else {
          const sQuot = Math.trunc(s1 / s2);
          const sRem = s1 % s2;
          const qMax = is16 ? 32767 : 127;
          const qMin = is16 ? -32768 : -128;
          if (sQuot > qMax || sQuot < qMin) {
            sResultStr = 'Divide Overflow Error';
          } else {
            sResultStr = `Quotient = ${sQuot}, Remainder = ${sRem}`;
          }
        }

        return {
          unsignedExpr: `${u1} ÷ ${u2}`,
          unsignedResult: uResultStr,
          signedExpr: `${s1} ÷ ${s2}`,
          signedResult: sResultStr,
        };
      } else {
        // Multiplication
        const uProd = u1 * u2;
        const sProd = s1 * s2;
        return {
          unsignedExpr: `${u1} × ${u2}`,
          unsignedResult: `Product = ${uProd}`,
          signedExpr: `${s1} × ${s2}`,
          signedResult: `Product = ${sProd}`,
        };
      }
    };

    const compData = getComparisonData();

    return (
      <div className="w-full flex flex-col gap-4 text-xs font-mono text-slate-800">
        {/* Controls block */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 text-[10px]">SIZE:</span>
            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
              {(['8bit', '16bit'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setExp2Size(sz);
                    setExp2Op1(sz === '8bit' ? 'A1' : '0A12');
                    setExp2Op2(sz === '8bit' ? '50' : '0050');
                    resetSimulator('exp2');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    exp2Size === sz ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {sz === '8bit' ? '8-Bit' : '16-Bit'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 text-[10px]">OPERATION:</span>
            <select
              value={exp2Op}
              onChange={(e) => {
                setExp2Op(e.target.value as any);
                resetSimulator('exp2');
              }}
              className="bg-white border border-slate-200 px-2 py-1 rounded text-[11px] font-bold text-indigo-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="MUL">MUL (Unsigned Mult)</option>
              <option value="IMUL">IMUL (Signed Mult)</option>
              <option value="DIV">DIV (Unsigned Div)</option>
              <option value="IDIV">IDIV (Signed Div)</option>
            </select>
          </div>
        </div>

        {/* Manual inputs & simulation schema */}
        <div className="grid grid-cols-2 gap-4 items-stretch bg-white/40 p-3 rounded-2xl border border-slate-100">
          <div className="space-y-2 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 block">
                  OPERAND 1 ({isDiv ? 'AX' : (is16 ? 'AX' : 'AL')})
                </label>
                <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black">
                  {isDiv ? '16-BIT DIVIDEND' : (is16 ? '16-BIT' : '8-BIT')}
                </span>
              </div>
              <input
                type="text"
                maxLength={isDiv ? 4 : (is16 ? 4 : 2)}
                value={exp2Op1}
                onChange={(e) => {
                  setExp2Op1(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''));
                  resetSimulator('exp2');
                }}
                placeholder={isDiv ? '0A12' : (is16 ? '0A12' : 'A1')}
                className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg p-2 font-mono font-black text-slate-900 text-sm focus:outline-none"
                disabled={exp2Step > 0}
              />
              <span className="text-[9px] text-slate-400 block font-bold uppercase mt-1 leading-none">
                {isDiv ? 'Dividend (Numerator)' : 'Multiplicand'}
              </span>
            </div>
            
            {op1Parsed.isValid && (
              <div className="text-[10px] text-slate-500 font-mono mt-2 flex flex-wrap gap-x-2 gap-y-0.5 justify-between bg-slate-50/80 px-2 py-1 rounded border border-slate-200/60 shadow-3xs">
                <span>Unsigned: <strong className="text-indigo-600 font-bold">{op1Parsed.unsigned}</strong></span>
                <span>Signed: <strong className={op1Parsed.signed < 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>{op1Parsed.signed}</strong></span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 block">
                  OPERAND 2 ({is16 ? 'BX' : 'BL'})
                </label>
                <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black">
                  {is16 ? '16-BIT' : '8-BIT'}
                </span>
              </div>
              <input
                type="text"
                maxLength={is16 ? 4 : 2}
                value={exp2Op2}
                onChange={(e) => {
                  setExp2Op2(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''));
                  resetSimulator('exp2');
                }}
                placeholder={is16 ? '0050' : '50'}
                className="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg p-2 font-mono font-black text-slate-900 text-sm focus:outline-none"
                disabled={exp2Step > 0}
              />
              <span className="text-[9px] text-slate-400 block font-bold uppercase mt-1 leading-none">
                {isDiv ? 'Divisor (Denominator)' : 'Multiplier'}
              </span>
            </div>

            {op2Parsed.isValid && (
              <div className="text-[10px] text-slate-500 font-mono mt-2 flex flex-wrap gap-x-2 gap-y-0.5 justify-between bg-slate-50/80 px-2 py-1 rounded border border-slate-200/60 shadow-3xs">
                <span>Unsigned: <strong className="text-indigo-600 font-bold">{op2Parsed.unsigned}</strong></span>
                <span>Signed: <strong className={op2Parsed.signed < 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>{op2Parsed.signed}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Registers Visual Graphic */}
        <div className="flex flex-col gap-2.5 items-center justify-center py-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-center gap-8 text-center w-full">
            <div className="flex flex-col items-center">
              <span className="text-[9.5px] text-slate-400 font-bold block mb-1">
                {isDiv ? 'AX REGISTER' : (is16 ? 'AX REGISTER' : 'AL REGISTER')}
              </span>
              <div className="bg-indigo-50 text-indigo-700 font-black text-sm p-2.5 px-5 rounded-xl border border-indigo-200 font-mono shadow-3xs min-w-[70px]">
                {exp2Op1 || '00'}H
              </div>
            </div>
            
            <div className="text-lg font-black text-slate-300">
              {isDiv ? '÷' : '×'}
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[9.5px] text-slate-400 font-bold block mb-1">
                {is16 ? 'BX REGISTER' : 'BL REGISTER'}
              </span>
              <div className="bg-indigo-50 text-indigo-700 font-black text-sm p-2.5 px-5 rounded-xl border border-indigo-200 font-mono shadow-3xs min-w-[70px]">
                {exp2Op2 || '00'}H
              </div>
            </div>
          </div>

          <div className="text-indigo-400 text-[10px] font-black animate-pulse flex items-center gap-1">
            <span>─── ALU HARDWARE CONVERTER EXECUTION ───▶</span>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center bg-white p-2.5 rounded-xl border border-slate-150">
              <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">
                {isDiv ? (is16 ? 'Quotient (AX)' : 'Quotient (AL)') : (is16 ? 'AX (Lower Product Word)' : 'AX (Full Product)')}
              </span>
              <strong className={`text-sm font-mono font-black ${exp2Step === 2 ? 'text-emerald-600' : 'text-slate-300'}`}>
                {exp2Step === 2 ? `${exp2ResultAX}H` : '????H'}
              </strong>
              
              {exp2Step === 2 && (
                <div className="text-[9.5px] text-slate-500 font-mono mt-2 flex flex-col items-center bg-slate-50/80 p-1.5 rounded-lg border border-slate-200 w-full gap-0.5">
                  <div>Unsigned: <strong className="text-indigo-600 font-bold">{getDecString(exp2ResultAX, isDiv ? (is16 ? 16 : 8) : 16, false)}</strong></div>
                  <div>Signed: <strong className="text-rose-600 font-bold">{getDecString(exp2ResultAX, isDiv ? (is16 ? 16 : 8) : 16, true)}</strong></div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center bg-white p-2.5 rounded-xl border border-slate-150">
              <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">
                {isDiv ? (is16 ? 'Remainder (DX)' : 'Remainder (AH)') : (is16 ? 'DX (Upper Product Word)' : 'DX (Not Used)')}
              </span>
              <strong className={`text-sm font-mono font-black ${exp2Step === 2 ? 'text-emerald-600' : 'text-slate-300'}`}>
                {exp2Step === 2 ? (isDiv ? (is16 ? `${exp2Remainder}H` : `${exp2Remainder}H`) : `${exp2ResultDX}H`) : '????H'}
              </strong>
              
              {exp2Step === 2 && (
                <div className="text-[9.5px] text-slate-500 font-mono mt-2 flex flex-col items-center bg-slate-50/80 p-1.5 rounded-lg border border-slate-200 w-full gap-0.5">
                  {isDiv ? (
                    <>
                      <div>Unsigned: <strong className="text-indigo-600 font-bold">{getDecString(exp2Remainder, is16 ? 16 : 8, false)}</strong></div>
                      <div>Signed: <strong className="text-rose-600 font-bold">{getDecString(exp2Remainder, is16 ? 16 : 8, true)}</strong></div>
                    </>
                  ) : is16 ? (
                    <>
                      <div>Unsigned: <strong className="text-indigo-600 font-bold">{getDecString(exp2ResultDX, 16, false)}</strong></div>
                      <div>Signed: <strong className="text-rose-600 font-bold">{getDecString(exp2ResultDX, 16, true)}</strong></div>
                    </>
                  ) : (
                    <span className="text-[9px] text-slate-400 py-1">Cleared / Not Used</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Simulator Operations Console */}
        <div className="bg-slate-950 text-slate-200 p-3.5 rounded-2xl border border-slate-800 text-left font-mono">
          <div className="text-[9px] text-indigo-400 font-bold border-b border-slate-800 pb-1.5 flex justify-between items-center">
            <span>MULTIPROCESSOR EXECUTION UNIT (ALU)</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-black text-[9px]">
              {exp2Step === 0 ? 'INPUT STAGE' : exp2Step === 1 ? 'LOAD STAGE' : 'COMPLETE'}
            </span>
          </div>

          <div className="mt-2 text-[12px] leading-relaxed font-mono min-h-[50px]">
            {exp2Error ? (
              <p className="text-rose-400 font-bold">❌ Error: {exp2Error}</p>
            ) : exp2Step === 0 ? (
              <p className="text-slate-400">
                Configure your hex operands above, then click <span className="text-indigo-400 font-bold">"Load Operands"</span> to begin.
              </p>
            ) : exp2Step === 1 ? (
              <p className="text-amber-400 font-bold">
                ✓ Operands loaded. Click <span className="text-indigo-300 font-bold">"Execute ALU Cycle"</span> to compute hex logic for {exp2Op}.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="text-emerald-400 font-bold">
                  <p>✓ Calculation completed successfully!</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Assembly Expression: <span className="text-indigo-300">{exp2Op} {is16 ? 'BX' : 'BL'}</span> (Operand1 in AX/AL = {exp2Op1}H, Operand2 in BX/BL = {exp2Op2}H)
                  </p>
                </div>

                {compData && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                      Comparative Register Analysis (Signed vs Unsigned):
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                      {/* Unsigned display */}
                      <div className={`p-2.5 rounded-xl border ${!isSigned ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-100' : 'bg-slate-950/30 border-slate-850 text-slate-400'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Unsigned Interpretation ({exp2Op.replace('I', '')})</span>
                          {!isSigned && <span className="bg-indigo-500 text-white text-[7px] px-1 py-0.5 rounded font-sans uppercase font-bold">Active Mode</span>}
                        </div>
                        <div className="text-[11px] font-bold text-slate-200">{compData.unsignedExpr}</div>
                        <div className="text-[11.5px] text-indigo-300 mt-1 font-semibold">{compData.unsignedResult}</div>
                      </div>

                      {/* Signed display */}
                      <div className={`p-2.5 rounded-xl border ${isSigned ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-100' : 'bg-slate-950/30 border-slate-850 text-slate-400'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">Signed Interpretation ({exp2Op.includes('I') ? exp2Op : 'I' + exp2Op})</span>
                          {isSigned && <span className="bg-rose-500 text-white text-[7px] px-1 py-0.5 rounded font-sans uppercase font-bold">Active Mode</span>}
                        </div>
                        <div className="text-[11px] font-bold text-slate-200">{compData.signedExpr}</div>
                        <div className="text-[11.5px] text-rose-300 mt-1 font-semibold">{compData.signedResult}</div>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-normal italic text-justify">
                      Notice how the CPU execution logic changes depending on signedness! The exact same hex binary patterns are interpreted as negative numbers in 2's complement when using signed instructions (IMUL/IDIV).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-900 pt-2.5">
            <button
              onClick={() => resetSimulator('exp2')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-[10.5px] font-bold cursor-pointer transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => stepSimulator('exp2')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-[10.5px] font-extrabold cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
            >
              {exp2Step === 2 ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </>
              ) : (
                <>
                  <span>{exp2Step === 0 ? 'Load Operands' : 'Execute ALU Cycle'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDynamicPointerScan = () => {
    return (
      <div className="w-full flex flex-col gap-4 text-xs font-mono text-slate-800">
        {/* Controls block */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 text-[10px]">ARRAY PRESETS:</span>
            <button
              onClick={() => {
                setExp3Array(['25', '4A', '12', '8B', '05', '92', '31', '15']);
                resetSimulator('exp3');
              }}
              className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
            >
              Preset 1
            </button>
            <button
              onClick={() => {
                setExp3Array(['FF', 'EE', 'DD', 'CC', 'BB', 'AA', '99', '88']);
                resetSimulator('exp3');
              }}
              className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
            >
              Decreasing
            </button>
            <button
              onClick={() => {
                const arr = Array.from({length:8}, () => Math.floor(Math.random()*256).toString(16).toUpperCase().padStart(2, '0'));
                setExp3Array(arr);
                resetSimulator('exp3');
              }}
              className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Randomize
            </button>
          </div>
        </div>

        {/* Array Visualization */}
        <div className="flex flex-col gap-1 text-left bg-white/40 p-3 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center text-slate-400 text-[9px] font-bold mb-1.5">
            <span>REGISTER SI (Offset index pointer)</span>
            <span>Scan Flow: Left to Right ────▶</span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto py-1">
            {exp3Array.map((val, i) => {
              const isCurrent = exp3Step === i;
              const isPassed = exp3Step > i;
              return (
                <div
                  key={i}
                  className={`flex-1 min-w-[32px] text-center p-2 rounded-xl border transition-all duration-300 relative ${
                    isCurrent
                      ? 'bg-amber-100 border-amber-500 text-amber-800 scale-[1.05] ring-2 ring-amber-400 font-black'
                      : isPassed
                      ? 'bg-slate-50 border-slate-200 text-slate-400'
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-900 font-bold'
                  }`}
                >
                  <div className="text-[8px] font-mono text-slate-400 mb-0.5">SI={i}</div>
                  <input
                    type="text"
                    maxLength={2}
                    value={val}
                    onChange={(e) => {
                      const next = [...exp3Array];
                      next[i] = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');
                      setExp3Array(next);
                      resetSimulator('exp3');
                    }}
                    className={`w-full text-center bg-transparent border-none text-[11px] font-mono font-bold focus:outline-none ${
                      isCurrent ? 'text-amber-950 font-black' : 'text-indigo-950'
                    }`}
                    disabled={exp3Step > 0}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Comparison Panel */}
        <div className="grid grid-cols-3 gap-2.5 items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
          <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-slate-150">
            <span className="text-[8.5px] text-slate-400 font-bold">AL (MAX SO FAR)</span>
            <strong className="text-sm text-indigo-700 font-black mt-0.5">{exp3MaxAL}H</strong>
          </div>

          <div className="flex flex-col items-center justify-center p-1 font-black bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-150 text-[10px] min-h-[45px]">
            {exp3Step === 0 ? (
              <span>CLICK STEP TO START</span>
            ) : exp3Step >= 8 ? (
              <span className="text-emerald-700">SCAN COMPLETED</span>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7.5px] text-indigo-500 uppercase">CMP Instruction</span>
                <span>{exp3Array[exp3Step - 1]}H vs {exp3MaxAL}H</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-slate-150">
            <span className="text-[8.5px] text-slate-400 font-bold">REMAINING CX</span>
            <strong className="text-sm text-indigo-700 font-black mt-0.5">
              {Math.max(0, 8 - exp3Step)}
            </strong>
          </div>
        </div>

        {/* Operations Console */}
        <div className="bg-slate-950 text-slate-200 p-3 rounded-2xl border border-slate-800 text-left font-mono">
          <div className="text-[9px] text-indigo-400 font-bold border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>REGISTER TRACE SCANNER (CMP ENGINE)</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-black">
              STEP {exp3Step}/8
            </span>
          </div>

          <div className="mt-2 text-[12px] leading-relaxed font-mono min-h-[50px]">
            {exp3Step === 0 ? (
              <p className="text-slate-400">
                Click <span className="text-indigo-400 font-bold">"Execute Step"</span> to initialize AL = [SI] and start scanning the array.
              </p>
            ) : exp3Step >= 8 ? (
              <p className="text-emerald-400 font-bold">
                ✓ Scan Complete! Maximum element found: <span className="text-white bg-emerald-600 px-1.5 py-0.5 rounded text-xs">{exp3MaxAL}H</span>
              </p>
            ) : (
              <div>
                <p className="text-slate-300">
                  <span className="text-indigo-400 font-bold">CMP AL, [SI]:</span> Comparing Current Max ({exp3MaxAL}H) with [SI] ({exp3Array[exp3Step - 1]}H).
                </p>
                {exp3IsGreater ? (
                  <p className="text-amber-400 font-bold mt-1">
                    ➔ AL ({exp3MaxAL}H) is already greater or equal. Skip update!
                  </p>
                ) : (
                  <p className="text-emerald-400 font-bold mt-1">
                    ➔ New maximum candidate found! Updating Register AL = {exp3Array[exp3Step - 1]}H.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-900 pt-2.5">
            <button
              onClick={() => resetSimulator('exp3')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-[10.5px] font-bold cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={() => stepSimulator('exp3')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-[10.5px] font-extrabold cursor-pointer flex items-center gap-1 shadow-xs"
            >
              {exp3Step >= 8 ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </>
              ) : (
                <>
                  <span>Execute Step {exp3Step + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDynamicBubbleSwap = () => {
    return (
      <div className="w-full flex flex-col gap-4 text-xs font-mono text-slate-800">
        {/* Array Presets and controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 text-[10px]">PRESETS:</span>
            <button
              onClick={() => {
                setExp4Array(['88', '11', '55', '22', '44', '33']);
                resetSimulator('exp4');
              }}
              className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
            >
              Reverse Sorted
            </button>
            <button
              onClick={() => {
                const arr = Array.from({length:6}, () => Math.floor(Math.random()*256).toString(16).toUpperCase().padStart(2, '0'));
                setExp4Array(arr);
                resetSimulator('exp4');
              }}
              className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Randomize
            </button>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <span>Pass: <span className="text-indigo-700 font-black">{exp4Pass}</span></span>
            <span className="mx-1">|</span>
            <span>Index SI: <span className="text-indigo-700 font-black">{exp4SI}</span></span>
          </div>
        </div>

        {/* Array Cards Map */}
        <div className="flex flex-col gap-1 text-left bg-white/40 p-3 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center text-slate-400 text-[9px] font-bold mb-1.5">
            <span>BUBBLE SORT ARRAY COMPONENT STACK</span>
            <span>Adjacent bounds compared: [SI] and [SI+1]</span>
          </div>

          <div className="flex gap-2">
            {exp4Array.map((val, i) => {
              const isSI = exp4SI === i;
              const isSIPlus = exp4SI + 1 === i;
              const isComparing = exp4StepActive === 'compare' || exp4StepActive === 'swap';
              const isSortedRegion = i >= exp4Array.length - exp4Pass + 1;
              
              let cardStyle = 'bg-indigo-50/50 border-indigo-100 text-indigo-900';
              if (isComparing && isSI) {
                cardStyle = 'bg-amber-100 border-amber-500 text-amber-800 scale-[1.04] ring-2 ring-amber-400 z-10 font-black';
              } else if (isComparing && isSIPlus) {
                cardStyle = 'bg-rose-100 border-rose-500 text-rose-800 scale-[1.04] ring-2 ring-rose-400 z-10 font-black';
              } else if (isSortedRegion) {
                cardStyle = 'bg-emerald-50 border-emerald-200 text-emerald-800/60 opacity-80';
              }

              return (
                <div
                  key={i}
                  className={`flex-1 text-center p-2.5 rounded-xl border transition-all duration-300 relative ${cardStyle}`}
                >
                  <div className="text-[7.5px] font-mono text-slate-400 mb-0.5">
                    {i === exp4SI ? 'SI' : i === exp4SI + 1 ? 'SI+1' : `Off ${i}`}
                  </div>
                  <input
                    type="text"
                    maxLength={2}
                    value={val}
                    onChange={(e) => {
                      const next = [...exp4Array];
                      next[i] = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');
                      setExp4Array(next);
                      resetSimulator('exp4');
                    }}
                    className={`w-full text-center bg-transparent border-none text-[12px] font-mono font-black focus:outline-none ${
                      isSI || isSIPlus ? 'text-slate-900' : 'text-indigo-950'
                    }`}
                    disabled={exp4StepActive !== 'compare' || exp4SI > 0 || exp4Pass > 1}
                  />
                  {isSortedRegion && (
                    <span className="absolute -top-1.5 right-1 bg-emerald-500 text-white rounded-full p-0.5 text-[6px] font-black scale-75">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time comparison text */}
        <div className="flex items-center justify-between p-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[10.5px] font-bold text-slate-700 font-mono">
          <div className="flex items-center gap-1">
            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[8.5px]">CMP</span>
            <span>[SI] ({exp4Array[exp4SI]}H) &gt; [SI+1] ({exp4Array[exp4SI + 1]}H) ?</span>
          </div>
          <div>
            {exp4StepActive === 'compare' ? (
              <span className="text-amber-600 animate-pulse">Evaluating...</span>
            ) : exp4Swapped ? (
              <span className="text-rose-600 font-black">YES, SWAP NEEDED!</span>
            ) : (
              <span className="text-emerald-600 font-black">NO, KEEP ORDER</span>
            )}
          </div>
        </div>

        {/* Execution Unit status console */}
        <div className="bg-slate-950 text-slate-200 p-3 rounded-2xl border border-slate-800 text-left font-mono">
          <div className="text-[9px] text-indigo-400 font-bold border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>BUBBLE SORT MULTI-PASS COMPILATION PROCESSOR</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-black uppercase">
              {exp4StepActive} Stage
            </span>
          </div>

          <div className="mt-2 text-[12px] leading-relaxed font-mono min-h-[50px]">
            {exp4StepActive === 'done' ? (
              <p className="text-emerald-400 font-bold">
                ✓ Array successfully sorted: <span className="text-white bg-emerald-600 px-1.5 py-0.5 rounded text-xs">{exp4Array.join('H, ')}H</span>
              </p>
            ) : exp4StepActive === 'compare' ? (
              <p className="text-slate-300">
                Comparing element <span className="text-amber-400 font-bold">{exp4Array[exp4SI]}H</span> with adjacent <span className="text-rose-400 font-bold">{exp4Array[exp4SI + 1]}H</span>.
              </p>
            ) : exp4StepActive === 'swap' ? (
              <p className="text-amber-400">
                {exp4Swapped ? (
                  <span>
                    ➔ Swap triggered! Loading [SI] into AL register and [SI+1] into AH, and cross-saving them.
                  </span>
                ) : (
                  <span>➔ Elements are in perfect order. No swap required.</span>
                )}
              </p>
            ) : (
              <p className="text-indigo-300">
                Incrementing SI index pointer to inspect next adjacent pair in active window.
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-900 pt-2.5">
            <button
              onClick={() => resetSimulator('exp4')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-[10.5px] font-bold cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={() => stepSimulator('exp4')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-[10.5px] font-extrabold cursor-pointer flex items-center gap-1 shadow-xs"
            >
              {exp4StepActive === 'done' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </>
              ) : (
                <>
                  <span>
                    {exp4StepActive === 'compare' ? 'Analyze CMP' : exp4StepActive === 'swap' ? 'Swap Buffers' : 'Next Pair'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDynamicBlockCopy = () => {
    return (
      <div className="w-full flex flex-col gap-4 text-xs font-mono text-slate-800">
        {/* Toggle Overlapping vs Non-overlapping */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 text-[10px]">MEMORY MAP:</span>
            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
              {(['none', 'forward', 'backward'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setExp5Overlap(mode);
                    resetSimulator('exp5');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    exp5Overlap === mode ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {mode === 'none' ? 'Non-Overlapping' : mode === 'forward' ? 'Overlap (Forward Copy Bug!)' : 'Overlap (Backward STD Fix!)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Source array row */}
        <div className="flex flex-col gap-1 text-left bg-white/40 p-2.5 rounded-xl border border-slate-100">
          <span className="text-indigo-600 text-[9px] font-bold uppercase leading-none mb-1.5 block">
            SOURCE MEMORY BLOCK (DS:SI starts at 1100H)
          </span>
          <div className="flex gap-2">
            {exp5Array.map((val, i) => {
              const isSourcePointer = exp5Overlap === 'backward'
                ? (5 - 1 - exp5Step === i && exp5Step < 5)
                : (exp5Step === i && exp5Step < 5);
              return (
                <div
                  key={i}
                  className={`flex-1 text-center p-2 rounded-xl border relative transition-all ${
                    isSourcePointer ? 'bg-amber-100 border-amber-500 text-amber-800 ring-2 ring-amber-400 font-black scale-[1.02]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-[7.5px] text-slate-400 mb-0.5">110{i}H</div>
                  <input
                    type="text"
                    maxLength={2}
                    value={val}
                    onChange={(e) => {
                      const next = [...exp5Array];
                      next[i] = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');
                      setExp5Array(next);
                      resetSimulator('exp5');
                    }}
                    className="w-full text-center bg-transparent border-none text-[11px] font-mono font-bold focus:outline-none"
                    disabled={exp5Step > 0}
                  />
                  {isSourcePointer && (
                    <span className="absolute -bottom-1.5 text-[7px] left-1/2 -translate-x-1/2 bg-amber-600 text-white px-1 rounded font-black whitespace-nowrap">
                      SI
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Destination array row */}
        <div className="flex flex-col gap-1 text-left bg-white/40 p-2.5 rounded-xl border border-slate-100">
          <span className="text-emerald-600 text-[9px] font-bold uppercase leading-none mb-1.5 block">
            DESTINATION MEMORY BLOCK (ES:DI starts at {exp5Overlap === 'none' ? '1200H' : '1102H'})
          </span>
          <div className="flex gap-2">
            {exp5DestArray.map((val, i) => {
              const destOffset = exp5Overlap === 'none' ? 0 : 2;
              const isDestPointer = exp5Overlap === 'backward'
                ? (5 - 1 - exp5Step + destOffset === i && exp5Step < 5)
                : (exp5Step + destOffset === i && exp5Step < 5);
              return (
                <div
                  key={i}
                  className={`flex-1 text-center p-2 rounded-xl border relative transition-all ${
                    isDestPointer ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400 font-black scale-[1.02]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-[7.5px] text-slate-400 mb-0.5">
                    {exp5Overlap === 'none' ? `120${i}H` : `110${i}H`}
                  </div>
                  <div className={`text-[11px] font-black ${val !== '00' ? 'text-emerald-700' : 'text-slate-300'}`}>
                    {val}H
                  </div>
                  {isDestPointer && (
                    <span className="absolute -bottom-1.5 text-[7px] left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-1 rounded font-black whitespace-nowrap">
                      DI
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulator Operations Console */}
        <div className="bg-slate-950 text-slate-200 p-3 rounded-2xl border border-slate-800 text-left font-mono">
          <div className="text-[9px] text-indigo-400 font-bold border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>STRING TRANSFER COPROCESSOR (REP MOVSB)</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-black">
              DF = {exp5Overlap === 'backward' ? '1 (DN)' : '0 (UP)'} | CX = {Math.max(0, 5 - exp5Step)}
            </span>
          </div>

          <div className="mt-2 text-[12px] leading-relaxed font-mono min-h-[50px]">
            {exp5Step >= 5 ? (
              <div className="text-emerald-400 font-bold">
                <p>✓ Transfer Complete!</p>
                {exp5Overlap === 'forward' ? (
                  <p className="text-rose-400 font-black text-[11px] mt-1 leading-snug">
                    ⚠️ ALERT: Look at the destination offsets! Because we copied forward, offsets 1102H and 1103H got overwritten before they could be read! The copied sequence is corrupted.
                  </p>
                ) : exp5Overlap === 'backward' ? (
                  <p className="text-emerald-400 font-black text-[11px] mt-1 leading-snug">
                    ✓ SUCCESS: By setting DF=1 (STD), the processor copied backwards (starting at 1104H to 1106H). No original data was overwritten before reading!
                  </p>
                ) : (
                  <p className="text-slate-400 text-[11px] mt-1">
                    Non-overlapping block copy completed perfectly into the 1200H space.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-slate-300">
                  <span className="text-indigo-400 font-bold">Instruction:</span> MOVSB (Byte {exp5Step + 1}/5)
                </p>
                {exp5Overlap === 'backward' ? (
                  <p className="text-amber-400 font-bold mt-1">
                    ➔ Reading from 110{4 - exp5Step}H ({exp5Array[4 - exp5Step]}H) and writing to 110{6 - exp5Step}H. SI & DI decrementing.
                  </p>
                ) : exp5Overlap === 'forward' ? (
                  <p className="text-rose-400 font-bold mt-1">
                    ➔ Reading from 110{exp5Step}H and writing to 110{exp5Step + 2}H.
                    {exp5Step >= 2 && <span className="block text-[10px] text-red-300 font-mono mt-0.5">* Notice: Reading value that was already overwritten!</span>}
                  </p>
                ) : (
                  <p className="text-emerald-400 font-bold mt-1">
                    ➔ Reading from 110{exp5Step}H ({exp5Array[exp5Step]}H) and writing to 120{exp5Step}H.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-900 pt-2.5">
            <button
              onClick={() => resetSimulator('exp5')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-[10.5px] font-bold cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={() => stepSimulator('exp5')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-[10.5px] font-extrabold cursor-pointer flex items-center gap-1 shadow-xs"
            >
              {exp5Step >= 5 ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </>
              ) : (
                <>
                  <span>Copy Byte {exp5Step + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSchematicDiagram = (diagramType: string) => {
    switch (diagramType) {
      case 'carry-ripple':
        return renderDynamicCarryRipple();
      case 'register-pair':
        return renderDynamicRegisterPair();
      case 'pointer-scan':
        return renderDynamicPointerScan();
      case 'bubble-swap':
        return renderDynamicBubbleSwap();
      case 'block-copy':
        return renderDynamicBlockCopy();
      default:
        return null;
    }
  };

  const renderStaticCalculations = () => {
    const activeLabData = labManualPagesData[selectedLabId] || labManualPagesData['exp1'];
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-1 flex flex-col gap-2">
        {activeLabData.manualCalculations.steps.map((st, idx) => (
          <div key={idx} className="bg-white border border-slate-150 p-3 rounded-xl flex flex-col gap-1 shadow-3xs hover:border-teal-200 transition-all">
            <div className="flex items-center gap-2">
              <span className="bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase">
                Step {idx + 1}
              </span>
              <h5 className="font-bold text-[13px] text-slate-900">{st.step}</h5>
            </div>
            <p className="text-[13px] text-slate-600 leading-normal pl-2 border-l-2 border-slate-100">
              {st.detail}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderDynamicCalculationsExpMath = () => {
    const n = expMathInput;
    const squareVal = n * n;
    const cubeVal = n * n * n;
    
    // Factorial calculation and iterations trace
    let factVal = 1;
    const factTrace = [];
    for (let i = n; i >= 1; i--) {
      const prevFact = factVal;
      factVal = factVal * i;
      factTrace.push({
        iteration: n - i + 1,
        cxVal: i,
        prevAX: prevFact,
        currAX: factVal,
        detail: `AX (${prevFact}) * CX (${i}) = ${factVal}`
      });
    }

    return (
      <div className="space-y-5 text-left">
        {/* Interactive Control Block */}
        <div className="bg-teal-50 border border-teal-150 p-3.5 rounded-2xl text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="font-bold text-[13px]">Active Input (NUM DB):</span>
            <span className="bg-teal-100 px-2.5 py-0.5 rounded text-xs font-black">N = {n}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpMathInput(prev => Math.max(1, prev - 1))}
              disabled={n <= 1}
              className="w-7 h-7 flex items-center justify-center bg-white border border-teal-200 rounded-lg hover:bg-teal-100 disabled:opacity-50 text-teal-800 font-extrabold cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center font-bold font-sans text-slate-800 text-sm">{n}</span>
            <button
              onClick={() => setExpMathInput(prev => Math.min(8, prev + 1))}
              disabled={n >= 8}
              className="w-7 h-7 flex items-center justify-center bg-white border border-teal-200 rounded-lg hover:bg-teal-100 disabled:opacity-50 text-teal-800 font-extrabold cursor-pointer"
            >
              +
            </button>
            <span className="text-[10px] text-slate-500 italic font-sans ml-1">(Limit: 1 - 8)</span>
          </div>
        </div>

        {/* Square and Cube Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-150 p-3.5 rounded-2xl space-y-2.5 shadow-3xs hover:border-indigo-200 transition-colors">
            <span className="text-[9.5px] font-mono font-black text-indigo-600 uppercase tracking-widest block border-b border-slate-100 pb-1.5">
              1. SQUARE CALCULATION (N²)
            </span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Operation:</span>
                <span className="font-mono text-slate-800 font-extrabold">{n} × {n}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Decimal Result:</span>
                <span className="font-sans font-black text-slate-900">{squareVal}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Hexadecimal (SQUARE):</span>
                <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {squareVal.toString(16).toUpperCase().padStart(4, '0')}H
                </span>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[8px] font-mono font-extrabold text-slate-400 block uppercase">8086 Assembly Logic:</span>
              <pre className="font-mono text-[10.5px] leading-tight text-slate-600">
                {`MOV AL, NUM  ; AL = ${n}\nXOR AH, AH   ; AX = ${n}\nMUL AL       ; AX = ${squareVal} (${squareVal.toString(16).toUpperCase()}H)`}
              </pre>
            </div>
          </div>

          <div className="bg-white border border-slate-150 p-3.5 rounded-2xl space-y-2.5 shadow-3xs hover:border-indigo-200 transition-colors">
            <span className="text-[9.5px] font-mono font-black text-indigo-600 uppercase tracking-widest block border-b border-slate-100 pb-1.5">
              2. CUBE CALCULATION (N³)
            </span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Operation:</span>
                <span className="font-mono text-slate-800 font-extrabold">{squareVal} × {n}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Decimal Result:</span>
                <span className="font-sans font-black text-slate-900">{cubeVal}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Hexadecimal (CUBE):</span>
                <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {cubeVal.toString(16).toUpperCase().padStart(4, '0')}H
                </span>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[8px] font-mono font-extrabold text-slate-400 block uppercase">8086 Assembly Logic:</span>
              <pre className="font-mono text-[10.5px] leading-tight text-slate-600">
                {`MOV BX, AX   ; BX = ${squareVal}\nMOV AL, NUM  ; AL = ${n}\nXOR AH, AH   ; AH = 0\nMUL BX       ; AX = ${cubeVal} (${cubeVal.toString(16).toUpperCase()}H)`}
              </pre>
            </div>
          </div>
        </div>

        {/* Factorial Loop Walkthrough Block */}
        <div className="bg-white border border-slate-150 p-4 rounded-2xl space-y-3 shadow-3xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest block">
              3. FACTORIAL LOOP TRACE (N!)
            </span>
            <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 font-mono font-black text-[10px] px-2.5 py-0.5 rounded-lg">
              Result: {factVal} ({factVal.toString(16).toUpperCase().padStart(4, '0')}H)
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <p className="leading-relaxed">
              Factorial of <strong className="text-slate-900">{n}</strong> is computed iteratively using the <strong className="font-mono text-slate-900 bg-slate-100 px-1 rounded text-[11px]">LOOP</strong> instruction, executing exactly <strong className="text-slate-900">{n}</strong> times:
            </p>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-xl bg-slate-50/45">
            <table className="w-full text-left border-collapse font-mono text-[11.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-500 font-black uppercase text-[9px] border-b border-slate-200">
                  <th className="px-3 py-2 border-r border-slate-200 text-center w-12">Iter</th>
                  <th className="px-3 py-2 border-r border-slate-200 text-center">CX (Counter)</th>
                  <th className="px-3 py-2 border-r border-slate-200">Active Multiply</th>
                  <th className="px-3 py-2">AX (Accumulator)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white font-black text-slate-700">
                {factTrace.map((tr) => (
                  <tr key={tr.iteration} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-2 border-r border-slate-200 text-center bg-slate-50/40">{tr.iteration}</td>
                    <td className="px-3 py-2 border-r border-slate-200 text-center font-bold">{tr.cxVal}</td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-600 font-medium">{tr.detail}</td>
                    <td className="px-3 py-2 text-indigo-600 bg-indigo-50/20">{tr.currAX.toString(16).toUpperCase().padStart(4, '0')}H ({tr.currAX})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDynamicCalculationsExp1 = () => {
    const stepsTrace = [];
    let carry = 0;
    for (let i = 0; i < 4; i++) {
      const a = parseInt(exp1Num1[i] || '0', 16);
      const b = parseInt(exp1Num2[i] || '0', 16);
      const carryIn = carry;
      
      let sumOrDiff = 0;
      let carryOut = 0;
      let label = '';
      let equation = '';
      
      if (exp1Op === 'ADD') {
        sumOrDiff = a + b + carryIn;
        carryOut = sumOrDiff > 255 ? 1 : 0;
        const res = sumOrDiff & 0xFF;
        equation = `${exp1Num1[i]}H + ${exp1Num2[i]}H + CarryIn(${carryIn}) = ${res.toString(16).toUpperCase()}H`;
        label = `Byte ${i} Addition (ADC)`;
        carry = carryOut;
      } else {
        sumOrDiff = a - b - carryIn;
        carryOut = sumOrDiff < 0 ? 1 : 0;
        const res = (sumOrDiff + 256) & 0xFF;
        equation = `${exp1Num1[i]}H - ${exp1Num2[i]}H - BorrowIn(${carryIn}) = ${res.toString(16).toUpperCase()}H`;
        label = `Byte ${i} Subtraction (SBB)`;
        carry = carryOut;
      }
      
      stepsTrace.push({ label, equation, carryIn, carryOut, a, b, res: sumOrDiff & 0xFF });
    }

    return (
      <div className="space-y-4">
        <div className="bg-teal-50 border border-teal-150 p-3 rounded-2xl text-teal-950 flex items-center justify-between text-[11px] font-bold">
          <span>Active Inputs: Num1 = {exp1Num1.slice().reverse().join('')}H | Num2 = {exp1Num2.slice().reverse().join('')}H</span>
          <span className="bg-teal-100 px-2 py-0.5 rounded text-[9px] uppercase font-mono">{exp1Op} MODE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stepsTrace.map((st, i) => (
            <div key={i} className="bg-white border border-slate-200 hover:border-teal-300 p-3.5 rounded-2xl shadow-3xs transition-all text-left">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                  STEP {i + 1}
                </span>
                <span className="font-bold text-slate-800 text-[12px]">{st.label}</span>
              </div>
              <div className="font-mono text-[11.5px] font-black text-indigo-700 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 my-2">
                {st.equation}
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>• Hex values: <span className="font-mono text-slate-800 font-bold">{st.a.toString(16).toUpperCase()}H</span> ({st.a}) and <span className="font-mono text-slate-800 font-bold">{st.b.toString(16).toUpperCase()}H</span> ({st.b})</li>
                <li>• Carry Input = <span className="font-bold">{st.carryIn}</span>, resulting in Carry Output = <span className="text-amber-600 font-bold">{st.carryOut}</span></li>
                <li>• Stored sum/diff in memory offset RESULT+{i} is <span className="font-mono text-emerald-600 font-bold">{st.res.toString(16).toUpperCase().padStart(2, '0')}H</span></li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDynamicCalculationsExp2 = () => {
    const is16 = exp2Size === '16bit';
    const isSigned = exp2Op === 'IMUL' || exp2Op === 'IDIV';
    const isDiv = exp2Op === 'DIV' || exp2Op === 'IDIV';
    
    let val1 = parseInt(exp2Op1 || '0', 16);
    let val2 = parseInt(exp2Op2 || '1', 16);
    if (isNaN(val1)) val1 = 0;
    if (isNaN(val2) || val2 === 0) val2 = 1;

    const limit = is16 ? 65536 : 256;
    const signBit = is16 ? 0x8000 : 0x80;
    
    let sVal1 = val1;
    let sVal2 = val2;
    if (isSigned) {
      if ((sVal1 & signBit) !== 0) sVal1 -= limit;
      if ((sVal2 & signBit) !== 0) sVal2 -= limit;
    }

    return (
      <div className="space-y-4 text-left">
        <div className="bg-teal-50 border border-teal-150 p-3 rounded-2xl text-teal-950 flex items-center justify-between text-[11.5px] font-bold font-mono">
          <span>Active Inputs: Op1 = {exp2Op1}H | Op2 = {exp2Op2}H</span>
          <span className="bg-teal-100 px-2 py-0.5 rounded text-[9px] uppercase font-mono">{exp2Op} ({exp2Size})</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3.5 shadow-3xs">
          <div>
            <h5 className="font-bold text-slate-800 text-sm mb-1">Step 1: Operand Interpretation</h5>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Before hardware processing, the registers parse the binary signals into standard numerical structures:
              <br />
              • Operand 1: <strong className="font-mono text-slate-900">{exp2Op1}H</strong> translates to decimal <strong className="text-indigo-600">{val1}</strong> (Unsigned) {isSigned && `or ${sVal1} (Signed 2's Complement)`}.
              <br />
              • Operand 2: <strong className="font-mono text-slate-900">{exp2Op2}H</strong> translates to decimal <strong className="text-indigo-600">{val2}</strong> (Unsigned) {isSigned && `or ${sVal2} (Signed 2's Complement)`}.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h5 className="font-bold text-slate-800 text-sm mb-1">Step 2: Arithmetic ALU Formula</h5>
            <div className="bg-indigo-50/50 border border-indigo-100 font-mono text-xs p-2.5 rounded-lg text-indigo-700 font-black my-2">
              {isDiv ? (
                <span>
                  Quotient = {isSigned ? sVal1 : val1} / {isSigned ? sVal2 : val2} = {isSigned ? Math.trunc(sVal1 / sVal2) : Math.floor(val1 / val2)}
                  <br />
                  Remainder = {isSigned ? sVal1 : val1} % {isSigned ? sVal2 : val2} = {isSigned ? sVal1 % sVal2 : val1 % val2}
                </span>
              ) : (
                <span>
                  Product = {isSigned ? sVal1 : val1} * {isSigned ? sVal2 : val2} = {isSigned ? sVal1 * sVal2 : val1 * val2}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h5 className="font-bold text-slate-800 text-sm mb-1">Step 3: Bit Allocation to Intel Registers</h5>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Based on the 8086 Instruction Set architecture specs:
              <br />
              {isDiv ? (
                is16 ? (
                  <span>
                    • Quotient goes to <strong className="font-mono text-slate-800">AX</strong>: {(isSigned ? Math.trunc(sVal1 / sVal2) : Math.floor(val1 / val2)) & 0xFFFF} (Hex: {((isSigned ? Math.trunc(sVal1 / sVal2) : Math.floor(val1 / val2)) & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}H)
                    <br />
                    • Remainder goes to <strong className="font-mono text-slate-800">DX</strong>: {(isSigned ? sVal1 % sVal2 : val1 % val2) & 0xFFFF} (Hex: {((isSigned ? sVal1 % sVal2 : val1 % val2) & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}H)
                  </span>
                ) : (
                  <span>
                    • Quotient goes to <strong className="font-mono text-slate-800">AL</strong>: {(isSigned ? Math.trunc(sVal1 / sVal2) : Math.floor(val1 / val2)) & 0xFF} (Hex: {((isSigned ? Math.trunc(sVal1 / sVal2) : Math.floor(val1 / val2)) & 0xFF).toString(16).toUpperCase().padStart(2, '0')}H)
                    <br />
                    • Remainder goes to <strong className="font-mono text-slate-800">AH</strong>: {(isSigned ? sVal1 % sVal2 : val1 % val2) & 0xFF} (Hex: {((isSigned ? sVal1 % sVal2 : val1 % val2) & 0xFF).toString(16).toUpperCase().padStart(2, '0')}H)
                  </span>
                )
              ) : (
                is16 ? (
                  <span>
                    • Upper Word of Product is stored in <strong className="font-mono text-slate-800">DX</strong>
                    <br />
                    • Lower Word of Product is stored in <strong className="font-mono text-slate-800">AX</strong>
                  </span>
                ) : (
                  <span>
                    • Full 16-bit Product is stored in <strong className="font-mono text-slate-800">AX</strong> register
                  </span>
                )
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderDynamicCalculationsExp3 = () => {
    const trace = [];
    let currentMax = parseInt(exp3Array[0] || '0', 16);
    
    trace.push({
      step: "SI = 0 (Initialization)",
      detail: `AL register is pre-loaded with the first array element [0] which is ${exp3Array[0]}H (decimal ${parseInt(exp3Array[0], 16)}). The index pointer SI is set to 1, and CX loop register is set to 7.`
    });

    for (let i = 1; i < 8; i++) {
      const val = parseInt(exp3Array[i] || '0', 16);
      const isGreater = val > currentMax;
      const oldMax = currentMax;
      if (isGreater) {
        currentMax = val;
      }
      trace.push({
        step: `Loop Iteration ${i} (SI = ${i})`,
        detail: `CMP AL (${oldMax.toString(16).toUpperCase()}H) with [SI] (${exp3Array[i]}H). Since [SI] is ${isGreater ? 'greater than AL, we update AL' : 'not greater than AL, we skip assignment'}. AL remains ${currentMax.toString(16).toUpperCase()}H.`
      });
    }

    return (
      <div className="space-y-4 text-left font-mono">
        <div className="bg-teal-50 border border-teal-150 p-3 rounded-2xl text-teal-950 flex items-center justify-between text-[11.5px] font-bold">
          <span>Active Array: [{exp3Array.join('H, ')}H]</span>
          <span className="bg-teal-100 px-2 py-0.5 rounded text-[9px] uppercase">Max Search</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
          {trace.map((t, i) => (
            <div key={i} className="bg-white border border-slate-150 p-3 rounded-xl flex flex-col gap-1 shadow-3xs hover:border-teal-200 transition-all text-left">
              <div className="flex items-center gap-2">
                <span className="bg-teal-50 border border-teal-100 text-teal-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase">
                  {i === 0 ? 'Init' : `CMP ${i}`}
                </span>
                <h5 className="font-bold text-[13px] text-slate-900">{t.step}</h5>
              </div>
              <p className="text-[13px] text-slate-600 leading-normal pl-2 border-l-2 border-slate-100">
                {t.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDynamicCalculationsExp4 = () => {
    return (
      <div className="space-y-4 text-left font-mono">
        <div className="bg-teal-50 border border-teal-150 p-3 rounded-2xl text-teal-950 flex items-center justify-between text-[11.5px] font-bold">
          <span>Active Array State: [{exp4Array.join('H, ')}H]</span>
          <span className="bg-teal-100 px-2 py-0.5 rounded text-[9px] uppercase">BUBBLE SORT</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-3xs">
          <h5 className="font-bold text-slate-800 text-sm">Step-by-Step Sorting Strategy</h5>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Bubble sort performs adjacent comparisons of array elements, shifting larger bytes to the right in multiple passes:
          </p>
          <ul className="space-y-2 text-[12.5px] text-slate-600 pl-4 list-disc leading-relaxed">
            <li>
              • <strong>Register CX & DX Limits:</strong> The outer loop is managed by register DX (count = N-1). The inner loop is managed by CX, which decrements on each pass to ignore already-sorted elements at the end.
            </li>
            <li>
              • <strong>Buffer Swapping:</strong> If [SI] is greater than [SI+1], [SI] is temporarily cached in AL, [SI+1] is placed in [SI], and AL is restored to [SI+1].
            </li>
            <li>
              • <strong>Active Index Trace:</strong> Currently comparing index <span className="font-mono font-bold text-slate-800">{exp4SI}</span> ({exp4Array[exp4SI]}H) and <span className="font-mono font-bold text-slate-800">{exp4SI+1}</span> ({exp4Array[exp4SI+1]}H). Since {parseInt(exp4Array[exp4SI],16)} {parseInt(exp4Array[exp4SI],16) > parseInt(exp4Array[exp4SI+1],16) ? '>' : '<='} {parseInt(exp4Array[exp4SI+1],16)}, a swap is {parseInt(exp4Array[exp4SI],16) > parseInt(exp4Array[exp4SI+1],16) ? 'REQUIRED' : 'NOT REQUIRED'}.
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const renderDynamicCalculationsExp5 = () => {
    const isBack = exp5Overlap === 'backward';
    const isForwardOverlap = exp5Overlap === 'forward';
    
    return (
      <div className="space-y-4 text-left font-mono">
        <div className="bg-teal-50 border border-teal-150 p-3 rounded-2xl text-teal-950 flex items-center justify-between text-[11.5px] font-bold">
          <span>Active Mode: {exp5Overlap === 'none' ? 'Non-overlapping' : isForwardOverlap ? 'Forward Overlap' : 'Backward Overlap'}</span>
          <span className="bg-teal-100 px-2 py-0.5 rounded text-[9px] uppercase">MOVSB BLOCK COPY</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3.5 shadow-3xs font-sans">
          <div>
            <h5 className="font-bold text-slate-800 text-sm mb-1 font-sans">How String Instructions Handle Overlap</h5>
            <p className="text-[13px] text-slate-600 leading-relaxed font-sans">
              When copying memory blocks that overlap (e.g., copying a block of size 5 from 1100H to 1102H):
            </p>
          </div>

          {isForwardOverlap ? (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-950 text-xs space-y-2 font-mono">
              <strong className="text-rose-800 text-[13px] block">⚠️ The Forward Copy Overwrite Bug (DF = 0)</strong>
              <p className="leading-relaxed">
                When copying forward starting at index 0 (1100H):
                <br />
                • Copy 1100H (10H) to 1102H. Offset 1102H becomes 10H (overwriting original value 30H).
                <br />
                • Copy 1101H (20H) to 1103H. Offset 1103H becomes 20H (overwriting original value 40H).
                <br />
                • When we reach offset 1102H, we try to copy its original value, but it is already overwritten with 10H!
                <br />
                ➔ Resulting corrupted block: <strong className="font-mono">[10H, 20H, 10H, 20H, 10H]</strong> instead of original sequence!
              </p>
            </div>
          ) : isBack ? (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-950 text-xs space-y-2 font-mono">
              <strong className="text-emerald-800 text-[13px] block">✓ The Backward STD Solution (DF = 1)</strong>
              <p className="leading-relaxed">
                To prevent overwriting, we set Direction Flag <strong className="font-mono">DF = 1</strong> using <strong className="font-mono">STD</strong>, starting at the END of the blocks:
                <br />
                • SI starts at 1104H (50H) and DI starts at 1106H.
                <br />
                • Copy 1104H (50H) to 1106H.
                <br />
                • Decrement SI & DI. Copy 1103H (40H) to 1105H.
                <br />
                • Pointers decrement safely towards the start, ensuring we ALWAYS read original values before they are written over.
                <br />
                ➔ Perfect copy integrity achieved!
              </p>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-950 text-xs space-y-2 font-sans">
              <strong className="text-indigo-800 text-[13px] block">✓ Clean Non-overlapping Transfer</strong>
              <p className="leading-relaxed">
                Since source blocks and destination blocks do not share any physical memory lanes (Source = 1100H, Destination = 1200H), the copy proceeds linearly without any side effects.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDynamicCalculations = () => {
    switch (selectedLabId) {
      case 'exp1':
        return renderDynamicCalculationsExp1();
      case 'exp2':
        return renderDynamicCalculationsExp2();
      case 'exp_math':
        return renderDynamicCalculationsExpMath();
      case 'exp3':
        return renderDynamicCalculationsExp3();
      case 'exp4':
        return renderDynamicCalculationsExp4();
      case 'exp5':
        return renderDynamicCalculationsExp5();
      default:
        return renderStaticCalculations();
    }
  };

  const renderPageContent = (pageIdx: number) => {
    const activeLabData = labManualPagesData[selectedLabId] || labManualPagesData['exp1'];
    const activeLab = labExperiments.find(l => l.id === selectedLabId) || labExperiments[0];

    switch (pageIdx) {
      case 0:
        return (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-150 p-3.5 rounded-2xl text-left">
                <h4 className="text-[10.5px] font-bold font-mono text-indigo-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  Aim of Experiment
                </h4>
                <p className="text-[14px] font-medium leading-relaxed text-slate-800 text-justify">
                  {activeLabData.aim}
                </p>
              </div>

              {/* Directives and Instructions Used Section */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-3.5 text-left shadow-3xs">
                <h4 className="text-[10.5px] font-bold font-mono text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Sliders className="w-4 h-4 text-indigo-600 animate-pulse" />
                  Opcodes & Directives Reference
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] font-mono font-black text-slate-500 uppercase tracking-wider block">Assembler Directives Used:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeLab.directivesUsed && activeLab.directivesUsed.length > 0 ? (
                        activeLab.directivesUsed.map((dir, dIdx) => (
                          <span key={dIdx} className="bg-amber-50 border border-amber-200/80 text-amber-800 text-[11.5px] font-mono font-black px-2 py-0.5 rounded-lg shadow-3xs">
                            {dir}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">None</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] font-mono font-black text-slate-500 uppercase tracking-wider block">8086 Assembly Instructions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {getInstructionsUsed(activeLab.id).map((ins, iIdx) => (
                        <span key={iIdx} className="bg-indigo-50 border border-indigo-200/80 text-indigo-800 text-[11.5px] font-mono font-black px-2 py-0.5 rounded-lg shadow-3xs">
                          {ins}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <div className="bg-emerald-50/50 border border-emerald-200/60 p-3 rounded-xl">
                  <h5 className="text-[10px] font-bold font-mono text-emerald-700 uppercase tracking-wider mb-1.5">Core Objective</h5>
                  <p className="text-[13px] text-slate-700 leading-relaxed text-justify">
                    {activeLabData.objectives[0]}
                  </p>
                </div>
                <div className="bg-blue-50/50 border border-blue-200/60 p-3 rounded-xl">
                  <h5 className="text-[10px] font-bold font-mono text-blue-700 uppercase tracking-wider mb-1.5">Key Focus Area</h5>
                  <p className="text-[13px] text-slate-700 leading-relaxed text-justify">
                    {activeLabData.objectives[1]}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2 text-left">
              <h4 className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Learning Outcomes
              </h4>
              <ul className="space-y-1.5">
                {activeLabData.outcomes.map((o, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[13px] text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                    <span className="leading-tight text-justify">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4 flex-1 flex flex-col justify-center text-left">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block mb-2">
              Hardware & Software Components Table:
            </span>
            <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10.5px] font-mono text-slate-500 uppercase tracking-wider font-extrabold">
                    <th className="px-4 py-2.5 w-12 text-center border-r border-slate-200">S.No</th>
                    <th className="px-4 py-2.5 border-r border-slate-200">Component / Tool</th>
                    <th className="px-4 py-2.5 border-r border-slate-200">Specification</th>
                    <th className="px-4 py-2.5">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {activeLabData.components.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/55 transition-colors text-[13px] text-slate-700">
                      <td className="px-4 py-2.5 font-mono font-bold text-center border-r border-slate-200 bg-slate-50/20">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900 border-r border-slate-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {comp.name}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-600 border-r border-slate-200 bg-indigo-50/10">{comp.spec}</td>
                      <td className="px-4 py-2.5 leading-snug text-justify">{comp.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-amber-900 font-medium">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Note: Standard laboratory compilation requires DOSBox 0.74 shell mapping to local MASM bin directories.</span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 flex-1 flex flex-col justify-between text-left">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Experimental Lab Procedure:</span>
            <div className="flex flex-col gap-2 flex-1">
              {activeLabData.procedureSteps.map((step, idx) => (
                <div key={idx} className="bg-white border border-slate-150 p-3 rounded-xl flex gap-2.5 items-start shadow-3xs hover:border-indigo-200 hover:shadow-xs transition-all border-l-4 border-l-indigo-500">
                  <span className="font-mono text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-[13px] leading-tight text-slate-700 text-justify flex-1 font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
            <div className="space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Technical Theory Context:</span>
              <p className="text-[14px] text-slate-700 leading-relaxed text-justify bg-slate-50/60 p-3 rounded-xl border border-slate-200/60 font-medium">
                {activeLabData.theoryText}
              </p>
            </div>
            
            {selectedLabId === 'exp2' ? (
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs space-y-4">
                <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest block border-b border-slate-100 pb-2">
                  Interactive Signed & Unsigned Number Representation Converter
                </span>
                <SignedUnsignedVisualizer />
              </div>
            ) : selectedLabId === 'exp_math' ? (
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-3xs space-y-4">
                <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest block border-b border-slate-100 pb-2">
                  Interactive Math Loop & Counter Simulator (CX-based)
                </span>
                <MathLoopTheoryVisualizer />
              </div>
            ) : (
              <div className="bg-white border border-slate-200 p-3 rounded-2xl flex-1 flex flex-col justify-center items-center shadow-3xs min-h-[160px]">
                <span className="text-[9px] font-bold font-mono text-indigo-500 uppercase tracking-widest mb-2">Interactive Schematic Diagram</span>
                {renderSchematicDiagram(activeLabData.theoryDiagramType)}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-3 flex-1 flex flex-col justify-between text-left">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Sequential Execution Steps:</span>
            <div className="flex flex-col gap-2 flex-1">
              {activeLabData.algorithmSteps.map((step, idx) => (
                <div key={idx} className="bg-white border border-slate-150 p-3 rounded-xl flex gap-2.5 items-start shadow-3xs hover:border-indigo-200 hover:shadow-xs transition-all animate-fade-in">
                  <span className="font-mono text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-[13px] leading-tight text-slate-700 text-justify flex-1 font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3 flex-1 flex flex-col justify-between text-left">
            <div className="flex flex-col gap-1 shrink-0">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Engineering Logic Flowchart:</span>
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-2.5 px-3 text-[11px] text-indigo-900 font-medium flex items-center gap-2 shadow-3xs">
                <span className="bg-indigo-600 text-white rounded-full p-0.5 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span>
                  <strong>Interactive Flow:</strong> Hover over the <span className="text-emerald-700 font-black">YES</span> or <span className="text-rose-700 font-black">NO</span> options on any decision card to light up its target step!
                </span>
              </div>
            </div>

            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex-1 flex flex-col items-center justify-start shadow-3xs">
              <div className="flex flex-col items-center justify-start gap-1 w-full max-w-md py-4 px-4 sm:px-14">
                {activeLabData.flowchartSteps.map((step, idx) => {
                  const isStartStop = step.type === 'start' || step.type === 'stop';
                  const isDecision = step.type === 'decision';
                  const isIO = step.type === 'io';
                  const isStepHovered = hoveredTargetStepIdx === idx;

                  return (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <div className="flex flex-col items-center justify-center shrink-0 my-1 relative">
                          <div className="w-[2px] h-4 bg-indigo-200" />
                          <div className="bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full p-0.5 shadow-3xs flex items-center justify-center relative">
                            <ChevronDown className="w-3.5 h-3.5" />
                            {activeLabData.flowchartSteps[idx - 1].type === 'decision' && (
                              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[8.5px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow-3xs whitespace-nowrap">
                                <span>YES</span>
                                <span className="text-[7.5px] text-emerald-500 font-bold">(True)</span>
                              </div>
                            )}
                          </div>
                          <div className="w-[2px] h-4 bg-indigo-200" />
                        </div>
                      )}
                      
                      {isStartStop ? (
                        <div className={`relative px-6 py-2.5 rounded-full shadow-3xs w-64 text-center flex items-center justify-center shrink-0 uppercase tracking-wider gap-1.5 transition-all duration-300 ${
                          isStepHovered
                            ? 'ring-4 ring-indigo-500/80 scale-[1.05] shadow-md bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-emerald-600 border border-emerald-500 text-white hover:bg-emerald-700'
                        }`}>
                          <span className="font-mono text-[8px] font-black text-emerald-100 bg-emerald-800/40 border border-emerald-500/30 px-1.5 py-0.5 rounded-full shrink-0">
                            Step {idx + 1}
                          </span>
                          <span className="font-mono font-bold text-[11px]">{step.label}</span>
                        </div>
                      ) : isDecision ? (
                        <div className="flex flex-col items-center justify-center gap-3 w-80">
                          {/* CLASSIC FLOWCHART DIAMOND SHAPE */}
                          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                            {/* Rotated background card to form the perfect geometric diamond */}
                            <div className={`absolute inset-3 rotate-45 border-2 rounded-xl transition-all duration-300 ${
                              isStepHovered
                                ? 'border-indigo-500 bg-indigo-50/90 shadow-md ring-4 ring-indigo-500/30'
                                : 'border-amber-300 bg-amber-50/95 hover:border-amber-400 shadow-3xs'
                            }`} />
                            
                            {/* Upright, non-rotated content inside the diamond */}
                            <div className="relative z-10 p-4 text-center flex flex-col items-center justify-center">
                              <div className="font-mono text-[8.5px] font-black text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full mb-1.5">
                                Step {idx + 1}
                              </div>
                              <span className="text-amber-950 font-mono font-black text-[12px] leading-tight max-w-[110px]">
                                {step.label}
                              </span>
                              <div className="text-[7.5px] text-amber-600 font-mono font-extrabold uppercase tracking-widest mt-1.5">
                                Decision
                              </div>
                            </div>
                          </div>

                          {/* HIGHLY-VISIBLE PATHWAY VISUALIZER (YES / NO FLOWS) */}
                          <div className="w-full space-y-2 text-left text-[10.5px]">
                            {(() => {
                              const branches = getDecisionBranchInfo(selectedLabId, step.label);
                              const targets = getBranchTargetIndices(selectedLabId, step.label);
                              return (
                                <div className="grid grid-cols-2 gap-2.5">
                                  {/* YES PATHWAY CARD */}
                                  <div 
                                    onMouseEnter={() => setHoveredTargetStepIdx(targets.yes)}
                                    onMouseLeave={() => setHoveredTargetStepIdx(null)}
                                    className="flex flex-col bg-white border border-emerald-200 rounded-xl p-2.5 hover:bg-emerald-50/70 hover:border-emerald-400 hover:shadow-2xs transition-all cursor-pointer group/yes"
                                  >
                                    <div className="flex items-center justify-between gap-1 mb-1.5">
                                      <span className="font-mono font-black text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">YES</span>
                                      {targets.yes !== null && (
                                        <span className="text-[8.5px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                                          ➔ Step {targets.yes + 1}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-slate-600 font-medium text-[10px] leading-snug group-hover/yes:text-slate-900 transition-colors">
                                      {branches.yes}
                                    </span>
                                  </div>

                                  {/* NO PATHWAY CARD */}
                                  <div 
                                    onMouseEnter={() => setHoveredTargetStepIdx(targets.no)}
                                    onMouseLeave={() => setHoveredTargetStepIdx(null)}
                                    className="flex flex-col bg-white border border-rose-200 rounded-xl p-2.5 hover:bg-rose-50/70 hover:border-rose-400 hover:shadow-2xs transition-all cursor-pointer group/no"
                                  >
                                    <div className="flex items-center justify-between gap-1 mb-1.5">
                                      <span className="font-mono font-black text-[9px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">NO</span>
                                      {targets.no !== null && (
                                        <span className="text-[8.5px] font-black text-rose-600 bg-rose-50 px-1 py-0.5 rounded">
                                          ➔ Step {targets.no + 1}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-slate-600 font-medium text-[10px] leading-snug group-hover/no:text-slate-900 transition-colors">
                                      {branches.no}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ) : isIO ? (
                        <div className={`relative rounded-2xl px-5 py-3.5 w-64 shadow-3xs transition-all duration-300 flex flex-col items-center justify-center text-center ${
                          isStepHovered
                            ? 'ring-4 ring-indigo-500/80 scale-[1.05] shadow-md border-indigo-400 bg-indigo-50/75'
                            : 'bg-blue-50/90 border border-blue-200 hover:border-blue-300'
                        }`}>
                          <div className="absolute top-2 left-2 font-mono text-[8.5px] font-black text-blue-800 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-full">
                            Step {idx + 1}
                          </div>
                          
                          <div className="bg-blue-100 text-blue-600 text-[8px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5 mt-2">
                            Input / Output
                          </div>
                          <span className="text-blue-950 font-mono font-bold text-[11px] leading-normal">{step.label}</span>
                        </div>
                      ) : (
                        <div className={`relative rounded-2xl px-5 py-3.5 w-64 shadow-3xs transition-all duration-300 flex flex-col items-center justify-center text-center group ${
                          isStepHovered
                            ? 'ring-4 ring-indigo-500/80 scale-[1.05] shadow-md border-indigo-400 bg-indigo-50/75'
                            : 'bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-2xs'
                        }`}>
                          <div className="absolute top-2 left-2 font-mono text-[8.5px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
                            Step {idx + 1}
                          </div>
                          
                          <div className="bg-slate-100 text-slate-500 text-[8.5px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5 mt-2 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            Process Block
                          </div>
                          <span className="text-slate-800 font-mono font-bold text-[11px] leading-normal">{step.label}</span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-3 flex-1 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                <button
                  onClick={() => setActiveLabStyle('simplified')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    activeLabStyle === 'simplified'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Simplified Model (.MODEL)
                </button>
                {activeLab.standardCode ? (
                  <button
                    onClick={() => setActiveLabStyle('standard')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activeLabStyle === 'standard'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Standard Segment (EXE)
                  </button>
                ) : null}
              </div>

              <button
                onClick={() => copyToClipboard(
                  activeLabStyle === 'standard' ? activeLab.standardCode : activeLab.simplifiedCode,
                  activeLab.id + '_' + activeLabStyle
                )}
                className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl cursor-pointer"
              >
                {copiedStyle === (activeLab.id + '_' + activeLabStyle) ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 font-extrabold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Source Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3 max-h-[220px] overflow-y-auto font-mono flex-1 relative shadow-inner">
              <pre className="font-mono text-[11px] leading-relaxed text-indigo-300 select-text whitespace-pre text-left">
                {activeLabStyle === 'standard' ? activeLab.standardCode : activeLab.simplifiedCode}
              </pre>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-3 flex-1 flex flex-col justify-between text-left">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Expected Execution Outputs:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 items-stretch min-h-[220px]">
              <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 font-mono flex flex-col justify-between text-left shadow-inner">
                <div className="text-[10px] font-mono font-bold text-indigo-400 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                  16-bit DEBUG.EXE Session Trace
                </div>
                <pre className="font-mono text-[10px] text-emerald-400 leading-normal whitespace-pre mt-1.5 select-text overflow-x-auto flex-1">
                  {activeLabData.expectedOutput.terminalDump}
                </pre>
                <div className="text-[9px] text-slate-500 italic mt-1 font-mono">
                  * Command -g executes the program and prints registers.
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between shadow-3xs">
                <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-1.5">Memory Variable Trace Map</span>
                <div className="space-y-2 mt-2 flex-1 flex flex-col justify-center">
                  {activeLabData.expectedOutput.inputs.map((inp, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[13px] border-b border-slate-50 pb-1.5">
                      <span className="font-bold text-slate-700">{inp.name} (Input):</span>
                      <span className="font-mono text-[11.5px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-bold">{inp.val}</span>
                    </div>
                  ))}
                  {activeLabData.expectedOutput.outputs.map((out, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[13px] border-b border-slate-50 pb-1.5">
                      <span className="font-bold text-slate-700">{out.name} (Result):</span>
                      <span className="font-mono text-[11.5px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold">{out.val}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-indigo-50/50 p-2 rounded-xl text-[10px] text-indigo-900 border border-indigo-100 font-mono mt-1 font-bold">
                  Expected Registers: {activeLabData.expectedOutput.registers}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
                {activeLabData.manualCalculations.title}:
              </span>
              <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-1 rounded-xl font-bold font-mono">
                ⚡ LIVE CALCULATOR LINKED
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
              {/* Dynamic Live Walkthrough (LHS) */}
              <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs flex flex-col gap-2.5">
                <h4 className="font-display font-bold text-slate-900 text-[13px] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0 animate-ping"></span>
                  State-linked Step-by-Step Analyzer
                </h4>
                <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
                  {renderDynamicCalculations()}
                </div>
              </div>

              {/* Lab Manual Standard Formulas (RHS) */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5">
                <h4 className="font-display font-bold text-slate-500 text-[11px] uppercase font-mono tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                  <span>Lab Reference Manual Steps</span>
                </h4>
                <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 flex flex-col gap-2 scrollbar-thin">
                  {activeLabData.manualCalculations.steps.map((st, idx) => (
                    <div key={idx} className="bg-white border border-slate-150 p-2.5 rounded-xl flex flex-col gap-1 shadow-3xs">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-teal-50 border border-teal-100 text-teal-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                          Step {idx + 1}
                        </span>
                        <h5 className="font-bold text-[12px] text-slate-900">{st.step}</h5>
                      </div>
                      <p className="text-[11.5px] text-slate-500 leading-normal pl-2 border-l-2 border-slate-100 text-justify">
                        {st.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4 flex-1 flex flex-col justify-center items-center text-center">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl text-center space-y-4 shadow-3xs max-w-lg w-full">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full inline-block border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-slate-900">Lab Experiment Completed</h4>
                <p className="text-[14px] text-slate-700 mt-2 leading-relaxed text-justify px-3 font-medium">
                  {activeLabData.resultText}
                </p>
              </div>
            </div>

            <div className="relative mt-2">
              <div className="border-4 border-dashed border-red-500/75 p-3 px-6 rounded-2xl font-mono text-[11px] font-extrabold text-red-500/80 bg-red-50/25 tracking-wider text-center flex flex-col items-center rotate-[-3deg] shadow-3xs max-w-xs transition-transform hover:scale-[1.03]">
                <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold">UNIVERSITY LAB SYSTEM</span>
                <span className="text-sm font-extrabold my-0.5">STATUS: GRADED A+ / CHECKED</span>
                <span className="text-[9px] italic text-red-400 font-mono font-bold">FACULTY OF MICROPROCESSORS DEPT</span>
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-3 flex-1 flex flex-col justify-between text-left">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Core Laboratory Precautions:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 items-stretch min-h-[220px]">
              {activeLabData.precautions.map((pre, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-3xs hover:border-amber-300 hover:shadow-xs transition-all border-l-4 border-l-amber-500">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs font-mono uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Precaution {idx + 1}</span>
                    </div>
                    <p className="text-[14px] text-slate-700 leading-relaxed text-justify font-medium">
                      {pre}
                    </p>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider mt-2">
                    * SAFETY DIRECTIVE
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-4 flex-1 flex flex-col justify-center text-left">
            <div className="bg-fuchsia-50/50 border border-fuchsia-150 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-fuchsia-100 border border-fuchsia-200 rounded-xl text-fuchsia-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[8.5px] font-mono font-bold text-fuchsia-500 block uppercase leading-none">Microprocessor Lab Challenge</span>
                  <h4 className="font-extrabold text-[15px] text-fuchsia-950 mt-1">{activeLabData.studentTask.title}</h4>
                </div>
              </div>
              
              <p className="text-[13.5px] text-slate-700 leading-relaxed text-justify font-medium">
                {activeLabData.studentTask.desc}
              </p>

              <div className="border-t border-fuchsia-100 pt-3">
                <button
                  onClick={() => setShowChallengeHint(!showChallengeHint)}
                  className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-700 hover:text-fuchsia-900 transition-colors bg-white hover:bg-fuchsia-50 border border-fuchsia-200 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showChallengeHint ? "Hide Strategy Hint" : "Reveal Strategy Hint"}</span>
                </button>

                {showChallengeHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2.5 bg-white border border-fuchsia-100 p-3 rounded-xl text-[12.5px] text-slate-600 leading-relaxed border-l-4 border-l-fuchsia-500 font-medium animate-fade-in"
                  >
                    <strong>Implementation Hint:</strong> {activeLabData.studentTask.hint}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="space-y-3 flex-1 flex flex-col justify-between text-left">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Real-World Industrial Applications:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 items-stretch min-h-[220px]">
              {activeLabData.applications.map((app, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-3xs hover:border-indigo-300 hover:shadow-xs transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                        {renderApplicationIcon(app.icon)}
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 tracking-tight leading-tight">{app.title}</h5>
                    </div>
                    <p className="text-[13px] text-slate-600 leading-relaxed text-justify">
                      {app.desc}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-indigo-500 uppercase tracking-widest mt-2 block">
                    SYSTEM DEPLOYMENT
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const copyToClipboard = (text: string, styleId: string) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedStyle(styleId);
      setTimeout(() => setCopiedStyle(null), 2000);
    }
  };

  const activeDirective = directivesData[hoveredDirective] || directivesData['DB'];

  const selectAndHover = (directiveId: string) => {
    setHoveredDirective(directiveId);
  };

  return (
    <div id="directive-sandbox-simulator" className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 text-slate-800 flex flex-col justify-between shadow-xs min-h-[850px] h-[920px] overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
          {/* Experiment Content Details (Full Width) */}
          <div className="flex-1 bg-slate-50/55 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between min-h-0 h-full overflow-hidden relative shadow-3xs">


            {/* Sticky/Fixed Compact Section Quick Jumps */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-b border-slate-150 shrink-0 scrollbar-none text-[10px] text-slate-500 font-bold font-mono">
              <span className="text-slate-400 uppercase tracking-wider text-[8.5px] shrink-0 mr-1 flex items-center gap-1">Jump to:</span>
              {sections.map((sec, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const el = document.getElementById(`sec-card-${idx}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  {idx + 1}. {sec.replace(' Concepts', '').replace(' trace', '').replace(' Required', '').replace(' Program', '')}
                </button>
              ))}
            </div>

            {/* Scrollable Single Page Document */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5 py-3.5 scrollbar-thin scroll-smooth">
              {sections.map((secName, idx) => {
                let sectionIcon = <BookOpen className="w-4 h-4 text-indigo-600" />;
                if (idx === 0) sectionIcon = <Compass className="w-4 h-4 text-indigo-600" />;
                if (idx === 1) sectionIcon = <Database className="w-4 h-4 text-emerald-600" />;
                if (idx === 2) sectionIcon = <ClipboardList className="w-4 h-4 text-blue-600" />;
                if (idx === 3) sectionIcon = <Layers className="w-4 h-4 text-purple-600" />;
                if (idx === 4) sectionIcon = <Code2 className="w-4 h-4 text-indigo-600" />;
                if (idx === 5) sectionIcon = <TrendingUp className="w-4 h-4 text-amber-600" />;
                if (idx === 6) sectionIcon = <FileCode className="w-4 h-4 text-rose-600" />;
                if (idx === 7) sectionIcon = <Terminal className="w-4 h-4 text-violet-600" />;
                if (idx === 8) sectionIcon = <Calculator className="w-4 h-4 text-teal-600" />;
                if (idx === 9) sectionIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                if (idx === 10) sectionIcon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
                if (idx === 11) sectionIcon = <Award className="w-4 h-4 text-fuchsia-600" />;
                if (idx === 12) sectionIcon = <Sparkles className="w-4 h-4 text-purple-600" />;

                return (
                  <div
                    id={`sec-card-${idx}`}
                    key={idx}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs relative overflow-hidden transition-all hover:border-slate-300 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-150">
                          {sectionIcon}
                        </div>
                        <div>
                          <span className="text-[8.5px] font-mono font-bold text-slate-400 block uppercase leading-none">SECTION 0{idx + 1}</span>
                          <h4 className="font-extrabold text-xs text-slate-900 tracking-tight uppercase mt-0.5">{secName}</h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-300">#sec-{idx + 1}</span>
                    </div>
                    <div className="text-slate-700">
                      {renderPageContent(idx)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

function SignedUnsignedVisualizer() {
  const [activeSubTab, setActiveSubTab] = useState<'representation' | 'arithmetic'>('representation');

  // --- Sub-Tab 1: Binary Representation State ---
  const [bitSize, setBitSize] = useState<8 | 16>(8);
  const [value, setValue] = useState<number>(149); // Default: decimal 149 (unsigned) / -107 (signed)
  const [inputValue, setInputValue] = useState<string>('149');

  // --- Sub-Tab 2: Signed/Unsigned Arithmetic State ---
  const [opMode, setOpMode] = useState<'MUL_IMUL' | 'DIV_IDIV'>('MUL_IMUL');
  const [opBitSize, setOpBitSize] = useState<8 | 16>(8);
  const [inputOp1, setInputOp1] = useState<string>('F2');
  const [inputOp2, setInputOp2] = useState<string>('03');

  // Sync representation state when bit width changes
  useEffect(() => {
    const maxVal = Math.pow(2, bitSize) - 1;
    if (value > maxVal) {
      const clamped = value & maxVal;
      setValue(clamped);
      setInputValue(clamped.toString(10));
    }
  }, [bitSize]);

  // Sync arithmetic default presets when operation mode or size changes
  useEffect(() => {
    if (opMode === 'MUL_IMUL') {
      if (opBitSize === 8) {
        setInputOp1('F2'); // -14 signed, 242 unsigned
        setInputOp2('03'); // 3 signed, 3 unsigned
      } else {
        setInputOp1('FFA1'); // -95 signed, 65441 unsigned
        setInputOp2('0005'); // 5 signed, 5 unsigned
      }
    } else { // Division
      if (opBitSize === 8) {
        setInputOp1('00F2'); // 242 signed/unsigned dividend (AX)
        setInputOp2('10');   // 16 divisor (BL)
      } else {
        setInputOp1('0000A120'); // 41248 dividend (DX:AX)
        setInputOp2('0050');     // 80 divisor (BX)
      }
    }
  }, [opMode, opBitSize]);

  const toggleBit = (idx: number) => {
    const newValue = value ^ (1 << idx);
    setValue(newValue);
    setInputValue(newValue.toString(10));
  };

  const handleDecimalChange = (valStr: string) => {
    setInputValue(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed)) {
      const maxUnsigned = Math.pow(2, bitSize) - 1;
      const minSigned = -Math.pow(2, bitSize - 1);
      
      if (parsed >= minSigned && parsed <= maxUnsigned) {
        let normalized = parsed;
        if (parsed < 0) {
          normalized = Math.pow(2, bitSize) + parsed;
        }
        setValue(normalized);
      }
    }
  };

  const handleHexChange = (hexStr: string) => {
    const cleaned = hexStr.toUpperCase().replace(/[^0-9A-F]/g, '');
    const parsed = parseInt(cleaned || '0', 16);
    const maxUnsigned = Math.pow(2, bitSize) - 1;
    if (parsed <= maxUnsigned) {
      setValue(parsed);
      setInputValue(parsed.toString(10));
    }
  };

  const setPreset = (dec: number) => {
    let normalized = dec;
    if (dec < 0) {
      normalized = Math.pow(2, bitSize) + dec;
    }
    setValue(normalized);
    setInputValue(dec.toString(10));
  };

  const unsignedVal = value;
  const halfRange = Math.pow(2, bitSize - 1);
  const signedVal = value >= halfRange ? value - Math.pow(2, bitSize) : value;
  const hexString = value.toString(16).toUpperCase().padStart(bitSize / 4, '0');

  // Helper to extract bit array of length bitSize
  const bits = Array.from({ length: bitSize }, (_, idx) => {
    return (value >> idx) & 1;
  });

  // We can render bits from MSB (left) to LSB (right)
  const renderByteRow = (startIdx: number, endIdx: number, label: string) => {
    const byteBits = [];
    for (let i = startIdx; i >= endIdx; i--) {
      const bitVal = (value >> i) & 1;
      const isMSB = i === bitSize - 1;
      const weight = Math.pow(2, i);
      const signedWeight = isMSB ? -weight : weight;

      byteBits.push(
        <button
          key={i}
          onClick={() => toggleBit(i)}
          className={`flex-1 flex flex-col items-center justify-between p-2 rounded-xl border-2 transition-all cursor-pointer select-none ${
            bitVal === 1
              ? isMSB
                ? 'bg-rose-500/15 border-rose-500 text-rose-900 font-black shadow-3xs'
                : 'bg-indigo-600 border-indigo-600 text-white font-black shadow-3xs animate-fade-in'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-3xs'
          }`}
        >
          <div className={`text-[9px] font-extrabold block ${bitVal === 1 ? (isMSB ? 'text-rose-700' : 'text-indigo-200') : 'text-slate-500'}`}>
            B{i}
          </div>
          <div className="text-sm font-extrabold my-1">
            {bitVal}
          </div>
          <div className={`text-[8.5px] font-mono leading-none tracking-tighter uppercase font-black ${bitVal === 1 ? (isMSB ? 'text-rose-800' : 'text-indigo-100') : 'text-slate-500'}`}>
            {isMSB ? `${signedWeight}` : `+${weight}`}
          </div>
        </button>
      );
    }

    return (
      <div className="space-y-1.5 flex-1">
        <div className="flex justify-between items-center text-[9.5px] text-slate-600 font-black uppercase tracking-wider px-1">
          <span>{label}</span>
          <span>(MSB ➔ LSB)</span>
        </div>
        <div className="flex gap-1.5">
          {byteBits}
        </div>
      </div>
    );
  };

  // --- Sub-Tab 2: Arithmetic Helper Parsing & Operations ---
  const parseHexCustom = (hex: string, maxBits: 8 | 16 | 32) => {
    const cleaned = hex.toUpperCase().replace(/[^0-9A-F]/g, '');
    if (!cleaned) return { unsigned: 0, signed: 0, isValid: false };
    const uVal = parseInt(cleaned, 16);
    if (isNaN(uVal)) return { unsigned: 0, signed: 0, isValid: false };
    const limit = Math.pow(2, maxBits);
    const halfLimit = Math.pow(2, maxBits - 1);
    const uValClamped = uVal % limit;
    const sVal = uValClamped >= halfLimit ? uValClamped - limit : uValClamped;
    return { unsigned: uValClamped, signed: sVal, isValid: true };
  };

  const isMul = opMode === 'MUL_IMUL';
  const is8Bit = opBitSize === 8;
  const op1Bits = isMul ? (is8Bit ? 8 : 16) : (is8Bit ? 16 : 32);
  const op2Bits = is8Bit ? 8 : 16;

  const parsedOp1 = parseHexCustom(inputOp1, op1Bits);
  const parsedOp2 = parseHexCustom(inputOp2, op2Bits);

  let unsignedExpr = '';
  let signedExpr = '';
  let unsignedResultText = '';
  let signedResultText = '';
  let unsignedRegisters: Array<{ name: string; val: string; desc: string }> = [];
  let signedRegisters: Array<{ name: string; val: string; desc: string }> = [];

  if (parsedOp1.isValid && parsedOp2.isValid) {
    const u1 = parsedOp1.unsigned;
    const u2 = parsedOp2.unsigned;
    const s1 = parsedOp1.signed;
    const s2 = parsedOp2.signed;

    if (isMul) {
      if (is8Bit) {
        const uProd = u1 * u2;
        const sProd = s1 * s2;

        unsignedExpr = `${u1} (AL) × ${u2} (BL) = ${uProd}`;
        signedExpr = `${s1} (AL) × ${s2} (BL) = ${sProd}`;

        unsignedResultText = `AX = ${uProd.toString(16).toUpperCase().padStart(4, '0')}H (${uProd})`;
        const sProdHex = (sProd < 0 ? (0x10000 + sProd) : sProd).toString(16).toUpperCase().padStart(4, '0');
        signedResultText = `AX = ${sProdHex}H (${sProd})`;

        unsignedRegisters = [
          { name: 'AL (Multiplicand)', val: u1.toString(16).toUpperCase().padStart(2, '0') + 'H', desc: `Unsigned: ${u1}` },
          { name: 'BL (Multiplier)', val: u2.toString(16).toUpperCase().padStart(2, '0') + 'H', desc: `Unsigned: ${u2}` },
          { name: 'AX (Product Result)', val: uProd.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${uProd}` }
        ];

        signedRegisters = [
          { name: 'AL (Multiplicand)', val: (s1 < 0 ? 256 + s1 : s1).toString(16).toUpperCase().padStart(2, '0') + 'H', desc: `Signed: ${s1}` },
          { name: 'BL (Multiplier)', val: (s2 < 0 ? 256 + s2 : s2).toString(16).toUpperCase().padStart(2, '0') + 'H', desc: `Signed: ${s2}` },
          { name: 'AX (Product Result)', val: sProdHex + 'H', desc: `Signed: ${sProd}` }
        ];
      } else {
        const uProd = u1 * u2;
        const sProd = s1 * s2;

        unsignedExpr = `${u1} (AX) × ${u2} (BX) = ${uProd}`;
        signedExpr = `${s1} (AX) × ${s2} (BX) = ${sProd}`;

        const uProdDX = Math.floor(uProd / 65536);
        const uProdAX = uProd % 65536;
        unsignedResultText = `DX:AX = ${uProdDX.toString(16).toUpperCase().padStart(4, '0')}:${uProdAX.toString(16).toUpperCase().padStart(4, '0')}H (${uProd})`;

        const sProdRaw = sProd < 0 ? (0x100000000 + sProd) : sProd;
        const sProdDX = Math.floor(sProdRaw / 65536) % 65536;
        const sProdAX = sProdRaw % 65536;
        signedResultText = `DX:AX = ${sProdDX.toString(16).toUpperCase().padStart(4, '0')}:${sProdAX.toString(16).toUpperCase().padStart(4, '0')}H (${sProd})`;

        unsignedRegisters = [
          { name: 'AX (Multiplicand)', val: u1.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${u1}` },
          { name: 'BX (Multiplier)', val: u2.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${u2}` },
          { name: 'DX (Upper Product)', val: uProdDX.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${uProdDX}` },
          { name: 'AX (Lower Product)', val: uProdAX.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${uProdAX}` }
        ];

        signedRegisters = [
          { name: 'AX (Multiplicand)', val: (s1 < 0 ? 65536 + s1 : s1).toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Signed: ${s1}` },
          { name: 'BX (Multiplier)', val: (s2 < 0 ? 65536 + s2 : s2).toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Signed: ${s2}` },
          { name: 'DX (Upper Product)', val: sProdDX.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Signed: ${sProdDX}` },
          { name: 'AX (Lower Product)', val: sProdAX.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Signed: ${sProdAX}` }
        ];
      }
    } else {
      // Division
      if (is8Bit) {
        unsignedExpr = `${u1} (AX) ÷ ${u2} (BL)`;
        signedExpr = `${s1} (AX) ÷ ${s2} (BL)`;

        if (u2 === 0) {
          unsignedResultText = 'Division by Zero (INT 00H Error)';
        } else {
          const uQuot = Math.floor(u1 / u2);
          const uRem = u1 % u2;
          if (uQuot > 255) {
            unsignedResultText = 'Divide Overflow Error (Quotient > 255)';
          } else {
            unsignedResultText = `Quotient = ${uQuot}, Remainder = ${uRem} (AL=${uQuot.toString(16).toUpperCase().padStart(2, '0')}H, AH=${uRem.toString(16).toUpperCase().padStart(2, '0')}H)`;
          }
        }

        if (s2 === 0) {
          signedResultText = 'Division by Zero (INT 00H Error)';
        } else {
          const sQuot = Math.trunc(s1 / s2);
          const sRem = s1 % s2;
          if (sQuot > 127 || sQuot < -128) {
            signedResultText = 'Divide Overflow Error (Quotient outside -128..127)';
          } else {
            const sQuotHex = (sQuot < 0 ? 256 + sQuot : sQuot).toString(16).toUpperCase().padStart(2, '0');
            const sRemHex = (sRem < 0 ? 256 + sRem : sRem).toString(16).toUpperCase().padStart(2, '0');
            signedResultText = `Quotient = ${sQuot}, Remainder = ${sRem} (AL=${sQuotHex}H, AH=${sRemHex}H)`;
          }
        }

        unsignedRegisters = [
          { name: 'AX (Dividend)', val: u1.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${u1}` },
          { name: 'BL (Divisor)', val: u2.toString(16).toUpperCase().padStart(2, '0') + 'H', desc: `Unsigned: ${u2}` }
        ];
        if (u2 !== 0 && Math.floor(u1 / u2) <= 255) {
          const uQuot = Math.floor(u1 / u2);
          const uRem = u1 % u2;
          unsignedRegisters.push({ name: 'AL (Quotient)', val: uQuot.toString(16).toUpperCase().padStart(2, '0') + 'H', desc: `Unsigned: ${uQuot}` });
          unsignedRegisters.push({ name: 'AH (Remainder)', val: uRem.toString(16).toUpperCase().padStart(2, '0') + 'H', desc: `Unsigned: ${uRem}` });
        }

        signedRegisters = [
          { name: 'AX (Dividend)', val: (s1 < 0 ? 65536 + s1 : s1).toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Signed: ${s1}` },
          { name: 'BL (Divisor)', val: (s2 < 0 ? 256 + s2 : s2).toString(16).toUpperCase().padStart(2, '0') + 'H', desc: `Signed: ${s2}` }
        ];
        if (s2 !== 0) {
          const sQuot = Math.trunc(s1 / s2);
          const sRem = s1 % s2;
          if (sQuot >= -128 && sQuot <= 127) {
            const sQuotHex = (sQuot < 0 ? 256 + sQuot : sQuot).toString(16).toUpperCase().padStart(2, '0');
            const sRemHex = (sRem < 0 ? 256 + sRem : sRem).toString(16).toUpperCase().padStart(2, '0');
            signedRegisters.push({ name: 'AL (Quotient)', val: sQuotHex + 'H', desc: `Signed: ${sQuot}` });
            signedRegisters.push({ name: 'AH (Remainder)', val: sRemHex + 'H', desc: `Signed: ${sRem}` });
          }
        }
      } else {
        // 16-bit division (DX:AX / BX)
        unsignedExpr = `${u1} (DX:AX) ÷ ${u2} (BX)`;
        signedExpr = `${s1} (DX:AX) ÷ ${s2} (BX)`;

        const uDividendDX = Math.floor(u1 / 65536);
        const uDividendAX = u1 % 65536;

        const sDividendRaw = s1 < 0 ? (0x100000000 + s1) : s1;
        const sDividendDX = Math.floor(sDividendRaw / 65536) % 65536;
        const sDividendAX = sDividendRaw % 65536;

        if (u2 === 0) {
          unsignedResultText = 'Division by Zero (INT 00H Error)';
        } else {
          const uQuot = Math.floor(u1 / u2);
          const uRem = u1 % u2;
          if (uQuot > 65535) {
            unsignedResultText = 'Divide Overflow Error (Quotient > 65535)';
          } else {
            unsignedResultText = `Quotient = ${uQuot}, Remainder = ${uRem} (AX=${uQuot.toString(16).toUpperCase().padStart(4, '0')}H, DX=${uRem.toString(16).toUpperCase().padStart(4, '0')}H)`;
          }
        }

        if (s2 === 0) {
          signedResultText = 'Division by Zero (INT 00H Error)';
        } else {
          const sQuot = Math.trunc(s1 / s2);
          const sRem = s1 % s2;
          if (sQuot > 32767 || sQuot < -32768) {
            signedResultText = 'Divide Overflow Error (Quotient outside -32768..32767)';
          } else {
            const sQuotHex = (sQuot < 0 ? 65536 + sQuot : sQuot).toString(16).toUpperCase().padStart(4, '0');
            const sRemHex = (sRem < 0 ? 65536 + sRem : sRem).toString(16).toUpperCase().padStart(4, '0');
            signedResultText = `Quotient = ${sQuot}, Remainder = ${sRem} (AX=${sQuotHex}H, DX=${sRemHex}H)`;
          }
        }

        unsignedRegisters = [
          { name: 'DX (Dividend High)', val: uDividendDX.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${uDividendDX}` },
          { name: 'AX (Dividend Low)', val: uDividendAX.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${uDividendAX}` },
          { name: 'BX (Divisor)', val: u2.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${u2}` }
        ];
        if (u2 !== 0 && Math.floor(u1 / u2) <= 65535) {
          const uQuot = Math.floor(u1 / u2);
          const uRem = u1 % u2;
          unsignedRegisters.push({ name: 'AX (Quotient)', val: uQuot.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${uQuot}` });
          unsignedRegisters.push({ name: 'DX (Remainder)', val: uRem.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Unsigned: ${uRem}` });
        }

        signedRegisters = [
          { name: 'DX (Dividend High)', val: sDividendDX.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Signed: ${s1 < 0 ? Math.floor(sDividendRaw / 65536) - 65536 : sDividendDX}` },
          { name: 'AX (Dividend Low)', val: sDividendAX.toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Signed: ${sDividendAX}` },
          { name: 'BX (Divisor)', val: (s2 < 0 ? 65536 + s2 : s2).toString(16).toUpperCase().padStart(4, '0') + 'H', desc: `Signed: ${s2}` }
        ];
        if (s2 !== 0) {
          const sQuot = Math.trunc(s1 / s2);
          const sRem = s1 % s2;
          if (sQuot >= -32768 && sQuot <= 32767) {
            const sQuotHex = (sQuot < 0 ? 65536 + sQuot : sQuot).toString(16).toUpperCase().padStart(4, '0');
            const sRemHex = (sRem < 0 ? 65536 + sRem : sRem).toString(16).toUpperCase().padStart(4, '0');
            signedRegisters.push({ name: 'AX (Quotient)', val: sQuotHex + 'H', desc: `Signed: ${sQuot}` });
            signedRegisters.push({ name: 'DX (Remainder)', val: sRemHex + 'H', desc: `Signed: ${sRem}` });
          }
        }
      }
    }
  }

  return (
    <div className="w-full text-slate-800 space-y-4">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveSubTab('representation')}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'representation'
              ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          Binary Representation & Converter
        </button>
        <button
          onClick={() => setActiveSubTab('arithmetic')}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'arithmetic'
              ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-indigo-500" />
          Signed / Unsigned Arithmetic Simulator
        </button>
      </div>

      {activeSubTab === 'representation' ? (
        <div className="space-y-4">
          {/* Bit Width Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-150">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-slate-500 uppercase mr-1.5">Register Size:</span>
              <button
                onClick={() => setBitSize(8)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  bitSize === 8
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                8-Bit (AL / BL)
              </button>
              <button
                onClick={() => setBitSize(16)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  bitSize === 16
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                16-Bit (AX / BX)
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 flex-wrap justify-end">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Presets:</span>
              {bitSize === 8 ? (
                <>
                  <button onClick={() => setPreset(0)} className="bg-white border border-slate-200 hover:border-slate-350 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer">0</button>
                  <button onClick={() => setPreset(127)} className="bg-white border border-slate-200 hover:border-slate-350 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer">+127 (Max)</button>
                  <button onClick={() => setPreset(-128)} className="bg-white border border-rose-300 hover:border-rose-450 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer text-rose-700">-128 (Min)</button>
                  <button onClick={() => setPreset(-1)} className="bg-white border border-slate-250 hover:border-slate-350 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer">-1</button>
                  <button onClick={() => setPreset(255)} className="bg-white border border-indigo-200 hover:border-indigo-350 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer text-indigo-700">255</button>
                </>
              ) : (
                <>
                  <button onClick={() => setPreset(0)} className="bg-white border border-slate-200 hover:border-slate-350 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer">0</button>
                  <button onClick={() => setPreset(32767)} className="bg-white border border-slate-200 hover:border-slate-350 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer">+32767</button>
                  <button onClick={() => setPreset(-32768)} className="bg-white border border-rose-300 hover:border-rose-450 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer text-rose-700">-32768</button>
                  <button onClick={() => setPreset(-1)} className="bg-white border border-slate-250 hover:border-slate-350 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer">-1</button>
                  <button onClick={() => setPreset(65535)} className="bg-white border border-indigo-200 hover:border-indigo-350 text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer text-indigo-700">65535</button>
                </>
              )}
            </div>
          </div>

          {/* Manual Value Inputs */}
          <div className="grid grid-cols-2 gap-4 items-center bg-slate-50/25 p-3 rounded-2xl border border-slate-150">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold text-slate-500 block uppercase">
                Decimal Value ({bitSize === 8 ? '-128 to 255' : '-32768 to 65535'})
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleDecimalChange(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-indigo-350 focus:border-indigo-500 rounded-lg p-2 font-mono font-black text-slate-900 text-xs focus:outline-none shadow-3xs"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold text-slate-500 block uppercase">
                Hexadecimal Value ({bitSize === 8 ? '00 to FF' : '0000 to FFFF'})
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-slate-400 font-bold text-xs font-mono">0x</span>
                <input
                  type="text"
                  maxLength={bitSize / 4}
                  value={hexString}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-indigo-350 focus:border-indigo-500 rounded-lg p-2 pl-7 font-mono font-black text-slate-900 text-xs focus:outline-none shadow-3xs"
                />
                <span className="absolute right-2.5 text-slate-400 font-bold text-[10px] font-mono">H</span>
              </div>
            </div>
          </div>

          {/* Interactive Bit Lanes */}
          <div className="space-y-3 p-3 bg-white border border-slate-150 rounded-2xl shadow-3xs">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                Tactile Bit-flip Register
              </span>
              <span className="text-[10px] text-slate-600 font-extrabold italic">Click any bit block to toggle value</span>
            </div>

            {bitSize === 8 ? (
              <div className="flex gap-2">
                {renderByteRow(7, 0, '8-Bit Register')}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                {renderByteRow(15, 8, 'Upper Byte (AH / BH)')}
                {renderByteRow(7, 0, 'Lower Byte (AL / BL)')}
              </div>
            )}
          </div>

          {/* Decoders Grid (Signed vs Unsigned Interpretation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unsigned Box */}
            <div className="bg-indigo-50/45 border border-indigo-150/80 rounded-2xl p-3 text-left flex flex-col justify-between shadow-3xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest">Unsigned Interpretation</span>
                  <span className="bg-indigo-100 text-indigo-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">MUL / DIV</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {unsignedVal}
                </div>
                <p className="text-[10.5px] text-slate-500 leading-normal">
                  Binary is parsed as a simple positive integer. The sign bit (MSB) acts as a standard positive power-of-two.
                </p>
              </div>

              <div className="bg-white/70 border border-slate-200/50 rounded-xl p-2 mt-3 font-mono text-[10px] text-slate-600 leading-relaxed space-y-1">
                <strong className="text-slate-700 font-bold block uppercase text-[8.5px] tracking-wider mb-0.5">Sum of Weights Calculation:</strong>
                <div className="truncate">
                  {bits.map((b, i) => b === 1 ? `2^${i}` : '').filter(Boolean).reverse().join(' + ') || '0'}
                </div>
                <div className="border-t border-slate-100 pt-1 mt-1 text-slate-800 font-bold truncate">
                  ➔ {bits.map((b, i) => b === 1 ? Math.pow(2, i) : '').filter(Boolean).reverse().join(' + ') || '0'} = {unsignedVal}
                </div>
              </div>
            </div>

            {/* Signed Box */}
            <div className="bg-rose-50/45 border border-rose-150/80 rounded-2xl p-3 text-left flex flex-col justify-between shadow-3xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-widest">Signed Representation (Two's Complement)</span>
                  <span className="bg-rose-100 text-rose-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-sans">IMUL / IDIV</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono flex items-center gap-2">
                  <span className={signedVal < 0 ? 'text-rose-600' : 'text-slate-900'}>{signedVal}</span>
                  {signedVal < 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold font-sans">NEGATIVE</span>
                  )}
                </div>
                <p className="text-[10.5px] text-slate-500 leading-normal">
                  The sign bit (MSB) acts as a negative weight (e.g., -128 or -32768). All other bits remain positive contributors.
                </p>
              </div>

              <div className="bg-white/70 border border-slate-200/50 rounded-xl p-2 mt-3 font-mono text-[10px] text-slate-600 leading-relaxed space-y-1">
                <strong className="text-slate-700 font-bold block uppercase text-[8.5px] tracking-wider mb-0.5">Two's Complement weight calculation:</strong>
                <div className="truncate">
                  {bits.map((b, i) => {
                    if (b === 1) {
                      return i === bitSize - 1 ? `(-2^${i})` : `2^${i}`;
                    }
                    return '';
                  }).filter(Boolean).reverse().join(' + ') || '0'}
                </div>
                <div className="border-t border-slate-100 pt-1 mt-1 text-slate-800 font-bold truncate">
                  ➔ {bits.map((b, i) => {
                    if (b === 1) {
                      return i === bitSize - 1 ? `-${Math.pow(2, i)}` : `+${Math.pow(2, i)}`;
                    }
                    return '';
                  }).filter(Boolean).reverse().join(' ').replace(/^\s*\+\s*/, '') || '0'} = {signedVal}
                </div>
              </div>
            </div>
          </div>

          {/* Visual byte layout context */}
          <div className="bg-indigo-950 text-indigo-200 p-3 rounded-2xl text-[11px] leading-relaxed font-sans flex items-start gap-2.5 border border-indigo-900 text-left">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="font-sans">
              <strong>Pedagogical Insight:</strong> Notice how entering <strong className="font-mono text-white">FFH</strong> or <strong className="font-mono text-white">FFFFH</strong> fills all bits with <span className="font-mono font-bold text-white">1</span>. In Unsigned mode, this is the absolute maximum value (<strong className="font-mono text-white">{bitSize === 8 ? '255' : '65535'}</strong>). In Signed mode, because the negative MSB value is added to all other positive values, the resulting sum is exactly <strong className="font-mono text-rose-300 font-extrabold">-1</strong>! Flip bit B{bitSize - 1} and watch the sign changes in real-time.
            </p>
          </div>
        </div>
      ) : (
        // --- Arithmetic Tab Layout ---
        <div className="space-y-4">
          {/* Controls Segment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60 p-2 rounded-xl border border-slate-150">
            {/* Op Selector */}
            <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setOpMode('MUL_IMUL')}
                className={`flex-1 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                  opMode === 'MUL_IMUL' ? 'bg-indigo-50 text-indigo-700 shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Multiplication (MUL / IMUL)
              </button>
              <button
                onClick={() => setOpMode('DIV_IDIV')}
                className={`flex-1 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                  opMode === 'DIV_IDIV' ? 'bg-indigo-50 text-indigo-700 shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Division (DIV / IDIV)
              </button>
            </div>

            {/* Bit Size Selector */}
            <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setOpBitSize(8)}
                className={`flex-1 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                  opBitSize === 8 ? 'bg-indigo-600 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                8-Bit Registers (AL, BL)
              </button>
              <button
                onClick={() => setOpBitSize(16)}
                className={`flex-1 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                  opBitSize === 16 ? 'bg-indigo-600 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                16-Bit Registers (AX, BX)
              </button>
            </div>
          </div>

          {/* Hexadecimal Operands Inputs */}
          <div className="grid grid-cols-2 gap-4 bg-white/40 p-3 rounded-2xl border border-slate-150">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                <span>Operand 1 ({isMul ? (is8Bit ? 'AL' : 'AX') : (is8Bit ? 'AX' : 'DX:AX')})</span>
                <span className="text-indigo-600 font-extrabold">{op1Bits}-bit Hex</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs font-mono">0x</span>
                <input
                  type="text"
                  maxLength={op1Bits / 4}
                  value={inputOp1}
                  onChange={(e) => setInputOp1(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''))}
                  className="w-full bg-white border border-slate-200 hover:border-indigo-350 focus:border-indigo-500 rounded-lg p-1.5 pl-7 font-mono font-black text-slate-900 text-xs focus:outline-none shadow-3xs"
                />
              </div>
              <span className="text-[9px] text-slate-400 font-bold leading-none mt-1 block">
                {isMul ? 'Multiplicand (Value 1)' : 'Dividend (Numerator)'}
              </span>
              {parsedOp1.isValid && (
                <div className="text-[9.5px] text-slate-500 bg-slate-50 border border-slate-200 rounded p-1 font-mono mt-1 flex justify-between">
                  <span>Uns: {parsedOp1.unsigned}</span>
                  <span className={parsedOp1.signed < 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}>Sig: {parsedOp1.signed}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                <span>Operand 2 ({is8Bit ? 'BL' : 'BX'})</span>
                <span className="text-indigo-600 font-extrabold">{op2Bits}-bit Hex</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs font-mono">0x</span>
                <input
                  type="text"
                  maxLength={op2Bits / 4}
                  value={inputOp2}
                  onChange={(e) => setInputOp2(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''))}
                  className="w-full bg-white border border-slate-200 hover:border-indigo-350 focus:border-indigo-500 rounded-lg p-1.5 pl-7 font-mono font-black text-slate-900 text-xs focus:outline-none shadow-3xs"
                />
              </div>
              <span className="text-[9px] text-slate-400 font-bold leading-none mt-1 block">
                {isMul ? 'Multiplier (Value 2)' : 'Divisor (Denominator)'}
              </span>
              {parsedOp2.isValid && (
                <div className="text-[9.5px] text-slate-500 bg-slate-50 border border-slate-200 rounded p-1 font-mono mt-1 flex justify-between">
                  <span>Uns: {parsedOp2.unsigned}</span>
                  <span className={parsedOp2.signed < 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}>Sig: {parsedOp2.signed}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dual Lane Comparison Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lane 1: Unsigned Arithmetic */}
            <div className="bg-indigo-50/45 border border-indigo-150/80 rounded-2xl p-3.5 text-left flex flex-col justify-between shadow-3xs space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-indigo-100/60 pb-1.5">
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                    Unsigned: {opMode === 'MUL_IMUL' ? 'MUL' : 'DIV'}
                  </span>
                  <span className="bg-indigo-100/70 text-indigo-700 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                    MAGNITUDE
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 leading-tight">
                  Decimal Calculation:
                  <div className="text-slate-800 font-black mt-0.5 truncate text-[11.5px]">
                    {unsignedExpr || 'Invalid inputs'}
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 leading-tight">
                  Execution Output:
                  <div className="text-indigo-600 font-black mt-0.5 truncate text-[12px]">
                    {unsignedResultText}
                  </div>
                </div>
              </div>

              {/* Registers Dump Unsigned */}
              <div className="bg-white/70 border border-slate-200/50 rounded-xl p-2 font-mono text-[10px] space-y-1.5">
                <span className="text-[8.5px] font-extrabold text-slate-400 uppercase block tracking-wider">Resulting CPU registers</span>
                {unsignedRegisters.map((reg, rIdx) => (
                  <div key={rIdx} className="flex justify-between border-b border-slate-100/60 pb-0.5 last:border-0 last:pb-0">
                    <span className="text-slate-600 font-semibold">{reg.name}</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1 rounded font-mono">{reg.val} <span className="text-[8.5px] text-slate-400 font-normal">({reg.desc})</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lane 2: Signed Arithmetic */}
            <div className="bg-rose-50/45 border border-rose-150/80 rounded-2xl p-3.5 text-left flex flex-col justify-between shadow-3xs space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-rose-100/60 pb-1.5">
                  <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">
                    Signed: {opMode === 'MUL_IMUL' ? 'IMUL' : 'IDIV'}
                  </span>
                  <span className="bg-rose-100/70 text-rose-700 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                    2's COMPLEMENT
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 leading-tight">
                  Decimal Calculation:
                  <div className="text-slate-800 font-black mt-0.5 truncate text-[11.5px]">
                    {signedExpr || 'Invalid inputs'}
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 leading-tight">
                  Execution Output:
                  <div className="text-rose-600 font-black mt-0.5 truncate text-[12px]">
                    {signedResultText}
                  </div>
                </div>
              </div>

              {/* Registers Dump Signed */}
              <div className="bg-white/70 border border-slate-200/50 rounded-xl p-2 font-mono text-[10px] space-y-1.5">
                <span className="text-[8.5px] font-extrabold text-slate-400 uppercase block tracking-wider">Resulting CPU registers</span>
                {signedRegisters.map((reg, rIdx) => (
                  <div key={rIdx} className="flex justify-between border-b border-slate-100/60 pb-0.5 last:border-0 last:pb-0">
                    <span className="text-slate-600 font-semibold">{reg.name}</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1 rounded font-mono">{reg.val} <span className="text-[8.5px] text-slate-450 font-normal">({reg.desc})</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Explainer */}
          <div className="bg-slate-950 text-slate-200 p-3 rounded-2xl text-[11px] leading-relaxed font-sans flex items-start gap-2.5 border border-slate-800 text-left shadow-3xs">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 font-sans">
              <strong className="text-indigo-300 font-bold font-sans uppercase text-[9px] tracking-wider block">Why are these results different?</strong>
              <p className="font-sans text-slate-300">
                In standard <strong className="font-mono text-white text-[10.5px]">MUL</strong> and <strong className="font-mono text-white text-[10.5px]">DIV</strong>, the CPU interprets the binary bit patterns as direct magnitude (positive weights only). 
                However, <strong className="font-mono text-white text-[10.5px]">IMUL</strong> and <strong className="font-mono text-white text-[10.5px]">IDIV</strong> treat the Most Significant Bit (MSB) as a sign weight (e.g. <span className="text-rose-300 font-bold">-128</span> for 8-bit operands, or <span className="text-rose-300 font-bold">-32768</span> for 16-bit operands). 
                If the input has its MSB set to <strong className="font-mono text-white">1</strong> (i.e. hex values starting with <strong className="font-mono text-white">8</strong> through <strong className="font-mono text-white">F</strong>), the signed instructions automatically treat it as a negative value!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MathLoopTheoryVisualizer() {
  const [num, setNum] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'sq_cube' | 'factorial'>('sq_cube');
  const [step, setStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // States of simulated execution
  const [ax, setAx] = useState<number>(0);
  const [bx, setBx] = useState<number>(0);
  const [cx, setCx] = useState<number>(0);
  const [dx, setDx] = useState<number>(0);
  const [memSquare, setMemSquare] = useState<number>(0);
  const [memCube, setMemCube] = useState<number>(0);
  const [memFact, setMemFact] = useState<number>(0);
  const [traceLog, setTraceLog] = useState<string[]>([]);

  // Square and Cube Operations steps:
  const sqCubeInstructions = [
    { label: 'MOV AL, NUM', code: 'MOV AL, NUM', desc: 'Load AL with the input value N.', run: (n: number) => { setAx(n); setTraceLog(prev => [...prev, `AX (AL) loaded with input N (${n})`]); } },
    { label: 'XOR AH, AH', code: 'XOR AH, AH', desc: 'Clear the upper byte of AX register so AX contains exactly N.', run: (n: number) => { setAx(prev => prev & 0x00FF); setTraceLog(prev => [...prev, `AH cleared. AX now contains exactly ${n} (00${n.toString(16).toUpperCase().padStart(4, '0')}H)`]); } },
    { label: 'MUL AL', code: 'MUL AL', desc: 'Multiply AL by AL (AL * AL). The 16-bit result is placed in AX.', run: (n: number) => { const res = n * n; setAx(res); setTraceLog(prev => [...prev, `MUL AL: AX = AL (${n}) * AL (${n}) = ${res} (${res.toString(16).toUpperCase()}H)`]); } },
    { label: 'MOV [SQUARE], AX', code: 'MOV [SQUARE], AX', desc: 'Store the square result from AX into memory variable SQUARE.', run: (n: number) => { const sq = n * n; setMemSquare(sq); setTraceLog(prev => [...prev, `MOV [SQUARE], AX: Memory variable SQUARE now holds ${sq} (${sq.toString(16).toUpperCase()}H)`]); } },
    { label: 'MOV BX, AX', code: 'MOV BX, AX', desc: 'Copy the square result from AX into BX register.', run: (n: number) => { const sq = n * n; setBx(sq); setTraceLog(prev => [...prev, `MOV BX, AX: BX register loaded with square result ${sq} (${sq.toString(16).toUpperCase()}H)`]); } },
    { label: 'MOV AL, NUM', code: 'MOV AL, NUM', desc: 'Load AL with input value N again to prepare for cube calculation.', run: (n: number) => { setAx(prev => (prev & 0xFF00) | n); setTraceLog(prev => [...prev, `MOV AL, NUM: AL loaded with N (${n})`]); } },
    { label: 'MUL BX', code: 'MUL BX', desc: 'Multiply AX (which has AL=N) by BX (Square). The result is stored in DX:AX.', run: (n: number) => { const sq = n * n; const cb = sq * n; setAx(cb & 0xFFFF); setDx(Math.floor(cb / 0x10000) & 0xFFFF); setTraceLog(prev => [...prev, `MUL BX: DX:AX = AL (${n}) * BX (${sq}) = ${cb} (${cb.toString(16).toUpperCase()}H)`]); } },
    { label: 'MOV [CUBE], AX', code: 'MOV [CUBE], AX', desc: 'Store the lower 16 bits of cube result from AX into memory variable CUBE.', run: (n: number) => { const sq = n * n; const cb = sq * n; setMemCube(cb & 0xFFFF); setTraceLog(prev => [...prev, `MOV [CUBE], AX: Memory variable CUBE now holds ${cb & 0xFFFF} (${(cb & 0xFFFF).toString(16).toUpperCase()}H)`]); } },
  ];

  const generateFactStates = (n: number) => {
    const states: Array<{
      lineIdx: number;
      ax: number;
      cx: number;
      dx: number;
      memFact: number;
      actionDesc: string;
      codeLine: string;
    }> = [];

    states.push({
      lineIdx: 0,
      ax: 0,
      cx: 0,
      dx: 0,
      memFact: 0,
      actionDesc: 'Starting factorial simulation...',
      codeLine: 'MOV CX, NUM',
    });

    states.push({
      lineIdx: 0,
      ax: 0,
      cx: n,
      dx: 0,
      memFact: 0,
      actionDesc: `Loaded CX with input N (${n}). CX is the loop counter and multiplier.`,
      codeLine: 'MOV CX, NUM',
    });

    states.push({
      lineIdx: 1,
      ax: 1,
      cx: n,
      dx: 0,
      memFact: 0,
      actionDesc: 'Initialized accumulator register AX with 0001H.',
      codeLine: 'MOV AX, 0001H',
    });

    let currentAx = 1;
    let currentCx = n;
    let currentDx = 0;

    while (currentCx > 0) {
      const prevAx = currentAx;
      const product = currentAx * currentCx;
      currentAx = product & 0xFFFF;
      currentDx = Math.floor(product / 0x10000) & 0xFFFF;
      
      states.push({
        lineIdx: 2,
        ax: currentAx,
        cx: currentCx,
        dx: currentDx,
        memFact: 0,
        actionDesc: `Loop body: Multiply AX (${prevAx}) by CX (${currentCx}). Product: AX = ${currentAx} (${currentAx.toString(16).toUpperCase()}H).`,
        codeLine: 'FACT_LOOP: MUL CX',
      });

      const prevCx = currentCx;
      currentCx = currentCx - 1;
      
      states.push({
        lineIdx: 3,
        ax: currentAx,
        cx: currentCx,
        dx: currentDx,
        memFact: 0,
        actionDesc: `LOOP instruction decrements CX (${prevCx} -> ${currentCx}). ${currentCx > 0 ? `CX is non-zero, jumping back to FACT_LOOP.` : `CX is zero, loop terminates. Proceeding to next instruction.`}`,
        codeLine: 'LOOP FACT_LOOP',
      });
    }

    states.push({
      lineIdx: 4,
      ax: currentAx,
      cx: currentCx,
      dx: currentDx,
      memFact: currentAx,
      actionDesc: `Store final factorial value ${currentAx} (${currentAx.toString(16).toUpperCase()}H) into memory variable FACT.`,
      codeLine: 'MOV [FACT], AX',
    });

    return states;
  };

  const factStates = generateFactStates(num);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        handleStepForward();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, step, activeTab, num]);

  useEffect(() => {
    handleReset();
  }, [num, activeTab]);

  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
    setAx(0);
    setBx(0);
    setCx(0);
    setDx(0);
    setMemSquare(0);
    setMemCube(0);
    setMemFact(0);
    setTraceLog(['Simulation initialized. Press Step Into or Run to visualize.']);
  };

  const handleStepForward = () => {
    if (activeTab === 'sq_cube') {
      if (step < sqCubeInstructions.length) {
        sqCubeInstructions[step].run(num);
        setStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setTraceLog(prev => [...prev, 'Simulation completed successfully!']);
      }
    } else {
      if (step < factStates.length - 1) {
        const nextStateIdx = step + 1;
        const s = factStates[nextStateIdx];
        setAx(s.ax);
        setCx(s.cx);
        setDx(s.dx);
        setMemFact(s.memFact);
        setTraceLog(prev => [...prev, s.actionDesc]);
        setStep(nextStateIdx);
      } else {
        setIsPlaying(false);
        setTraceLog(prev => [...prev, 'Simulation completed successfully!']);
      }
    }
  };

  const handleRunToEnd = () => {
    setIsPlaying(false);
    if (activeTab === 'sq_cube') {
      let currentStep = step;
      while (currentStep < sqCubeInstructions.length) {
        sqCubeInstructions[currentStep].run(num);
        currentStep++;
      }
      setStep(sqCubeInstructions.length);
      setTraceLog(prev => [...prev, 'Simulation completed successfully!']);
    } else {
      const finalStateIdx = factStates.length - 1;
      const s = factStates[finalStateIdx];
      setAx(s.ax);
      setCx(s.cx);
      setDx(s.dx);
      setMemFact(s.memFact);
      
      const logs = ['Simulation initialized. Press Step Into or Run to visualize.'];
      for (let i = 1; i <= finalStateIdx; i++) {
        logs.push(factStates[i].actionDesc);
      }
      logs.push('Simulation completed successfully!');
      setTraceLog(logs);
      setStep(finalStateIdx);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controller */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans shadow-3xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-indigo-950">Set input value NUM (N):</span>
            <div className="flex items-center gap-1 ml-1.5">
              <button
                onClick={() => setNum(prev => Math.max(1, prev - 1))}
                disabled={num <= 1}
                className="w-6 h-6 flex items-center justify-center bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-50 text-indigo-800 font-extrabold cursor-pointer"
              >
                -
              </button>
              <span className="w-6 text-center font-bold font-sans text-slate-800 text-sm">{num}</span>
              <button
                onClick={() => setNum(prev => Math.min(8, prev + 1))}
                disabled={num >= 8}
                className="w-6 h-6 flex items-center justify-center bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-50 text-indigo-800 font-extrabold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200 gap-1">
            <button
              onClick={() => setActiveTab('sq_cube')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'sq_cube'
                  ? 'bg-white text-indigo-600 shadow-3xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Square & Cube
            </button>
            <button
              onClick={() => setActiveTab('factorial')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'factorial'
                  ? 'bg-white text-indigo-600 shadow-3xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Factorial (CX Loop)
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleStepForward}
            disabled={activeTab === 'sq_cube' ? step >= sqCubeInstructions.length : step >= factStates.length - 1}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
          >
            <span>Step Into (F7)</span>
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <span>{isPlaying ? 'Pause' : 'Auto Run'}</span>
          </button>
          <button
            onClick={handleRunToEnd}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Run All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Hand: Code Viewer */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between text-left">
          <div>
            <div className="text-[10px] font-mono font-black text-indigo-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-400" />
              8086 ASSEMBLY EXECUTION
            </div>
            
            <div className="mt-3.5 space-y-1 font-mono text-[11px] leading-relaxed">
              {activeTab === 'sq_cube' ? (
                sqCubeInstructions.map((inst, idx) => {
                  const isCurrent = idx === step;
                  return (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-md flex items-center gap-2 border transition-all ${
                        isCurrent
                          ? 'bg-indigo-500/15 border-indigo-500 text-indigo-200 font-bold scale-[1.01]'
                          : 'border-transparent text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <span className="w-5 text-right text-slate-500 text-[10px] font-mono select-none">{idx + 1}</span>
                      <span className="flex-1 whitespace-pre">{inst.code}</span>
                      {isCurrent && <span className="text-[9px] font-sans bg-indigo-500/25 px-1 rounded animate-pulse">PC</span>}
                    </div>
                  );
                })
              ) : (
                // Factorial Code list
                [
                  { code: 'MOV CX, NUM' },
                  { code: 'MOV AX, 0001H' },
                  { code: 'FACT_LOOP: MUL CX' },
                  { code: 'LOOP FACT_LOOP' },
                  { code: 'MOV [FACT], AX' },
                ].map((inst, idx) => {
                  let isCurrent = false;
                  if (step > 0) {
                    const currentLineIdx = factStates[step].lineIdx;
                    isCurrent = idx === currentLineIdx;
                  } else {
                    isCurrent = idx === 0;
                  }
                  return (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-md flex items-center gap-2 border transition-all ${
                        isCurrent
                          ? 'bg-indigo-500/15 border-indigo-500 text-indigo-200 font-bold scale-[1.01]'
                          : 'border-transparent text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <span className="w-5 text-right text-slate-500 text-[10px] select-none">{idx + 1}</span>
                      <span className="flex-1 whitespace-pre">{inst.code}</span>
                      {isCurrent && <span className="text-[9px] font-sans bg-indigo-500/25 px-1 rounded animate-pulse">PC</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mt-4">
            <span className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1">Instruction Explanation:</span>
            <p className="text-[11.5px] text-slate-300 leading-normal font-sans">
              {activeTab === 'sq_cube'
                ? step < sqCubeInstructions.length
                  ? sqCubeInstructions[step].desc
                  : 'All instructions executed. Press Reset to restart.'
                : step < factStates.length
                  ? factStates[step].actionDesc
                  : 'All instructions executed. Press Reset to restart.'}
            </p>
          </div>
        </div>

        {/* Right Hand: CPU Registers & Memory Variables */}
        <div className="lg:col-span-7 space-y-4">
          {/* CPU Registers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs text-left space-y-3">
            <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest block border-b border-slate-150 pb-2">
              CPU Registers & Flags
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center space-y-1">
                <span className="text-[9.5px] font-mono font-bold text-slate-400 block">AX (Accumulator)</span>
                <div className="font-mono text-[14px] font-black text-indigo-600">
                  {ax.toString(16).toUpperCase().padStart(4, '0')}H
                </div>
                <span className="text-[9px] font-sans text-slate-500 block">dec: {ax}</span>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center space-y-1">
                <span className="text-[9.5px] font-mono font-bold text-slate-400 block">BX (Base)</span>
                <div className="font-mono text-[14px] font-black text-indigo-600">
                  {bx.toString(16).toUpperCase().padStart(4, '0')}H
                </div>
                <span className="text-[9px] font-sans text-slate-500 block">dec: {bx}</span>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center space-y-1">
                <span className="text-[9.5px] font-mono font-bold text-slate-400 block">CX (Counter/Loop)</span>
                <div className="font-mono text-[14px] font-black text-indigo-600">
                  {cx.toString(16).toUpperCase().padStart(4, '0')}H
                </div>
                <span className="text-[9px] font-sans text-slate-500 block">dec: {cx}</span>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center space-y-1">
                <span className="text-[9.5px] font-mono font-bold text-slate-400 block">DX (Data/Mul)</span>
                <div className="font-mono text-[14px] font-black text-indigo-600">
                  {dx.toString(16).toUpperCase().padStart(4, '0')}H
                </div>
                <span className="text-[9px] font-sans text-slate-500 block">dec: {dx}</span>
              </div>
            </div>
          </div>

          {/* Memory Variables */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs text-left space-y-3">
            <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest block border-b border-slate-150 pb-2">
              Memory Segment Variables (DS)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-center space-y-1">
                <span className="text-[9px] font-mono font-bold text-amber-700 block uppercase">SQUARE DW ?</span>
                <div className="font-mono text-[13px] font-black text-amber-900 bg-white/80 py-1 rounded border border-amber-100">
                  {memSquare > 0 ? `${memSquare.toString(16).toUpperCase().padStart(4, '0')}H` : '????H'}
                </div>
                <span className="text-[9.5px] font-sans text-slate-500 block">Value: {memSquare || 'Uninitialized'}</span>
              </div>

              <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-center space-y-1">
                <span className="text-[9px] font-mono font-bold text-amber-700 block uppercase">CUBE DW ?</span>
                <div className="font-mono text-[13px] font-black text-amber-900 bg-white/80 py-1 rounded border border-amber-100">
                  {memCube > 0 ? `${memCube.toString(16).toUpperCase().padStart(4, '0')}H` : '????H'}
                </div>
                <span className="text-[9.5px] font-sans text-slate-500 block">Value: {memCube || 'Uninitialized'}</span>
              </div>

              <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-center space-y-1">
                <span className="text-[9px] font-mono font-bold text-amber-700 block uppercase">FACT DW ?</span>
                <div className="font-mono text-[13px] font-black text-amber-900 bg-white/80 py-1 rounded border border-amber-100">
                  {memFact > 0 ? `${memFact.toString(16).toUpperCase().padStart(4, '0')}H` : '????H'}
                </div>
                <span className="text-[9.5px] font-sans text-slate-500 block">Value: {memFact || 'Uninitialized'}</span>
              </div>
            </div>
          </div>

          {/* Real-time Trace Log */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-3xs text-left flex flex-col gap-2">
            <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-200 pb-1.5">
              Live Instruction Log & Counter Trace
            </span>
            <div className="max-h-[140px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-600 space-y-1.5 scrollbar-thin pr-1">
              {traceLog.map((log, idx) => (
                <div key={idx} className="flex gap-2 items-start border-b border-slate-100 pb-1 last:border-0">
                  <span className="text-slate-400 select-none">▶</span>
                  <span className="text-slate-700">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
