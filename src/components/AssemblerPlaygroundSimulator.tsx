import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Cpu, 
  Settings, 
  RefreshCw, 
  List, 
  Database, 
  CornerDownRight, 
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
  PlayCircle
} from 'lucide-react';

interface CodeLine {
  text: string;
  comment?: string;
  execute: (
    regs: Record<string, number>, 
    flags: Record<string, number>, 
    ram: Record<number, number>
  ) => {
    newRegs: Record<string, number>;
    newFlags: Record<string, number>;
    newRam: Record<number, number>;
    log: string;
    jumpToLabel?: string;
  };
}

interface ProgramTemplate {
  name: string;
  description: string;
  initialRegs: Record<string, number>;
  initialRam: Record<number, number>;
  code: CodeLine[];
}

const programTemplates: ProgramTemplate[] = [
  {
    name: '16-Bit Unsigned Addition',
    description: 'Load two variables into registers, sum them, and store the sum back in physical memory.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SI: 0x0000, DI: 0x0000, IP: 0x0000 },
    initialRam: { 0x1000: 0x1500, 0x1002: 0x2A10, 0x1004: 0x0000 },
    code: [
      {
        text: 'MOV AX, [1000H]',
        comment: 'Load first number (1500H) into register AX',
        execute: (regs, flags, ram) => {
          const val = ram[0x1000] || 0;
          return {
            newRegs: { ...regs, AX: val, IP: regs.IP + 1 },
            newFlags: { ...flags },
            newRam: { ...ram },
            log: `MOV AX, [1000H] -> Loaded 1500H into AX.`
          };
        }
      },
      {
        text: 'MOV BX, [1002H]',
        comment: 'Load second number (2A10H) into register BX',
        execute: (regs, flags, ram) => {
          const val = ram[0x1002] || 0;
          return {
            newRegs: { ...regs, BX: val, IP: regs.IP + 1 },
            newFlags: { ...flags },
            newRam: { ...ram },
            log: `MOV BX, [1002H] -> Loaded 2A10H into BX.`
          };
        }
      },
      {
        text: 'ADD AX, BX',
        comment: 'Perform addition: AX = AX + BX',
        execute: (regs, flags, ram) => {
          const sum = regs.AX + regs.BX;
          const result = sum & 0xFFFF;
          const carry = sum > 0xFFFF ? 1 : 0;
          const zero = result === 0 ? 1 : 0;
          const sign = (result & 0x8000) ? 1 : 0;
          return {
            newRegs: { ...regs, AX: result, IP: regs.IP + 1 },
            newFlags: { ZF: zero, CF: carry, SF: sign },
            newRam: { ...ram },
            log: `ADD AX, BX -> Added AX & BX. AX is now ${result.toString(16).toUpperCase().padStart(4, '0')}H. [ZF:${zero}, CF:${carry}, SF:${sign}]`
          };
        }
      },
      {
        text: 'MOV [1004H], AX',
        comment: 'Save the sum into memory at address 1004H',
        execute: (regs, flags, ram) => {
          const newRam = { ...ram, 0x1004: regs.AX };
          return {
            newRegs: { ...regs, IP: regs.IP + 1 },
            newFlags: { ...flags },
            newRam,
            log: `MOV [1004H], AX -> Saved sum (${regs.AX.toString(16).toUpperCase().padStart(4, '0')}H) to RAM offset 1004H.`
          };
        }
      },
      {
        text: 'HLT',
        comment: 'Halt program execution',
        execute: (regs, flags, ram) => {
          return {
            newRegs: { ...regs, IP: 0xFFFF }, // special code for complete
            newFlags: { ...flags },
            newRam: { ...ram },
            log: 'HLT -> Program execution halted successfully!'
          };
        }
      }
    ]
  },
  {
    name: 'Find Maximum (Branching)',
    description: 'Compare AX and BX registers. Execute conditional JMP to skip instructions and keep the maximum value inside AX.',
    initialRegs: { AX: 0x007F, BX: 0x00A0, CX: 0x0000, DX: 0x0000, SI: 0x0000, DI: 0x0000, IP: 0x0000 },
    initialRam: {},
    code: [
      {
        text: 'CMP AX, BX',
        comment: 'Compare values by performing AX - BX (discards results, sets flags)',
        execute: (regs, flags, ram) => {
          const sub = (regs.AX - regs.BX) & 0xFFFF;
          const zero = sub === 0 ? 1 : 0;
          const carry = regs.AX < regs.BX ? 1 : 0;
          const sign = (sub & 0x8000) ? 1 : 0;
          return {
            newRegs: { ...regs, IP: regs.IP + 1 },
            newFlags: { ZF: zero, CF: carry, SF: sign },
            newRam: { ...ram },
            log: `CMP AX, BX -> AX (007FH) vs BX (00A0H). BX is larger, so CF is set (borrow required). [ZF:${zero}, CF:${carry}, SF:${sign}]`
          };
        }
      },
      {
        text: 'JGE SKIP_UPDATE',
        comment: 'Jump to label if AX >= BX (using flags SF and OF)',
        execute: (regs, flags, ram) => {
          // In our example AX < BX, so no jump should occur
          const jump = flags.SF === 0; // shorthand
          if (jump) {
            return {
              newRegs: { ...regs, IP: regs.IP + 2 }, // jump over MOV
              newFlags: { ...flags },
              newRam: { ...ram },
              log: 'JGE SKIP_UPDATE -> Jump condition MET. Skipping AX update.'
            };
          } else {
            return {
              newRegs: { ...regs, IP: regs.IP + 1 }, // fall through
              newFlags: { ...flags },
              newRam: { ...ram },
              log: 'JGE SKIP_UPDATE -> Jump condition NOT met. Falling through to next instruction.'
            };
          }
        }
      },
      {
        text: 'MOV AX, BX',
        comment: 'Update AX with maximum value (BX)',
        execute: (regs, flags, ram) => {
          return {
            newRegs: { ...regs, AX: regs.BX, IP: regs.IP + 1 },
            newFlags: { ...flags },
            newRam: { ...ram },
            log: 'MOV AX, BX -> AX updated to maximum value (00A0H).'
          };
        }
      },
      {
        text: 'SKIP_UPDATE: NOP',
        comment: 'Label marker (No Operation)',
        execute: (regs, flags, ram) => {
          return {
            newRegs: { ...regs, IP: regs.IP + 1 },
            newFlags: { ...flags },
            newRam: { ...ram },
            log: 'SKIP_UPDATE -> NOP instruction. Continuing.'
          };
        }
      },
      {
        text: 'HLT',
        comment: 'Halt program',
        execute: (regs, flags, ram) => {
          return {
            newRegs: { ...regs, IP: 0xFFFF },
            newFlags: { ...flags },
            newRam: { ...ram },
            log: 'HLT -> Branch execution halted safely!'
          };
        }
      }
    ]
  },
  {
    name: 'Looping Array Summation',
    description: 'Use the count register CX to loop 4 times, indexing through physical memory at 1000H with register SI to aggregate a sum in AX.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0004, DX: 0x0000, SI: 0x1000, DI: 0x0000, IP: 0x0000 },
    initialRam: { 0x1000: 0x0005, 0x1002: 0x0002, 0x1004: 0x0006, 0x1006: 0x0003 },
    code: [
      {
        text: 'ADD AX, [SI]',
        comment: 'Add value in RAM pointed to by register SI to accumulator AX',
        execute: (regs, flags, ram) => {
          const addr = regs.SI;
          const val = ram[addr] || 0;
          const sum = regs.AX + val;
          return {
            newRegs: { ...regs, AX: sum, IP: regs.IP + 1 },
            newFlags: { ...flags, ZF: sum === 0 ? 1 : 0 },
            newRam: { ...ram },
            log: `ADD AX, [SI] -> Read memory at address ${addr.toString(16).toUpperCase()}H (Value: ${val}). Sum is now AX = ${sum.toString(16).toUpperCase()}H.`
          };
        }
      },
      {
        text: 'INC SI',
        comment: 'Point to next byte in memory',
        execute: (regs, flags, ram) => {
          return {
            newRegs: { ...regs, SI: regs.SI + 1, IP: regs.IP + 1 },
            newFlags: { ...flags },
            newRam: { ...ram },
            log: `INC SI -> SI pointer incremented to ${(regs.SI + 1).toString(16).toUpperCase()}H.`
          };
        }
      },
      {
        text: 'INC SI',
        comment: 'Increment SI again to align with 16-bit word boundary (2 bytes)',
        execute: (regs, flags, ram) => {
          return {
            newRegs: { ...regs, SI: regs.SI + 1, IP: regs.IP + 1 },
            newFlags: { ...flags },
            newRam: { ...ram },
            log: `INC SI -> SI pointer incremented to ${(regs.SI + 1).toString(16).toUpperCase()}H (word aligned).`
          };
        }
      },
      {
        text: 'LOOP_SUM: LOOP 0',
        comment: 'Decrement register CX. If CX > 0, jump back to first instruction (Offset 0)',
        execute: (regs, flags, ram) => {
          const nextCX = regs.CX - 1;
          const zero = nextCX === 0 ? 1 : 0;
          if (nextCX > 0) {
            return {
              newRegs: { ...regs, CX: nextCX, IP: 0 }, // jump to 0 (first instruction)
              newFlags: { ...flags, ZF: zero },
              newRam: { ...ram },
              log: `LOOP -> Dec CX to ${nextCX}. CX > 0: looping back to start of block.`
            };
          } else {
            return {
              newRegs: { ...regs, CX: nextCX, IP: regs.IP + 1 }, // fall through
              newFlags: { ...flags, ZF: zero },
              newRam: { ...ram },
              log: 'LOOP -> Dec CX to 0. Loop completed! Falling through to next block.'
            };
          }
        }
      },
      {
        text: 'HLT',
        comment: 'Halt program',
        execute: (regs, flags, ram) => {
          return {
            newRegs: { ...regs, IP: 0xFFFF },
            newFlags: { ...flags },
            newRam: { ...ram },
            log: 'HLT -> Program Loop compilation complete! Sum saved.'
          };
        }
      }
    ]
  }
];

