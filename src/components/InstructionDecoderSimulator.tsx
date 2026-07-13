import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Cpu, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface SimulatorInstruction {
  opcode: string;
  category: string;
  desc: string;
  setupDesc: string;
  initialRegs: Record<string, number>;
  initialFlags: Record<string, number>;
  execute: (regs: Record<string, number>, flags: Record<string, number>) => {
    newRegs: Record<string, number>;
    newFlags: Record<string, number>;
    mathExplanation: string;
  };
}

const mockInstructions: SimulatorInstruction[] = [
  {
    opcode: 'ADD AL, 01H',
    category: 'Arithmetic',
    desc: 'Adds 1 to the 8-bit register AL.',
    setupDesc: 'Initializes AL = 7FH (+127 signed) to demonstrate a signed arithmetic overflow.',
    initialRegs: { AX: 0x007F, BX: 0x0001, CX: 0x0005, DX: 0x0000 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const result = (al + 1) & 0xFF;
      const newAX = (regs.AX & 0xFF00) | result;
      
      const newRegs = { ...regs, AX: newAX };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: al === 0xFF ? 1 : 0, // Unsigned overflow
        SF: (result & 0x80) ? 1 : 0, // MSB is 1
        OF: al === 0x7F ? 1 : 0 // +127 + 1 = -128 (Signed overflow!)
      };

      return {
        newRegs,
        newFlags,
        mathExplanation: 'AL contained 7FH (01111111B = +127 signed). Adding 01H resulted in 80H (10000000B = -128 signed). Because adding two positive numbers (+127 and +1) produced a negative result (-128), a signed Arithmetic Overflow occurred: OF is set to 1. No unsigned carry was produced out of the 8th bit, so CF remains 0. The Sign Flag (SF) is set to 1 because the MSB of the result is 1.'
      };
    }
  },
  {
    opcode: 'SUB AX, BX',
    category: 'Arithmetic',
    desc: 'Subtracts BX register value from AX, updating AX.',
    setupDesc: 'Initializes AX = 1000H, BX = 0200H.',
    initialRegs: { AX: 0x1000, BX: 0x0200, CX: 0x0005, DX: 0x0000 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0 },
    execute: (regs, flags) => {
      const result = (regs.AX - regs.BX) & 0xFFFF;
      const newRegs = { ...regs, AX: result };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: regs.AX < regs.BX ? 1 : 0, // borrow
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0 // no signed overflow for these numbers
      };

      return {
        newRegs,
        newFlags,
        mathExplanation: `AX contained 1000H, BX contained 0200H. Subtracting: 1000H - 0200H = 0E00H (3584 in decimal). The result is non-zero, so ZF = 0. AX was greater than BX, so no borrow was required, meaning CF = 0. The MSB is 0, so SF = 0. This is a standard unsigned arithmetic cycle.`
      };
    }
  },
  {
    opcode: 'CMP AX, BX',
    category: 'Comparison',
    desc: 'Compares AX and BX by performing AX - BX, but does NOT save the result in AX.',
    setupDesc: 'Initializes AX = 0500H, BX = 0500H.',
    initialRegs: { AX: 0x0500, BX: 0x0500, CX: 0x0005, DX: 0x0000 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0 },
    execute: (regs, flags) => {
      // CMP does not alter register values
      const result = (regs.AX - regs.BX) & 0xFFFF;
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: regs.AX < regs.BX ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0
      };

      return {
        newRegs: { ...regs }, // unchanged registers!
        newFlags,
        mathExplanation: 'The CMP instruction performs a subtraction internally: AX (0500H) - BX (0500H) = 0000H. The subtraction results in exactly zero, which triggers the Zero Flag: ZF is set to 1. No borrow was required (CF = 0) and the sign is positive (SF = 0). Crucially, notice that the AX register value remains completely unmodified at 0500H!'
      };
    }
  },
  {
    opcode: 'XOR AX, AX',
    category: 'Logical',
    desc: 'Performs bitwise XOR of AX with itself. Standard instruction used to clear registers to zero.',
    setupDesc: 'Initializes AX = FFFFH.',
    initialRegs: { AX: 0xFFFF, BX: 0x0020, CX: 0x0005, DX: 0x0000 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0 },
    execute: (regs, flags) => {
      const result = 0; // XOR AX, AX is always 0
      const newRegs = { ...regs, AX: result };
      const newFlags = {
        ZF: 1, // Zero flag set to 1
        CF: 0, // Logic instructions clear CF
        SF: 0, // positive
        OF: 0  // Logic instructions clear OF
      };

      return {
        newRegs,
        newFlags,
        mathExplanation: 'XORing any value with itself results in 0 (e.g. FFFFH XOR FFFFH = 0000H). This clears the AX register. Because the result is zero, the Zero Flag (ZF) is set to 1. Note: All logical instructions (AND, OR, XOR) automatically clear the Carry (CF) and Overflow (OF) flags to 0 by default design on the 8086 MPU.'
      };
    }
  },
  {
    opcode: 'AND AL, 0FH',
    category: 'Logical',
    desc: 'Logical bitwise AND of AL with immediate constant 0FH to isolate the lower nibble.',
    setupDesc: 'Initializes AL = A5H.',
    initialRegs: { AX: 0x00A5, BX: 0x0010, CX: 0x0005, DX: 0x0000 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 1 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const result = al & 0x0F;
      const newAX = (regs.AX & 0xFF00) | result;
      
      const newRegs = { ...regs, AX: newAX };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: 0, // Cleared on logic
        SF: (result & 0x80) ? 1 : 0,
        OF: 0  // Cleared on logic
      };

      return {
        newRegs,
        newFlags,
        mathExplanation: 'AL is ANDed with 0FH: A5H (10100101B) AND 0FH (00001111B) = 05H (00000101B). This masks out (clears) the high nibble (A), keeping only the low nibble (5). The result (05H) is non-zero, so ZF = 0. Logical operations always force CF = 0 and OF = 0.'
      };
    }
  },
  {
    opcode: 'SHL CX, 1',
    category: 'Bit Shift',
    desc: 'Shifts CX register left by 1 bit position. Equivalent to multiplying CX by 2.',
    setupDesc: 'Initializes CX = 4000H.',
    initialRegs: { AX: 0x0012, BX: 0x0010, CX: 0x4000, DX: 0x0000 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0 },
    execute: (regs, flags) => {
      const beforeVal = regs.CX;
      const result = (regs.CX << 1) & 0xFFFF;
      const newRegs = { ...regs, CX: result };
      
      // Carry flag gets the shifted out bit (bit 15)
      const carryOut = (beforeVal & 0x8000) ? 1 : 0;
      // OF set if sign changed during shift
      const beforeSign = (beforeVal & 0x8000) ? 1 : 0;
      const afterSign = (result & 0x8000) ? 1 : 0;

      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: carryOut,
        SF: afterSign,
        OF: beforeSign !== afterSign ? 1 : 0
      };

      return {
        newRegs,
        newFlags,
        mathExplanation: `SHL CX, 1 shifts the bits of CX (4000H = 0100000000000000B) left by one. This shifts the bits to 8000H (1000000000000000B). The value doubled from 16384 to 32768 in decimal. The sign bit (MSB) flipped from 0 to 1, representing a sign change, which triggers the Overflow Flag: OF is set to 1. The bit shifted out of the MSB into carry was 0, so CF = 0.`
      };
    }
  }
];

