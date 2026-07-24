import { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Link, ShieldAlert, BookOpen, Layers, Info } from 'lucide-react';
import { renderSignalName } from './PinConfigurationSimulator';

interface ComponentInfo {
  id: string;
  name: string;
  chipModel: string;
  role: string;
  connections: string[];
  examTip: string;
}

export default function MinimumModeHardwareSimulator() {
  const [activeTab, setActiveTab] = useState<'flow' | 'details'>('flow');
  const [selectedChip, setSelectedChip] = useState<string>('cpu');
  const [currentTState, setCurrentTState] = useState<'idle' | 't1' | 't2' | 't3' | 't4'>('idle');
  const [busDirection, setBusDirection] = useState<'read' | 'write'>('read');

  const formatActiveLowString = (str: string) => {
    if (str.includes('WR =')) {
      return (
        <span className="inline-flex items-center gap-0.5">
          <span className="overline">WR</span>
          <span> = LOW (Active)</span>
        </span>
      );
    }
    if (str.includes('RD =')) {
      return (
        <span className="inline-flex items-center gap-0.5">
          <span className="overline">RD</span>
          <span> = LOW (Active)</span>
        </span>
      );
    }
    return str;
  };

  const chips: Record<string, ComponentInfo> = {
    clock: {
      id: 'clock',
      name: 'Clock Generator',
      chipModel: 'Intel 8284A',
      role: 'Generates the master CLK signal, provides a synchronized RESET pulse on boot, and coordinates READY state synchronization for slow memory devices.',
      connections: [
        'CLK pin connected to 8086 CLK (pin 19) to drive CPU cycles.',
        'RESET pin connected to 8086 RESET (pin 21) to trigger initial system boot.',
        'READY pin connected to 8086 READY (pin 22) to synchronize slow memories.'
      ],
      examTip: 'Always mention that the 8284A crystal frequency is divided by 3 internally to output the 8086 system CLK (e.g., 15 MHz crystal outputs a 5 MHz CLK).'
    },
    cpu: {
      id: 'cpu',
      name: '8086 Microprocessor (Minimum Mode)',
      chipModel: 'Intel 8086',
      role: 'The heart of the system. Operating in Minimum Mode when MN/MX (pin 33) is wired directly to +5V (Vcc). Generates its own control signals without needing a separate bus controller.',
      connections: [
        'MN/MX pin (pin 33) connected to +5V.',
        'ALE pin (Address Latch Enable) connected to latch STB input.',
        'DEN & DT/R connected to transceiver OE & DIR inputs.',
        'M/IO, RD, and WR signals connected directly to memory/IO control bus.'
      ],
      examTip: 'A common exam question asks why MN/MX is connected to +5V. State clearly: "To enable Minimum Mode, where the 8086 generates all control signals (ALE, RD, WR, M/IO) directly on pins 24 to 31."'
    },
    latch: {
      id: 'latch',
      name: 'Address Latches (x3)',
      chipModel: 'Intel 8282 / 74LS373',
      role: 'Demultiplexes the combined Address/Data bus (AD0-AD15) and Address/Status bus (A16-A19/Status). Captures and locks the pure 20-bit physical memory address at the start of every bus cycle.',
      connections: [
        'Inputs connected to CPU AD0-AD15, A16-A19, and BHE lines.',
        'STB (Strobe) pin connected to CPU ALE (pin 25) output.',
        'OE (Output Enable) pin grounded (0V) to keep outputs permanently enabled.',
        'Outputs form the pure, non-multiplexed 20-bit Address Bus (A0-A19) and BHE.'
      ],
      examTip: 'Explain that the 8086 multiplexes addresses and data to keep the chip pin count down to 40. The 8282 latches are crucial to filter out data, leaving a clean, constant Address Bus for the memory chips.'
    },
    transceiver: {
      id: 'transceiver',
      name: 'Data Transceivers (x2)',
      chipModel: 'Intel 8286 / 74LS245',
      role: 'Bidirectional buffers that control the flow of data between the CPU and the system Data Bus. Prevents electrical noise, boosts drive current, and avoids bus collisions.',
      connections: [
        'Local side pins connected to CPU multiplexed AD0-AD15 lines.',
        'System side pins form the dedicated 16-bit system Data Bus (D0-D15).',
        'OE (Output Enable) pin connected to CPU DEN pin (pin 26).',
        'DIR (Direction) pin connected to CPU DT/R pin (pin 27).'
      ],
      examTip: 'Remember: DEN enables the transceivers (active Low), while DT/R controls direction (High = Transmit/Write from CPU, Low = Receive/Read into CPU).'
    },
    memory: {
      id: 'memory',
      name: 'Memory & I/O Peripherals',
      chipModel: 'RAM / ROM / IO Devices',
      role: 'Stores code, data variables, and interfaces with input/output chips. Intercepts demultiplexed address buses and responds to active low read/write commands.',
      connections: [
        'Address inputs connected to demultiplexed Address Bus (A0-A19).',
        'Data pins connected to system Data Bus (D0-D15).',
        'Control inputs respond to RD, WR, and M/IO signals directly.'
      ],
      examTip: 'Explain that standard memory space is 1 MB (accessed via A0-A19), while I/O space is 64 KB (accessed via A0-A15 when M/IO is Low).'
    }
  };

  const selectedChipInfo = chips[selectedChip];

  // Helper to determine signal states for the current T-state
  const getSignalState = () => {
    switch (currentTState) {
      case 't1':
        return {
          ale: 'HIGH (Strobe Active)',
          den: 'HIGH (Disabled)',
          dtr: busDirection === 'write' ? 'HIGH (Transmit)' : 'HIGH (Turnaround)',
          busContent: 'ADDRESS (A0 - A19)',
          rd_wr: 'HIGH (Inactive)',
          latchStatus: 'OPEN - LATCHING ADDRESS'
        };
      case 't2':
        return {
          ale: 'LOW (Locked)',
          den: 'LOW (Enabled)',
          dtr: busDirection === 'write' ? 'HIGH (Transmit)' : 'LOW (Receive)',
          busContent: busDirection === 'write' ? 'DATA (D0 - D15)' : 'Hi-Z (Wait for memory)',
          rd_wr: busDirection === 'write' ? 'WR = LOW (Active)' : 'RD = LOW (Active)',
          latchStatus: 'LOCKED - HOLDING ADDRESS'
        };
      case 't3':
        return {
          ale: 'LOW (Locked)',
          den: 'LOW (Enabled)',
          dtr: busDirection === 'write' ? 'HIGH (Transmit)' : 'LOW (Receive)',
          busContent: busDirection === 'write' ? 'DATA (D0 - D15) Written' : 'DATA (D0 - D15) Read',
          rd_wr: busDirection === 'write' ? 'WR = LOW (Active)' : 'RD = LOW (Active)',
          latchStatus: 'LOCKED - HOLDING ADDRESS'
        };
      case 't4':
        return {
          ale: 'LOW (Inactive)',
          den: 'HIGH (Disabled)',
          dtr: 'HIGH (Default)',
          busContent: 'Float (Hi-Z)',
          rd_wr: 'HIGH (Inactive)',
          latchStatus: 'LOCKED - STANDBY'
        };
      default:
        return {
          ale: 'LOW',
          den: 'HIGH (Inactive)',
          dtr: 'HIGH',
          busContent: 'Undefined/Idle',
          rd_wr: 'HIGH',
          latchStatus: 'STANDBY'
        };
    }
  };

  const signals = getSignalState();

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Title block with tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-sm font-semibold text-slate-800 font-display block">8086 Minimum Mode Hardware Architecture</span>
            <span className="text-[10px] text-slate-400 block font-mono">Interactive Hardware Connections &amp; Bus Cycle simulation</span>
          </div>
        </div>

        <div className="flex rounded-lg bg-slate-200/60 p-1 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'flow' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Hardware Flow
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'details' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chip-by-Chip Pins
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {activeTab === 'flow' ? (
          /* HARDWARE FLOW INTERACTIVE MAP */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Interactive Circuit Block Visualizer */}
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-5 relative">
                {/* Simulator States bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200/60 pb-4 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Cycle Stepper</span>
                    <span className="text-xs text-slate-700">Step through a memory <strong>{busDirection.toUpperCase()}</strong> bus cycle to observe hardware logic:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={busDirection}
                      onChange={(e) => setBusDirection(e.target.value as 'read' | 'write')}
                      className="text-[11px] bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="read">Read Operation</option>
                      <option value="write">Write Operation</option>
                    </select>

                    <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-lg">
                      {['idle', 't1', 't2', 't3', 't4'].map((state) => (
                        <button
                          key={state}
                          onClick={() => setCurrentTState(state as any)}
                          className={`px-2 py-1 text-[10px] font-mono font-bold rounded uppercase transition-all ${
                            currentTState === state
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-300/40'
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* VISUAL SCHEMATIC MAP */}
                <div className="relative min-h-[380px] border border-slate-200 rounded-xl bg-white p-6 overflow-x-auto">
                  {/* Grid of Chips */}
                  <div className="grid grid-cols-12 gap-y-12 gap-x-2 md:gap-x-6 relative min-w-[620px] py-4">
                    
                    {/* 1. 8284A Clock block */}
                    <div 
                      onClick={() => setSelectedChip('clock')}
                      className={`col-span-3 border-2 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                        selectedChip === 'clock' 
                          ? 'border-amber-500 bg-amber-50/40 shadow-xs' 
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-amber-600">8284A IC</span>
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">Clock Generator</h4>
                        <p className="text-[9px] text-slate-400 font-mono mt-1">
                          CLK: {currentTState !== 'idle' ? '5 MHz (Active)' : 'Standby'}
                        </p>
                      </div>
                    </div>

                    {/* Spacer/Wire connection info */}
                    <div className="col-span-1 flex flex-col justify-center items-center">
                      <div className="w-full h-0.5 bg-amber-200 relative">
                        <div className={`absolute w-1.5 h-1.5 rounded-full bg-amber-500 left-0 top-1/2 -translate-y-1/2 ${currentTState !== 'idle' ? 'animate-ping' : ''}`}></div>
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 mt-1">CLK</span>
                    </div>

                    {/* 2. 8086 CPU Block */}
                    <div 
                      onClick={() => setSelectedChip('cpu')}
                      className={`col-span-4 border-2 p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between min-h-[140px] relative ${
                        selectedChip === 'cpu' 
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-xs' 
                          : 'border-slate-300 bg-slate-100/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="absolute top-2 right-2 bg-indigo-600 text-[8px] text-white font-mono px-1 py-0.5 rounded">
                        MN/MX = +5V (MIN)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-5 h-5 text-indigo-600" />
                        <span className="text-[10px] font-bold font-mono text-indigo-700">8086 CPU</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs leading-none">Main Microprocessor</h4>
                        <span className="text-[8px] text-slate-400 block mt-1">Pin 33 Tied High</span>
                      </div>
                    </div>

                    {/* 3. Address Latch Unit */}
                    <div className="col-span-4 flex flex-col justify-center">
                      <div 
                        onClick={() => setSelectedChip('latch')}
                        className={`border-2 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                          selectedChip === 'latch' 
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs' 
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-emerald-600">8282 / 74LS373</span>
                          <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded ${currentTState === 't1' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600'}`}>
                            STB = ALE
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">Address Latches</h4>
                          <span className="text-[8px] text-slate-400 block">Latching State: {signals.latchStatus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Connecting Buses & Transceivers */}
                    {/* Multiplexed AD0-AD15 signal bus flowing down/right */}
                    <div className="col-span-12 grid grid-cols-12 gap-2 relative">
                      {/* Interactive lines highlighting */}
                      <div className="absolute left-[30%] right-[30%] top-[-24px] h-[48px] border-l-2 border-r-2 border-dashed border-indigo-200/80 -z-0"></div>
                    </div>

                    {/* Spacer for offset */}
                    <div className="col-span-4"></div>

                    {/* 4. 8286 Bidirectional Transceivers */}
                    <div 
                      onClick={() => setSelectedChip('transceiver')}
                      className={`col-span-4 border-2 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                        selectedChip === 'transceiver' 
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs' 
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-blue-600">8286 Transceiver</span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${['t2', 't3'].includes(currentTState) ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          OE = DEN
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">Data Transceiver</h4>
                        <p className="text-[8px] text-slate-400 font-mono mt-1">
                          DIR (DT/R) = {signals.dtr}
                        </p>
                      </div>
                    </div>

                    {/* 5. Memory & I/O space */}
                    <div 
                      onClick={() => setSelectedChip('memory')}
                      className={`col-span-4 border-2 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                        selectedChip === 'memory' 
                          ? 'border-purple-600 bg-purple-50/40 shadow-xs' 
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-purple-600 font-semibold">1 MB Space</span>
                        <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">Memory &amp; I/O</h4>
                        <p className="text-[8px] text-slate-400 block mt-1">
                          Responding to: <span className="font-mono text-indigo-600 font-semibold inline-flex items-center gap-0.5">{formatActiveLowString(signals.rd_wr)}</span>
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Connecting bus representations overlay */}
                  {currentTState !== 'idle' && (
                    <div className="absolute inset-x-0 bottom-4 text-center">
                      <span className="inline-block bg-indigo-50 border border-indigo-150 rounded px-2.5 py-1 text-[10px] font-mono font-bold text-indigo-700 shadow-2xs">
                        ACTIVE DATA BUS CONTENT: <span className="text-pink-600 font-extrabold">{signals.busContent}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step Analysis and Signal values */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Active Signal Analysis (T-State: {currentTState.toUpperCase()})</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 font-mono text-[9px] block">ALE (Address Latch Enable)</span>
                    <strong className="text-slate-800 font-mono text-[11px]">{signals.ale}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 font-mono text-[9px] block">
                      <span className="overline">DEN</span> (Data Enable - Active Low)
                    </span>
                    <strong className="text-slate-800 font-mono text-[11px]">{signals.den}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 font-mono text-[9px] block">DT/<span className="overline">R</span> (Data Transmit/Receive)</span>
                    <strong className="text-slate-800 font-mono text-[11px]">{signals.dtr}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 font-mono text-[9px] block">Control Signals Status</span>
                    <strong className="text-indigo-600 font-mono text-[11px] inline-flex items-center">{formatActiveLowString(signals.rd_wr)}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 col-span-1 sm:col-span-2">
                    <span className="text-slate-400 font-mono text-[9px] block">Hardware Latching State</span>
                    <strong className="text-emerald-700 text-[11px]">{signals.latchStatus}</strong>
                  </div>
                </div>

                {/* Plain-English behavioral description */}
                <div className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-150 mt-1">
                  {currentTState === 'idle' && (
                    <span><strong>Idle State:</strong> Click on any T-state cycle button (T1-T4) above to visualize how pins, latches, and transceivers coordinate dynamically during a memory bus read or write transaction.</span>
                  )}
                  {currentTState === 't1' && (
                    <span><strong>T1 State (Address Phase):</strong> The CPU outputs the physical memory address onto the multiplexed AD0-AD15 bus. Simultaneously, it pulses <strong>ALE high</strong>. This transitions the 8282 latches to capture and latch the address. Transceivers are disabled to prevent data line conflicts.</span>
                  )}
                  {currentTState === 't2' && (
                    <span><strong>T2 State (Control Phase):</strong> The CPU drops <strong>ALE low</strong> to freeze/lock the captured address inside the latches. It then asserts either <strong>RD</strong> (Read) or <strong>WR</strong> (Write) low. It pulls <strong>DEN low</strong>, activating the transceivers to establish bidirection data coupling.</span>
                  )}
                  {currentTState === 't3' && (
                    <span><strong>T3 State (Data Transfer Phase):</strong> The latches continue to hold the clean address for the memory device. Data flows actively from/to the memory chips via the 8286 transceivers. If memory is slow, a low READY signal will insert wait states (Tw) here.</span>
                  )}
                  {currentTState === 't4' && (
                    <span><strong>T4 State (Completion Phase):</strong> The active low control lines (RD/WR) and DEN return to high state. The transceivers enter high-impedance mode (Hi-Z), releasing control of the data bus and ending the bus cycle.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Device Inspector Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-150">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-bold font-display uppercase text-slate-800 tracking-wider">Device Pin Inspector</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Selected Device</span>
                    <h3 className="font-display font-extrabold text-slate-900 text-sm md:text-base leading-snug">
                      {selectedChipInfo.name}
                    </h3>
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-indigo-150 mt-1">
                      {selectedChipInfo.chipModel}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed pt-2">
                    <p>{selectedChipInfo.role}</p>
                  </div>

                  {/* Core Pin Connection Map */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block">Key Circuit Connections</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {selectedChipInfo.connections.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* INTERACTIVE PIN MULTIPLEXING DEMONSTRATOR */}
                  <div className="border border-slate-150 rounded-xl p-3 bg-slate-50 space-y-2.5 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono text-indigo-600 font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500 animate-pulse" /> Pin Multiplexing Demo
                      </span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold border border-indigo-150">
                        AD0 - AD15 Lines
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal">
                      <strong>Multiplexing Principle:</strong> Pins transmit <strong>Address</strong> during the <strong>T1 clock state</strong>, and transition to transmit <strong>Data</strong> during <strong>T2, T3, and T4 states</strong>.
                    </p>

                    {/* Miniature Interactive T-State Cycle Stepper */}
                    <div className="grid grid-cols-5 gap-1 p-0.5 bg-slate-200/60 rounded-md">
                      {(['idle', 't1', 't2', 't3', 't4'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setCurrentTState(st)}
                          className={`py-1 text-[9px] font-mono font-bold rounded uppercase transition-all text-center ${
                            currentTState === st
                              ? 'bg-indigo-600 text-white shadow-3xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* Animated Pin Bus Visual representation */}
                    <div className="bg-white border border-slate-250 rounded-lg p-2.5 space-y-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Physical Pin State:</span>
                        <span className={`font-bold uppercase ${currentTState === 't1' ? 'text-amber-600' : ['t2', 't3', 't4'].includes(currentTState) ? 'text-blue-600' : 'text-slate-400'}`}>
                          {currentTState === 't1' ? 'Address Phase (T1)' : ['t2', 't3', 't4'].includes(currentTState) ? 'Data Phase (T2-T4)' : 'Standby / Hi-Z'}
                        </span>
                      </div>

                      {/* Displaying raw visual pins AD0-AD7 */}
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1 block">Copper Pins (AD0 - AD7)</span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((pinNum) => {
                            const isAddress = currentTState === 't1';
                            const isData = ['t2', 't3', 't4'].includes(currentTState);
                            return (
                              <div
                                key={pinNum}
                                className={`w-4 h-7 rounded border flex flex-col items-center justify-between py-0.5 text-[8px] font-mono font-bold transition-all duration-300 ${
                                  isAddress
                                    ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-2xs shadow-amber-100'
                                    : isData
                                    ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-2xs shadow-blue-100'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                              >
                                <span>AD{pinNum}</span>
                                <span className="font-extrabold text-[10px] leading-none">
                                  {isAddress ? 'A' : isData ? 'D' : 'Z'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Decoded pin explanation label */}
                      <div className="text-[10px] text-slate-600 leading-relaxed font-medium pt-0.5 border-t border-slate-100">
                        {currentTState === 'idle' && (
                          <span className="text-slate-400 italic">Select a clock cycle state (T1-T4) above to observe demultiplexing transitions in real-time.</span>
                        )}
                        {currentTState === 't1' && (
                          <span>
                            <span className="text-amber-600 font-bold font-mono">T1 (Address State):</span> The multiplexed bus is carrying the physical Memory Address (<code className="font-mono bg-amber-50 px-1 text-amber-700 rounded text-[9px]">A0-A15</code>). External address latches are locked open by the ALE signal.
                          </span>
                        )}
                        {currentTState === 't2' && (
                          <span>
                            <span className="text-blue-600 font-bold font-mono">T2 (Transition/Control State):</span> Address is saved inside external latches. Pins transition to carry the actual Read/Write Data (<code className="font-mono bg-blue-50 px-1 text-blue-700 rounded text-[9px]">D0-D15</code>).
                          </span>
                        )}
                        {currentTState === 't3' && (
                          <span>
                            <span className="text-indigo-600 font-bold font-mono">T3 (Data Transfer State):</span> Pin lines are completely stabilized to carry data. CPU samples or drives the system bus to complete the read or write request.
                          </span>
                        )}
                        {currentTState === 't4' && (
                          <span>
                            <span className="text-slate-600 font-bold font-mono">T4 (Bus Termination State):</span> The data cycle completes. Pins transition back to high-impedance floating state (<code className="font-mono bg-slate-50 px-1 text-slate-600 rounded text-[9px]">Hi-Z</code>) to avoid collisions.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exam Tip block */}
                <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 mt-4 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 font-mono uppercase">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>University Exam Corner</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    {selectedChipInfo.examTip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CHIP BY CHIP PIN-LEVEL BREAKDOWN */
          <div className="space-y-5">
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-display font-bold text-slate-800 text-sm">Pin-Level Decoupling of the support chips</h3>
              <p className="text-xs text-slate-500 mt-0.5">Explore how address demultiplexing and bidirectional data buffer control is accomplished at the physical pin level in B.Tech engineering layouts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(chips).map((chip) => (
                <div key={chip.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 text-xs md:text-sm font-display">{chip.name}</strong>
                      <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150">
                        {chip.chipModel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {chip.role}
                    </p>

                    <div className="border-t border-slate-100 pt-2 space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Wiring detail:</span>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        {chip.connections.slice(0, 2).map((conn, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-indigo-600 font-bold font-mono">•</span>
                            <span>{conn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/40 p-2.5 rounded border border-indigo-100/60 text-[10px] text-slate-700 leading-relaxed">
                    <span className="font-bold text-indigo-700 font-mono block uppercase text-[9px] mb-0.5">Exam Quick Tip</span>
                    {chip.examTip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
