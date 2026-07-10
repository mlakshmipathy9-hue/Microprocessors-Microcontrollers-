import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  Shield, 
  Shuffle, 
  Database, 
  Cpu, 
  BookOpen, 
  CheckCircle2 
} from 'lucide-react';

interface Preset {
  label: string;
  segmentReg: string;
  segmentVal: string;
  offsetReg: string;
  offsetVal: string;
  desc: string;
}

const presets: Preset[] = [
  {
    label: 'Instruction Fetch (CS:IP)',
    segmentReg: 'CS',
    segmentVal: '1000',
    offsetReg: 'IP',
    offsetVal: '2000',
    desc: 'The next instruction byte is fetched from memory at CS:IP.'
  },
  {
    label: 'Stack Operation (SS:SP)',
    segmentReg: 'SS',
    segmentVal: '2000',
    offsetReg: 'SP',
    offsetVal: 'FFFE',
    desc: 'Pushing/popping values writes/reads from stack at SS:SP.'
  },
  {
    label: 'Data Read (DS:BX)',
    segmentReg: 'DS',
    segmentVal: '3A50',
    offsetReg: 'BX',
    offsetVal: '0100',
    desc: 'Reading a standard data variable with BX serving as base offset.'
  }
];

interface SegmentInfo {
  id: string;
  name: string;
  register: string;
  defaultOffset: string;
  color: string;
  bgLight: string;
  borderCol: string;
  purpose: string;
  needExplanation: string;
  typicalAddressHex: string;
}

const segmentsData: SegmentInfo[] = [
  {
    id: 'cs',
    name: 'Code Segment (CS)',
    register: 'CS',
    defaultOffset: 'IP (Instruction Pointer)',
    color: 'text-indigo-700 bg-indigo-700',
    bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-950',
    borderCol: 'border-indigo-500',
    purpose: 'Stores the executable instructions (machine code) of the running program. The CPU automatically fetches the next instruction byte from the address CS:IP.',
    needExplanation: 'Isolates program executable code from data modifications to prevent accidental program corruption (security).',
    typicalAddressHex: '1000H'
  },
  {
    id: 'ds',
    name: 'Data Segment (DS)',
    register: 'DS',
    defaultOffset: 'BX, SI, DI, or direct displacement',
    color: 'text-emerald-700 bg-emerald-700',
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    borderCol: 'border-emerald-500',
    purpose: 'Stores global variables, constants, and static data used by the program. Default segment for most data reference instructions.',
    needExplanation: 'Allows the program to access memory variable storage cleanly, separated from instructions and temporary scratchpads.',
    typicalAddressHex: '3000H'
  },
  {
    id: 'ss',
    name: 'Stack Segment (SS)',
    register: 'SS',
    defaultOffset: 'SP (Stack Pointer), BP (Base Pointer)',
    color: 'text-rose-700 bg-rose-700',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-950',
    borderCol: 'border-rose-500',
    purpose: 'Reserved memory area used for temporary storage, local variables, subroutine return addresses (during CALL/RET), and parameter passing.',
    needExplanation: 'Prevents growing dynamic stack data from overwriting program code or static data, avoiding stack overflow disasters.',
    typicalAddressHex: '5000H'
  },
  {
    id: 'es',
    name: 'Extra Segment (ES)',
    register: 'ES',
    defaultOffset: 'DI (Destination Index for String Operations)',
    color: 'text-amber-700 bg-amber-700',
    bgLight: 'bg-amber-50 border-amber-200 text-amber-950',
    borderCol: 'border-amber-500',
    purpose: 'An extra data segment typically used for string destination storage, multi-segment data operations, or sharing data tables.',
    needExplanation: 'Enables high-speed block movement instructions (like MOVSB/MOVSW) to copy data across distant logical areas of memory.',
    typicalAddressHex: '7000H'
  }
];