export default function InstructionDecoderSimulator() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [regs, setRegs] = useState<Record<string, number>>(mockInstructions[0].initialRegs);
  const [flags, setFlags] = useState<Record<string, number>>(mockInstructions[0].initialFlags);
  const [executionState, setExecutionState] = useState<'idle' | 'fetching' | 'decoding' | 'alu' | 'done'>('idle');
  const [lastExplanation, setLastExplanation] = useState<string>('');

  const activeInstruction = mockInstructions[selectedIdx];

  const handleSelectInstruction = (idx: number) => {
    setSelectedIdx(idx);
    setRegs(mockInstructions[idx].initialRegs);
    setFlags(mockInstructions[idx].initialFlags);
    setExecutionState('idle');
    setLastExplanation('');
  };

  const handleExecute = () => {
    setExecutionState('fetching');

    // Pipeline Stage 1: Fetch
    setTimeout(() => {
      setExecutionState('decoding');
    }, 1000);

    // Pipeline Stage 2: Decode
    setTimeout(() => {
      setExecutionState('alu');
    }, 2000);

    // Pipeline Stage 3: ALU & Writeback
    setTimeout(() => {
      const result = activeInstruction.execute(regs, flags);
      setRegs(result.newRegs);
      setFlags(result.newFlags);
      setLastExplanation(result.mathExplanation);
      setExecutionState('done');
    }, 3000);
  };

  const handleReset = () => {
    setRegs(activeInstruction.initialRegs);
    setFlags(activeInstruction.initialFlags);
    setExecutionState('idle');
    setLastExplanation('');
  };

  const hexFormat = (val: number): string => {
    return '0x' + val.toString(16).toUpperCase().padStart(4, '0');
  };

  return (
    <div id="instruction-decoder-simulator" className="bg-white border border-slate-200 rounded-3xl p-6 min-h-[480px] text-slate-800 flex flex-col justify-between shadow-xs">
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold font-display text-indigo-600 flex items-center gap-2">
              <Cpu className="w-5 h-5 animate-pulse" />
              Instruction Execution & ALU Simulator
            </h2>
            <p className="text-slate-500 text-xs">Witness the hardware pipeline and how binary calculations alter CPU status flags</p>
          </div>
          <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-bold">
            Execution Unit (EU)
          </span>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Column A: Instruction selector and run triggers */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-indigo-600 font-mono block">Select Instruction to Test:</span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {mockInstructions.map((inst, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectInstruction(idx)}
                    disabled={executionState !== 'idle' && executionState !== 'done'}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex justify-between items-center ${
                      selectedIdx === idx
                        ? 'bg-indigo-650 border-indigo-500 text-white font-bold scale-[1.02] shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-mono">{inst.opcode}</p>
                      <p className="text-[9px] text-slate-500 font-sans mt-0.5 font-normal">{inst.category}</p>
                    </div>
                    {selectedIdx === idx && (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction Specific Setup Note */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-[10px] space-y-1">
              <p className="text-slate-600 leading-normal">
                <strong className="text-indigo-600">Lesson Setup:</strong> {activeInstruction.setupDesc}
              </p>
            </div>

            {/* Buttons row */}
            <div className="flex gap-2.5">
              <button
                disabled={executionState !== 'idle' && executionState !== 'done'}
                onClick={handleExecute}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                {executionState === 'idle' ? 'Execute' : executionState === 'done' ? 'Re-run' : 'Running...'}
              </button>
              <button
                onClick={handleReset}
                className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-colors cursor-pointer"
                title="Reset registers to initial states"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Column B: Register/Flag Display and Pipeline flow */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
            
            {/* Visual CPU Pipeline Tracker */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
              <div className={`p-1.5 rounded-lg border transition-all ${
                executionState === 'fetching' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold scale-[1.03]' : 'bg-white border-slate-200/60 text-slate-400'
              }`}>
                <span className="block text-[8px] text-slate-500 uppercase">Stage 1</span>
                <span>FETCH (CS:IP)</span>
              </div>
              <div className={`p-1.5 rounded-lg border transition-all ${
                executionState === 'decoding' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold scale-[1.03]' : 'bg-white border-slate-200/60 text-slate-400'
              }`}>
                <span className="block text-[8px] text-slate-500 uppercase">Stage 2</span>
                <span>DECODE</span>
              </div>
              <div className={`p-1.5 rounded-lg border transition-all ${
                executionState === 'alu' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold scale-[1.03]' : 'bg-white border-slate-200/60 text-slate-400'
              }`}>
                <span className="block text-[8px] text-slate-500 uppercase">Stage 3</span>
                <span>ALU CYCLE</span>
              </div>
              <div className={`p-1.5 rounded-lg border transition-all ${
                executionState === 'done' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold scale-[1.03]' : 'bg-white border-slate-200/60 text-slate-400'
              }`}>
                <span className="block text-[8px] text-slate-500 uppercase">Stage 4</span>
                <span>WRITE BACK</span>
              </div>
            </div>

            {/* General Purpose Registers & Status Flags Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Registers */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-100 pb-1">CPU registers:</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white border border-slate-200 p-2 rounded-xl flex justify-between items-center">
                    <span className="text-indigo-600 font-bold">AX:</span>
                    <span className="text-slate-800 font-bold">{hexFormat(regs.AX)}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl flex justify-between items-center">
                    <span className="text-indigo-600 font-bold">BX:</span>
                    <span className="text-slate-800 font-bold">{hexFormat(regs.BX)}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl flex justify-between items-center">
                    <span className="text-indigo-600 font-bold">CX:</span>
                    <span className="text-slate-800 font-bold">{hexFormat(regs.CX)}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl flex justify-between items-center">
                    <span className="text-indigo-600 font-bold">DX:</span>
                    <span className="text-slate-800 font-bold">{hexFormat(regs.DX)}</span>
                  </div>
                </div>
              </div>

              {/* Status flags */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block border-b border-slate-100 pb-1">ALU Status Flags:</span>
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                  {/* ZF */}
                  <div className={`p-2 rounded-xl border transition-colors ${
                    flags.ZF === 1 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <span className="block text-[8px] text-slate-500 font-bold">ZF</span>
                    <span className="text-xs">{flags.ZF}</span>
                  </div>
                  {/* CF */}
                  <div className={`p-2 rounded-xl border transition-colors ${
                    flags.CF === 1 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <span className="block text-[8px] text-slate-500 font-bold">CF</span>
                    <span className="text-xs">{flags.CF}</span>
                  </div>
                  {/* SF */}
                  <div className={`p-2 rounded-xl border transition-colors ${
                    flags.SF === 1 
                      ? 'bg-sky-50 border-sky-300 text-sky-700 font-bold' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <span className="block text-[8px] text-slate-500 font-bold">SF</span>
                    <span className="text-xs">{flags.SF}</span>
                  </div>
                  {/* OF */}
                  <div className={`p-2 rounded-xl border transition-colors ${
                    flags.OF === 1 
                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}>
                    <span className="block text-[8px] text-slate-500 font-bold">OF</span>
                    <span className="text-xs">{flags.OF}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs font-sans min-h-[90px] leading-relaxed">
              <AnimatePresence mode="wait">
                {lastExplanation ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    <span className="text-[10px] font-mono font-bold text-indigo-600 block uppercase">ALU Mathematical Explanation:</span>
                    <p className="text-slate-600 leading-relaxed">{lastExplanation}</p>
                  </motion.div>
                ) : (
                  <div className="text-slate-400 italic text-center py-4 flex flex-col items-center justify-center gap-1.5">
                    <Info className="w-5 h-5 text-slate-300" />
                    <span>Select an instruction and click "Execute" to observe the arithmetic analysis.</span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 font-mono text-right pt-4 border-t border-slate-100 shrink-0 mt-4">
        Interactive 8086 Instruction Decoder Simulator
      </div>
    </div>
  );
}
