import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Cpu, 
  Settings, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Sparkles, 
  Info, 
  Terminal, 
  ArrowLeftRight, 
  Layers, 
  Database,
  ChevronRight,
  HelpCircle,
  Sliders,
  ChevronLeft,
  BookOpen,
  Binary,
  ArrowRightLeft,
  Code2,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import {
  SimulatorInstruction,
  mockInstructions,
  eceSlides,
  getSlideIndexForOpcode,
  getInstructionFormat,
  EceSlide,
  InstructionFormatInfo
} from '../data/instructionDecoderData';

export default function InstructionDecoderSimulator() {
  const [activeTab, setActiveTab] = useState<'All' | 'Data Transfer' | 'Arithmetic' | 'BCD & ASCII Adjust' | 'Logical & Bitwise' | 'Control, Flag & IO'>('All');
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  
  // Simulated hardware state
  const [regs, setRegs] = useState<Record<string, number>>(mockInstructions[0].initialRegs);
  const [flags, setFlags] = useState<Record<string, number>>(mockInstructions[0].initialFlags);
  const [beforeRegs, setBeforeRegs] = useState<Record<string, number>>(mockInstructions[0].initialRegs);
  const [beforeFlags, setBeforeFlags] = useState<Record<string, number>>(mockInstructions[0].initialFlags);
  
  // Execution Status
  const [executionState, setExecutionState] = useState<'idle' | 'executing' | 'done'>('idle');
  const [lastExplanation, setLastExplanation] = useState<string>('');
  const [labHelpTab, setLabHelpTab] = useState<'slide' | 'format' | 'transfer' | 'xlat'>('slide');
  const [slideIndex, setSlideIndex] = useState<number>(3); // Initialized directly to MOV Slide
  const [transferDemo, setTransferDemo] = useState<'mov' | 'push' | 'pop' | 'lea'>('mov');

  // Register editing
  const [editingReg, setEditingReg] = useState<string | null>(null);
  const [tempRegVal, setTempRegVal] = useState<string>('');

  // Interactive XLAT translation scenario
  const [xlatScenario, setXlatScenario] = useState<'gray' | 'sevensegment' | 'ascii_num' | 'ascii_case' | 'custom'>('gray');
  const [xlatAlVal, setXlatAlVal] = useState<number>(3);

  const [xlatTable, setXlatTable] = useState<number[]>([
    0x00, 0x01, 0x03, 0x02, 0x06, 0x07, 0x05, 0x04, 0x0C, 0x0D, 0x0F, 0x0E, 0x0A, 0x0B, 0x09, 0x08
  ]);

  // Interactive Stack Frames State
  const [stackFrames, setStackFrames] = useState<Array<{ addr: number; value: number; label: string }>>([
    { addr: 0xFFFC, value: 0x1234, label: 'AX (Pushed)' }
  ]);



  const activeInstruction = mockInstructions[selectedIdx];

  const filteredInstructions = mockInstructions
    .map((inst, index) => ({ inst, index }))
    .filter(item => activeTab === 'All' || item.inst.category === activeTab);

  const handleSelectInstruction = (idx: number) => {
    setSelectedIdx(idx);
    setRegs(mockInstructions[idx].initialRegs);
    setFlags(mockInstructions[idx].initialFlags);
    setBeforeRegs(mockInstructions[idx].initialRegs);
    setBeforeFlags(mockInstructions[idx].initialFlags);
    setExecutionState('idle');
    setLastExplanation('');
    
    const targetSlide = getSlideIndexForOpcode(mockInstructions[idx].opcode);
    setSlideIndex(targetSlide);
    setLabHelpTab('slide'); // Jump to corresponding presentation slide

    // Synchronize XLAT index if XLAT instruction selected
    if (mockInstructions[idx].opcode === 'XLAT') {
      setXlatAlVal(mockInstructions[idx].initialRegs.AX & 0xFF);
    }
  };

  const handleExecute = () => {
    const captureRegs = { ...regs };
    const captureFlags = { ...flags };
    setBeforeRegs(captureRegs);
    setBeforeFlags(captureFlags);

    setExecutionState('executing');

    setTimeout(() => {
      let result;
      if (activeInstruction.opcode === 'XLAT') {
        const alVal = captureRegs.AX & 0xFF;
        const lookupVal = xlatTable[Math.min(15, alVal)] ?? 0;
        const newAX = (captureRegs.AX & 0xFF00) | lookupVal;
        
        const scenarioNames = {
          gray: 'Binary-to-Gray Code Conversion',
          sevensegment: 'Hex-to-Seven-Segment LED Conversion',
          ascii_num: 'Decimal-to-ASCII Character Conversion',
          ascii_case: 'Lowercase ASCII Alphabet Case Mapping',
          custom: 'Custom Table Mapping'
        };
        
        const scenarioMeanings = {
          gray: `the Gray Code pattern binary equivalent ${byteHexFormat(lookupVal)}`,
          sevensegment: `the Seven-Segment LED display control code ${byteHexFormat(lookupVal)} (which physically lights up the corresponding LED segments)`,
          ascii_num: `the ASCII code ${byteHexFormat(lookupVal)} for character '${String.fromCharCode(lookupVal)}'`,
          ascii_case: `the ASCII code ${byteHexFormat(lookupVal)} for lowercase character '${String.fromCharCode(lookupVal)}'`,
          custom: `the mapped lookup byte ${byteHexFormat(lookupVal)}`
        };

        const explanation = `[XLAT EXECUTION SYSTEM]:\n` +
          `1. CPU reads base register BX = ${hexFormat(captureRegs.BX)} as the start offset of the lookup table in the Data Segment.\n` +
          `2. CPU reads AL = ${byteHexFormat(alVal)} (decimal ${alVal}) as the lookup index.\n` +
          `3. Effective Address calculation: DS:[BX + AL] = DS:[${hexFormat(captureRegs.BX + alVal)}].\n` +
          `4. CPU fetches the translated byte ${byteHexFormat(lookupVal)} from that memory location.\n` +
          `5. AL is updated from ${byteHexFormat(alVal)} to ${byteHexFormat(lookupVal)} (representing ${scenarioMeanings[xlatScenario]}).\n\n` +
          `Status flags are unaffected by the XLAT instruction.`;

        result = {
          newRegs: { ...captureRegs, AX: newAX, IP: captureRegs.IP + 1 },
          newFlags: { ...captureFlags },
          mathExplanation: explanation
        };
      } else {
        result = activeInstruction.execute(captureRegs, captureFlags);
        if (activeInstruction.opcode.startsWith('PUSH')) {
          const pushVal = captureRegs.AX;
          const targetAddr = (captureRegs.SP - 2) & 0xFFFF;
          setStackFrames(prev => [
            { addr: targetAddr, value: pushVal, label: `${activeInstruction.opcode.split(' ')[1] || 'AX'} (${hexFormat(pushVal)})` },
            ...prev.filter(f => f.addr !== targetAddr)
          ]);
        } else if (activeInstruction.opcode.startsWith('POP')) {
          const popAddr = captureRegs.SP;
          setStackFrames(prev => prev.filter(f => f.addr !== popAddr));
        }
      }
      setRegs(result.newRegs);
      setFlags(result.newFlags);
      setLastExplanation(result.mathExplanation);
      setExecutionState('done');
    }, 200);
  };

  const handlePushReg = (regName: string, regVal: number) => {
    const currentSp = regs.SP;
    const newSp = (currentSp - 2) & 0xFFFF;
    setRegs(prev => ({ ...prev, SP: newSp }));
    setStackFrames(prev => [
      { addr: newSp, value: regVal, label: `${regName} (${hexFormat(regVal)})` },
      ...prev.filter(f => f.addr !== newSp)
    ]);
    setExecutionState('done');
    setLastExplanation(
      `[STACK PUSH OPERATION]: Executed PUSH ${regName}.\n` +
      `1. Stack Pointer decremented by 2: SP ← ${hexFormat(currentSp)} - 2 = ${hexFormat(newSp)}.\n` +
      `2. 16-bit word ${hexFormat(regVal)} written to Stack Segment memory at SS:${hexFormat(newSp)}.\n` +
      `   - Low Byte (${byteHexFormat(regVal & 0xFF)}) stored at SS:${hexFormat(newSp)}\n` +
      `   - High Byte (${byteHexFormat((regVal >> 8) & 0xFF)}) stored at SS:${hexFormat((newSp + 1) & 0xFFFF)}`
    );
  };

  const handlePopReg = (regName: string) => {
    const currentSp = regs.SP;
    if (currentSp >= 0xFFFE) {
      setExecutionState('done');
      setLastExplanation('[STACK UNDERFLOW WARNING]: Stack Pointer SP is at Base of Stack (FFFEH). Cannot pop from an empty stack!');
      return;
    }
    const topFrame = stackFrames.find(f => f.addr === currentSp);
    const popVal = topFrame ? topFrame.value : 0x5678;
    const newSp = (currentSp + 2) & 0xFFFF;

    setRegs(prev => ({ ...prev, [regName]: popVal, SP: newSp }));
    setStackFrames(prev => prev.filter(f => f.addr !== currentSp));
    setExecutionState('done');
    setLastExplanation(
      `[STACK POP OPERATION]: Executed POP ${regName}.\n` +
      `1. 16-bit word ${hexFormat(popVal)} read from Stack Segment memory at SS:${hexFormat(currentSp)} into ${regName}.\n` +
      `2. Stack Pointer incremented by 2: SP ← ${hexFormat(currentSp)} + 2 = ${hexFormat(newSp)}.`
    );
  };

  const handleResetStack = () => {
    setRegs(prev => ({ ...prev, SP: 0xFFFE }));
    setStackFrames([]);
    setExecutionState('idle');
    setLastExplanation('Stack reset to initial empty state (SP = FFFEH).');
  };

  const handleReset = () => {
    setRegs(activeInstruction.initialRegs);
    setFlags(activeInstruction.initialFlags);
    setBeforeRegs(activeInstruction.initialRegs);
    setBeforeFlags(activeInstruction.initialFlags);
    setExecutionState('idle');
    setLastExplanation('');
  };

  const hexFormat = (val: number): string => {
    return val.toString(16).toUpperCase().padStart(4, '0') + 'H';
  };

  const byteHexFormat = (val: number): string => {
    return val.toString(16).toUpperCase().padStart(2, '0') + 'H';
  };

  // Safe manual adjustments for students to experiment
  const adjustRegister = (reg: string, delta: number) => {
    if (executionState !== 'idle' && executionState !== 'done') return;
    setRegs(prev => {
      const newVal = (prev[reg] + delta + 0x10000) & 0xFFFF;
      setBeforeRegs(b => ({ ...b, [reg]: newVal }));
      if (reg === 'AX' && activeInstruction.opcode === 'XLAT') {
        setXlatAlVal(newVal & 0xFF);
      }
      return { ...prev, [reg]: newVal };
    });
  };

  // Direct manual value setting
  const startEditing = (reg: string) => {
    if (executionState !== 'idle' && executionState !== 'done') return;
    setEditingReg(reg);
    setTempRegVal((regs[reg] ?? 0).toString(16).toUpperCase());
  };

  const saveEditing = (reg: string) => {
    setEditingReg(null);
    let cleanVal = tempRegVal.trim().toUpperCase();
    if (cleanVal.endsWith('H')) {
      cleanVal = cleanVal.slice(0, -1);
    }
    let parsed = parseInt(cleanVal, 16);
    if (isNaN(parsed)) {
      parsed = parseInt(cleanVal, 10);
    }
    if (!isNaN(parsed)) {
      const newVal = parsed & 0xFFFF;
      setRegs(prev => ({ ...prev, [reg]: newVal }));
      setBeforeRegs(prev => ({ ...prev, [reg]: newVal }));
      if (reg === 'AX' && activeInstruction.opcode === 'XLAT') {
        setXlatAlVal(newVal & 0xFF);
      }
    }
  };

  const toggleFlag = (flag: string) => {
    if (executionState !== 'idle' && executionState !== 'done') return;
    setFlags(prev => {
      const newVal = prev[flag] === 1 ? 0 : 1;
      setBeforeFlags(b => ({ ...b, [flag]: newVal }));
      return { ...prev, [flag]: newVal };
    });
  };

  const handleXlatScenarioChange = (scenario: 'gray' | 'sevensegment' | 'ascii_num' | 'ascii_case' | 'custom') => {
    setXlatScenario(scenario);
    if (scenario === 'gray') {
      setXlatTable([0x00, 0x01, 0x03, 0x02, 0x06, 0x07, 0x05, 0x04, 0x0C, 0x0D, 0x0F, 0x0E, 0x0A, 0x0B, 0x09, 0x08]);
    } else if (scenario === 'sevensegment') {
      setXlatTable([0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71]);
    } else if (scenario === 'ascii_num') {
      setXlatTable([0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46]);
    } else if (scenario === 'ascii_case') {
      setXlatTable([0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70]);
    } else {
      setXlatTable([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0x00]);
    }
  };

  const updateXlatAlVal = (val: number) => {
    const cleanVal = Math.min(15, Math.max(0, val));
    setXlatAlVal(cleanVal);
    if (activeInstruction?.opcode === 'XLAT') {
      setRegs(prev => {
        const currentAx = prev.AX ?? 0;
        const newAx = (currentAx & 0xFF00) | cleanVal;
        setBeforeRegs(b => ({ ...b, AX: newAx }));
        return { ...prev, AX: newAx };
      });
    }
  };

  const renderSegmentedBits = (label: string, bits: string) => {
    if (bits.length !== 8) {
      return (
        <div className="flex gap-0.5">
          {bits.split('').map((b, bi) => (
            <span key={bi} className="w-5 h-5 rounded bg-slate-900 text-slate-300 border border-slate-800/80 flex items-center justify-center font-mono text-[9px] font-bold shadow-xs">
              {b}
            </span>
          ))}
        </div>
      );
    }

    if (label === 'Opcode') {
      const base = bits.substring(0, 6);
      const d = bits.substring(6, 7);
      const w = bits.substring(7, 8);
      return (
        <div className="flex items-center gap-1 font-mono">
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5">
              {base.split('').map((b, bi) => (
                <span key={bi} className="w-4.5 h-4.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900/60 flex items-center justify-center text-[9px] font-bold shadow-xs" title="Opcode base bits">
                  {b}
                </span>
              ))}
            </div>
            <span className="text-[7.5px] text-indigo-400 font-bold uppercase mt-1 tracking-wider">Opcode</span>
          </div>

          <div className="w-[1px] h-6 bg-slate-800 self-center mx-0.5" />

          <div className="flex flex-col items-center">
            <span className="w-4.5 h-4.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/60 flex items-center justify-center text-[9px] font-bold shadow-xs" title="D bit: Direction (0 = Source is Reg, 1 = Dest is Reg)">
              {d}
            </span>
            <span className="text-[7.5px] text-emerald-400 font-bold uppercase mt-1 tracking-wider">D</span>
          </div>

          <div className="w-[1px] h-6 bg-slate-800 self-center mx-0.5" />

          <div className="flex flex-col items-center">
            <span className="w-4.5 h-4.5 rounded bg-amber-950 text-amber-400 border border-amber-900/60 flex items-center justify-center text-[9px] font-bold shadow-xs" title="W bit: Size (0 = 8-bit, 1 = 16-bit)">
              {w}
            </span>
            <span className="text-[7.5px] text-amber-400 font-bold uppercase mt-1 tracking-wider">W</span>
          </div>
        </div>
      );
    }

    if (label === 'ModR/M') {
      const mod = bits.substring(0, 2);
      const reg = bits.substring(2, 5);
      const rm = bits.substring(5, 8);
      return (
        <div className="flex items-center gap-1 font-mono">
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5">
              {mod.split('').map((b, bi) => (
                <span key={bi} className="w-4.5 h-4.5 rounded bg-sky-950 text-sky-400 border border-sky-900/60 flex items-center justify-center text-[9px] font-bold shadow-xs" title="MOD: Addressing Mode">
                  {b}
                </span>
              ))}
            </div>
            <span className="text-[7.5px] text-sky-400 font-bold uppercase mt-1 tracking-wider">MOD</span>
          </div>

          <div className="w-[1px] h-6 bg-slate-800 self-center mx-0.5" />

          <div className="flex flex-col items-center">
            <div className="flex gap-0.5">
              {reg.split('').map((b, bi) => (
                <span key={bi} className="w-4.5 h-4.5 rounded bg-pink-950 text-pink-400 border border-pink-900/60 flex items-center justify-center text-[9px] font-bold shadow-xs" title="REG: Register Index">
                  {b}
                </span>
              ))}
            </div>
            <span className="text-[7.5px] text-pink-400 font-bold uppercase mt-1 tracking-wider">REG</span>
          </div>

          <div className="w-[1px] h-6 bg-slate-800 self-center mx-0.5" />

          <div className="flex flex-col items-center">
            <div className="flex gap-0.5">
              {rm.split('').map((b, bi) => (
                <span key={bi} className="w-4.5 h-4.5 rounded bg-violet-950 text-violet-400 border border-violet-900/60 flex items-center justify-center text-[9px] font-bold shadow-xs" title="R/M: Register or Memory operand">
                  {b}
                </span>
              ))}
            </div>
            <span className="text-[7.5px] text-violet-400 font-bold uppercase mt-1 tracking-wider">R/M</span>
          </div>
        </div>
      );
    }

    const col = label.includes('LOCK') 
      ? 'bg-rose-950 text-rose-400 border-rose-900/60' 
      : label.includes('Immediate') || label.includes('Port') 
      ? 'bg-amber-950 text-amber-400 border-amber-900/60' 
      : 'bg-indigo-950 text-indigo-400 border-indigo-900/60';

    return (
      <div className="flex flex-col items-center font-mono">
        <div className="flex gap-0.5">
          {bits.split('').map((b, bi) => (
            <span key={bi} className={`w-4.5 h-4.5 rounded ${col} border flex items-center justify-center text-[9px] font-bold shadow-xs`} title={label}>
              {b}
            </span>
          ))}
        </div>
        <span className="text-[7.5px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
          {label.length > 6 ? label.substring(0, 5) + '.' : label}
        </span>
      </div>
    );
  };

  const getActiveStateLabel = () => {
    switch (executionState) {
      case 'executing':
        return { text: 'EU: EXECUTING INSTRUCTION...', color: 'text-amber-800', border: 'border-amber-300 bg-amber-50/80' };
      case 'done':
        return { text: 'EU: EXECUTION COMPLETED & REGISTER WRITEBACK OK', color: 'text-emerald-800 border-emerald-300 bg-emerald-50/80', border: 'border-emerald-300 bg-emerald-50/80' };
      default:
        return { text: 'SYSTEM STANDBY / EMULATION IDLE', color: 'text-indigo-800/90', border: 'border-sky-200/80 bg-sky-100/50' };
    }
  };

  const stateDetails = getActiveStateLabel();
  const formatInfo = getInstructionFormat(activeInstruction.opcode);

  return (
    <div id="instruction-decoder-simulator" className="bg-[#eef6ff] border border-sky-200/80 rounded-3xl p-6 text-slate-800 flex flex-col justify-between shadow-2xl relative overflow-hidden w-full shadow-indigo-950/5">
      {/* Background Neon Orbits */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-6 relative z-10">
        
        {/* Dynamic Micro-Controller Header */}
        <div className="border-b border-sky-200/60 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white border border-sky-100 rounded-2xl shadow-inner text-indigo-600 flex items-center justify-center">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold font-sans tracking-tight text-slate-900 flex items-center gap-2">
                8086 Instruction & ALU Execution Laboratory
                <span className="text-xs bg-indigo-100 border border-indigo-200/80 text-indigo-700 font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  Unit II
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>Intel 8086 Silicon Instruction Emulation Suite</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <div className="px-4 py-2 bg-white border border-sky-100 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Lecture Companion</span>
              <span className="text-xs text-indigo-600 font-bold block leading-none mt-1">Dr. M Lakshmipathy</span>
            </div>
          </div>
        </div>

        {/* Global Hardware Status Monitor */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`md:col-span-3 px-4 py-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${stateDetails.border}`}>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full transition-colors ${
                executionState === 'executing' 
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse' 
                  : executionState === 'done' 
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                  : 'bg-slate-400'
              }`} />
              <span className={`text-xs font-mono font-bold tracking-wider ${stateDetails.color}`}>
                {stateDetails.text}
              </span>
            </div>
            <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-md text-slate-600 border border-sky-100 shadow-sm">CS:IP = 1000:0100H</span>
          </div>

          <div className="px-4 py-3 bg-white border border-sky-100 rounded-2xl flex items-center justify-between shadow-sm">
            <span className="text-xs text-slate-500 font-sans font-bold uppercase tracking-wider">Instruction Format:</span>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">{formatInfo.machineCode}</span>
          </div>
        </div>

        {/* Categories Tab Switcher */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 border-b border-sky-100/80 scrollbar-thin scrollbar-thumb-sky-200/50 items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto">
            {(['All', 'Data Transfer', 'Arithmetic', 'BCD & ASCII Adjust', 'Logical & Bitwise', 'Control, Flag & IO'] as const).map(tab => {
              const isSel = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    const firstMatch = mockInstructions.findIndex(inst => tab === 'All' || inst.category === tab);
                    if (firstMatch !== -1) {
                      handleSelectInstruction(firstMatch);
                    }
                  }}
                  className={`px-3.5 py-2 text-[11px] font-sans font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
                    isSel
                      ? 'bg-gradient-to-r from-indigo-700 to-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-white border-sky-100 text-slate-600 hover:text-indigo-950 hover:bg-sky-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>


        </div>

        {/* 3-Column Bento Laboratory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* COLUMN 1: Code Selection & Operation Core */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-white border border-sky-150 rounded-2xl p-5 space-y-5 shadow-sm">
            
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 font-mono block uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-600 animate-pulse" />
                Instruction Stream:
              </span>
              <div className="space-y-1.5 overflow-y-auto max-h-[300px] pr-1.5 scrollbar-thin scrollbar-thumb-sky-200/50">
                {filteredInstructions.map(({ inst, index }) => {
                  const isSelected = selectedIdx === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectInstruction(index)}
                      disabled={executionState !== 'idle' && executionState !== 'done'}
                      className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs cursor-pointer transition-all flex justify-between items-center ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-500 text-white font-extrabold shadow-md relative overflow-hidden'
                          : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-sky-50/50 hover:text-indigo-950 hover:border-sky-200/60'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                      )}
                      <div>
                        <p className={`font-mono text-xs tracking-wide ${isSelected ? 'text-white' : 'text-slate-800 font-semibold'}`}>{inst.opcode}</p>
                        <p className={`text-[9px] mt-1 font-sans font-semibold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                          {inst.category}
                        </p>
                      </div>
                      {isSelected ? (
                        <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instruction Context & Micro-code Details */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase font-mono tracking-wider border-b border-slate-150 pb-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Setup parameters:
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {activeInstruction.setupDesc}
              </p>
              <div className="text-[11px] text-slate-500 leading-normal border-t border-slate-150 pt-2 flex flex-col gap-1.5 font-mono">
                <div><span className="font-bold text-slate-400">Addressing Mode: </span><span className="text-slate-700">{formatInfo.addressing}</span></div>
                <div><span className="font-bold text-slate-400">Assembly Syntax: </span><span className="text-indigo-700 font-semibold">{formatInfo.syntax}</span></div>
              </div>
            </div>

            {/* Hardware Console Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={handleExecute}
                disabled={executionState !== 'idle' && executionState !== 'done'}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold font-sans rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/30"
              >
                <Play className="w-4 h-4 fill-white" />
                Run Instruction
              </button>
              <button
                onClick={handleReset}
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold font-sans rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-slate-200 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                Reset CPU
              </button>
            </div>

          </div>

          {/* COLUMN 2 & 3: Visual CPU Registers Grid & Interactive Classroom Tabs */}
          <div className="lg:col-span-8 flex flex-col gap-6 justify-between">
            
            {/* The Silicon Register File & Flags */}
            <div className="bg-white border border-sky-150 rounded-2xl p-5 space-y-4 shadow-sm">
              
              {/* Register File Title Banner */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                  <span className="text-xs font-extrabold uppercase text-slate-800 tracking-wider font-mono">
                    8086 CPU Execution Unit (EU) Registers
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Standby Read-Write State</span>
              </div>

              {/* Glowing Register Matrices - Twin Cell Split Register Files */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['AX', 'BX', 'CX', 'DX', 'SP', 'BP', 'SI', 'DI'].map(reg => {
                  const val = regs[reg] ?? 0;
                  const prevVal = beforeRegs[reg] ?? 0;
                  const isModified = val !== prevVal && executionState === 'done';
                  const isCurrentEditing = editingReg === reg;

                  // High and Low sub-register calculations (only applicable to AX, BX, CX, DX)
                  const hasSubRegs = ['AX', 'BX', 'CX', 'DX'].includes(reg);
                  const highByteVal = (val >> 8) & 0xFF;
                  const lowByteVal = val & 0xFF;

                  return (
                    <div 
                      key={reg} 
                      className={`relative group bg-slate-50 border rounded-2xl p-3.5 transition-all duration-300 ${
                        isModified 
                          ? 'border-emerald-300 shadow-sm bg-emerald-50/40' 
                          : 'border-slate-150 hover:border-indigo-200/60'
                      }`}
                    >
                      {/* Register Name */}
                      <span className="text-xs font-mono text-indigo-700 font-extrabold block">{reg}</span>

                      {/* OLED Display Area */}
                      <div className="mt-2 flex items-center justify-between">
                        {isCurrentEditing ? (
                          <input
                            type="text"
                            value={tempRegVal}
                            autoFocus
                            onChange={(e) => setTempRegVal(e.target.value)}
                            onBlur={() => saveEditing(reg)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(reg);
                              if (e.key === 'Escape') setEditingReg(null);
                            }}
                            className="w-full bg-white text-emerald-800 font-mono text-sm px-2 py-1 rounded-lg border border-indigo-500 focus:outline-none"
                          />
                        ) : (
                          <div 
                            onClick={() => startEditing(reg)}
                            className="font-mono text-base font-bold text-emerald-700 tracking-wider cursor-pointer hover:bg-slate-200/50 px-1.5 py-0.5 rounded-lg transition-all flex items-baseline gap-1.5"
                            title="Click to edit raw Hex value"
                          >
                            <span>{hexFormat(val)}</span>
                            {isModified && (
                              <span className="text-[10px] text-slate-400 line-through font-normal">{hexFormat(prevVal)}</span>
                            )}
                          </div>
                        )}

                        {/* Adjust Buttons */}
                        <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => adjustRegister(reg, 1)}
                            disabled={executionState !== 'idle' && executionState !== 'done'}
                            className="text-[10px] text-slate-500 hover:text-indigo-600 disabled:opacity-20 cursor-pointer font-bold leading-none p-0.5 hover:bg-slate-200 rounded"
                          >
                            ▲
                          </button>
                          <button 
                            onClick={() => adjustRegister(reg, -1)}
                            disabled={executionState !== 'idle' && executionState !== 'done'}
                            className="text-[10px] text-slate-500 hover:text-indigo-600 disabled:opacity-20 cursor-pointer font-bold leading-none p-0.5 hover:bg-slate-200 rounded"
                          >
                            ▼
                          </button>
                        </div>
                      </div>

                      {/* Twin Cell Split Sub-Registers visual indicator */}
                      {hasSubRegs && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between font-mono text-[9px] text-slate-500">
                          <div>
                            <span className="text-indigo-600 font-semibold">{reg[0]}H:</span>{' '}
                            <span className="text-emerald-700 font-bold">{byteHexFormat(highByteVal)}</span>
                          </div>
                          <div className="w-[1px] bg-slate-200" />
                          <div>
                            <span className="text-indigo-600 font-semibold">{reg[0]}L:</span>{' '}
                            <span className="text-emerald-700 font-bold">{byteHexFormat(lowByteVal)}</span>
                          </div>
                        </div>
                      )}

                      {/* Small Indicator Tag */}
                      {isModified && (
                        <span className="absolute -top-1.5 right-2 bg-emerald-600 text-white text-[8px] font-bold px-1.5 rounded-full uppercase leading-none py-1 tracking-wider shadow-sm">
                          Delta
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ALU Segment Register Pins (Visual Bus Interface Unit - BIU representation) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-250/50">
                {['CS', 'DS', 'SS', 'ES'].map(seg => (
                  <div key={seg} className="flex items-center justify-between font-mono px-3 py-1.5 bg-white rounded-xl border border-slate-200/60 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold">{seg} Segment</span>
                    <span className="text-xs text-slate-800 font-bold">{hexFormat(regs[seg] ?? 0)}</span>
                  </div>
                ))}
              </div>

              {/* Status Flag Breadboard Pins - Styled as Physical Switches */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-mono text-slate-500 uppercase font-bold block mb-3 tracking-wider">
                  Intel 8086 ALU Status Flags:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3.5">
                  {['ZF', 'CF', 'SF', 'OF', 'AF', 'PF'].map(flag => {
                    const isSet = flags[flag] === 1;
                    const prevFlag = beforeFlags[flag] ?? 0;
                    const isMod = flags[flag] !== prevFlag && executionState === 'done';

                    return (
                      <div 
                        key={flag}
                        onClick={() => toggleFlag(flag)}
                        className={`cursor-pointer group flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          isSet 
                            ? 'bg-indigo-50 border-indigo-200 shadow-xs text-indigo-950' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'
                        }`}
                        title="Click to toggle flag status"
                      >
                        <span className="text-xs font-mono font-extrabold group-hover:text-indigo-700">{flag}</span>
                        
                        {/* LED Light */}
                        <div className="mt-2 relative flex items-center justify-center">
                          <span className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isSet 
                              ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
                              : 'bg-slate-200'
                          }`} />
                          {isMod && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          )}
                        </div>

                        <span className="text-[10px] font-mono mt-1.5 font-bold">{flags[flag]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Interactive Stack & PUSH/POP Memory Laboratory - Renders when PUSH or POP is selected */}
            {(activeInstruction.opcode.includes('PUSH') || activeInstruction.opcode.includes('POP')) && (
              <div className="bg-white border-2 border-indigo-200/80 rounded-2xl p-5 space-y-5 shadow-lg relative overflow-hidden">
                {/* Background circuit board glow */}
                <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <span className="text-sm font-extrabold uppercase text-slate-800 tracking-wider font-mono">
                      8086 Stack Segment (SS:SP) & PUSH/POP Memory Laboratory
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full font-bold">
                      SS: {hexFormat(regs.SS)}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-extrabold">
                      SP: {hexFormat(regs.SP)}
                    </span>
                  </div>
                </div>

                {/* Subtitle description */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  The 8086 stack is a LIFO (Last-In, First-Out) memory structure inside the Stack Segment (<code className="font-mono font-bold text-slate-800">SS</code>). The Stack Pointer (<code className="font-mono font-bold text-indigo-700">SP</code>) tracks the Top of Stack offset. <strong>Important:</strong> The 8086 stack grows <em>downward</em> from higher memory addresses to lower addresses!
                </p>

                {/* 2-Column Laboratory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Column: Stack Controls & Micro-step Rules (7 cols) */}
                  <div className="md:col-span-7 space-y-4 bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold font-mono text-indigo-950 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-indigo-600" />
                        8086 Stack Micro-Execution Rules:
                      </span>

                      <div className="space-y-2 text-xs font-mono">
                        {/* PUSH Card */}
                        <div className="p-3 bg-white border border-indigo-100 rounded-lg shadow-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-indigo-700 text-xs">PUSH Operand (e.g. PUSH AX)</span>
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">Decrements SP by 2</span>
                          </div>
                          <ol className="text-[11px] text-slate-600 space-y-0.5 list-decimal pl-4 pt-1 font-sans">
                            <li><strong className="font-mono text-indigo-900">SP ← SP - 2</strong> (Allocates 2 bytes downward in SS)</li>
                            <li><strong className="font-mono text-indigo-900">SS:[SP] ← 16-bit Word</strong> (Writes Low Byte to SS:[SP], High Byte to SS:[SP+1])</li>
                          </ol>
                        </div>

                        {/* POP Card */}
                        <div className="p-3 bg-white border border-emerald-100 rounded-lg shadow-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-emerald-800 text-xs">POP Operand (e.g. POP DX)</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Increments SP by 2</span>
                          </div>
                          <ol className="text-[11px] text-slate-600 space-y-0.5 list-decimal pl-4 pt-1 font-sans">
                            <li><strong className="font-mono text-emerald-950">Dest ← SS:[SP]</strong> (Reads 16-bit word from current Top of Stack)</li>
                            <li><strong className="font-mono text-emerald-950">SP ← SP + 2</strong> (Frees 2 bytes, moving SP upward)</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Push/Pop Buttons */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                        Interactive Stack Control Operations:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => handlePushReg('AX', regs.AX)}
                          className="px-2.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                          PUSH AX ({hexFormat(regs.AX)})
                        </button>
                        <button
                          onClick={() => handlePushReg('BX', regs.BX)}
                          className="px-2.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                          PUSH BX ({hexFormat(regs.BX)})
                        </button>
                        <button
                          onClick={() => handlePopReg('DX')}
                          className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold font-mono transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                          POP DX
                        </button>
                        <button
                          onClick={handleResetStack}
                          className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                          Reset SP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Physical Stack Memory Diagram (5 cols) */}
                  <div className="md:col-span-5 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-inner relative overflow-hidden">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                      <span className="text-[10px] font-bold font-mono uppercase text-indigo-400 tracking-wider">
                        Stack Segment Memory (SS:{hexFormat(regs.SS)})
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                        LIFO Stack
                      </span>
                    </div>

                    {/* Stack Memory Cells (High Address FFFE to Low Address FFF4) */}
                    <div className="space-y-1.5 font-mono text-xs my-2">
                      {[0xFFFE, 0xFFFC, 0xFFFA, 0xFFF8, 0xFFF6].map((addr) => {
                        const isTop = regs.SP === addr;
                        const frame = stackFrames.find(f => f.addr === addr);
                        const isBelowSp = addr < regs.SP;
                        const isBOS = addr === 0xFFFE;

                        return (
                          <div 
                            key={addr}
                            className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                              isTop 
                                ? 'bg-indigo-900/90 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)] scale-[1.02]' 
                                : frame 
                                ? 'bg-slate-800/90 border-slate-700 text-slate-200' 
                                : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-indigo-300">
                                {hexFormat(addr)}H:
                              </span>
                              {frame ? (
                                <span className="font-extrabold text-emerald-400">
                                  {hexFormat(frame.value)}
                                </span>
                              ) : isBOS ? (
                                <span className="text-[10px] italic text-slate-400">
                                  [Base of Stack]
                                </span>
                              ) : (
                                <span className="text-[10px] italic text-slate-600">
                                  {isBelowSp ? '[ Unallocated ]' : '[ Free Memory ]'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {frame && (
                                <span className="text-[9px] bg-slate-700 text-indigo-200 px-1.5 py-0.5 rounded font-bold">
                                  {frame.label}
                                </span>
                              )}
                              {isTop && (
                                <span className="text-[9px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                                  👈 TOS (SP)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[9.5px] font-mono text-slate-400 flex justify-between items-center">
                      <span>↓ Growth: High → Low Addr</span>
                      <span className="text-indigo-400 font-bold">SS:[SP] = Top Of Stack</span>
                    </div>

                  </div>

                </div>

                {/* Code Example */}
                <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 text-slate-100 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      8086 Assembly Stack Sequence Example
                    </span>
                    <button
                      onClick={() => handleExecute()}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Run {activeInstruction.opcode}
                    </button>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-emerald-300 bg-slate-950/80 p-2.5 rounded-lg overflow-x-auto border border-slate-800 font-mono">
{`; --- 8086 Stack Memory PUSH & POP Sequence ---
MOV AX, 1234H  ; Initialize AX with 1234H
PUSH AX        ; SP ← SP - 2 (FFFC), writes 1234H to SS:FFFCH
POP DX         ; Reads 1234H into DX, SP ← SP + 2 (FFFE)`}
                  </pre>
                </div>

              </div>
            )}

            {/* Interactive XLAT Conversion Laboratory - Renders when XLAT is selected */}
            {activeInstruction.opcode === 'XLAT' && (
              <div className="bg-white border-2 border-indigo-200/80 rounded-2xl p-5 space-y-5 shadow-lg relative overflow-hidden">
                {/* Background circuit board glow */}
                <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <span className="text-sm font-extrabold uppercase text-slate-800 tracking-wider font-mono">
                      XLAT Translate & Conversion Laboratory
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                    DS:[BX + AL] Translation Engine
                  </span>
                </div>

                {/* Subtitle description */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  The <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[11px] rounded-md font-bold">XLAT</code> instruction uses the contents of the <code className="font-mono font-bold text-slate-700">BX</code> register as the start address of a lookup table in memory, and <code className="font-mono font-bold text-slate-700">AL</code> as the unsigned offset index into this table. It retrieves the table's entry and overwrites <code className="font-mono font-bold text-slate-700">AL</code> with it.
                </p>

                {/* Conversion Mode Selection Tabs */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                    Choose Conversion Table (Simulation Scenario):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'ascii_num', label: 'Decimal to ASCII', desc: '0-15 → ASCII Character' },
                      { id: 'sevensegment', label: 'Hex to 7-Segment', desc: '0-F → LED Display Byte' },
                      { id: 'gray', label: 'Binary to Gray Code', desc: 'Binary → Gray Code Pattern' },
                      { id: 'ascii_case', label: 'Lowercase Mapping', desc: '0-15 → lowercase ascii' }
                    ].map(sc => {
                      const isSel = xlatScenario === sc.id;
                      return (
                        <button
                          key={sc.id}
                          onClick={() => handleXlatScenarioChange(sc.id as any)}
                          className={`px-3 py-2 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSel
                              ? 'bg-indigo-50 border-indigo-300 shadow-xs'
                              : 'bg-slate-50/50 border-slate-150 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className={`text-[11px] font-bold ${isSel ? 'text-indigo-800' : 'text-slate-700'}`}>{sc.label}</span>
                          <span className="text-[8.5px] text-slate-400 font-mono mt-0.5">{sc.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Visual Workspace: Table + Interactive Hardware Element */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left: Memory Table Visualizer (8 Cols) */}
                  <div className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold font-mono text-indigo-950 uppercase tracking-wider">
                        Memory Lookup Table (DS:BX = {hexFormat(regs.BX)})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Total Size: 16 Bytes (00H - 0FH)
                      </span>
                    </div>

                    {/* Table Matrix (16 Cells) */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {Array.from({ length: 16 }).map((_, i) => {
                        const cellVal = xlatTable[i] ?? 0;
                        const isActive = (regs.AX & 0xFF) === i;

                        // Display visualizer based on scenario
                        let displayChar = '';
                        if (xlatScenario === 'ascii_num') {
                          displayChar = String.fromCharCode(cellVal);
                        } else if (xlatScenario === 'ascii_case') {
                          displayChar = String.fromCharCode(cellVal);
                        }

                        return (
                          <div
                            key={i}
                            onClick={() => updateXlatAlVal(i)}
                            className={`p-2 rounded-lg border text-center font-mono cursor-pointer transition-all flex flex-col justify-between select-none relative ${
                              isActive
                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-md scale-105 z-10 font-bold'
                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10 text-slate-800'
                            }`}
                            title={`Click to set AL to index ${byteHexFormat(i)}`}
                          >
                            <span className={`text-[8px] font-extrabold ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                              +{byteHexFormat(i)}
                            </span>
                            <span className="text-xs font-bold block my-1">
                              {byteHexFormat(cellVal)}
                            </span>
                            <span className={`text-[8.5px] truncate font-bold leading-none ${isActive ? 'text-emerald-300' : 'text-indigo-600'}`}>
                              {xlatScenario === 'sevensegment' ? (
                                `led`
                              ) : displayChar ? (
                                `'${displayChar}'`
                              ) : (
                                `val`
                              )}
                            </span>
                            {isActive && (
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-white" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Address calculation helper */}
                    <div className="mt-4 p-2.5 bg-white border border-slate-150 rounded-lg flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-slate-600 gap-2">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-400">Memory Cell: </span>
                        <span className="text-slate-800 font-extrabold bg-slate-100 px-1.5 py-0.5 rounded">
                          DS:[{hexFormat(regs.BX)} + {byteHexFormat(regs.AX & 0xFF)}] = DS:[{hexFormat(regs.BX + (regs.AX & 0xFF))}]
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-700 font-bold">
                        <span>Stored Content: </span>
                        <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-extrabold">
                          {byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Tactile Physical Simulator Outlet (4 Cols) */}
                  <div className="md:col-span-4 bg-slate-900 text-indigo-50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center shadow-inner relative overflow-hidden">
                    {/* Retro Grid background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:10px_10px] opacity-10" />
                    
                    <div className="w-full text-center relative z-10 shrink-0 mb-2">
                      <span className="text-[9px] font-bold font-mono uppercase text-indigo-400 tracking-widest block">
                        Hardware Display Unit
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium font-sans">
                        Real-time Output
                      </span>
                    </div>

                    {/* Dynamic Graphic Board depending on scenario */}
                    <div className="w-full flex-grow flex items-center justify-center py-2 relative z-10 min-h-[110px]">
                      {xlatScenario === 'sevensegment' ? (
                        /* Beautiful Seven-Segment LED Graphic */
                        <SevenSegmentDisplay hexValue={xlatTable[regs.AX & 0xFF] ?? 0} />
                      ) : xlatScenario === 'ascii_num' || xlatScenario === 'ascii_case' ? (
                        /* Glowing CRT ASCII Character Box */
                        <div className="flex flex-col items-center justify-center bg-slate-950 border border-emerald-500/30 w-24 h-24 rounded-xl shadow-inner shadow-emerald-900/40">
                          <span className="text-[9px] font-mono font-bold text-emerald-500/60 uppercase tracking-widest leading-none mb-2">
                            CRT TERM
                          </span>
                          <span className="text-3xl font-mono font-extrabold text-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                            {String.fromCharCode(xlatTable[regs.AX & 0xFF] ?? 32)}
                          </span>
                          <span className="text-[9px] font-mono text-emerald-500/60 mt-2">
                            ASCII: {byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)}
                          </span>
                        </div>
                      ) : (
                        /* Binary pattern visualizer for Gray Code */
                        <div className="flex flex-col items-center gap-1 w-full px-2">
                          <div className="text-center">
                            <p className="text-[9px] text-slate-400 font-mono">Index AL Binary:</p>
                            <div className="flex gap-0.5 justify-center mt-1">
                              {(regs.AX & 0xFF).toString(2).padStart(4, '0').split('').map((bit, idx) => (
                                <span key={idx} className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] font-bold text-indigo-300">
                                  {bit}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="my-1.5 text-indigo-500 text-xs font-bold">▼ XLAT ▼</div>

                          <div className="text-center">
                            <p className="text-[9px] text-emerald-400 font-mono font-bold">Gray Code Output Binary:</p>
                            <div className="flex gap-0.5 justify-center mt-1">
                              {(xlatTable[regs.AX & 0xFF] ?? 0).toString(2).padStart(4, '0').split('').map((bit, idx) => (
                                <span key={idx} className="w-5 h-5 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-mono text-[10px] font-bold text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.3)] animate-pulse">
                                  {bit}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Index adjustment helper */}
                    <div className="w-full relative z-10 mt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-indigo-300 mb-1">
                        <span>Select Input Index (AL):</span>
                        <span className="font-bold text-white bg-indigo-800/80 px-1.5 py-0.5 rounded">
                          {regs.AX & 0xFF} ({byteHexFormat(regs.AX & 0xFF)})
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={regs.AX & 0xFF}
                        onChange={(e) => updateXlatAlVal(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[8px] font-mono text-indigo-400 mt-1">
                        <span>Min (00H)</span>
                        <span>Max (0FH)</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Assembly Code How-It-Is-Used Demonstration Box */}
                <div className="mt-4 bg-slate-900 rounded-xl p-4 border border-slate-800 text-slate-100 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      8086 Assembly Program Code ({xlatScenario === 'ascii_num' ? 'Decimal to ASCII Conversion' : xlatScenario === 'sevensegment' ? 'Hex to 7-Segment LED Conversion' : xlatScenario === 'gray' ? 'Binary to Gray Code Conversion' : 'Lowercase ASCII Mapping'})
                    </span>
                    <button
                      onClick={() => handleExecute()}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Execute XLAT Step
                    </button>
                  </div>

                  <pre className="text-[11px] leading-relaxed text-emerald-300 bg-slate-950/80 p-3 rounded-lg overflow-x-auto border border-slate-800 font-mono">
{xlatScenario === 'ascii_num' ? `; --- Decimal to ASCII Conversion using XLAT ---
.DATA
  LOOKUP_TBL DB 30H, 31H, 32H, 33H, 34H, 35H, 36H, 37H, 38H, 39H ; ASCII '0'..'9'
  INPUT_DEC  DB ${byteHexFormat(regs.AX & 0xFF)}                       ; Raw decimal digit (${regs.AX & 0xFF})

.CODE
  MOV AX, @DATA
  MOV DS, AX
  LEA BX, LOOKUP_TBL ; Load base address offset into BX (${hexFormat(regs.BX)})
  MOV AL, INPUT_DEC  ; Load unsigned lookup index into AL (${byteHexFormat(regs.AX & 0xFF)})
  XLAT               ; Executed: AL = DS:[BX + AL] -> AL becomes ${byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)} ('${String.fromCharCode(xlatTable[regs.AX & 0xFF] ?? 32)}')`
: xlatScenario === 'sevensegment' ? `; --- Hex to 7-Segment LED Display Conversion using XLAT ---
.DATA
  LED_TABLE  DB 3FH, 06H, 5BH, 4FH, 66H, 6DH, 7DH, 07H, 7FH, 6FH ; LED Control Bytes
  INPUT_HEX  DB ${byteHexFormat(regs.AX & 0xFF)}                       ; Hex Digit (${regs.AX & 0xFF})

.CODE
  MOV AX, @DATA
  MOV DS, AX
  LEA BX, LED_TABLE  ; Load base address offset into BX (${hexFormat(regs.BX)})
  MOV AL, INPUT_HEX  ; Load unsigned lookup index into AL (${byteHexFormat(regs.AX & 0xFF)})
  XLAT               ; Executed: AL = DS:[BX + AL] -> AL becomes ${byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)} (Display Code)`
: xlatScenario === 'gray' ? `; --- Binary to Gray Code Conversion using XLAT ---
.DATA
  GRAY_TABLE DB 00H, 01H, 03H, 02H, 06H, 07H, 05H, 04H ; Gray Code Lookup
  INPUT_BIN  DB ${byteHexFormat(regs.AX & 0xFF)}                       ; Binary index (${regs.AX & 0xFF})

.CODE
  MOV AX, @DATA
  MOV DS, AX
  LEA BX, GRAY_TABLE ; Load base address offset into BX (${hexFormat(regs.BX)})
  MOV AL, INPUT_BIN  ; Load index into AL (${byteHexFormat(regs.AX & 0xFF)})
  XLAT               ; Executed: AL = DS:[BX + AL] -> AL becomes ${byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)}`
: `; --- Lowercase ASCII Mapping using XLAT ---
.DATA
  CHAR_TABLE DB 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'
  INPUT_IDX  DB ${byteHexFormat(regs.AX & 0xFF)}                       ; Index (${regs.AX & 0xFF})

.CODE
  MOV AX, @DATA
  MOV DS, AX
  LEA BX, CHAR_TABLE ; Load base offset into BX (${hexFormat(regs.BX)})
  MOV AL, INPUT_IDX  ; Load index into AL (${byteHexFormat(regs.AX & 0xFF)})
  XLAT               ; Executed: AL = DS:[BX + AL] -> AL becomes ${byteHexFormat(xlatTable[regs.AX & 0xFF] ?? 0)} ('${String.fromCharCode(xlatTable[regs.AX & 0xFF] ?? 32)}')`}
                  </pre>
                  <p className="text-[10px] text-slate-400 mt-2 italic font-sans">
                    💡 Tip: Try changing the index slider above or clicking any cell in the lookup table to update the assembly code parameters in real time!
                  </p>
                </div>

              </div>
            )}



            {/* Dynamic Educational Help Tabs Panel */}
            <div className="bg-white border border-sky-150 rounded-2xl overflow-hidden flex flex-col shadow-sm">
              
              {/* Direct Header */}
              <div className="flex bg-slate-50 border-b border-slate-200/80 px-4 py-3 justify-between items-center">
                <span className="text-xs font-bold font-mono text-indigo-950 uppercase tracking-widest flex items-center gap-2">
                  <Binary className="w-4 h-4 text-indigo-600" />
                  Machine Code & Instruction Analyzer
                </span>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200">
                  {formatInfo.machineCode}
                </span>
              </div>

              {/* Display Area */}
              <div className="p-5 bg-slate-50/20 text-xs leading-relaxed space-y-4">
                <div>
                  <h4 className="text-xs font-bold font-mono text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
                    <Binary className="w-4 h-4 text-indigo-600" />
                    Instruction Byte Stream Parser ({activeInstruction.opcode})
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {activeInstruction.desc}
                  </p>
                </div>

                {/* Visual Binary Breakdowns */}
                <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-inner">
                  {formatInfo.bytesBreakdown.map((b, bi) => (
                    <div key={bi} className="flex items-center gap-3">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs text-center">
                        <span className="text-[9px] font-mono text-indigo-700 uppercase font-extrabold block mb-1">{b.label}</span>
                        <div>
                          {renderSegmentedBits(b.label, b.bits)}
                        </div>
                        <span className="text-xs font-mono text-emerald-700 font-extrabold block mt-1.5">{b.hex}</span>
                      </div>
                      {bi < formatInfo.bytesBreakdown.length - 1 && (
                        <span className="text-slate-400 font-bold text-sm">+</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Hex Details Table */}
                <div className="space-y-1.5 font-mono text-xs pt-1">
                  <div className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-150 pb-1 flex justify-between">
                    <span>Field / Hex Byte</span>
                    <span>Machine Meaning</span>
                  </div>
                  {formatInfo.bytesBreakdown.map((b, bi) => (
                    <div key={bi} className="flex justify-between border-b border-slate-100 pb-1 text-slate-700 text-[11px]">
                      <span className="font-bold text-indigo-700">{b.label} ({b.hex}):</span>
                      <span className="text-slate-500 text-right">{b.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Logs Terminal & Math Explanation Section */}
            <div className="bg-white border border-sky-150 rounded-2xl p-5 space-y-4 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-700 block uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600 animate-pulse" />
                Silicon execution analyzer logs:
              </span>
              <div className="min-h-[80px] bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 font-mono text-xs leading-relaxed relative shadow-inner">
                <AnimatePresence mode="wait">
                  {executionState === 'done' ? (
                    <motion.div
                      key="explain-done"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-emerald-700 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        [CPU CORE]: Instruction retirement successful
                      </p>
                      <p className="text-slate-600 pl-4 leading-relaxed text-justify">{lastExplanation}</p>
                    </motion.div>
                  ) : executionState !== 'idle' ? (
                    <motion.div 
                      key="explain-executing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1.5"
                    >
                      <p className="text-indigo-700 animate-pulse uppercase tracking-wider text-[10px] font-bold">[CPU CORE]: Executing instruction...</p>
                      <p className="text-slate-500 pl-4">Updating register files and processor flags state</p>
                    </motion.div>
                  ) : (
                    <div className="text-slate-400 italic text-center py-2.5 flex flex-col items-center justify-center gap-1.5">
                      <Info className="w-5 h-5 text-indigo-600/50" />
                      <span className="text-xs text-slate-500">Select an instruction, adjust registers if needed, then click "Run Instruction" to execute.</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Footer System Details */}
      <div className="text-[10px] text-slate-400 font-mono text-right pt-4 border-t border-sky-150 shrink-0 mt-6 flex justify-between items-center">
        <span>* Emulated instructions strictly match standard Intel 8086 physical states.</span>
        <span>Interactive Instruction Laboratory v2.5 (ECE Micro)</span>
      </div>
    </div>
  );
}

// Helper component for active-high seven segment LED display
function SevenSegmentDisplay({ hexValue }: { hexValue: number }) {
  const isLit = (mask: number) => (hexValue & mask) !== 0;

  // Real LED red glow vs dark dim red
  const activeColor = "fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.95)]";
  const inactiveColor = "fill-rose-950/15";

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-neutral-950 border-2 border-neutral-800 rounded-xl shadow-inner w-28 h-36">
      <svg
        viewBox="0 0 100 130"
        className="w-16 h-24 select-none"
        style={{ transform: "skewX(-6deg)" }}
      >
        {/* Segment a */}
        <polygon
          points="20,10 70,10 65,18 25,18"
          className={`transition-all duration-250 ${isLit(0x01) ? activeColor : inactiveColor}`}
        />
        {/* Segment f */}
        <polygon
          points="13,14 21,21 21,57 13,63"
          className={`transition-all duration-250 ${isLit(0x20) ? activeColor : inactiveColor}`}
        />
        {/* Segment b */}
        <polygon
          points="79,14 79,63 71,57 71,21"
          className={`transition-all duration-250 ${isLit(0x02) ? activeColor : inactiveColor}`}
        />
        {/* Segment g */}
        <polygon
          points="20,60 70,60 75,65 70,70 20,70 15,65"
          className={`transition-all duration-250 ${isLit(0x40) ? activeColor : inactiveColor}`}
        />
        {/* Segment e */}
        <polygon
          points="13,67 21,73 21,109 13,116"
          className={`transition-all duration-250 ${isLit(0x10) ? activeColor : inactiveColor}`}
        />
        {/* Segment c */}
        <polygon
          points="79,67 79,116 71,109 71,73"
          className={`transition-all duration-250 ${isLit(0x04) ? activeColor : inactiveColor}`}
        />
        {/* Segment d */}
        <polygon
          points="25,112 65,112 70,120 20,120"
          className={`transition-all duration-250 ${isLit(0x08) ? activeColor : inactiveColor}`}
        />
        {/* DP (Decimal point) */}
        <circle
          cx="87"
          cy="116"
          r="4.5"
          className={`transition-all duration-250 ${isLit(0x80) ? activeColor : inactiveColor}`}
        />
      </svg>
    </div>
  );
}