export default function MemoryCalculationSimulator() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'segmented-structure'>('calculator');
  const [segReg, setSegReg] = useState('CS');
  const [offsetReg, setOffsetReg] = useState('IP');
  const [segValHex, setSegValHex] = useState('1000');
  const [offsetValHex, setOffsetValHex] = useState('2000');
  const [error, setError] = useState<string | null>(null);

  const [physicalAddress, setPhysicalAddress] = useState('12000');
  const [shiftedSeg, setShiftedSeg] = useState('10000');

  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('cs');

  useEffect(() => {
    // Validate hex input
    const hexRegex = /^[0-9A-Fa-f]{1,4}$/;
    if (!hexRegex.test(segValHex)) {
      setError('Segment address must be a valid 1 to 4 digit Hexadecimal number.');
      return;
    }
    if (!hexRegex.test(offsetValHex)) {
      setError('Offset address must be a valid 1 to 4 digit Hexadecimal number.');
      return;
    }
    setError(null);

    // Compute Physical Address
    const segInt = parseInt(segValHex, 16);
    const offsetInt = parseInt(offsetValHex, 16);
    
    const shifted = segInt << 4; // same as segInt * 16
    const physical = shifted + offsetInt;

    setShiftedSeg(shifted.toString(16).toUpperCase());
    setPhysicalAddress(physical.toString(16).toUpperCase().padStart(5, '0'));
  }, [segValHex, offsetValHex]);

  const selectPreset = (p: Preset) => {
    setSegReg(p.segmentReg);
    setOffsetReg(p.offsetReg);
    setSegValHex(p.segmentVal);
    setOffsetValHex(p.offsetVal);
  };

  const getBinaryString = (hex: string, length = 16) => {
    try {
      const parsed = parseInt(hex, 16);
      if (isNaN(parsed)) return '';
      return parsed.toString(2).padStart(length, '0');
    } catch {
      return '';
    }
  };

  const activeSegmentDetails = segmentsData.find(s => s.id === selectedSegmentId) || segmentsData[0];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-slate-900">
      {/* Tab Switcher / Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-700" />
          <span className="text-[15px] font-bold text-slate-800 font-display">
            8086 Memory Segmentation &amp; Calculations
          </span>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex items-center bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'calculator' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Address Calculator
          </button>
          <button
            onClick={() => setActiveTab('segmented-structure')}
            className={`px-3 py-1.5 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'segmented-structure' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            How it works &amp; Why needed
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'calculator' ? (
            <motion.div
              key="calculator-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5"
            >
              {/* Left Inputs Panel */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-display font-bold text-[14px] text-slate-950">1. Enter Hexadecimal Parameters</h4>
                    <p className="text-[13px] text-slate-600">8086 registers are 16-bit. Hex digits are from 0-9 and A-F.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Segment */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-slate-700 block">
                        Segment Register ({segReg})
                      </label>
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 transition-all">
                        <span className="px-2.5 py-1.5 text-[13px] font-mono font-extrabold text-indigo-700 border-r border-slate-300 bg-indigo-50">{segReg}</span>
                        <input
                          type="text"
                          maxLength={4}
                          value={segValHex}
                          onChange={(e) => setSegValHex(e.target.value.toUpperCase())}
                          className="w-full bg-transparent px-2.5 py-1.5 text-[13px] font-mono text-slate-950 focus:outline-none font-bold"
                          placeholder="e.g. 1000"
                        />
                        <span className="px-2.5 text-[13px] font-mono text-slate-500 font-semibold">H</span>
                      </div>
                    </div>

                    {/* Offset */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-slate-700 block">
                        Offset Register ({offsetReg})
                      </label>
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 transition-all">
                        <span className="px-2.5 py-1.5 text-[13px] font-mono font-extrabold text-amber-700 border-r border-slate-300 bg-amber-50">{offsetReg}</span>
                        <input
                          type="text"
                          maxLength={4}
                          value={offsetValHex}
                          onChange={(e) => setOffsetValHex(e.target.value.toUpperCase())}
                          className="w-full bg-transparent px-2.5 py-1.5 text-[13px] font-mono text-slate-950 focus:outline-none font-bold"
                          placeholder="e.g. 2000"
                        />
                        <span className="px-2.5 text-[13px] font-mono text-slate-500 font-semibold">H</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-900 text-[13px] flex items-center gap-2">
                      <span className="font-bold">Error:</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-3">
                    <span className="text-[13px] font-bold text-slate-700 block mb-2">Preset Combinations (B.Tech Syllabus):</span>
                    <div className="space-y-2">
                      {presets.map(p => (
                        <button
                          key={p.label}
                          onClick={() => selectPreset(p)}
                          className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-[13px] cursor-pointer"
                        >
                          <div className="font-bold text-slate-900 flex justify-between">
                            <span>{p.label}</span>
                            <span className="font-mono text-indigo-700 font-extrabold">{p.segmentVal}:{p.offsetVal}</span>
                          </div>
                          <p className="text-[13px] text-slate-600 mt-0.5">{p.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200/60 space-y-3">
                  <div>
                    <span className="text-[13px] font-mono font-bold text-indigo-800 uppercase tracking-wide block">How Memory is Segmented</span>
                    <p className="text-slate-800 text-[13px] leading-relaxed mt-1">
                      The 8086 has a <strong>20-bit address bus</strong> to access <strong>1 MB</strong> of memory. However, its internal registers are only <strong>16-bit</strong>. To bridge this gap, memory is organized into logical <strong>segments</strong>:
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-200 font-mono">
                      <span className="text-indigo-800 font-bold block">1. 64KB Segments</span>
                      <span className="text-slate-700 text-[13px]">Max size addressable by any 16-bit offset pointer.</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-indigo-200 font-mono">
                      <span className="text-indigo-800 font-bold block">2. Four Active Segments</span>
                      <span className="text-slate-700 text-[13px]">Code (CS), Data (DS), Stack (SS), and Extra (ES).</span>
                    </div>
                  </div>

                  <div className="bg-white/90 p-3 rounded-lg border border-indigo-200/60 text-[13px] leading-relaxed text-slate-700 space-y-1.5">
                    <strong className="text-indigo-900 block font-bold text-[13px]">The Segmentation Mechanics:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-[13px]">
                      <li><strong>Segment Base:</strong> The starting boundary address, stored in CS, DS, SS, or ES. Shifting it left by 4 bits (multiplying by 10H) aligns it to a 20-bit physical boundary.</li>
                      <li><strong>Offset (Effective Address):</strong> The relative distance (displacement) from the segment base.</li>
                      <li><strong>Dynamic Relocation:</strong> Programs can be placed anywhere in physical memory by changing only the segment base registers, while offsets remain unchanged!</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Math & Steps Panel */}
              <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-[14px] text-slate-950 mb-3 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-700" />
                    Physical Address Generation Steps
                  </h4>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[13px] font-bold text-indigo-700">Step 1: Shift Segment Left 4 Bits (Multiply by 10H)</span>
                        <span className="text-[13px] text-slate-500 font-mono">Segment * 10H</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[13px] bg-slate-50 p-2.5 rounded border border-slate-200">
                        <div>
                          <span className="text-slate-600 font-sans mr-2">{segReg} value:</span>
                          <strong className="text-indigo-900 font-extrabold">{segValHex}H</strong>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-slate-600 font-sans mr-2">Shifted Segment:</span>
                          <strong className="text-indigo-950 font-extrabold">{shiftedSeg}H</strong>
                        </div>
                      </div>
                      <div className="text-[13px] font-mono text-slate-700 mt-2">
                        Binary: {getBinaryString(segValHex)} <span className="text-indigo-700 font-extrabold">&lt;&lt; 4</span> = {getBinaryString(shiftedSeg, 20)}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[13px] font-bold text-amber-700">Step 2: Add Offset Address to Shifted Segment</span>
                        <span className="text-[13px] text-slate-500 font-mono">Shifted Segment + Offset</span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-right text-[13px] space-y-1">
                        <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                          <span className="text-[13px] text-slate-600 font-sans text-left">Shifted Segment Address</span>
                          <span className="text-indigo-950 font-bold">{shiftedSeg} H</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-[13px] text-slate-600 font-sans text-left">Offset Address ({offsetReg})</span>
                          <span className="text-amber-700 font-bold">+ {offsetValHex.padStart(5, '0')} H</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-slate-400 pt-1.5 font-bold text-base">
                          <span className="text-[13px] text-indigo-800 font-sans text-left font-bold flex items-center gap-1">
                            Physical Address (20-Bit)
                          </span>
                          <span className="text-indigo-700 font-extrabold">{physicalAddress} H</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graphical Address Space representation */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="text-[13px] uppercase font-mono tracking-wider text-slate-500 block mb-2 font-bold">Memory Segment Mapping Context</span>
                  <div className="h-8 bg-slate-200 rounded-full overflow-hidden relative flex items-center px-4 border border-slate-300">
                    <div className="absolute left-0 top-0 bottom-0 w-full bg-linear-to-r from-indigo-100 to-indigo-300 opacity-60"></div>
                    {/* Pointer */}
                    <div className="absolute h-full w-1 bg-indigo-700" style={{ left: '35%' }}></div>
                    <div className="absolute text-[13px] font-bold font-mono text-indigo-950" style={{ left: '38%' }}>
                      Segment Base: {segValHex}0H | Target: {physicalAddress}H
                    </div>
                    <div className="absolute left-2 font-mono text-[13px] text-slate-700 z-10 font-bold">00000H</div>
                    <div className="absolute right-2 font-mono text-[13px] text-slate-700 z-10 font-bold">FFFFFH (1 MB)</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="segmented-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Top Selector Banner */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 font-display flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-700" />
                    Interactive Memory Segmentation Styles &amp; Types
                  </h3>
                  <p className="text-[13px] text-slate-600 mt-1">
                    Click the buttons to toggle between Overlap and Non-Overlap modes, or hover over registers &amp; segments to inspect them.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSegmentId('non-overlap')}
                    className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                      selectedSegmentId === 'non-overlap' || selectedSegmentId === 'cs' || selectedSegmentId === 'ds' || selectedSegmentId === 'ss' || selectedSegmentId === 'es'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Non-Overlap Segmentation
                  </button>
                  <button
                    onClick={() => setSelectedSegmentId('overlap')}
                    className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                      selectedSegmentId === 'overlap'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Overlap Segmentation
                  </button>
                  <button
                    onClick={() => setSelectedSegmentId('io-space')}
                    className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
                      selectedSegmentId === 'io-space'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    I/O Address Space
                  </button>
                </div>
              </div>

              {/* Grid System containing MPU, Memory Map, and I/O Space / Details */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* 1. 8086 MPU Chip (Col-Span-4) */}
                <div className="xl:col-span-4 bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="font-mono font-bold text-[14px] text-white tracking-wide">8086/8088 MPU</h4>
                      <span className="text-[11px] text-indigo-400 uppercase font-mono tracking-wider">Microprocessor Unit</span>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-[13px]">
                    {/* IP Block */}
                    <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60 hover:border-indigo-400/60 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400 text-[13px]">Instruction Pointer</span>
                        <span className="text-white bg-slate-700 px-2 py-0.5 rounded text-[13px] font-bold">IP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-sans">Holds 16-bit offset of next instruction.</p>
                    </div>

                    {/* Segment Registers */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 space-y-2">
                      <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider block">Segment Registers (16-Bit)</span>
                      
                      <div className="grid grid-cols-1 gap-1.5">
                        <button
                          onMouseEnter={() => setSelectedSegmentId('cs')}
                          className={`w-full p-2 rounded-md border text-left transition-all flex justify-between items-center cursor-pointer ${
                            selectedSegmentId === 'cs' ? 'bg-indigo-950/80 border-indigo-500 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-bold text-[13px]">Code Segment Register</span>
                          <span className="font-bold text-indigo-400 font-mono text-[13px]">CS</span>
                        </button>

                        <button
                          onMouseEnter={() => setSelectedSegmentId('ds')}
                          className={`w-full p-2 rounded-md border text-left transition-all flex justify-between items-center cursor-pointer ${
                            selectedSegmentId === 'ds' ? 'bg-emerald-950/80 border-emerald-500 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-bold text-[13px]">Data Segment Register</span>
                          <span className="font-bold text-emerald-400 font-mono text-[13px]">DS</span>
                        </button>

                        <button
                          onMouseEnter={() => setSelectedSegmentId('ss')}
                          className={`w-full p-2 rounded-md border text-left transition-all flex justify-between items-center cursor-pointer ${
                            selectedSegmentId === 'ss' ? 'bg-rose-950/80 border-rose-500 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-bold text-[13px]">Stack Segment Register</span>
                          <span className="font-bold text-rose-400 font-mono text-[13px]">SS</span>
                        </button>

                        <button
                          onMouseEnter={() => setSelectedSegmentId('es')}
                          className={`w-full p-2 rounded-md border text-left transition-all flex justify-between items-center cursor-pointer ${
                            selectedSegmentId === 'es' ? 'bg-amber-950/80 border-amber-500 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-bold text-[13px]">Extra Segment Register</span>
                          <span className="font-bold text-amber-400 font-mono text-[13px]">ES</span>
                        </button>
                      </div>
                    </div>

                    {/* General Purpose Registers */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">General Purpose Registers (8/16-Bit)</span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-center">
                          <span className="text-slate-400 block text-[10px]">Accumulator</span>
                          <strong className="text-white text-[13px]">AX (AH | AL)</strong>
                        </div>
                        <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-center">
                          <span className="text-slate-400 block text-[10px]">Base Register</span>
                          <strong className="text-white text-[13px]">BX (BH | BL)</strong>
                        </div>
                        <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-center">
                          <span className="text-slate-400 block text-[10px]">Count Register</span>
                          <strong className="text-white text-[13px]">CX (CH | CL)</strong>
                        </div>
                        <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700 text-center">
                          <span className="text-slate-400 block text-[10px]">Data Register</span>
                          <strong className="text-white text-[13px]">DX (DH | DL)</strong>
                        </div>
                      </div>
                    </div>

                    {/* Pointer & Index Registers */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Pointer &amp; Index Registers (16-Bit)</span>
                      <div className="grid grid-cols-4 gap-1 text-center font-bold text-white text-[13px]">
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">SP</div>
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">BP</div>
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">SI</div>
                        <div className="bg-slate-800/80 p-2 rounded border border-slate-700">DI</div>
                      </div>
                    </div>

                    {/* SR Box */}
                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 text-center">
                      <span className="text-slate-400 text-[11px] font-sans mr-2">Status Register / Flags:</span>
                      <strong className="text-indigo-400 text-[13px]">SR</strong>
                    </div>
                  </div>
                </div>

                {/* 2. External Memory Address Space (Col-Span-5) */}
                <div className="xl:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] font-bold text-slate-800 font-display">
                      1 MB External Physical Memory Map
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded">
                      {selectedSegmentId === 'overlap' ? 'Overlapping Layout' : 'Non-Overlapping Layout'}
                    </span>
                  </div>

                  {/* 1MB Stack container representing 00000H to FFFFFH */}
                  <div className="border-2 border-slate-300 rounded-xl bg-white p-5 h-[480px] flex flex-col justify-between relative overflow-hidden shadow-inner">
                    {/* Background indicator */}
                    <div className="absolute inset-0 bg-slate-50/20 pointer-events-none"></div>

                    {/* Address Boundary Label Top */}
                    <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-400 border-b border-slate-100 pb-1 z-10">
                      <span>Bottom Address: 00000 H</span>
                      <span>(0 Bytes)</span>
                    </div>

                    {/* Render segments depending on overlap state */}
                    <div className="flex-1 relative my-4 flex flex-col justify-around">
                      {selectedSegmentId === 'overlap' ? (
                        /* Overlap Mode */
                        <div className="absolute inset-0 flex flex-col justify-start space-y-1">
                          {/* Segment 1: CS */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('cs')}
                            className="bg-indigo-50 border-2 border-indigo-500/80 hover:border-indigo-600 rounded-lg p-3 relative h-[100px] shadow-xs cursor-pointer transition-all"
                          >
                            <div className="flex justify-between text-[11px] font-mono text-indigo-900 font-bold">
                              <span>Code Segment (64 KB)</span>
                              <span>CS Base: 1000H</span>
                            </div>
                            <div className="text-[13px] font-semibold text-indigo-950 mt-1">CS:IP Mapping Range</div>
                            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-indigo-600 font-bold">10000H - 1FFFFH</div>
                          </div>

                          {/* Segment 2: DS Overlapped */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('ds')}
                            className="bg-emerald-50/90 border-2 border-emerald-500 hover:border-emerald-600 rounded-lg p-3 relative h-[100px] -mt-10 shadow-xs cursor-pointer transition-all bg-repeating-linear-stripes"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(16, 185, 129, 0.05) 5px, rgba(16, 185, 129, 0.05) 10px)'
                            }}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-emerald-900 font-bold">
                              <span>Data Segment (64 KB)</span>
                              <span>DS Base: 1400H</span>
                            </div>
                            <div className="text-[13px] font-bold text-emerald-950 mt-1 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Overlaps CS by 48 KB!</span>
                            </div>
                            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-emerald-600 font-bold">14000H - 23FFFH</div>
                          </div>

                          {/* Segment 3: SS Overlapped */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('ss')}
                            className="bg-rose-50/90 border-2 border-rose-500 hover:border-rose-600 rounded-lg p-3 relative h-[100px] -mt-10 shadow-xs cursor-pointer transition-all"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(244, 63, 94, 0.05) 5px, rgba(244, 63, 94, 0.05) 10px)'
                            }}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-rose-900 font-bold">
                              <span>Stack Segment (64 KB)</span>
                              <span>SS Base: 1800H</span>
                            </div>
                            <div className="text-[13px] font-bold text-rose-950 mt-1 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>Overlaps DS by 48 KB!</span>
                            </div>
                            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-rose-600 font-bold">18000H - 27FFFH</div>
                          </div>

                          {/* Segment 4: ES Overlapped */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('es')}
                            className="bg-amber-50/90 border-2 border-amber-500 hover:border-amber-600 rounded-lg p-3 relative h-[100px] -mt-10 shadow-xs cursor-pointer transition-all"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.05) 5px, rgba(245, 158, 11, 0.05) 10px)'
                            }}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-amber-900 font-bold">
                              <span>Extra Segment (64 KB)</span>
                              <span>ES Base: 1C00H</span>
                            </div>
                            <div className="text-[13px] font-bold text-amber-950 mt-1 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Overlaps SS by 48 KB!</span>
                            </div>
                            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-amber-600 font-bold">1C000H - 2BFFFH</div>
                          </div>
                        </div>
                      ) : (
                        /* Non-Overlap Mode */
                        <div className="absolute inset-0 flex flex-col justify-between py-1">
                          {/* Segment 1: CS */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('cs')}
                            className={`border-2 rounded-lg p-2.5 relative cursor-pointer transition-all shadow-xs h-[85px] ${
                              selectedSegmentId === 'cs' ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-400/55' : 'bg-white border-slate-200 hover:border-indigo-400'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                              <span className="text-indigo-800 font-bold">Code Segment (64 KB)</span>
                              <span>CS: 1000H</span>
                            </div>
                            <p className="text-[13px] text-slate-600 mt-1">Holds program instructions.</p>
                            <div className="absolute bottom-1.5 right-2.5 text-[10px] font-mono font-bold text-slate-500">10000H - 1FFFFH</div>
                          </div>

                          {/* Segment 2: DS */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('ds')}
                            className={`border-2 rounded-lg p-2.5 relative cursor-pointer transition-all shadow-xs h-[85px] ${
                              selectedSegmentId === 'ds' ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-400/55' : 'bg-white border-slate-200 hover:border-emerald-400'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                              <span className="text-emerald-800 font-bold">Data Segment (64 KB)</span>
                              <span>DS: 3000H</span>
                            </div>
                            <p className="text-[13px] text-slate-600 mt-1">Holds static variable storage.</p>
                            <div className="absolute bottom-1.5 right-2.5 text-[10px] font-mono font-bold text-slate-500">30000H - 3FFFFH</div>
                          </div>

                          {/* Segment 3: SS */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('ss')}
                            className={`border-2 rounded-lg p-2.5 relative cursor-pointer transition-all shadow-xs h-[85px] ${
                              selectedSegmentId === 'ss' ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-400/55' : 'bg-white border-slate-200 hover:border-rose-400'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                              <span className="text-rose-800 font-bold">Stack Segment (64 KB)</span>
                              <span>SS: 5000H</span>
                            </div>
                            <p className="text-[13px] text-slate-600 mt-1">Holds return vectors &amp; variables.</p>
                            <div className="absolute bottom-1.5 right-2.5 text-[10px] font-mono font-bold text-slate-500">50000H - 5FFFFH</div>
                          </div>

                          {/* Segment 4: ES */}
                          <div
                            onMouseEnter={() => setSelectedSegmentId('es')}
                            className={`border-2 rounded-lg p-2.5 relative cursor-pointer transition-all shadow-xs h-[85px] ${
                              selectedSegmentId === 'es' ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-400/55' : 'bg-white border-slate-200 hover:border-amber-400'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] font-mono text-slate-500 font-bold">
                              <span className="text-amber-800 font-bold">Extra Segment (64 KB)</span>
                              <span>ES: 7000H</span>
                            </div>
                            <p className="text-[13px] text-slate-600 mt-1">Holds high-speed transfer targets.</p>
                            <div className="absolute bottom-1.5 right-2.5 text-[10px] font-mono font-bold text-slate-500">70000H - 7FFFFH</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address Boundary Label Bottom */}
                    <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-400 border-t border-slate-100 pt-1 z-10">
                      <span>Top Address: FFFFF H</span>
                      <span>(1 MB Total Space)</span>
                    </div>
                  </div>

                  {/* 1 MB Memory Bit/Byte Calculation Card */}
                  <div className="mt-4 bg-indigo-50/50 border border-indigo-150 rounded-xl p-4 space-y-3">
                    <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-indigo-700 block">
                      1 MB Memory Bit &amp; Location Math
                    </span>
                    <div className="text-[12.5px] text-slate-700 space-y-2">
                      <p className="leading-relaxed">
                        In the <strong>8086 Microprocessor</strong>, the physical address bus is <strong>20-bit</strong> wide.
                      </p>
                      
                      {/* Equations Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11.5px] bg-white p-3 rounded-lg border border-slate-150">
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Standard Storage Math</span>
                          <div>• 1 Byte = 8 bits</div>
                          <div>• 1 KB = 1024 Bytes</div>
                          <div>• 1 MB = 1024 KB</div>
                          <div className="pt-1 border-t border-dashed border-slate-200">
                            <strong>1,048,576 Bytes</strong>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">8086 Physical Limits</span>
                          <div>• 20-bit Bus = 2<sup>20</sup> locations</div>
                          <div>• 2<sup>20</sup> = 1,048,576 locations</div>
                          <div>• 1 Location = 1 Byte (8 bits)</div>
                          <div className="pt-1 border-t border-dashed border-slate-200">
                            <strong>8,388,608 bits</strong>
                          </div>
                        </div>
                      </div>

                      {/* Exponential Summary */}
                      <div className="bg-indigo-950 text-indigo-100 rounded-lg p-2.5 text-center font-mono text-[12px] space-y-1">
                        <div className="flex justify-around items-center">
                          <div>
                            <span className="text-indigo-300 text-[10px] block font-sans">MAX MEMORY (BYTES)</span>
                            <strong>2<sup>20</sup> Bytes</strong>
                          </div>
                          <div className="text-indigo-400">|</div>
                          <div>
                            <span className="text-indigo-300 text-[10px] block font-sans">MAX MEMORY (BITS)</span>
                            <strong>2<sup>23</sup> bits</strong>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11.5px] text-slate-500 italic mt-1 leading-normal">
                        * Since each memory location stores exactly 1 byte (8 bits), the maximum addressable space of 1,048,576 locations matches exactly 1 MB (1,048,576 Bytes = 8,388,608 bits).
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Right Panel: Input/Output Address Space & Details Console (Col-Span-3) */}
                <div className="xl:col-span-3 space-y-4">
                  
                  {/* Interactive Textbook Style - Input/Output Address Space Block */}
                  <div
                    onMouseEnter={() => setSelectedSegmentId('io-space')}
                    className={`border-2 rounded-2xl p-4 transition-all cursor-pointer bg-white shadow-xs ${
                      selectedSegmentId === 'io-space' ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-300' : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span className="text-[13px] font-bold text-slate-800 font-display">Input / Output Address Space</span>
                    </div>
                    
                    <div className="border border-emerald-300 rounded-lg p-3 bg-emerald-50/50 text-center font-mono">
                      <div className="text-[11px] text-emerald-800 font-bold">0000 H</div>
                      <div className="h-12 border-x border-dashed border-emerald-400 my-1 bg-white/75 flex items-center justify-center font-bold text-[13px] text-emerald-950">
                        64 KB Port Address space
                      </div>
                      <div className="text-[11px] text-emerald-800 font-bold">FFFF H</div>
                    </div>
                    
                    <p className="text-[13px] text-slate-600 leading-normal mt-2.5">
                      The 8086 has a dedicated <strong>64KB I/O Space</strong> separate from main memory. It uses instructions like <code>IN</code> and <code>OUT</code> with 16-bit direct port addresses, bypassing memory segment logic.
                    </p>
                  </div>

                  {/* Context Sensitive Details Board */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3.5">
                    <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-indigo-700 block">
                      Active Textbook Explanation
                    </span>

                    {/* Detailed Content based on selected segment */}
                    {selectedSegmentId === 'cs' && (
                      <div className="space-y-2">
                        <strong className="text-indigo-950 font-bold text-[13px] block">Code Segment (CS) explanation:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Stored instruction codes are fetched by the BIU combining <strong>CS</strong> (Segment Base) and <strong>IP</strong> (Offset). Overlapping allows shared micro-libraries to execute code directly from inside code sections.
                        </p>
                        <div className="bg-white border border-indigo-100 p-2.5 rounded-lg text-[13px] font-mono text-indigo-900 leading-normal">
                          CS × 10H + IP = Physical Fetch Vector
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'ds' && (
                      <div className="space-y-2">
                        <strong className="text-emerald-950 font-bold text-[13px] block">Data Segment (DS) explanation:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Serves as the default storage segment for variables and arrays. By default, offset registers <strong>BX</strong>, <strong>SI</strong>, or <strong>DI</strong> are combined with DS.
                        </p>
                        <div className="bg-white border border-emerald-100 p-2.5 rounded-lg text-[13px] font-mono text-emerald-900 leading-normal">
                          DS × 10H + Offset = Variable Location
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'ss' && (
                      <div className="space-y-2">
                        <strong className="text-rose-950 font-bold text-[13px] block">Stack Segment (SS) explanation:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Manages local variables, parameters, and stack-frame scopes. Linked primarily to <strong>SP</strong> (Stack Pointer) and <strong>BP</strong> (Base Pointer).
                        </p>
                        <div className="bg-white border border-rose-100 p-2.5 rounded-lg text-[13px] font-mono text-rose-900 leading-normal">
                          SS × 10H + SP = Stack Push/Pop Target
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'es' && (
                      <div className="space-y-2">
                        <strong className="text-amber-950 font-bold text-[13px] block">Extra Segment (ES) explanation:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Used heavily during string operations as destination pointer buffer coupling with index register <strong>DI</strong>. This prevents read-write pointers from colliding inside the standard data segment.
                        </p>
                        <div className="bg-white border border-amber-100 p-2.5 rounded-lg text-[13px] font-mono text-amber-900 leading-normal">
                          ES × 10H + DI = String Destination Address
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'overlap' && (
                      <div className="space-y-2">
                        <strong className="text-purple-950 font-bold text-[13px] block">Overlap Segmentation Details:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          In the 8086, segments can overlap fully or partially. This happens because segment starting base addresses can be declared at any 16-byte interval (called a Paragraph boundary).
                        </p>
                        <div className="bg-white border border-purple-100 p-2.5 rounded-lg text-slate-600 text-xs leading-normal">
                          <strong className="text-purple-800 text-[13px] block mb-1">Why use Overlap?</strong>
                          <ul className="list-disc pl-4 space-y-1 text-[13px]">
                            <li>Conserves physical memory for small programs (no wasted gaps).</li>
                            <li>Enables shared data transfer vectors across segments.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'non-overlap' && (
                      <div className="space-y-2">
                        <strong className="text-slate-900 font-bold text-[13px] block">Non-Overlap Segmentation Details:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Each segment is placed in a distinct, isolated 64 KB memory block. No data or code references bleed into other active segments.
                        </p>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-slate-600 text-xs leading-normal">
                          <strong className="text-slate-800 text-[13px] block mb-1">Why use Non-Overlap?</strong>
                          <ul className="list-disc pl-4 space-y-1 text-[13px]">
                            <li>Provides clean logical organization of Code, Data, and Stack.</li>
                            <li>Ensures program execution security and prevents stack-overflow corruption.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedSegmentId === 'io-space' && (
                      <div className="space-y-3">
                        <strong className="text-emerald-950 font-bold text-[14px] block border-b border-emerald-100 pb-1">
                          Memory vs. I/O Space: Clear Comparison
                        </strong>
                        <p className="text-[12.5px] text-slate-700 leading-relaxed">
                          The 8086 uses <strong>Isolated I/O</strong>. This means Main Memory and I/O (Input/Output) ports are in <strong>completely separate physical address spaces</strong>, controlled by different pins and instructions.
                        </p>

                        {/* Comparison Table */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden text-[11.5px] bg-white">
                          <div className="grid grid-cols-3 bg-slate-100 font-bold p-1.5 border-b border-slate-200">
                            <div>Feature</div>
                            <div className="text-indigo-700">Main Memory</div>
                            <div className="text-emerald-700">I/O Space</div>
                          </div>
                          
                          <div className="grid grid-cols-3 p-1.5 border-b border-slate-150">
                            <span className="font-semibold text-slate-600">Total Size</span>
                            <span>1 MB (1,048,576 Bytes)</span>
                            <span>64 KB (65,536 Ports)</span>
                          </div>

                          <div className="grid grid-cols-3 p-1.5 border-b border-slate-150">
                            <span className="font-semibold text-slate-600">Address Bus</span>
                            <span>20-bit (00000H - FFFFFH)</span>
                            <span>16-bit (0000H - FFFFH)</span>
                          </div>

                          <div className="grid grid-cols-3 p-1.5 border-b border-slate-150">
                            <span className="font-semibold text-slate-600">M/IO Pin</span>
                            <span className="text-indigo-600 font-bold font-mono">HIGH (+5V)</span>
                            <span className="text-emerald-600 font-bold font-mono">LOW (0V)</span>
                          </div>

                          <div className="grid grid-cols-3 p-1.5 border-b border-slate-150">
                            <span className="font-semibold text-slate-600">Addressing</span>
                            <span>Segmented (Base + Offset)</span>
                            <span>Direct Port (No Segments)</span>
                          </div>

                          <div className="grid grid-cols-3 p-1.5">
                            <span className="font-semibold text-slate-600">Assembly code</span>
                            <code className="text-indigo-800">MOV AL, [BX]</code>
                            <code className="text-emerald-800">IN AL, DX</code>
                          </div>
                        </div>

                        <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 text-[12px] leading-normal space-y-1">
                          <strong className="text-emerald-950 font-bold block">💡 The M/IO Pin Secret:</strong>
                          <p className="text-slate-800">
                            When the CPU executes <code>IN</code> or <code>OUT</code>, it sets the <strong>M/IO Pin to LOW (0)</strong>. This signal tells the system board to activate I/O chip-select lines instead of RAM chips, keeping both worlds safely separated!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Fallback default */}
                    {!['cs', 'ds', 'ss', 'es', 'overlap', 'non-overlap', 'io-space'].includes(selectedSegmentId) && (
                      <div className="space-y-2">
                        <strong className="text-slate-900 font-bold text-[13px] block">Quick Exam Guide:</strong>
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          Hover or select any microprocessor register or segment block to view detailed syllabus explanations.
                        </p>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-slate-600 text-xs leading-normal">
                          Learn the physical address formulation and segmentation styles dynamically.
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
