import React, { useState } from 'react';
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
  Tag
} from 'lucide-react';

interface DirectiveInfo {
  id: string;
  name: string;
  fullForm: string;
  bytesAllocated: string;
  desc: string;
  example: string;
}

const directivesData: Record<string, DirectiveInfo> = {
  'SEGMENT': {
    id: 'SEGMENT',
    name: 'SEGMENT & ENDS',
    fullForm: 'Segment Boundaries Definition',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Defines the starting and ending boundaries of a logical segment module (e.g. Code, Data, Stack) inside the program. Guides the assembler to organize code cleanly into blocks.',
    example: 'DATA SEGMENT\n; variables go here\nDATA ENDS'
  },
  'DB': {
    id: 'DB',
    name: 'DB (Define Byte)',
    fullForm: 'Define Byte',
    bytesAllocated: '1 Byte per element',
    desc: 'Allocates memory storage space in RAM for 8-bit variables. Can initialize variables with constants, string characters, or uninitialized values (?).',
    example: 'VAL_BYTE DB 25H\nCHAR_STR DB \'A\''
  },
  'DW': {
    id: 'DW',
    name: 'DW (Define Word)',
    fullForm: 'Define Word',
    bytesAllocated: '2 Bytes per element',
    desc: 'Allocates memory storage space in RAM for 16-bit word variables. Stores the low-byte at the lower physical address and the high-byte at the higher address (Little-Endian layout).',
    example: 'VAL_WORD DW 12A0H\nARRAY_W DW 5 DUP(0)'
  },
  'DD': {
    id: 'DD',
    name: 'DD (Define Doubleword)',
    fullForm: 'Define Doubleword',
    bytesAllocated: '4 Bytes per element',
    desc: 'Allocates memory storage space in RAM for 32-bit doubleword variables (commonly used for storing far segment pointers: 16-bit CS and 16-bit IP offset).',
    example: 'VAL_DWORD DD 12345678H'
  },
  'ASSUME': {
    id: 'ASSUME',
    name: 'ASSUME',
    fullForm: 'Assume Segment Association',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Tells the assembler which physical segment register (CS, DS, SS, ES) should point to which logical segment at runtime. It is purely for compile-time syntax checks and does NOT actually load registers with addresses.',
    example: 'ASSUME CS:CODE, DS:DATA'
  },
  'ORG': {
    id: 'ORG',
    name: 'ORG (Origin)',
    fullForm: 'Origin Pointer Control',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Sets the starting logical offset address pointer for subsequent instructions or data variables inside the active segment. Commonly set to ORG 100H for DOS .COM files.',
    example: 'ORG 0100H'
  },
  'EQU': {
    id: 'EQU',
    name: 'EQU (Equate)',
    fullForm: 'Equate Constant Symbol',
    bytesAllocated: '0 Bytes (Compiler Directive)',
    desc: 'Creates a text or numeric constant alias. The assembler replaces all occurrences of the symbol name with its literal value during the compilation process. Consumes no physical RAM.',
    example: 'MAX_LIMIT EQU 50'
  },
  'DUP': {
    id: 'DUP',
    name: 'DUP (Duplicate Operator)',
    fullForm: 'Duplicate Memory Array',
    bytesAllocated: 'Dependent on width (DB/DW/DD) & count',
    desc: 'A duplicating operator used inside DB/DW directives to easily allocate and initialize block memory arrays with a uniform initial value.',
    example: 'ARRAY_B DB 10 DUP(0H) ; reserves 10 bytes initialized to 0'
  }
};

const segmentLayout = [
  { label: 'MY_BYTE', directive: 'DB', value: '7AH', size: 1, offset: '0000H', desc: 'Single 8-bit byte at Offset 0000H' },
  { label: 'MY_WORD', directive: 'DW', value: '1F04H', size: 2, offset: '0001H', desc: '16-bit Word spans 2 bytes (Offsets 0001H & 0002H)' },
  { label: 'MY_DWORD', directive: 'DD', value: '12345678H', size: 4, offset: '0003H', desc: '32-bit Doubleword spans 4 bytes (Offsets 0003H - 0006H)' },
  { label: 'MY_ARRAY', directive: 'DB', value: '3 DUP(0)', size: 3, offset: '0007H', desc: '3 consecutive bytes initialized to 0 (Offsets 0007H - 0009H)' }
];

