import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Code2, 
  Database, 
  Layers, 
  Copy, 
  Check, 
  Info, 
  Sparkles, 
  Binary, 
  CheckCircle2, 
  FileCode, 
  Terminal, 
  Cpu, 
  ArrowRight,
  Shield,
  LayoutGrid
} from 'lucide-react';

interface DirectiveInfo {
  id: string;
  name: string;
  fullForm: string;
  category: 'Segment Control' | 'Data Definition' | 'Procedure & Scope' | 'General Symbol';
  bytesAllocated: string;
  desc: string;
  example: string;
  styleAffiliation: 'Standard Style' | 'Simplified Style' | 'Both Styles';
}

const directivesCatalog: Record<string, DirectiveInfo> = {
  'SEGMENT': {
    id: 'SEGMENT',
    name: 'SEGMENT & ENDS',
    fullForm: 'Segment Boundaries Declaration',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Defines the starting and ending boundaries of a logical segment block (Code, Data, Stack) in Standard Segment programming style.',
    example: 'DATA_SEG SEGMENT\n  NUM1 DB 25H\nDATA_SEG ENDS',
    styleAffiliation: 'Standard Style'
  },
  'ASSUME': {
    id: 'ASSUME',
    name: 'ASSUME',
    fullForm: 'Segment Register Association Directive',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Informs the assembler which segment register (CS, DS, SS, ES) corresponds to which logical segment at compile time for label offset validation.',
    example: 'ASSUME CS:CODE_SEG, DS:DATA_SEG',
    styleAffiliation: 'Standard Style'
  },
  'MODEL': {
    id: 'MODEL',
    name: '.MODEL',
    fullForm: 'Memory Model Directive',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Pre-configures standard segment sizing parameters (e.g. SMALL, TINY, MEDIUM) in Simplified programming style, eliminating explicit SEGMENT/ENDS blocks.',
    example: '.MODEL SMALL  ; Code in 64KB, Data in 64KB',
    styleAffiliation: 'Simplified Style'
  },
  'STACK': {
    id: 'STACK',
    name: '.STACK',
    fullForm: 'Stack Segment Allocation',
    category: 'Segment Control',
    bytesAllocated: 'User-specified size (e.g. 256 Bytes)',
    desc: 'Allocates a dedicated Stack Segment with a designated size in Simplified programming style.',
    example: '.STACK 100H  ; Reserves 256 bytes for stack',
    styleAffiliation: 'Simplified Style'
  },
  'DATA': {
    id: 'DATA',
    name: '.DATA',
    fullForm: 'Data Segment Identifier',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Marks the beginning of the data segment in Simplified programming style.',
    example: '.DATA\nVAL1 DB 10H\nVAL2 DW 1234H',
    styleAffiliation: 'Simplified Style'
  },
  'CODE': {
    id: 'CODE',
    name: '.CODE',
    fullForm: 'Code Segment Identifier',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Marks the beginning of the executable instruction segment in Simplified programming style.',
    example: '.CODE\nMAIN PROC\n  MOV AX, @DATA\n  MOV DS, AX\nMAIN ENDP',
    styleAffiliation: 'Simplified Style'
  },
  '@DATA': {
    id: '@DATA',
    name: '@DATA',
    fullForm: 'Data Segment Address Symbol',
    category: 'Segment Control',
    bytesAllocated: '0 Bytes (Compile Constant)',
    desc: 'A predefined symbolic constant representing the physical base segment address of the .DATA block used to initialize DS register.',
    example: 'MOV AX, @DATA\nMOV DS, AX',
    styleAffiliation: 'Simplified Style'
  },
  'DB': {
    id: 'DB',
    name: 'DB (Define Byte)',
    fullForm: '8-Bit Byte Storage Allocation',
    category: 'Data Definition',
    bytesAllocated: '1 Byte per element',
    desc: 'Allocates memory storage space in RAM for 8-bit byte variables or character strings.',
    example: 'COUNT DB 0FFH\nMSG DB \'HELLO\', 0',
    styleAffiliation: 'Both Styles'
  },
  'DW': {
    id: 'DW',
    name: 'DW (Define Word)',
    fullForm: '16-Bit Word Storage Allocation',
    category: 'Data Definition',
    bytesAllocated: '2 Bytes per element',
    desc: 'Allocates memory storage space in RAM for 16-bit word variables. Stored in physical memory using Little-Endian byte order.',
    example: 'VAL_WORD DW 1234H\nARRAY_W DW 5 DUP(0)',
    styleAffiliation: 'Both Styles'
  },
  'DD': {
    id: 'DD',
    name: 'DD (Define Doubleword)',
    fullForm: '32-Bit Doubleword Storage Allocation',
    category: 'Data Definition',
    bytesAllocated: '4 Bytes per element',
    desc: 'Allocates memory storage space for 32-bit values or FAR pointer addresses (Segment:Offset pairs).',
    example: 'FAR_PTR DD 10002000H',
    styleAffiliation: 'Both Styles'
  },
  'DUP': {
    id: 'DUP',
    name: 'DUP (Duplicate Operator)',
    fullForm: 'Array Allocation Duplicator',
    category: 'Data Definition',
    bytesAllocated: 'Count * Element Size',
    desc: 'Duplicates a pattern or value multiple times to initialize array memory blocks.',
    example: 'BUFFER DB 100 DUP(0)  ; 100 zeroed bytes',
    styleAffiliation: 'Both Styles'
  },
  'EQU': {
    id: 'EQU',
    name: 'EQU (Equate Constant)',
    fullForm: 'Equate Symbolic Constant',
    category: 'General Symbol',
    bytesAllocated: '0 Bytes (Replaced at Compile-Time)',
    desc: 'Assigns a symbolic text alias or constant value. The assembler replaces occurrences during translation; no runtime RAM consumed.',
    example: 'MAX_SIZE EQU 50\nMOV CX, MAX_SIZE',
    styleAffiliation: 'Both Styles'
  },
  'ORG': {
    id: 'ORG',
    name: 'ORG (Origin)',
    fullForm: 'Origin Offset Directive',
    category: 'General Symbol',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Sets the starting instruction or data location counter offset in memory. Crucial for DOS .COM executables (ORG 100H).',
    example: 'ORG 100H  ; Sets CS offset to 100H',
    styleAffiliation: 'Both Styles'
  },
  'END': {
    id: 'END',
    name: 'END',
    fullForm: 'End of Assembly Source Module',
    category: 'General Symbol',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Terminates the assembly process for the current file. Specifies the program entry point label to the linker.',
    example: 'END START',
    styleAffiliation: 'Both Styles'
  },
  'PROC': {
    id: 'PROC',
    name: 'PROC & ENDP',
    fullForm: 'Procedure Declaration Block',
    category: 'Procedure & Scope',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Encloses subroutines/functions. Can be specified as NEAR (same code segment) or FAR (different code segment).',
    example: 'MY_SUB PROC NEAR\n  ; subroutine logic\n  RET\nMY_SUB ENDP',
    styleAffiliation: 'Both Styles'
  },
  'PTR': {
    id: 'PTR',
    name: 'PTR (Pointer Type Override)',
    fullForm: 'Pointer Type Clarification Operator',
    category: 'Procedure & Scope',
    bytesAllocated: '0 Bytes (Compile Operator)',
    desc: 'Overrides or clarifies the memory operand size (BYTE PTR or WORD PTR) when operand size is ambiguous.',
    example: 'MOV BYTE PTR [BX], 05H\nINC WORD PTR [SI]',
    styleAffiliation: 'Both Styles'
  },
  'OFFSET': {
    id: 'OFFSET',
    name: 'OFFSET',
    fullForm: 'Offset Address Operator',
    category: 'Procedure & Scope',
    bytesAllocated: '0 Bytes (Compile Operator)',
    desc: 'Extracts the 16-bit logical offset address of a variable or label rather than its content value.',
    example: 'MOV BX, OFFSET MY_VAR\n; Same as LEA BX, MY_VAR',
    styleAffiliation: 'Both Styles'
  }
};

