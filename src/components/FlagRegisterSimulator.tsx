import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

interface Flag {
  bit: number;
  abbr: string;
  fullName: string;
  type: 'status' | 'control' | 'unused';
  desc: string;
  setDesc: string;
  clearDesc: string;
}

const flagsData: Flag[] = [
  { bit: 15, abbr: '-', fullName: 'Unused Bit 15', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 14, abbr: '-', fullName: 'Unused Bit 14', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 13, abbr: '-', fullName: 'Unused Bit 13', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 12, abbr: '-', fullName: 'Unused Bit 12', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 11, abbr: 'OF', fullName: 'Overflow Flag', type: 'status', desc: 'Indicates signed arithmetic overflow.', setDesc: 'Set (1) if signed result exceeds the capacity of destination register (positive overflow or negative overflow).', clearDesc: 'Cleared (0) if signed result is within valid boundaries.' },
  { bit: 10, abbr: 'DF', fullName: 'Direction Flag', type: 'control', desc: 'Controls string instructions increment/decrement direction.', setDesc: 'Set (1) makes string operations process from right-to-left (auto-decrements SI/DI).', clearDesc: 'Cleared (0) makes string operations process from left-to-right (auto-increments SI/DI).' },
  { bit: 9, abbr: 'IF', fullName: 'Interrupt Enable Flag', type: 'control', desc: 'Enables or disables maskable hardware interrupts (INTR pin).', setDesc: 'Set (1) enables interrupts (STI instruction).', clearDesc: 'Cleared (0) disables maskable interrupts (CLI instruction).' },
  { bit: 8, abbr: 'TF', fullName: 'Trap Flag', type: 'control', desc: 'Enables single-step debugging mode.', setDesc: 'Set (1) puts CPU into single-step mode. Generates Interrupt Type 1 after each instruction execution.', clearDesc: 'Cleared (0) disables single-step mode.' },
  { bit: 7, abbr: 'SF', fullName: 'Sign Flag', type: 'status', desc: 'Indicates the mathematical sign of the result.', setDesc: 'Set (1) if MSB (Most Significant Bit) of result is 1, indicating a negative number.', clearDesc: 'Cleared (0) if MSB is 0, indicating a positive number or zero.' },
  { bit: 6, abbr: 'ZF', fullName: 'Zero Flag', type: 'status', desc: 'Indicates whether the mathematical result is zero.', setDesc: 'Set (1) if the ALU result of the operation is exactly zero.', clearDesc: 'Cleared (0) if the result is non-zero.' },
  { bit: 5, abbr: '-', fullName: 'Unused Bit 5', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 4, abbr: 'AF', fullName: 'Auxiliary Carry Flag', type: 'status', desc: 'Indicates half-carry from bit 3 to bit 4. Used for BCD arithmetic.', setDesc: 'Set (1) if there is a carry out from lower nibble (bit 3) or borrow in subtraction.', clearDesc: 'Cleared (0) if no carry/borrow from bit 3.' },
  { bit: 3, abbr: '-', fullName: 'Unused Bit 3', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 2, abbr: 'PF', fullName: 'Parity Flag', type: 'status', desc: 'Indicates parity of the lowest 8 bits of the result.', setDesc: 'Set (1) if the lower 8 bits of the result contain an EVEN number of 1s.', clearDesc: 'Cleared (0) if the lower 8 bits contain an ODD number of 1s.' },
  { bit: 1, abbr: '-', fullName: 'Unused Bit 1', type: 'unused', desc: 'Reserved bit, always undefined.', setDesc: '', clearDesc: '' },
  { bit: 0, abbr: 'CF', fullName: 'Carry Flag', type: 'status', desc: 'Indicates carry out of the MSB in unsigned arithmetic.', setDesc: 'Set (1) if an addition results in a carry, or a subtraction results in a borrow from MSB.', clearDesc: 'Cleared (0) if no carry or borrow occurred.' }
];