export default function DirectiveSandboxSimulator() {
  const [hoveredDirective, setHoveredDirective] = useState<string>('DB');
  const [selectedVarIdx, setSelectedVarIdx] = useState<number | null>(null);

  const activeDirective = directivesData[hoveredDirective] || directivesData['DB'];

  return (
    <div id="directive-sandbox-simulator" className="bg-white border border-slate-200 rounded-3xl p-6 min-h-[480px] text-slate-800 flex flex-col justify-between shadow-xs">
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold font-display text-indigo-600 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Assembler Directives & Memory Sandbox
          </h2>
          <p className="text-slate-500 text-xs">Hover or click highlighted directives in the program to see how memory is partitioned</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Column A: Interactive Code Explorer */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3 text-[10px] font-mono text-slate-400">
                <span>MASM Assembly Program Template</span>
                <span>DATA SEGMENT MAP</span>
              </div>

              {/* Pseudo code display */}
              <pre className="font-mono text-[10.5px] leading-relaxed text-slate-700 select-none">
                <span className="text-slate-400">; --- Segment Definitions ---</span><br />
                <span className="text-sky-700 font-bold">DATA</span> <button onMouseEnter={() => setHoveredDirective('SEGMENT')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">SEGMENT</button><br />
                
                <span className="text-slate-400">  ; Variables using DB, DW, DD directives</span><br />
                <span>  MAX_VAL  <button onMouseEnter={() => setHoveredDirective('EQU')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">EQU</button> 100</span><br />
                <span>  MY_BYTE  <button onMouseEnter={() => setHoveredDirective('DB')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">DB</button>  7AH</span><br />
                <span>  MY_WORD  <button onMouseEnter={() => setHoveredDirective('DW')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">DW</button>  1F04H</span><br />
                <span>  MY_DWORD <button onMouseEnter={() => setHoveredDirective('DD')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">DD</button>  12345678H</span><br />
                <span>  MY_ARRAY <button onMouseEnter={() => setHoveredDirective('DB')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">DB</button>  3 <button onMouseEnter={() => setHoveredDirective('DUP')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">DUP</button>(0)</span><br />
                
                <span className="text-sky-700 font-bold">DATA</span> <button onMouseEnter={() => setHoveredDirective('SEGMENT')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">ENDS</button><br /><br />

                <span className="text-sky-700 font-bold">CODE</span> <button onMouseEnter={() => setHoveredDirective('SEGMENT')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">SEGMENT</button><br />
                <span>  <button onMouseEnter={() => setHoveredDirective('ASSUME')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer font-extrabold">ASSUME</button> CS:CODE, DS:DATA</span><br />
                
                <span className="text-slate-400">  ; Entry point offset</span><br />
                <span>  <button onMouseEnter={() => setHoveredDirective('ORG')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">ORG</button> 0100H</span><br />
                <span>START:</span><br />
                <span className="text-slate-600">  MOV AX, DATA</span><br />
                <span className="text-slate-600">  MOV DS, AX</span><br />
                <span className="text-slate-600">  ; code body goes here</span><br />
                
                <span className="text-sky-700 font-bold">CODE</span> <button onMouseEnter={() => setHoveredDirective('SEGMENT')} className="text-indigo-600 hover:text-indigo-750 font-bold underline cursor-pointer">ENDS</button><br />
                <span className="text-sky-700 font-bold">END</span> START
              </pre>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[10px] text-slate-500 flex items-center gap-1.5 mt-4">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              <span>Tip: Hover over the underlined directives to inspect details on the right</span>
            </div>
          </div>

          {/* Column B: Detailed Directive Explainer & Data Segment visualizer */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            
            {/* Directive Details Card */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider">Directive Details</span>
                <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                  {activeDirective.bytesAllocated}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  {activeDirective.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-bold uppercase">{activeDirective.fullForm}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{activeDirective.desc}</p>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[10px]">
                <span className="text-slate-400 block mb-1">Standard Syntax Example:</span>
                <pre className="text-indigo-750">{activeDirective.example}</pre>
              </div>
            </div>

            {/* Logical Data Segment Offset Map */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-500 font-mono block uppercase border-b border-slate-100 pb-1">Logical Memory Mapping (Data Segment):</span>
              <div className="grid grid-cols-4 gap-1.5">
                {segmentLayout.map((item, idx) => {
                  const isSelected = selectedVarIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedVarIdx(isSelected ? null : idx)}
                      className={`text-left p-2 rounded-xl border font-mono transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-500 scale-[1.02] shadow-sm text-indigo-700' 
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="block text-[8px] text-slate-400">{item.offset}</span>
                      <span className="block text-[10px] font-bold truncate">{item.label}</span>
                      <span className="block text-[8px] text-indigo-600 mt-1">{item.directive} ({item.size}B)</span>
                    </button>
                  );
                })}
              </div>

              <div className="h-[40px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {selectedVarIdx !== null ? (
                    <motion.div
                      key={selectedVarIdx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-indigo-700 italic text-center w-full bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg"
                    >
                      {segmentLayout[selectedVarIdx].desc} - Value: <strong>{segmentLayout[selectedVarIdx].value}</strong>
                    </motion.div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">Click any memory block variable above to inspect offset allocation</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 font-mono text-right pt-4 border-t border-slate-100 shrink-0 mt-4">
        Interactive Assembler Directives Sandbox
      </div>
    </div>
  );
}