export default function AssemblerPlaygroundSimulator() {
  const [selectedProgIdx, setSelectedProgIdx] = useState<number>(0);
  const [regs, setRegs] = useState<Record<string, number>>({ ...programTemplates[0].initialRegs });
  const [flags, setFlags] = useState<Record<string, number>>({ ZF: 0, CF: 0, SF: 0 });
  const [ram, setRam] = useState<Record<number, number>>({ ...programTemplates[0].initialRam });
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[SYSTEM] Initialized Assembler CPU Sandbox...']);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const activeTemplate = programTemplates[selectedProgIdx];
  const ip = regs.IP;
  const isCompleted = ip === 0xFFFF;

  const handleSelectProgram = (idx: number) => {
    setSelectedProgIdx(idx);
    setRegs({ ...programTemplates[idx].initialRegs });
    setFlags({ ZF: 0, CF: 0, SF: 0 });
    setRam({ ...programTemplates[idx].initialRam });
    setTerminalLogs([`[SYSTEM] Loaded program: ${programTemplates[idx].name}`]);
    setIsRunning(false);
  };

  const handleStep = () => {
    if (isCompleted || ip >= activeTemplate.code.length) {
      setTerminalLogs(prev => [...prev, '[SYSTEM] Program is already complete. Click Reset to re-run.']);
      return;
    }

    const currentLine = activeTemplate.code[ip];
    const outcome = currentLine.execute(regs, flags, ram);
    
    setRegs(outcome.newRegs);
    setFlags(outcome.newFlags);
    setRam(outcome.newRam);
    setTerminalLogs(prev => [...prev, `[IP:${ip.toString().padStart(2, '0')}] ${currentLine.text} -> ${outcome.log}`]);
  };

  const handleReset = () => {
    setRegs({ ...activeTemplate.initialRegs });
    setFlags({ ZF: 0, CF: 0, SF: 0 });
    setRam({ ...activeTemplate.initialRam });
    setTerminalLogs([`[SYSTEM] Reset program state for ${activeTemplate.name}`]);
    setIsRunning(false);
  };

  // Run whole script
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      if (isCompleted || ip >= activeTemplate.code.length) {
        setIsRunning(false);
      } else {
        interval = setInterval(() => {
          handleStep();
        }, 1200);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, regs.IP]);

  const hexFormat = (val: number): string => {
    return val.toString(16).toUpperCase().padStart(4, '0') + 'H';
  };

  return (
    <div id="assembler-playground-simulator" className="bg-white border border-slate-200 rounded-3xl p-6 min-h-[480px] text-slate-800 flex flex-col justify-between shadow-xs">
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-display text-indigo-600 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 animate-pulse text-indigo-600" />
              Live 8086 Assembly Emulator
            </h2>
            <p className="text-slate-550 text-xs">Write, step through, and emulate assembly instructions directly inside the browser</p>
          </div>
          
          <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 max-w-fit flex">
            {programTemplates.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectProgram(idx)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                  selectedProgIdx === idx 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Template {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Column A: Interactive Code Listing */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between max-h-[350px]">
            <div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 mb-2.5 text-[10px] text-slate-400 font-mono">
                <span>Active Assembly Source</span>
                <span>IP: {isCompleted ? 'HALTED' : ip.toString().padStart(4, '0')}</span>
              </div>

              {/* Code display with highlight marker */}
              <div className="space-y-2 overflow-y-auto max-h-[220px] scrollbar-thin pr-1">
                {activeTemplate.code.map((line, idx) => {
                  const isActive = idx === ip && !isCompleted;
                  return (
                    <div 
                      key={idx}
                      className={`flex items-start gap-2.5 p-1.5 rounded-lg border transition-all text-xs font-mono ${
                        isActive 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-950 scale-[1.01] shadow-xs font-extrabold' 
                          : 'bg-transparent border-transparent text-slate-500'
                      }`}
                    >
                      <span className={`w-4 text-right text-[10px] shrink-0 font-bold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {idx.toString().padStart(2, '0')}:
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={isActive ? 'text-indigo-900 font-bold' : 'text-slate-700'}>{line.text}</span>
                        <span className="block text-[9px] text-slate-400 mt-0.5 font-sans leading-normal font-normal">
                          ; {line.comment}
                        </span>
                      </div>
                      {isActive && (
                        <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controller row */}
            <div className="flex gap-2 pt-2 border-t border-slate-200 mt-2">
              <button
                onClick={handleStep}
                disabled={isCompleted || isRunning}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                title="Execute single instruction (F7)"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                Single Step (F7)
              </button>
              
              <button
                onClick={() => setIsRunning(!isRunning)}
                disabled={isCompleted}
                className={`flex-1 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  isRunning 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-30'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                {isRunning ? 'Pause' : 'Run Script'}
              </button>

              <button
                onClick={handleReset}
                className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 rounded-lg transition-colors cursor-pointer"
                title="Reset program registers"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Column B: Register, Flag & Memory Visual panel */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Top GP Register + Flags display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CPU Registers display */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block border-b border-slate-200 pb-0.5">CPU registers:</span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg flex justify-between text-slate-700">
                    <span className="text-indigo-600">AX:</span>
                    <span>{hexFormat(regs.AX)}</span>
                  </div>
                  <div className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg flex justify-between text-slate-700">
                    <span className="text-indigo-600">BX:</span>
                    <span>{hexFormat(regs.BX)}</span>
                  </div>
                  <div className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg flex justify-between text-slate-700">
                    <span className="text-indigo-600">CX:</span>
                    <span>{hexFormat(regs.CX)}</span>
                  </div>
                  <div className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg flex justify-between text-slate-700">
                    <span className="text-indigo-600">SI:</span>
                    <span>{hexFormat(regs.SI)}</span>
                  </div>
                </div>
              </div>

              {/* Status Flags & RAM display */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 font-mono uppercase block border-b border-slate-200 pb-0.5">ALU Status Flags:</span>
                <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
                  <div className={`p-1 rounded-lg border ${flags.ZF === 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    <span>ZF: {flags.ZF}</span>
                  </div>
                  <div className={`p-1 rounded-lg border ${flags.CF === 1 ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    <span>CF: {flags.CF}</span>
                  </div>
                  <div className={`p-1 rounded-lg border ${flags.SF === 1 ? 'bg-sky-50 border-sky-300 text-sky-700 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    <span>SF: {flags.SF}</span>
                  </div>
                </div>

                {/* Micro memory inspector */}
                <div className="pt-2 border-t border-slate-200 font-mono text-[9px] flex flex-col gap-1">
                  <span className="text-slate-500 font-sans font-bold">RAM Memory Blocks:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.keys(activeTemplate.initialRam).length > 0 ? (
                      Object.keys(activeTemplate.initialRam).map((addrStr) => {
                        const addr = parseInt(addrStr, 10);
                        const val = ram[addr] || 0;
                        const originalVal = activeTemplate.initialRam[addr];
                        const isModified = val !== originalVal;
                        return (
                          <div key={addr} className="bg-white border border-slate-200 p-1 rounded flex justify-between text-slate-700">
                            <span className="text-slate-400">{addr.toString(16).toUpperCase()}H:</span>
                            <span className={isModified ? 'text-emerald-600 font-bold' : 'text-slate-600'}>
                              {hexFormat(val)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center text-slate-400 py-1 font-sans italic">No RAM offsets mapped for this logic</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Live log compiler screen */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 font-mono text-[10px] leading-relaxed max-h-[140px] overflow-y-auto flex flex-col justify-between text-slate-700">
              <div>
                <div className="border-b border-slate-200 pb-1.5 mb-2 text-slate-500 text-[9px] uppercase font-bold tracking-widest flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                    Live Debug Trace Logs
                  </span>
                  <Activity className="w-3 h-3 text-indigo-600 animate-pulse" />
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[100px] scrollbar-thin">
                  {terminalLogs.map((log, idx) => (
                    <div 
                      key={idx}
                      className={
                        log.includes('[SYSTEM]') 
                          ? 'text-indigo-600 font-bold' 
                          : log.includes('HLT') 
                          ? 'text-emerald-750 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200' 
                          : 'text-slate-650'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 font-mono text-right pt-4 border-t border-slate-100 shrink-0 mt-4">
        Interactive 8086 Assembly Language Playground Emulator
      </div>
    </div>
  );
}