interface ProgrammingStyleInfo {
  id: 'standard' | 'simplified' | 'com';
  title: string;
  badge: string;
  subtitle: string;
  desc: string;
  formatName: string;
  code: string;
  keyDirectives: string[];
  features: string[];
}

const programmingStylesData: Record<string, ProgrammingStyleInfo> = {
  'standard': {
    id: 'standard',
    title: '1. Standard Segment-Ends Style',
    badge: 'EXE Format (Explicit)',
    subtitle: 'Classic SEGMENT / ENDS / ASSUME Frame Structure',
    desc: 'The traditional 8086 program format where every memory section (Data, Code, Stack) is explicitly wrapped in SEGMENT and ENDS directives. Gives complete low-level control over segment naming and alignment.',
    formatName: 'Standard .EXE Program Format',
    code: `; Standard Segment-Ends Style
DATA_SEG SEGMENT
  NUM1 DB 15H
  NUM2 DB 25H
  RESULT DB ?
DATA_SEG ENDS

CODE_SEG SEGMENT
  ASSUME CS:CODE_SEG, DS:DATA_SEG
START:
  ; Manual DS Initialization
  MOV AX, DATA_SEG
  MOV DS, AX

  ; Addition Logic
  MOV AL, NUM1
  ADD AL, NUM2
  MOV RESULT, AL

  ; DOS Exit Interrupt
  MOV AH, 4CH
  INT 21H
CODE_SEG ENDS
END START`,
    keyDirectives: ['SEGMENT', 'ENDS', 'ASSUME', 'END', 'DB'],
    features: [
      'Explicit SEGMENT and ENDS blocks for each memory section',
      'Requires ASSUME directive to bind registers to segment names',
      'Data segment address MUST be loaded manually into DS via MOV AX, DATA_SEG',
      'Generates a multi-segment relocatable .EXE executable file'
    ]
  },
  'simplified': {
    id: 'simplified',
    title: '2. Simplified Dot-Model Style',
    badge: 'EXE Format (Modern)',
    subtitle: 'Concise .MODEL / .DATA / .CODE Shortcut Structure',
    desc: 'The modern, streamlined programming style using dot-directives. Eliminates verbose SEGMENT/ENDS syntax and ASSUME statements while maintaining clean module separation.',
    formatName: 'Simplified Dot-Model .EXE Format',
    code: `; Simplified Dot-Model Style
.MODEL SMALL
.STACK 100H

.DATA
  NUM1 DB 15H
  NUM2 DB 25H
  RESULT DB ?

.CODE
MAIN PROC
  ; Predefined @DATA symbol
  MOV AX, @DATA
  MOV DS, AX

  ; Addition Logic
  MOV AL, NUM1
  ADD AL, NUM2
  MOV RESULT, AL

  ; DOS Exit
  MOV AH, 4CH
  INT 21H
MAIN ENDP
END MAIN`,
    keyDirectives: ['.MODEL', '.STACK', '.DATA', '.CODE', '@DATA', 'PROC', 'ENDP'],
    features: [
      'Uses .MODEL SMALL to automatically configure code and data segment limits',
      'Replaces ASSUME with implicit automated segment declarations',
      'Loads DS using the predefined @DATA symbol',
      'Cleaner, more readable syntax used in modern assembly courses'
    ]
  },
  'com': {
    id: 'com',
    title: '3. Tiny .COM Single Segment Style',
    badge: 'COM Format (Single Segment)',
    subtitle: 'Unified 64KB Memory Space (.MODEL TINY + ORG 100H)',
    desc: 'A ultra-compact program style where Code, Data, and Stack all reside inside a single 64KB physical segment. DOS automatically initializes CS = DS = SS = ES upon startup.',
    formatName: 'Tiny .COM Executable Format',
    code: `; Tiny .COM Single Segment Style
.MODEL TINY
.CODE
ORG 100H  ; Entry point offset for .COM

START:
  JMP REAL_CODE

  ; Embedded Data inside Code Segment
  NUM1 DB 15H
  NUM2 DB 25H
  RESULT DB ?

REAL_CODE:
  ; NO DS Initialization Needed!
  ; DOS automatically sets CS = DS = SS = ES

  MOV AL, NUM1
  ADD AL, NUM2
  MOV RESULT, AL

  ; DOS Exit
  MOV AH, 4CH
  INT 21H

END START`,
    keyDirectives: ['.MODEL TINY', '.CODE', 'ORG 100H', 'JMP', 'END'],
    features: [
      'Combines Code, Data, and Stack into ONE unified 64KB segment',
      'Requires ORG 100H to reserve 256-byte Program Segment Prefix (PSP)',
      'NO manual DS loading required (CS = DS = SS = ES automatically)',
      'Produces lightweight .COM files (maximum size 64KB)'
    ]
  }
};