export default function FlagRegisterSimulator() {
  const [selectedBit, setSelectedBit] = useState<number>(0);
  const [flagsState, setFlagsState] = useState<Record<string, number>>({
    CF: 0, PF: 0, AF: 0, ZF: 0, SF: 0, TF: 0, IF: 1, DF: 0, OF: 0
  });
  const [testScenario, setTestScenario] = useState<string>('custom');

  const selectedFlag = flagsData.find(f => f.bit === selectedBit);

  const toggleFlag = (abbr: string) => {
    if (abbr === '-') return;
    setFlagsState(prev => ({
      ...prev,
      [abbr]: prev[abbr] === 1 ? 0 : 1
    }));
    setTestScenario('custom');
  };

  const applyScenario = (scenario: string) => {
    setTestScenario(scenario);
    switch (scenario) {
      case 'zero-result':
        // 5 - 5 = 0. ZF=1, PF=1 (even 1s in 00000000), CF=0, SF=0, OF=0, AF=0
        setFlagsState({
          CF: 0, PF: 1, AF: 0, ZF: 1, SF: 0, TF: 0, IF: 1, DF: 0, OF: 0
        });
        break;
      case 'unsigned-carry':
        // 255 + 1 = 256 (carry occurred). CF=1, ZF=1, PF=1, SF=0, OF=0, AF=1
        setFlagsState({
          CF: 1, PF: 1, AF: 1, ZF: 1, SF: 0, TF: 0, IF: 1, DF: 0, OF: 0
        });
        break;
      case 'signed-overflow':
        // 127 + 1 = 128 (positive + positive = negative). OF=1, SF=1 (since MSB is 1), CF=0, ZF=0, PF=1, AF=1
        setFlagsState({
          CF: 0, PF: 1, AF: 1, ZF: 0, SF: 1, TF: 0, IF: 1, DF: 0, OF: 1
        });
        break;
      case 'negative-result':
        // 2 - 5 = -3. SF=1, CF=1 (borrow), ZF=0, PF=0, OF=0, AF=1
        setFlagsState({
          CF: 1, PF: 0, AF: 1, ZF: 0, SF: 1, TF: 0, IF: 1, DF: 0, OF: 0
        });
        break;
      case 'clear-all':
        setFlagsState({
          CF: 0, PF: 0, AF: 0, ZF: 0, SF: 0, TF: 0, IF: 0, DF: 0, OF: 0
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-700 font-display">8086 Flag Register Visualizer (16-Bit)</span>
        </div>
        <button
          onClick={() => applyScenario('clear-all')}
          className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-all font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Register
        </button>
      </div>

      <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        {/* 16-Bit Register Block visual */}
        <div className="bg-slate-50 text-slate-800 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500">16-Bit Flag Register Layout</span>
            <span className="text-xs font-mono text-indigo-600">Click active flags to toggle their bits</span>
          </div>

          <div className="grid gap-1 md:gap-1.5 text-center" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
            {flagsData.map(f => {
              const isActive = f.abbr !== '-';
              const value = isActive ? flagsState[f.abbr] : 0;
              const isSelected = f.bit === selectedBit;

              return (
                <div key={f.bit} className="flex flex-col items-center">
                  {/* Bit index */}
                  <span className="text-xs font-mono text-slate-400 block mb-1">{f.bit}</span>
                  {/* Bit box button */}
                  <button
                    onClick={() => {
                      setSelectedBit(f.bit);
                      if (isActive) toggleFlag(f.abbr);
                    }}
                    className={`w-full aspect-square flex items-center justify-center font-mono rounded-md border text-sm font-bold transition-all ${
                      isActive
                        ? value === 1
                          ? isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs scale-105'
                            : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-500 shadow-2xs'
                          : isSelected
                            ? 'bg-white text-slate-800 border-indigo-600 scale-105 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800 shadow-2xs'
                        : 'bg-slate-100 text-slate-300 border-slate-200/50 cursor-not-allowed opacity-40'
                    }`}
                  >
                    {isActive ? value : 'U'}
                  </button>
                  {/* Flag identifier */}
                  <span className={`text-xs font-mono mt-1 font-semibold ${
                    isActive
                      ? value === 1 ? 'text-indigo-600' : 'text-slate-400'
                      : 'text-slate-300'
                  }`}>
                    {f.abbr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content & Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Flag Detail Card */}
          <div className="lg:col-span-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            {selectedFlag ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-lg text-slate-800">
                      {selectedFlag.fullName}
                    </h4>
                    <span className={`text-xs uppercase font-mono px-2 py-0.5 rounded-full font-bold inline-block ${
                      selectedFlag.type === 'status' ? 'bg-blue-100 text-blue-800' :
                      selectedFlag.type === 'control' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {selectedFlag.type} flag
                    </span>
                  </div>
                  <span className="font-mono text-2xl font-bold text-slate-300">
                    Bit {selectedFlag.bit}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-slate-600 text-xs">
                    {selectedFlag.desc}
                  </p>

                  {selectedFlag.type !== 'unused' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="font-mono font-bold text-indigo-600 block mb-0.5">Bit = 1</span>
                        <p className="text-slate-500 text-xs leading-relaxed">{selectedFlag.setDesc}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="font-mono font-bold text-slate-400 block mb-0.5">Bit = 0</span>
                        <p className="text-slate-500 text-xs leading-relaxed">{selectedFlag.clearDesc}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <HelpCircle className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Select any bit in the register above to study its detailed function.</p>
              </div>
            )}
          </div>

          {/* Interactive ALU Scenarios */}
          <div className="lg:col-span-6 bg-white p-4 rounded-xl border border-slate-100 space-y-3">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                ALU Arithmetic Scenario Player
              </h4>
              <p className="text-xs text-slate-500">
                Observe how instructions change conditional status flags.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => applyScenario('zero-result')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex justify-between items-center ${
                  testScenario === 'zero-result'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'hover:bg-slate-50 text-slate-700 border-slate-100'
                }`}
              >
                <div>
                  <strong className="font-mono">SUB AX, AX</strong> (Result is exactly 0)
                  <p className="text-xs text-slate-500 mt-0.5">Sets ZF = 1. PF = 1 since zero has even parity.</p>
                </div>
                <span className="text-xs font-mono bg-white px-1.5 py-0.5 border rounded-sm font-semibold text-emerald-700 shrink-0">Run</span>
              </button>

              <button
                onClick={() => applyScenario('unsigned-carry')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex justify-between items-center ${
                  testScenario === 'unsigned-carry'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'hover:bg-slate-50 text-slate-700 border-slate-100'
                }`}
              >
                <div>
                  <strong className="font-mono">ADD AL, 1</strong> (AL was 255 / FFH)
                  <p className="text-xs text-slate-500 mt-0.5">8-bit unsigned roll-over. Sets Carry Flag CF = 1.</p>
                </div>
                <span className="text-xs font-mono bg-white px-1.5 py-0.5 border rounded-sm font-semibold text-emerald-700 shrink-0">Run</span>
              </button>

              <button
                onClick={() => applyScenario('signed-overflow')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex justify-between items-center ${
                  testScenario === 'signed-overflow'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'hover:bg-slate-50 text-slate-700 border-slate-100'
                }`}
              >
                <div>
                  <strong className="font-mono">ADD AL, 1</strong> (AL was 127 / +7FH)
                  <p className="text-xs text-slate-500 mt-0.5">Signed overflow (+127 + 1 = -128). Sets OF = 1, SF = 1.</p>
                </div>
                <span className="text-xs font-mono bg-white px-1.5 py-0.5 border rounded-sm font-semibold text-emerald-700 shrink-0">Run</span>
              </button>

              <button
                onClick={() => applyScenario('negative-result')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex justify-between items-center ${
                  testScenario === 'negative-result'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'hover:bg-slate-50 text-slate-700 border-slate-100'
                }`}
              >
                <div>
                  <strong className="font-mono">SUB AL, 5</strong> (AL was 2)
                  <p className="text-xs text-slate-500 mt-0.5">Results in -3. Sets Sign Flag SF = 1, and Carry CF = 1 (borrow).</p>
                </div>
                <span className="text-xs font-mono bg-white px-1.5 py-0.5 border rounded-sm font-semibold text-emerald-700 shrink-0">Run</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