interface DirectiveSandboxSimulatorProps {
  initialLabId?: string;
}

export default function DirectiveSandboxSimulator({ initialLabId }: DirectiveSandboxSimulatorProps = {}) {
  const [activeTab, setActiveTab] = useState<'directives' | 'styles' | 'sandbox'>('directives');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDirectiveId, setSelectedDirectiveId] = useState<string>('DB');
  const [selectedStyleId, setSelectedStyleId] = useState<'standard' | 'simplified' | 'com'>('standard');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Memory Sandbox state
  const [var1Val, setVar1Val] = useState<string>('7A');
  const [var2Val, setVar2Val] = useState<string>('1F04');
  const [dupCount, setDupCount] = useState<number>(3);

  const selectedDirective = directivesCatalog[selectedDirectiveId] || directivesCatalog['DB'];
  const selectedStyle = programmingStylesData[selectedStyleId];

  const handleCopyCode = (text: string) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const categories = ['All', 'Segment Control', 'Data Definition', 'Procedure & Scope', 'General Symbol'];

  const filteredDirectives = Object.values(directivesCatalog).filter(d => {
    if (selectedCategory === 'All') return true;
    return d.category === selectedCategory;
  });

  return (
    <div id="directive-sandbox-simulator" className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 text-slate-800 flex flex-col justify-between shadow-xs min-h-[750px] max-w-7xl mx-auto w-full">
      {/* Top Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Binary className="w-5 h-5 text-indigo-600" />
            8086 Assembler Directives & Programming Styles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive compile-time directive reference, program structure comparison, and RAM memory layout analyzer
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <button
            id="btn-tab-directives"
            onClick={() => setActiveTab('directives')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'directives'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Assembler Directives
          </button>
          <button
            id="btn-tab-styles"
            onClick={() => setActiveTab('styles')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'styles'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            Programming Styles
          </button>
          <button
            id="btn-tab-sandbox"
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'sandbox'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600" />
            Memory Layout Sandbox
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-[580px]">
        {/* TAB 1: ASSEMBLER DIRECTIVES CATALOG */}
        {activeTab === 'directives' && (
          <motion.div
            key="directives-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Filter:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid Layout: Left List of Directives, Right Detail Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Directive Cards List */}
              <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredDirectives.map((dir) => {
                  const isSelected = dir.id === selectedDirectiveId;
                  return (
                    <button
                      key={dir.id}
                      onClick={() => setSelectedDirectiveId(dir.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-300 shadow-sm'
                          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className={`text-[9px] font-mono font-bold uppercase block mb-1 ${
                          isSelected ? 'text-indigo-600' : 'text-slate-400'
                        }`}>
                          {dir.category}
                        </span>
                        <h4 className="text-xs font-extrabold font-mono text-slate-900 tracking-tight">
                          {dir.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-2 block truncate">
                        {dir.fullForm}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Directive Inspector Box */}
              <div className="lg:col-span-6 bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md">
                        {selectedDirective.category}
                      </span>
                      <span className="text-[10px] font-mono font-extrabold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                        {selectedDirective.styleAffiliation}
                      </span>
                    </div>
                    <h3 className="text-lg font-mono font-black text-white tracking-tight">
                      {selectedDirective.name}
                    </h3>
                    <p className="text-xs font-mono text-indigo-300 mt-0.5">
                      {selectedDirective.fullForm}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Compile Size</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {selectedDirective.bytesAllocated}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                    Purpose & Compile-Time Behavior
                  </span>
                  <p className="text-xs leading-relaxed text-slate-300 font-sans">
                    {selectedDirective.desc}
                  </p>
                </div>

                {/* Assembly Example Block */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                      8086 Assembly Syntax Example
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedDirective.example)}
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
                    <pre>{selectedDirective.example}</pre>
                  </div>
                </div>

                {/* Important distinction note */}
                <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-2xl p-3 flex items-start gap-2 text-indigo-200 text-xs">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-snug text-[11px]">
                    <strong>Note:</strong> Assembler directives are processed by the assembler software (MASM/TASM) at compile-time and do NOT generate executable machine opcodes in the CPU.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: TYPES OF ASSEMBLY PROGRAMMING STYLES */}
        {activeTab === 'styles' && (
          <motion.div
            key="styles-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Style Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['standard', 'simplified', 'com'] as const).map((styleKey) => {
                const style = programmingStylesData[styleKey];
                const isSelected = styleKey === selectedStyleId;
                return (
                  <button
                    key={styleKey}
                    onClick={() => setSelectedStyleId(styleKey)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md inline-block mb-2 ${
                        isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {style.badge}
                      </span>
                      <h3 className="text-sm font-extrabold tracking-tight font-sans">
                        {style.title}
                      </h3>
                    </div>
                    <p className={`text-xs mt-2 font-mono leading-snug ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {style.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Style Deep-Dive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Code Editor View */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-100 shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-indigo-300">{selectedStyle.formatName}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(selectedStyle.code)}
                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied Code' : 'Copy Program'}
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner max-h-[420px]">
                  <pre className="whitespace-pre">{selectedStyle.code}</pre>
                </div>
              </div>

              {/* Right Architectural Characteristics */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5">
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase text-indigo-600 tracking-wider block">
                    Style Characteristics
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
                    {selectedStyle.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {selectedStyle.desc}
                  </p>
                </div>

                {/* Key Directives Used */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                    Key Directives Required
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStyle.keyDirectives.map((kd) => (
                      <span key={kd} className="text-xs font-mono font-bold bg-white border border-slate-200 text-indigo-700 px-2.5 py-1 rounded-lg shadow-2xs">
                        {kd}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                    Key Features & Mechanics
                  </span>
                  <ul className="space-y-2">
                    {selectedStyle.features.map((ft, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{ft}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-extrabold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                Feature Comparison Matrix across 8086 Program Styles
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-400 font-bold bg-white">
                      <th className="p-2.5">Feature</th>
                      <th className="p-2.5 text-indigo-700">1. Standard Segment Style</th>
                      <th className="p-2.5 text-emerald-700">2. Simplified Dot-Model Style</th>
                      <th className="p-2.5 text-amber-700">3. Tiny .COM Style</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Segment Boundaries</td>
                      <td className="p-2.5">Explicit <code className="text-indigo-600">SEGMENT / ENDS</code></td>
                      <td className="p-2.5"><code className="text-emerald-600">.DATA</code> and <code className="text-emerald-600">.CODE</code> shortcuts</td>
                      <td className="p-2.5"><code className="text-amber-600">.MODEL TINY</code> single segment</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">DS Loading Method</td>
                      <td className="p-2.5"><code className="text-indigo-600">MOV AX, DATA_SEG</code></td>
                      <td className="p-2.5"><code className="text-emerald-600">MOV AX, @DATA</code></td>
                      <td className="p-2.5"><strong className="text-emerald-600">Automatic by OS</strong> (CS=DS=SS=ES)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Executable Format</td>
                      <td className="p-2.5">Multi-segment .EXE file</td>
                      <td className="p-2.5">Multi-segment .EXE file</td>
                      <td className="p-2.5">Lightweight single-segment .COM file</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Max Memory Reach</td>
                      <td className="p-2.5">Up to 1 MB physical RAM</td>
                      <td className="p-2.5">Up to 1 MB physical RAM</td>
                      <td className="p-2.5">Maximum 64 KB total program size</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: DATA SEGMENT RAM ALLOCATION SANDBOX */}
        {activeTab === 'sandbox' && (
          <motion.div
            key="sandbox-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight font-sans uppercase flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  Interactive Data Segment Memory Allocation Sandbox
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate how variable declaration directives (DB, DW, DUP) allocate RAM byte offsets in Little-Endian format
                </p>
              </div>

              {/* Interactive Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    MY_BYTE (DB Directive - 1 Byte):
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">0x</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={var1Val}
                      onChange={(e) => setVar1Val(e.target.value.toUpperCase())}
                      className="font-mono text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-indigo-700 w-20 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    MY_WORD (DW Directive - 2 Bytes):
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">0x</span>
                    <input
                      type="text"
                      maxLength={4}
                      value={var2Val}
                      onChange={(e) => setVar2Val(e.target.value.toUpperCase())}
                      className="font-mono text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-indigo-700 w-24 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">
                    MY_ARRAY (DB {dupCount} DUP(0) - Bytes):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={dupCount}
                      onChange={(e) => setDupCount(parseInt(e.target.value))}
                      className="accent-indigo-600 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {dupCount} Bytes
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical RAM Offsets Mapping Visualization */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                  Computed Data Segment RAM Offsets (DS:0000H onwards):
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 font-mono text-xs">
                  {/* Byte 0: MY_BYTE */}
                  <div className="bg-indigo-50 border border-indigo-300 rounded-2xl p-3 text-center shadow-xs">
                    <span className="text-[8px] font-bold text-indigo-500 block uppercase">Offset 0000H</span>
                    <span className="text-sm font-black text-indigo-900 block my-0.5">
                      {(var1Val || '00').padStart(2, '0')}H
                    </span>
                    <span className="text-[8px] font-bold text-indigo-600 block uppercase truncate">MY_BYTE (DB)</span>
                  </div>

                  {/* Byte 1 & 2: MY_WORD (Little-Endian) */}
                  {(() => {
                    const paddedHex = (var2Val || '0000').padStart(4, '0');
                    const lowByte = paddedHex.slice(2, 4);
                    const highByte = paddedHex.slice(0, 2);
                    return (
                      <>
                        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-center shadow-xs">
                          <span className="text-[8px] font-bold text-emerald-600 block uppercase">Offset 0001H</span>
                          <span className="text-sm font-black text-emerald-900 block my-0.5">
                            {lowByte}H
                          </span>
                          <span className="text-[8px] font-bold text-emerald-700 block uppercase truncate">MY_WORD (Low Byte)</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-center shadow-xs">
                          <span className="text-[8px] font-bold text-emerald-600 block uppercase">Offset 0002H</span>
                          <span className="text-sm font-black text-emerald-900 block my-0.5">
                            {highByte}H
                          </span>
                          <span className="text-[8px] font-bold text-emerald-700 block uppercase truncate">MY_WORD (High Byte)</span>
                        </div>
                      </>
                    );
                  })()}

                  {/* Array DUP Bytes */}
                  {Array.from({ length: dupCount }).map((_, idx) => {
                    const offsetHex = (3 + idx).toString(16).toUpperCase().padStart(4, '0') + 'H';
                    return (
                      <div key={idx} className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-center shadow-xs">
                        <span className="text-[8px] font-bold text-amber-600 block uppercase">Offset {offsetHex}</span>
                        <span className="text-sm font-black text-amber-900 block my-0.5">
                          00H
                        </span>
                        <span className="text-[8px] font-bold text-amber-700 block uppercase truncate">ARR[{idx}] (DUP)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Memory Explanation */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed font-sans flex items-start gap-3">
                <Cpu className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-bold block mb-0.5">Little-Endian Memory Storage Principle:</strong>
                  Notice that when declaring <code className="text-indigo-600 font-mono font-bold">MY_WORD DW {(var2Val || '0000').padStart(4, '0')}H</code>, the 8086 processor stores the lower byte (<code className="text-emerald-700 font-mono font-bold">{(var2Val || '0000').padStart(4, '0').slice(2, 4)}H</code>) at the lower memory offset (0001H), and the higher byte (<code className="text-emerald-700 font-mono font-bold">{(var2Val || '0000').padStart(4, '0').slice(0, 2)}H</code>) at the next offset (0002H).
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
