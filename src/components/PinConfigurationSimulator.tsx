import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Settings, ShieldAlert, Cpu, HelpCircle, Activity, Zap, Binary, BookOpen, Clock, X, Maximize2, Minimize2, Layers } from 'lucide-react';

interface PinDefinition {
  num: number;
  minName: string;
  maxName: string;
  category: 'address-data' | 'control' | 'status' | 'power-clock';
  desc: string;
}

const pinDefs: PinDefinition[] = [
  { num: 1, minName: 'GND', maxName: 'GND', category: 'power-clock', desc: 'Ground pin. Used for reference potential.' },
  { num: 2, minName: 'AD14', maxName: 'AD14', category: 'address-data', desc: 'Address/Data Bus Bit 14. Demultiplexed into address bit A14 or data bit D14.' },
  { num: 3, minName: 'AD13', maxName: 'AD13', category: 'address-data', desc: 'Address/Data Bus Bit 13. Demultiplexed into address bit A13 or data bit D13.' },
  { num: 4, minName: 'AD12', maxName: 'AD12', category: 'address-data', desc: 'Address/Data Bus Bit 12. Demultiplexed into address bit A12 or data bit D12.' },
  { num: 5, minName: 'AD11', maxName: 'AD11', category: 'address-data', desc: 'Address/Data Bus Bit 11. Demultiplexed into address bit A11 or data bit D11.' },
  { num: 6, minName: 'AD10', maxName: 'AD10', category: 'address-data', desc: 'Address/Data Bus Bit 10. Demultiplexed into address bit A10 or data bit D10.' },
  { num: 7, minName: 'AD9', maxName: 'AD9', category: 'address-data', desc: 'Address/Data Bus Bit 9. Demultiplexed into address bit A9 or data bit D9.' },
  { num: 8, minName: 'AD8', maxName: 'AD8', category: 'address-data', desc: 'Address/Data Bus Bit 8. Demultiplexed into address bit A8 or data bit D8.' },
  { num: 9, minName: 'AD7', maxName: 'AD7', category: 'address-data', desc: 'Address/Data Bus Bit 7. Demultiplexed into address bit A7 or data bit D7.' },
  { num: 10, minName: 'AD6', maxName: 'AD6', category: 'address-data', desc: 'Address/Data Bus Bit 6. Demultiplexed into address bit A6 or data bit D6.' },
  { num: 11, minName: 'AD5', maxName: 'AD5', category: 'address-data', desc: 'Address/Data Bus Bit 5. Demultiplexed into address bit A5 or data bit D5.' },
  { num: 12, minName: 'AD4', maxName: 'AD4', category: 'address-data', desc: 'Address/Data Bus Bit 4. Demultiplexed into address bit A4 or data bit D4.' },
  { num: 13, minName: 'AD3', maxName: 'AD3', category: 'address-data', desc: 'Address/Data Bus Bit 3. Demultiplexed into address bit A3 or data bit D3.' },
  { num: 14, minName: 'AD2', maxName: 'AD2', category: 'address-data', desc: 'Address/Data Bus Bit 2. Demultiplexed into address bit A2 or data bit D2.' },
  { num: 15, minName: 'AD1', maxName: 'AD1', category: 'address-data', desc: 'Address/Data Bus Bit 1. Demultiplexed into address bit A1 or data bit D1.' },
  { num: 16, minName: 'AD0', maxName: 'AD0', category: 'address-data', desc: 'Address/Data Bus Bit 0 (LSB). Demultiplexed into address bit A0 or data bit D0.' },
  { num: 17, minName: 'NMI', maxName: 'NMI', category: 'control', desc: 'Non-Maskable Interrupt input. It is edge-triggered (low-to-high transition). Cannot be disabled by software.' },
  { num: 18, minName: 'INTR', maxName: 'INTR', category: 'control', desc: 'Interrupt Request. Level-triggered input. Evaluated at the last clock cycle of each instruction. Masked by IF flag.' },
  { num: 19, minName: 'CLK', maxName: 'CLK', category: 'power-clock', desc: 'Clock Input. Provides the basic timing for the processor (typically 5, 8, or 10 MHz).' },
  { num: 20, minName: 'GND', maxName: 'GND', category: 'power-clock', desc: 'Ground pin. Used for reference potential.' },
  
  // Right side (pin 21 is opposite to pin 20)
  { num: 21, minName: 'RESET', maxName: 'RESET', category: 'control', desc: 'System Reset. Clears the flag register, DS, SS, ES, IP and sets CS to FFFFH. Restarts execution.' },
  { num: 22, minName: 'READY', maxName: 'READY', category: 'control', desc: 'Acknowledge signal from slow memory or I/O. If low, processor inserts WAIT states into the bus cycle.' },
  { num: 23, minName: 'TEST', maxName: 'TEST', category: 'control', desc: 'Tested by the WAIT instruction. If TEST is low, execution continues, else the processor waits in an idle state.' },
  { num: 24, minName: 'INTA', maxName: 'QS1', category: 'control', desc: 'Min Mode: Interrupt Acknowledge (active low). Max Mode: Queue Status Pin 1. Indicates the instruction queue status.' },
  { num: 25, minName: 'ALE', maxName: 'QS0', category: 'control', desc: 'Min Mode: Address Latch Enable. High during T1 to latch addresses into 8282 latches. Max Mode: Queue Status Pin 0.' },
  { num: 26, minName: 'DEN', maxName: 'S0', category: 'control', desc: 'Min Mode: Data Enable (active low). Turns on transceiver 8286. Max Mode: Status Pin 0. Indicates start of a bus cycle.' },
  { num: 27, minName: 'DT/R', maxName: 'S1', category: 'control', desc: 'Min Mode: Data Transmit/Receive. Controls data flow direction on transceiver. Max Mode: Status Pin 1.' },
  { num: 28, minName: 'M/IO', maxName: 'S2', category: 'control', desc: 'Min Mode: Memory or I/O selection (Memory when High, I/O when Low). Max Mode: Status Pin 2.' },
  { num: 29, minName: 'WR', maxName: 'LOCK', category: 'control', desc: 'Min Mode: Write Control (active low). Max Mode: Bus Lock signal. Prevents other system controllers from gaining the bus.' },
  { num: 30, minName: 'HLDA', maxName: 'RQ/GT1', category: 'control', desc: 'Min Mode: Hold Acknowledge. Confirms bus release. Max Mode: Request/Grant 1. Bidirectional line for other bus masters.' },
  { num: 31, minName: 'HOLD', maxName: 'RQ/GT0', category: 'control', desc: 'Min Mode: Hold Request. External device requests local bus control. Max Mode: Request/Grant 0. Higher priority than RQ/GT1.' },
  { num: 32, minName: 'RD', maxName: 'RD', category: 'control', desc: 'Read Control (active low). Signals memory or I/O read operation.' },
  { num: 33, minName: 'MN/MX', maxName: 'MN/MX', category: 'power-clock', desc: 'Minimum/Maximum mode selector. Connected to +5V (Vcc) for Minimum Mode, connected to Ground (GND) for Maximum Mode.' },
  { num: 34, minName: 'BHE/S7', maxName: 'BHE/S7', category: 'address-data', desc: 'Bus High Enable / Status S7. Used to enable data on the higher byte of the bus (D8-D15). Status S7 remains low.' },
  { num: 35, minName: 'A19/S6', maxName: 'A19/S6', category: 'address-data', desc: 'Address bit 19 / Status S6. Demultiplexed. S6 is always low (indicates 8086 is controller of bus).' },
  { num: 36, minName: 'A18/S5', maxName: 'A18/S5', category: 'address-data', desc: 'Address bit 18 / Status S5. S5 indicates the state of the Interrupt Enable Flag.' },
  { num: 37, minName: 'A17/S4', maxName: 'A17/S4', category: 'address-data', desc: 'Address bit 17 / Status S4. S3 & S4 indicate which segment register is being accessed for the current bus cycle.' },
  { num: 38, minName: 'A16/S3', maxName: 'A16/S3', category: 'address-data', desc: 'Address bit 16 / Status S3. S3 & S4 encoding: 00=Extra, 01=Stack, 10=Code/None, 11=Data Segment.' },
  { num: 39, minName: 'AD15', maxName: 'AD15', category: 'address-data', desc: 'Address/Data Bus Bit 15. Demultiplexed into address bit A15 or data bit D15.' },
  { num: 40, minName: 'Vcc', maxName: 'Vcc', category: 'power-clock', desc: 'Power Supply input. Requires regulated +5V DC.' }
];

export interface SignalGroupInfo {
  id: 'address-data' | 'control' | 'status' | 'power-clock';
  name: string;
  pins: string;
  colorClass: string;
  dotColorClass: string;
  textColorClass: string;
  borderColorClass: string;
  accentColorClass: string;
  electricalFunction: string;
  timingSignificance: string;
}

export const signalGroupData: Record<'address-data' | 'control' | 'status' | 'power-clock', SignalGroupInfo> = {
  'address-data': {
    id: 'address-data',
    name: 'Address / Data Bus (AD Bus)',
    pins: 'AD0 - AD15 (Pins 2-16, 39), A16/S3 - A19/S6 (Pins 35-38), BHE/S7 (Pin 34)',
    colorClass: 'bg-blue-50 border-blue-200 text-blue-950',
    dotColorClass: 'bg-blue-500 border-blue-600',
    textColorClass: 'text-blue-900',
    borderColorClass: 'border-blue-200',
    accentColorClass: 'text-blue-600',
    electricalFunction: 'A 20-line time-multiplexed tristate bidirectional bus. Operates at standard TTL levels (+5V logical high). To conserve physically limited chip package pins, the lower 16 lines carry both memory address and data information alternately.',
    timingSignificance: '• T1 State: Asserted with the 20-bit physical memory address. External latch chips (e.g. 8282) are strobed via the ALE signal to latch the address. \n• T2 State: Switches direction or "turns around" from Address to Data mode. The bus goes to high-impedance (Hi-Z) for write-to-read transition to prevent bus contention.\n• T3 & T4 States: Actively carries physical 16-bit read/write data (D0-D15) while the upper pins (A16-A19) multiplex output status bits (S3-S6).'
  },
  'control': {
    id: 'control',
    name: 'Control Signals',
    pins: 'ALE (Pin 25), RD (Pin 32), WR (Pin 29), DEN (Pin 26), DT/R (Pin 27), M/IO (Pin 28), READY (Pin 22), RESET (Pin 21), TEST (Pin 23), NMI (Pin 17), INTR (Pin 18)',
    colorClass: 'bg-amber-50 border-amber-200 text-amber-950',
    dotColorClass: 'bg-amber-500 border-amber-600',
    textColorClass: 'text-amber-900',
    borderColorClass: 'border-amber-200',
    accentColorClass: 'text-amber-600',
    electricalFunction: 'Active-low and active-high coordination lines. Controls bus timing direction, transceiver enable/disable, interrupt request lines, and peripheral read/write handshakes.',
    timingSignificance: '• T1 State: Asserts ALE (Address Latch Enable) high as a sharp pulse to lock the multiplexed address. Triggers DT/R high for write or low for read to set line transceiver buffers.\n• T2 State: Drives DEN (Data Enable) active-low to turn on external transceivers, and pulls RD (Read) or WR (Write) low to execute the memory or I/O interface action.\n• T3 State: Samples the READY input line. If slow memories pull READY low, the CPU inserts continuous wait states (Tw) to hold the cycle.\n• T4 State: Pulls RD/WR control and DEN high to safely commit data and complete the transaction.'
  },
  'status': {
    id: 'status',
    name: 'Status Signals',
    pins: 'S0, S1, S2 (Pins 26-28 in Max Mode), S3-S6 (Multiplexed on Pins 35-38), QS0, QS1 (Pins 25, 24 in Max Mode)',
    colorClass: 'bg-purple-50 border-purple-200 text-purple-950',
    dotColorClass: 'bg-purple-500 border-purple-600',
    textColorClass: 'text-purple-900',
    borderColorClass: 'border-purple-200',
    accentColorClass: 'text-purple-600',
    electricalFunction: 'Indicates the internal execution state of the processor, currently accessed memory segment segment, queue operations, or processor interrupt flags.',
    timingSignificance: '• T1 & T2 States: S0, S1, S2 (Maximum Mode) are asserted to inform the external 8288 Bus Controller of the cycle type (e.g., Code Fetch, Memory Read, I/O Write). This is intercepted to generate system timing.\n• T2 - T4 States: S3 & S4 encode which active Segment Register is currently driving the BIU: 00=Extra Segment (ES), 01=Stack (SS), 10=Code (CS) or None, 11=Data Segment (DS). S5 reflects the current state of the Interrupt Enable Flag.'
  },
  'power-clock': {
    id: 'power-clock',
    name: 'Power & Clock (Power/Clk)',
    pins: 'Vcc (Pin 40), GND (Pins 1 & 20), CLK (Pin 19), MN/MX (Pin 33)',
    colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    dotColorClass: 'bg-emerald-500 border-emerald-600',
    textColorClass: 'text-emerald-900',
    borderColorClass: 'border-emerald-200',
    accentColorClass: 'text-emerald-600',
    electricalFunction: 'Continuous electricity supply (regulated +5V Vcc and GND references), hardware mode strapping configuration, and main master clock timing reference.',
    timingSignificance: '• CLK (Input): Dictates the basic frequency of the CPU (typically 5 MHz). One full clock cycle constitutes one T-state (T1, T2, T3, T4). All internal registers and execution steps transition on the rising edge of CLK.\n• RESET (Input): Must be asserted high for at least 4 CLK cycles to reboot the system. Upon falling, sets IP to 0000H and CS to FFFFH to fetch the first bootstrap instruction.\n• MN/MX (Input): Wired to Vcc (+5V) to enable Minimum Mode, or GND (0V) to enable Maximum Mode, altering the physical decoding of pins 24-31.'
  }
};

const modeThemes = {
  minimum: {
    border: 'border-amber-200/80',
    bg: 'bg-white',
    accent: 'text-amber-600',
    bannerBg: 'bg-white',
    bannerBorder: 'border-amber-100',
    accentBtn: 'bg-amber-600 text-white hover:bg-amber-700',
    chipGlow: 'shadow-amber-500/5',
    chipBorder: 'border-amber-900/30',
  },
  maximum: {
    border: 'border-purple-200/80',
    bg: 'bg-white',
    accent: 'text-purple-600',
    bannerBg: 'bg-white',
    bannerBorder: 'border-purple-100',
    accentBtn: 'bg-purple-600 text-white hover:bg-purple-700',
    chipGlow: 'shadow-purple-500/5',
    chipBorder: 'border-purple-900/30',
  },
  combined: {
    border: 'border-indigo-200/80',
    bg: 'bg-white',
    accent: 'text-indigo-600',
    bannerBg: 'bg-white',
    bannerBorder: 'border-indigo-100/80',
    accentBtn: 'bg-indigo-600 text-white hover:bg-indigo-700',
    chipGlow: 'shadow-indigo-500/5',
    chipBorder: 'border-indigo-950/40',
  }
};

export default function PinConfigurationSimulator() {
  const [selectedPinNum, setSelectedPinNum] = useState<number>(33); // Default MN/MX pin
  const [mode, setMode] = useState<'minimum' | 'maximum' | 'combined'>('combined');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [panelTab, setPanelTab] = useState<'inspector' | 'divisions' | 'maxmode'>('inspector');
  const [hoveredGroup, setHoveredGroup] = useState<'address-data' | 'control' | 'status' | 'power-clock' | null>(null);
  const [showInterconnectModal, setShowInterconnectModal] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<'T1_ADDRESS' | 'T2_T4_DATA'>('T1_ADDRESS');
  const [interconnectAction, setInterconnectAction] = useState<'READ' | 'WRITE'>('READ');
  const [isInterconnectMaximized, setIsInterconnectMaximized] = useState<boolean>(false);
  const [interconnectDevice, setInterconnectDevice] = useState<'MEMORY' | 'IO'>('MEMORY');
  const [interconnectMode, setInterconnectMode] = useState<'MIN' | 'MAX'>('MIN');

  // Interactive Maximum Mode Decoder States
  const [maxStatusVal, setMaxStatusVal] = useState<number>(5); // Default: 5 (Memory Read)
  const [maxQueueVal, setMaxQueueVal] = useState<number>(0); // Default: 0 (No Operation)
  const [maxLockActive, setMaxLockActive] = useState<boolean>(false); // Default: false
  const [maxReqGrantState, setMaxReqGrantState] = useState<'none' | 'rq0' | 'rq1'>('none'); // Default: none

  // Stack operation simulation states
  const [stackOp, setStackOp] = useState<'idle' | 'push' | 'pop'>('idle');
  const [stackPointer, setStackPointer] = useState<number>(0x1000);
  const [stackRegisterAX, setStackRegisterAX] = useState<string>('5E7Ah');
  const [stackMemory, setStackMemory] = useState<Array<{ addr: number, val: string, comment?: string }>>([
    { addr: 0x0FFA, val: '0000h', comment: 'Empty space' },
    { addr: 0x0FFC, val: '0000h', comment: 'Empty space' },
    { addr: 0x0FFE, val: '55AAh', comment: 'Previous Stack Frame' },
    { addr: 0x1000, val: 'ABCDh', comment: 'Bottom of Stack' },
    { addr: 0x1002, val: '9F20h', comment: 'Calling Frame Link' },
  ]);

  const handlePush = () => {
    if (stackPointer <= 0x0FFA) {
      return; // Stack is full
    }
    const targetAddr = stackPointer - 2;
    setStackOp('push');
    setMaxStatusVal(6); // 110: Memory Write
    setStackPointer(targetAddr);
    setStackMemory(prev => prev.map(item => {
      if (item.addr === targetAddr) {
        return { ...item, val: stackRegisterAX, comment: 'Pushed AX value' };
      }
      return item;
    }));
  };

  const handlePop = () => {
    if (stackPointer >= 0x1002) {
      return; // Stack is empty (at limit of simulation)
    }
    setStackOp('pop');
    setMaxStatusVal(5); // 101: Memory Read
    const poppedItem = stackMemory.find(item => item.addr === stackPointer);
    if (poppedItem) {
      setStackRegisterAX(poppedItem.val);
    }
    const targetAddr = stackPointer + 2;
    setStackPointer(targetAddr);
    setStackMemory(prev => prev.map(item => {
      if (item.addr === stackPointer) {
        return { ...item, comment: 'Popped / Inactive' };
      }
      return item;
    }));
  };

  const handleResetStack = () => {
    setStackOp('idle');
    setStackPointer(0x1000);
    setStackRegisterAX('5E7Ah');
    setStackMemory([
      { addr: 0x0FFA, val: '0000h', comment: 'Empty space' },
      { addr: 0x0FFC, val: '0000h', comment: 'Empty space' },
      { addr: 0x0FFE, val: '55AAh', comment: 'Previous Stack Frame' },
      { addr: 0x1000, val: 'ABCDh', comment: 'Bottom of Stack' },
      { addr: 0x1002, val: '9F20h', comment: 'Calling Frame Link' },
    ]);
  };

  const selectedPin = pinDefs.find(p => p.num === selectedPinNum);
  const currentTheme = modeThemes[mode];

  const getPinColor = (p: PinDefinition) => {
    const isDual = p.minName !== p.maxName;
    const isFiltered = categoryFilter === 'all' || p.category === categoryFilter;

    if (p.num === selectedPinNum) {
      if (mode === 'minimum') return 'bg-amber-600 text-white font-bold scale-[1.03] shadow-md border-amber-700 ring-2 ring-amber-300/30 z-10';
      if (mode === 'maximum') return 'bg-purple-600 text-white font-bold scale-[1.03] shadow-md border-purple-700 ring-2 ring-purple-300/30 z-10';
      return 'bg-indigo-600 text-white font-bold scale-[1.03] shadow-md border-indigo-700 ring-2 ring-indigo-300/30 z-10';
    }

    if (!isFiltered) return 'opacity-30 border-slate-100 bg-slate-50/50 text-slate-400';

    if (isDual) {
      if (mode === 'minimum') {
        return 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-900 font-semibold';
      }
      if (mode === 'maximum') {
        return 'bg-purple-50 hover:bg-purple-100/80 border-purple-200 text-purple-900 font-semibold';
      }
      // Combined mode
      return 'bg-indigo-50/30 hover:bg-indigo-50/70 border-indigo-100/80 text-slate-800 font-medium';
    }

    switch (p.category) {
      case 'address-data':
        return 'bg-blue-50/80 hover:bg-blue-100/95 border-blue-200/70 text-blue-900';
      case 'control':
        return 'bg-amber-50/50 hover:bg-amber-100/80 border-amber-200/60 text-amber-900';
      case 'status':
        return 'bg-purple-50/50 hover:bg-purple-100/80 border-purple-200/60 text-purple-900';
      case 'power-clock':
        return 'bg-emerald-50/80 hover:bg-emerald-100/95 border-emerald-200/70 text-emerald-900';
      default:
        return 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';
    }
  };

  const pinsLeft = pinDefs.filter(p => p.num <= 20);
  const pinsRight = pinDefs.filter(p => p.num > 20).sort((a, b) => b.num - a.num); // 40 to 21

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl shadow-xs border transition-all duration-300 ${currentTheme.border} overflow-hidden`}>
      {/* Settings / Mode bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-3 border-b transition-all duration-300 ${currentTheme.border} ${currentTheme.bg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Settings className={`w-4 h-4 ${currentTheme.accent}`} />
            <span className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">Mode Configuration:</span>
          </div>
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 self-start">
            <button
              onClick={() => setMode('combined')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'combined' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Combined View (All Pins)
            </button>
            <button
              onClick={() => setMode('minimum')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'minimum' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Minimum Mode (+5V)
            </button>
            <button
              onClick={() => setMode('maximum')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'maximum' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maximum Mode (GND)
            </button>
          </div>
        </div>

        {/* Legend with interactive detailed hover tooltips */}
        <div className="relative flex flex-wrap items-center gap-2 text-[10px] font-mono z-30">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block sm:inline mr-1">
            Signal Groups (Hover/Tap):
          </span>
          
          <button
            onMouseEnter={() => setHoveredGroup('address-data')}
            onMouseLeave={() => setHoveredGroup(null)}
            onClick={() => {
              setCategoryFilter(categoryFilter === 'address-data' ? 'all' : 'address-data');
              setHoveredGroup(hoveredGroup === 'address-data' ? null : 'address-data');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              categoryFilter === 'address-data' || hoveredGroup === 'address-data'
                ? 'bg-blue-100 border-blue-300 text-blue-900 shadow-xs font-semibold'
                : 'bg-blue-50/50 border-blue-100/70 text-blue-800 hover:bg-blue-50'
            }`}
          >
            <span className="w-2 h-2 bg-blue-500 border border-blue-600 rounded-sm inline-block shrink-0"></span>
            <span>AD Bus</span>
            <HelpCircle className="w-2.5 h-2.5 text-blue-500 opacity-60" />
          </button>

          <button
            onMouseEnter={() => setHoveredGroup('control')}
            onMouseLeave={() => setHoveredGroup(null)}
            onClick={() => {
              setCategoryFilter(categoryFilter === 'control' ? 'all' : 'control');
              setHoveredGroup(hoveredGroup === 'control' ? null : 'control');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              categoryFilter === 'control' || hoveredGroup === 'control'
                ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs font-semibold'
                : 'bg-amber-50/50 border-amber-100/70 text-amber-900 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 bg-amber-500 border border-amber-600 rounded-sm inline-block shrink-0"></span>
            <span>Control</span>
            <HelpCircle className="w-2.5 h-2.5 text-amber-500 opacity-60" />
          </button>

          <button
            onMouseEnter={() => setHoveredGroup('status')}
            onMouseLeave={() => setHoveredGroup(null)}
            onClick={() => {
              setCategoryFilter(categoryFilter === 'status' ? 'all' : 'status');
              setHoveredGroup(hoveredGroup === 'status' ? null : 'status');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              categoryFilter === 'status' || hoveredGroup === 'status'
                ? 'bg-purple-100 border-purple-300 text-purple-950 shadow-xs font-semibold'
                : 'bg-purple-50/50 border-purple-100/70 text-purple-900 hover:bg-purple-50'
            }`}
          >
            <span className="w-2 h-2 bg-purple-500 border border-purple-600 rounded-sm inline-block shrink-0"></span>
            <span>Status</span>
            <HelpCircle className="w-2.5 h-2.5 text-purple-500 opacity-60" />
          </button>

          <button
            onMouseEnter={() => setHoveredGroup('power-clock')}
            onMouseLeave={() => setHoveredGroup(null)}
            onClick={() => {
              setCategoryFilter(categoryFilter === 'power-clock' ? 'all' : 'power-clock');
              setHoveredGroup(hoveredGroup === 'power-clock' ? null : 'power-clock');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              categoryFilter === 'power-clock' || hoveredGroup === 'power-clock'
                ? 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-xs font-semibold'
                : 'bg-emerald-50/50 border-emerald-100/70 text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 bg-emerald-500 border border-emerald-600 rounded-sm inline-block shrink-0"></span>
            <span>Power/Clk</span>
            <HelpCircle className="w-2.5 h-2.5 text-emerald-500 opacity-60" />
          </button>

          {/* Group Tooltip Absolute Overlay */}
          <AnimatePresence>
            {hoveredGroup && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHoveredGroup(hoveredGroup)}
                onMouseLeave={() => setHoveredGroup(null)}
                className={`absolute top-full right-0 mt-3 z-50 w-full sm:w-[500px] bg-white border rounded-xl shadow-2xl p-4.5 space-y-3.5 transition-all text-left ${
                  signalGroupData[hoveredGroup].borderColorClass
                } ${signalGroupData[hoveredGroup].colorClass}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${signalGroupData[hoveredGroup].dotColorClass}`}></span>
                    <h4 className="font-display font-bold text-sm text-slate-800">
                      {signalGroupData[hoveredGroup].name}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredGroup(null);
                    }}
                    className="p-1 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details Section */}
                <div className="space-y-3 text-[11.5px] leading-normal font-sans">
                  {/* Electrical Function */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Electrical Function:</span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      {signalGroupData[hoveredGroup].electricalFunction}
                    </p>
                  </div>

                  {/* Timing Significance */}
                  <div className="space-y-1 pt-1.5 border-t border-slate-200/50">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Timing &amp; Bus Cycle States:</span>
                    </div>
                    <p className="text-slate-700 font-medium whitespace-pre-line">
                      {signalGroupData[hoveredGroup].timingSignificance}
                    </p>
                  </div>
                </div>

                {/* Associated Pins */}
                <div className="bg-white/80 border border-slate-200/40 rounded-lg p-2 font-mono text-[9.5px]">
                  <span className="font-bold text-slate-500 block mb-0.5">Associated Pins:</span>
                  <div className="text-slate-800 break-words leading-relaxed">
                    {signalGroupData[hoveredGroup].pins}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto">
        {/* DIP-40 Package Representation */}
        <div className={`lg:col-span-5 bg-slate-50/60 rounded-2xl border transition-all duration-300 ${currentTheme.border} p-6 flex items-center justify-center relative min-h-[720px] shadow-sm`}>
          <div className="absolute top-3 left-4 flex gap-2">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">8086 DIP-40 Package View</span>
          </div>

          {/* Chip visual */}
          <div className="flex items-stretch gap-5 w-full max-w-xl h-full relative">
            {/* Left Pins (1 to 20) */}
            <div className="flex flex-col justify-between py-2 space-y-1.5 w-1/3">
              {pinsLeft.map(p => {
                const name = mode === 'minimum' ? p.minName : p.maxName;
                const isFiltered = categoryFilter === 'all' || p.category === categoryFilter;
                return (
                  <button
                    key={p.num}
                    onClick={() => setSelectedPinNum(p.num)}
                    onMouseEnter={() => setSelectedPinNum(p.num)}
                    className={`relative text-left text-xs h-8 px-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${getPinColor(p)} ${
                      !isFiltered ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    {/* Metal Lead / Prong */}
                    <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-5 h-[3px] bg-slate-300 border-y border-slate-400/50 z-0 pointer-events-none"></div>
                    <span className="font-mono font-bold text-[10px] opacity-40 shrink-0 z-10">{p.num}</span>
                    <span className="font-mono text-xs truncate ml-1 z-10">{name}</span>
                  </button>
                );
              })}
            </div>

            {/* Central Chip Body */}
            <div className={`flex-1 bg-zinc-900 border-4 border-zinc-950 rounded-xl relative flex flex-col items-center justify-between py-6 text-zinc-400 text-center shadow-lg px-2 transition-all duration-300 ${
              mode === 'minimum' ? 'ring-2 ring-amber-500/20' :
              mode === 'maximum' ? 'ring-2 ring-purple-500/20' :
              'ring-2 ring-indigo-500/20'
            }`}>
              {/* Notch at the top */}
              <div className="w-6 h-3 bg-zinc-950 rounded-b-lg absolute top-0 left-1/2 -translate-x-1/2"></div>

              {/* Text on chip */}
              <div className="mt-4 font-mono font-bold tracking-widest text-[11px] text-zinc-500">
                INTEL &apos;78
              </div>

              <div className="flex flex-col items-center">
                <Cpu className={`w-8 h-8 mb-1 transition-colors ${
                  mode === 'minimum' ? 'text-amber-500/75' :
                  mode === 'maximum' ? 'text-purple-500/75' :
                  'text-indigo-500/75'
                }`} />
                <span className="font-display font-black text-white text-base tracking-widest">i8086</span>
                <span className="font-mono text-[9px] text-zinc-500 mt-1 uppercase">16-Bit HMOS MPU</span>
              </div>

              {/* Pin index pointer */}
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 absolute bottom-3 left-3 border border-zinc-800"></div>

              <div className="text-[9px] font-mono text-zinc-600">
                40-PIN DUAL IN-LINE
              </div>
            </div>

            {/* Right Pins (40 to 21, rendered from 40 down to 21) */}
            <div className="flex flex-col justify-between py-2 space-y-1.5 w-1/3">
              {pinsRight.map(p => {
                const name = mode === 'minimum' ? p.minName : p.maxName;
                const isFiltered = categoryFilter === 'all' || p.category === categoryFilter;
                const isDual = p.minName !== p.maxName;

                return (
                  <button
                    key={p.num}
                    onClick={() => setSelectedPinNum(p.num)}
                    onMouseEnter={() => setSelectedPinNum(p.num)}
                    className={`relative text-right text-xs h-8 px-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${getPinColor(p)} ${
                      !isFiltered ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    {/* Metal Lead / Prong */}
                    <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-5 h-[3px] bg-slate-300 border-y border-slate-400/50 z-0 pointer-events-none"></div>
                    {mode === 'combined' && isDual ? (
                      <span className="font-mono text-[9px] truncate mr-1 flex items-center gap-1 flex-wrap justify-end z-10">
                        <span className="text-amber-700 font-bold bg-amber-50/80 border border-amber-200/60 px-1 py-0.2 rounded text-[8px] md:text-[9px] leading-none">
                          {p.minName}
                        </span>
                        <span className="text-slate-400 font-normal">/</span>
                        <span className="text-purple-700 font-bold bg-purple-50/80 border border-purple-200/60 px-1 py-0.2 rounded text-[8px] md:text-[9px] leading-none">
                          {p.maxName}
                        </span>
                      </span>
                    ) : (
                      <span className="font-mono text-xs truncate mr-1 z-10">{name}</span>
                    )}
                    <span className="font-mono font-bold text-[10px] opacity-40 shrink-0 z-10">{p.num}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Description Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className={`bg-white rounded-xl border transition-all duration-300 ${currentTheme.border} p-4 space-y-4 h-full flex flex-col justify-between shadow-xs`}>
            <div>
              {/* Educational Tab Switcher */}
              <div className="flex border-b border-slate-100 pb-2 mb-4 gap-1">
                <button
                  onClick={() => setPanelTab('inspector')}
                  className={`flex-1 pb-2 text-[10px] sm:text-xs font-bold uppercase tracking-tight text-center border-b-2 transition-all cursor-pointer ${
                    panelTab === 'inspector'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  📍 Pin Inspector
                </button>
                <button
                  onClick={() => setPanelTab('divisions')}
                  className={`flex-1 pb-2 text-[10px] sm:text-xs font-bold uppercase tracking-tight text-center border-b-2 transition-all cursor-pointer ${
                    panelTab === 'divisions'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  📚 Divisions Guide
                </button>
                <button
                  onClick={() => setPanelTab('maxmode')}
                  className={`flex-1 pb-2 text-[10px] sm:text-xs font-bold uppercase tracking-tight text-center border-b-2 transition-all cursor-pointer ${
                    panelTab === 'maxmode'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  ⚙️ Max Mode
                </button>
              </div>

              {panelTab === 'inspector' ? (
                <>
                  {/* Category selector filter */}
                  <div className="mb-4 animate-in fade-in duration-150">
                    <span className="text-xs font-semibold text-slate-500 block mb-1.5">Filter Pins by Category:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'all', label: 'All Pins' },
                        { id: 'address-data', label: 'Addr/Data Bus' },
                        { id: 'control', label: 'Control Signals' },
                        { id: 'status', label: 'Status Signals' },
                        { id: 'power-clock', label: 'Power & Clock' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setCategoryFilter(cat.id)}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all text-left border cursor-pointer ${
                            categoryFilter === cat.id
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <AnimatePresence mode="wait">
                      {selectedPin ? (
                        <motion.div
                          key={selectedPin.num}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.12 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xl font-bold border px-2.5 py-1 rounded-lg ${
                              mode === 'minimum' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                              mode === 'maximum' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                              'bg-indigo-50 border-indigo-100 text-indigo-700'
                            }`}>
                              Pin {selectedPin.num}
                            </span>
                            <div>
                              <div className="font-display font-bold text-lg text-slate-800">
                                {mode === 'minimum' ? selectedPin.minName : selectedPin.maxName}
                              </div>
                              <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold inline-block ${
                                selectedPin.category === 'address-data' ? 'bg-blue-100 text-blue-800' :
                                selectedPin.category === 'control' ? 'bg-amber-100 text-amber-800' :
                                selectedPin.category === 'status' ? 'bg-purple-100 text-purple-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {selectedPin.category.replace('-', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Display warning if pin has dual functionality in different modes */}
                          {selectedPin.minName !== selectedPin.maxName && (
                            <div className={`border text-xs p-3.5 rounded-xl flex items-start gap-2.5 transition-all duration-300 ${
                              mode === 'minimum' ? 'bg-white border-amber-200/60 text-amber-950 shadow-xs' :
                              mode === 'maximum' ? 'bg-white border-purple-200/60 text-purple-950 shadow-xs' :
                              'bg-white border-indigo-200/60 text-indigo-950 shadow-xs'
                            }`}>
                              <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${
                                mode === 'minimum' ? 'text-amber-600' :
                                mode === 'maximum' ? 'text-purple-600' :
                                'text-indigo-600'
                              }`} />
                              <div>
                                <span className="font-bold">Dual-Function Pin:</span> 
                                <div className="mt-1 space-y-1.5">
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-800 px-1.5 py-0.2 rounded font-bold">MIN MODE:</span>
                                    <strong className="text-amber-700">{selectedPin.minName}</strong>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <span className="text-[10px] bg-purple-100 border border-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-bold">MAX MODE:</span>
                                    <strong className="text-purple-700">{selectedPin.maxName}</strong>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Pin Description & Function</span>
                            <p className="text-slate-600 text-sm leading-relaxed mt-1">
                              {selectedPin.desc}
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Hover over or click any pin on the processor to explore its hardware functionality.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : panelTab === 'divisions' ? (
                /* Signal Divisions Guide Tab Content */
                <div className="space-y-5 animate-in fade-in duration-150 overflow-y-auto max-h-[460px] pr-1">
                  <div className="text-sm text-slate-700 font-medium leading-relaxed mb-2 pb-2.5 border-b border-slate-150">
                    The 8086 pins are functional signal lines grouped into five key hardware divisions to manage processor operations:
                  </div>

                  {/* 1. AD Bus */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3 transition-all duration-300 hover:shadow-xs shadow-2xs">
                    <div className="flex flex-row items-center justify-between gap-3 border-b border-blue-100/60 pb-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500 text-white rounded-lg shadow-sm">
                          <Layers className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-sm sm:text-base font-black text-blue-950 tracking-tight">
                          1. Address / Data Bus (AD Bus)
                        </span>
                      </div>
                      <span className="text-[11px] bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wide shrink-0">
                        Multiplexed
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-semibold">
                      To minimize pin count, the 8086 uses <strong>time multiplexing</strong>. High-speed lines share both addresses and data.
                    </p>
                    <ul className="text-sm text-slate-700 space-y-2 pl-1">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                        <span><strong>T1 State:</strong> Carries 20-bit memory address (AD0-AD15, A16-A19).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                        <span><strong>T2 - T4 States:</strong> Carries 16-bit physical data (D0-D15) or Status bits (S3-S7).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                        <span><strong>Key Pins:</strong> <code className="font-mono bg-blue-100/80 px-1.5 py-0.5 rounded text-xs text-blue-900 font-extrabold">AD0 - AD15 (Pins 2-16, 39)</code>, <code className="font-mono bg-blue-100/80 px-1.5 py-0.5 rounded text-xs text-blue-900 font-extrabold">A16/S3 - A19/S6 (Pins 35-38)</code>.</span>
                      </li>
                    </ul>

                    {/* Interactive diagram card link */}
                    <div className="mt-3 bg-white border border-blue-150 rounded-xl p-3.5 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                          <Activity className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">External Interconnect Diagram</span>
                          <span className="text-[11px] text-slate-600 font-semibold block leading-normal">Interactive signal flow diagram showing how CPU communicates with Memory & I/O.</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowInterconnectModal(true)}
                        className="w-full text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Launch Hardware Interconnect Visualizer</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Control Signals */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3 transition-all duration-300 hover:shadow-xs shadow-2xs">
                    <div className="flex flex-row items-center justify-between gap-3 border-b border-amber-100/60 pb-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-sm">
                          <Settings className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-sm sm:text-base font-black text-amber-950 tracking-tight">
                          2. Control Signals
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wide shrink-0">
                        Coordination
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-semibold">
                      These signals synchronize and dictate the direction of data transfers, external wait requests, and reset.
                    </p>
                    <ul className="text-sm text-slate-700 space-y-2 pl-1">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                        <span><strong>RD / WR:</strong> Active-low controls determining if data is being read or written.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                        <span><strong>ALE (Address Latch Enable):</strong> Triggers external latches to lock in the 20-bit address during T1.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                        <span><strong>DEN & DT/R:</strong> Activates external transceivers and sets direction (Transmitting vs Receiving).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                        <span><strong>M/IO:</strong> High selects Main Memory; Low selects I/O Ports.</span>
                      </li>
                    </ul>
                  </div>

                  {/* 3. Status Signals */}
                  <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-3 transition-all duration-300 hover:shadow-xs shadow-2xs">
                    <div className="flex flex-row items-center justify-between gap-3 border-b border-purple-100/60 pb-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-500 text-white rounded-lg shadow-sm">
                          <Activity className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-sm sm:text-base font-black text-purple-950 tracking-tight">
                          3. Status Signals
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wide shrink-0">
                        CPU State
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-semibold">
                      These bits represent internal CPU settings, current segment register access, or system status in real time.
                    </p>
                    <ul className="text-sm text-slate-700 space-y-2 pl-1">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></span>
                        <span><strong>S0, S1, S2 (Max Mode):</strong> Encodes the type of bus cycle (Read, Write, Halt, Code Fetch).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></span>
                        <span><strong>S3 & S4:</strong> Identifies which segment register is in use: 00 Extra, 01 Stack, 10 Code/None, 11 Data.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></span>
                        <span><strong>S5:</strong> Shows status of Interrupt Enable Flag (IF).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></span>
                        <span><strong>QS0 & QS1:</strong> Tells the system the instruction queue state (e.g. Empty, 1st byte).</span>
                      </li>
                    </ul>
                  </div>

                  {/* 4. Power & Clock Signals */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3 transition-all duration-300 hover:shadow-xs shadow-2xs">
                    <div className="flex flex-row items-center justify-between gap-3 border-b border-emerald-100/60 pb-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-sm">
                          <Zap className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-sm sm:text-base font-black text-emerald-950 tracking-tight">
                          4. Power &amp; Clock (Power/Clk)
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wide shrink-0">
                        Hardware
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-semibold">
                      Provides essential electricity, core reference clock timings, and primary mode straphanger configuration.
                    </p>
                    <ul className="text-sm text-slate-700 space-y-2 pl-1">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                        <span><strong>Vcc / GND:</strong> Power (+5V regulated DC) and grounding references.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                        <span><strong>CLK:</strong> Square wave input synchronizing internal registers and ALU cycles.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                        <span><strong>MN/MX:</strong> Selects Minimum Mode (+5V, standalone CPU) or Maximum Mode (GND, multiprocessor with 8087).</span>
                      </li>
                    </ul>
                  </div>

                  {/* 5. Interrupts, DMA & Bus Arbitration */}
                  <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-3 transition-all duration-300 hover:shadow-xs shadow-2xs">
                    <div className="flex flex-row items-center justify-between gap-3 border-b border-rose-100/60 pb-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-rose-500 text-white rounded-lg shadow-sm">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-sm sm:text-base font-black text-rose-950 tracking-tight">
                          5. Interrupts, DMA &amp; Bus Arbitration
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wide shrink-0">
                        External Async
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-semibold">
                      Handles asynchronous real-time events, direct memory access handshakes, and multi-master bus request/grant arbitration.
                    </p>
                    <ul className="text-sm text-slate-700 space-y-2 pl-1">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                        <span><strong>INTR / NMI:</strong> External hardware interrupts. NMI is non-maskable (highest priority), while INTR can be ignored by clearing IF.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                        <span><strong>HOLD / HLDA (Min Mode):</strong> Direct Memory Access pins where external controllers request bus control.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                        <span><strong>RQ/GT0 / RQ/GT1 (Max Mode):</strong> Bidirectional request/grant lines used by other processors to share buses.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Maximum Mode Interactive Decoder Content */
                <div className="space-y-4 animate-in fade-in duration-150 overflow-y-auto max-h-[460px] pr-1">
                  <div className="text-[12px] text-slate-500 leading-normal mb-1 pb-2 border-b border-slate-150 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Interactive decoder for signals activated specifically when MN/MX pin is grounded (0V).</span>
                  </div>

                  {/* S2, S1, S0 Bus Status Decoder */}
                  <div className="space-y-2 border border-purple-150 rounded-xl p-3 bg-purple-50/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-950 flex items-center gap-1">
                        <Binary className="w-3.5 h-3.5 text-purple-600" />
                        1. S2, S1, S0 Status Inputs (Pins 28, 27, 26)
                      </span>
                      <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">
                        Bus Cycle
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed">
                      The CPU emits a 3-bit status code during T1-T2. The <strong>8288 Bus Controller</strong> decodes this to generate appropriate read/write timing command pulses. Select a state to decode:
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {[
                        { val: 0, s: '000', label: 'Interrupt Acknowledge', cmd: 'INTA is pulled LOW' },
                        { val: 1, s: '001', label: 'Read I/O Port', cmd: '/IORC is pulled LOW' },
                        { val: 2, s: '010', label: 'Write I/O Port', cmd: '/IOWC & /AIOWC pulled LOW' },
                        { val: 3, s: '011', label: 'Halt Processor', cmd: 'No command (High-Z)' },
                        { val: 4, s: '100', label: 'Instruction Fetch', cmd: '/MRDC is pulled LOW' },
                        { val: 5, s: '101', label: 'Read Memory Data', cmd: '/MRDC is pulled LOW' },
                        { val: 6, s: '110', label: 'Write Memory Data', cmd: '/MWTC & /AMWC pulled LOW' },
                        { val: 7, s: '111', label: 'Passive (Idle)', cmd: 'No command (All High)' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => setMaxStatusVal(item.val)}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            maxStatusVal === item.val
                              ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700 px-1 rounded">
                              S2,S1,S0 = {item.s}
                            </span>
                            {maxStatusVal === item.val && (
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                            )}
                          </div>
                          <div className="text-[11px] font-bold mt-1 truncate">{item.label}</div>
                          <div className={`text-[9px] mt-0.5 font-mono ${
                            maxStatusVal === item.val ? 'text-purple-200' : 'text-slate-500'
                          }`}>
                            {item.cmd}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* S2,S1,S0 Detailed Decoded Info Box */}
                    <div className="bg-white border border-purple-100 rounded-xl p-3 space-y-1.5 text-xs text-slate-700 shadow-xs mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          Decoded Bus Operation
                        </span>
                      </div>
                      <div className="leading-relaxed text-[11.5px]">
                        {maxStatusVal === 0 && (
                          <p>
                            <strong>Interrupt Acknowledge (INTA):</strong> The CPU acknowledges a hardware interrupt request. The 8288 Bus Controller will issue two active-low pulses on its <strong>INTA output pin</strong>. This prompts the external interrupt controller (8259A) to place the interrupt vector byte onto the local data bus (D0-D7) so the CPU can read it.
                          </p>
                        )}
                        {maxStatusVal === 1 && (
                          <p>
                            <strong>Read I/O Port:</strong> The CPU is executing an input instruction (such as <code>IN AL, DX</code>). The 8288 Controller decodes the 001 status code and pulls the <strong>/IORC (I/O Read Command)</strong> pin LOW, enabling the target I/O peripheral to drive the data bus.
                          </p>
                        )}
                        {maxStatusVal === 2 && (
                          <p>
                            <strong>Write I/O Port:</strong> The CPU is executing an output instruction (such as <code>OUT DX, AL</code>). The 8288 Controller pulls the <strong>/IOWC (I/O Write Command)</strong> and the <strong>/AIOWC (Advanced I/O Write Command)</strong> pins LOW to write data immediately to the port.
                          </p>
                        )}
                        {maxStatusVal === 3 && (
                          <p>
                            <strong>Halt Processor:</strong> The CPU has executed a <code>HLT</code> instruction and suspends execution. No command pulses are output by the 8288 Bus Controller. All command bus pins remain at high-impedance. The CPU remains dormant until a reset or interrupt occurs.
                          </p>
                        )}
                        {maxStatusVal === 4 && (
                          <p>
                            <strong>Instruction Fetch (Code Access):</strong> The CPU is accessing memory to read instruction opcodes. The 8288 decodes 100 and pulls <strong>/MRDC (Memory Read Command)</strong> LOW. This is distinct from regular data reading, allowing advanced caching systems or co-processors to track execution.
                          </p>
                        )}
                        {maxStatusVal === 5 && (
                          <p>
                            <strong>Read Memory Data:</strong> The CPU is reading data operands from RAM/ROM. The 8288 Controller pulls <strong>/MRDC (Memory Read Command)</strong> LOW to enable the addressed memory device to write data onto the system bus.
                          </p>
                        )}
                        {maxStatusVal === 6 && (
                          <p>
                            <strong>Write Memory Data:</strong> The CPU is storing data in memory. The 8288 Controller pulls <strong>/MWTC (Memory Write)</strong> and <strong>/AMWC (Advanced Memory Write)</strong> LOW. The advanced write signal is asserted one clock period earlier to allow slower memory chips extra set-up time.
                          </p>
                        )}
                        {maxStatusVal === 7 && (
                          <p>
                            <strong>Passive State (Idle):</strong> The CPU has no bus cycle active. All address/data buses are either inactive or performing internal execution. All 8288 Command Outputs remain high (inactive, 5V).
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QS1, QS0 Queue Status Decoder */}
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        2. QS1, QS0 Queue Status (Pins 24, 25)
                      </span>
                      <span className="text-[9px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-mono font-bold">
                        Prefetch Queue
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed">
                      The 8086 has a 6-byte instruction prefetch queue. In Maximum Mode, pins 24 and 25 emit status codes in real time so external co-processors (like the <strong>8087 Math Co-processor</strong>) can sync with the CPU's execution pipeline.
                    </p>

                    <div className="grid grid-cols-4 gap-1.5 mt-2">
                      {[
                        { val: 0, qs: '00', label: 'NOP', desc: 'No queue operation' },
                        { val: 1, qs: '01', label: '1st Byte', desc: 'First byte of opcode' },
                        { val: 2, qs: '10', label: 'Flush', desc: 'Queue was emptied' },
                        { val: 3, qs: '11', label: 'Subseq', desc: 'Subsequent byte' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => setMaxQueueVal(item.val)}
                          className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all ${
                            maxQueueVal === item.val
                              ? 'bg-slate-800 text-white border-slate-950 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1 rounded inline-block">
                            {item.qs}
                          </div>
                          <div className="text-[10.5px] font-bold mt-1 block truncate">{item.label}</div>
                        </button>
                      ))}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 leading-relaxed">
                      {maxQueueVal === 0 && (
                        <p>
                          <strong>NOP (No Operation):</strong> The instruction queue was not accessed in this clock cycle. The CPU is performing bus transfers, calculating memory addresses, or executing an internal cycle.
                        </p>
                      )}
                      {maxQueueVal === 1 && (
                        <p>
                          <strong>First Byte of Opcode:</strong> The byte fetched from the instruction queue is the first byte of an instruction opcode. This is a critical signal for co-processors like the <strong>8087 Numeric Processor Extension</strong>, allowing them to decode floating-point instructions in lockstep with the main CPU.
                        </p>
                      )}
                      {maxQueueVal === 2 && (
                        <p>
                          <strong>Queue Empty (Flush):</strong> The instruction queue has been completely flushed and emptied. This occurs whenever the CPU executes a branch instruction (like <code>JMP</code> or <code>CALL</code>), invalidating all prefetched bytes. The CPU must re-fetch from the new IP destination.
                        </p>
                      )}
                      {maxQueueVal === 3 && (
                        <p>
                          <strong>Subsequent Byte:</strong> The byte fetched from the queue is a subsequent byte of an instruction (e.g. displacement, immediate data, ModR/M byte). It is part of the current multi-byte instruction rather than a new opcode.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* LOCK Pin and RQ/GT Pins Control Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {/* LOCK Pin Control */}
                    <div className="border border-red-150 rounded-xl p-3 bg-red-50/20 space-y-2">
                      <span className="text-[11.5px] font-bold text-red-950 block">3. Bus Lock (/LOCK - Pin 29)</span>
                      <p className="text-[10.5px] text-slate-600 leading-tight">
                        Active-low signal to lock out other processors from taking control of the system bus.
                      </p>
                      <button
                        onClick={() => setMaxLockActive(!maxLockActive)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          maxLockActive
                            ? 'bg-red-600 border-red-700 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {maxLockActive ? "Asserted: /LOCK = 0V (ACTIVE)" : "Deasserted: /LOCK = 5V (IDLE)"}
                      </button>
                      <div className="bg-white border border-red-100 rounded-lg p-2 text-[10px] text-slate-600 leading-normal min-h-[50px]">
                        {maxLockActive ? (
                          <span className="text-red-700 font-medium">
                            🔒 <strong>Bus Secured:</strong> No other processor or coprocessor can gain the bus! Ensures atomic updates of semaphores in multi-processor (multibus) configurations.
                          </span>
                        ) : (
                          "Standard Operation. Bus mastership can be transferred via RQ/GT signals."
                        )}
                      </div>
                    </div>

                    {/* Request/Grant (RQ/GT0, RQ/GT1) Control */}
                    <div className="border border-emerald-150 rounded-xl p-3 bg-emerald-50/20 space-y-2">
                      <span className="text-[11.5px] font-bold text-emerald-950 block">4. Bus Requests (RQ/GT)</span>
                      <p className="text-[10.5px] text-slate-600 leading-tight">
                        Bidirectional lines (Pins 31, 30) for bus mastership. Select request simulation:
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'none', label: 'Idle' },
                          { id: 'rq0', label: 'RQ/GT0' },
                          { id: 'rq1', label: 'RQ/GT1' },
                        ].map((choice) => (
                          <button
                            key={choice.id}
                            onClick={() => setMaxReqGrantState(choice.id as any)}
                            className={`py-1 rounded text-[10px] font-bold cursor-pointer transition-all border ${
                              maxReqGrantState === choice.id
                                ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                      <div className="bg-white border border-emerald-100 rounded-lg p-2 text-[10px] text-slate-600 leading-normal min-h-[50px]">
                        {maxReqGrantState === 'none' && (
                          "No active bus arbitration requests. 8086 remains system bus master."
                        )}
                        {maxReqGrantState === 'rq0' && (
                          <span className="text-emerald-800">
                            ⚡ <strong>RQ/GT0 Active (High Priority):</strong> Asserts higher priority. Connected to coprocessors like the 8087 NDP. The coprocessor requests bus, CPU responds with a grant pulse on the same pin.
                          </span>
                        )}
                        {maxReqGrantState === 'rq1' && (
                          <span className="text-emerald-800">
                            🐢 <strong>RQ/GT1 Active (Low Priority):</strong> Asserts lower priority. Used for secondary I/O processors like 8089. Granted only if RQ/GT0 is not active.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stack Operations (PUSH & POP) */}
                    <div className="space-y-2.5 border border-indigo-150 rounded-xl p-3 bg-indigo-50/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          5. Stack Operations & Segment Status (S3, S4)
                        </span>
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-mono font-bold">
                          PUSH / POP
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-600 leading-relaxed">
                        Executing <code>PUSH</code> and <code>POP</code> instructions targets the Stack Segment (SS). This automatically triggers segment status status lines <strong>S4, S3 = 0, 1</strong> to indicate Stack Segment access, and asserts read/write bus commands.
                      </p>

                      {/* AX input and controls */}
                      <div className="flex items-center justify-between gap-2 bg-white p-2 border border-indigo-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500">AX Register:</span>
                          <input
                            type="text"
                            value={stackRegisterAX}
                            onChange={(e) => setStackRegisterAX(e.target.value.slice(0, 5))}
                            className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            placeholder="5E7Ah"
                          />
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={handlePush}
                            disabled={stackPointer <= 0x0FFA}
                            className="px-2.5 py-1 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-405 disabled:cursor-not-allowed rounded text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                          >
                            📥 PUSH AX
                          </button>
                          <button
                            onClick={handlePop}
                            disabled={stackPointer >= 0x1002}
                            className="px-2.5 py-1 bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-100 disabled:text-slate-405 disabled:cursor-not-allowed rounded text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                          >
                            📤 POP AX
                          </button>
                          <button
                            onClick={handleResetStack}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-all cursor-pointer"
                            title="Reset Stack"
                          >
                            🔄
                          </button>
                        </div>
                      </div>

                      {/* Stack Memory Layout Display */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white border border-indigo-100 rounded-xl p-3 shadow-2xs">
                        {/* Left: Memory visualization */}
                        <div className="md:col-span-6 space-y-1 font-mono text-[10px]">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Stack Memory (RAM)</span>
                          {stackMemory.map((item) => {
                            const isTOS = item.addr === stackPointer;
                            return (
                              <div
                                key={item.addr}
                                className={`flex items-center justify-between p-1.5 rounded-lg border transition-all gap-2 ${
                                  isTOS
                                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold shadow-xs'
                                    : 'border-slate-100 bg-slate-50/20 text-slate-600 hover:bg-slate-50/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`w-3.5 h-3.5 flex items-center justify-center rounded-full text-[9px] shrink-0 ${isTOS ? "text-amber-600 bg-amber-100 font-black animate-pulse" : "text-slate-300"}`}>
                                    {isTOS ? "➔" : " "}
                                  </span>
                                  <span className="font-extrabold font-mono text-[10px] text-slate-800 shrink-0">SS:{item.addr.toString(16).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-2 min-w-0 shrink-0">
                                  <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] border shrink-0 ${isTOS ? "bg-amber-100/80 border-amber-200 text-amber-950" : "bg-slate-50 border-slate-100 text-slate-600"}`}>{item.val}</span>
                                  <span className="text-[10px] text-slate-450 font-sans italic truncate max-w-[100px] sm:max-w-[150px] text-right" title={item.comment}>
                                    {isTOS ? "Top of Stack" : item.comment}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Right: Signal state decode */}
                        <div className="md:col-span-6 flex flex-col justify-between text-xs space-y-2 bg-slate-50/50 rounded-lg p-2.5 border border-slate-150">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Real-time Signals Decoded</span>
                            <div className="space-y-1.5 font-mono text-[11px]">
                              <div className="flex justify-between items-center bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                <span className="text-slate-500">S4, S3 Pins:</span>
                                <span className="text-indigo-600 font-black">0, 1 (Stack Segment)</span>
                              </div>
                              <div className="flex justify-between items-center bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                <span className="text-slate-500">S2,S1,S0 Code:</span>
                                <span className="text-purple-600 font-black">
                                  {stackOp === 'push' ? '110 (Write Memory)' : stackOp === 'pop' ? '101 (Read Memory)' : '111 (Passive)'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                <span className="text-slate-500">8288 Cmd Bus:</span>
                                <span className="text-emerald-600 font-bold text-[10px]">
                                  {stackOp === 'push' ? '/MWTC, /AMWC Low' : stackOp === 'pop' ? '/MRDC Low' : 'All Command Pins High'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                <span className="text-slate-500">DT/R Direction:</span>
                                <span className="text-amber-600 font-bold">
                                  {stackOp === 'push' ? 'HIGH (Write Out)' : stackOp === 'pop' ? 'LOW (Read In)' : 'High-Z'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-[10px] leading-tight text-slate-500 border-t border-slate-200/60 pt-1.5">
                            {stackOp === 'push' && (
                              <p className="text-indigo-700 font-medium">
                                📥 <strong>PUSH:</strong> CPU decremented SP, broadcasted address, and drove <code>{stackRegisterAX}</code> onto AD0-AD15. 8288 pulled <strong>/MWTC</strong> low to latch it.
                              </p>
                            )}
                            {stackOp === 'pop' && (
                              <p className="text-violet-700 font-medium">
                                📤 <strong>POP:</strong> CPU asserted <strong>/MRDC</strong>. RAM responded by driving the stack value onto AD0-AD15. CPU read it into AX and then incremented SP.
                              </p>
                            )}
                            {stackOp === 'idle' && (
                              <p>
                                No stack operation active. Try clicking <strong>PUSH AX</strong> or <strong>POP AX</strong> above to see the active bus cycle timing and pins change.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Educational Explanation Box */}
                      <div className="mt-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] leading-relaxed text-amber-900 shadow-2xs space-y-3">
                        <div className="flex gap-2">
                          <HelpCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-black text-amber-950 block mb-0.5">Why does an "empty" stack point to a value (like ABCDh)?</span>
                            <div className="space-y-1.5 font-sans">
                              <p>
                                In real microcomputers like the 8086, <strong>physical RAM memory is never truly "empty" or blank</strong>. Every physical address in silicon always stores a sequence of electrical bits (which reads as hexadecimal data), consisting of power-up garbage, left-over program values, or initialized boot data.
                              </p>
                              <p>
                                When you initialize a stack, the Stack Segment (SS) and Stack Pointer (SP) simply specify the <strong>starting boundary address</strong> (e.g., <code>1000h</code>) of your workspace. 
                              </p>
                              <p>
                                When you execute a <code>PUSH</code>, the 8086 decrements the SP <em>first</em> (e.g., <code>1000h ➔ 0FFEh</code>) before writing the new value. Because of this <strong>decrement-then-write</strong> strategy, the data at the starting base address (e.g., <code>ABCDh</code> at <code>1000h</code>) is never overwritten by your stack operations, remaining perfectly preserved!
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Operations Breakdown */}
                        <div className="border-t border-amber-200/60 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white/80 border border-amber-200/40 rounded-lg p-2.5 space-y-2">
                            <span className="font-black text-indigo-950 text-[10.5px] uppercase tracking-wide flex items-center gap-1">
                              📥 PUSH Instruction Steps
                            </span>
                            <ol className="list-decimal pl-4 space-y-1 text-[10px] text-slate-700">
                              <li><strong>Decrement SP:</strong> The CPU decrements the Stack Pointer by 2 (<code>SP ➔ SP - 2</code>) to allocate space for a 16-bit word.</li>
                              <li><strong>Segment Status:</strong> The BIU sets status bits <code>S4=0, S3=1</code> to flag active Stack Segment (SS) access.</li>
                              <li><strong>Address Bus Cycle:</strong> During <code>T1</code>, the target physical address (<code>16 × SS + SP</code>) is driven onto the Address/Data multiplexed bus.</li>
                              <li><strong>Data Output:</strong> During <code>T2-T4</code>, the 16-bit register value (e.g. AX) is driven onto <code>AD0-AD15</code>.</li>
                              <li><strong>Write Control:</strong> The 8288 Bus Controller asserts Write Command (<code>/MWTC</code> low), latching the data into physical RAM.</li>
                            </ol>
                          </div>

                          <div className="bg-white/80 border border-amber-200/40 rounded-lg p-2.5 space-y-2">
                            <span className="font-black text-violet-950 text-[10.5px] uppercase tracking-wide flex items-center gap-1">
                              📤 POP Instruction Steps
                            </span>
                            <ol className="list-decimal pl-4 space-y-1 text-[10px] text-slate-700">
                              <li><strong>Segment Status:</strong> The BIU sets status bits <code>S4=0, S3=1</code> to flag active Stack Segment (SS) access.</li>
                              <li><strong>Address Bus Cycle:</strong> During <code>T1</code>, the current Top of Stack physical address (<code>16 × SS + SP</code>) is driven onto the Address Bus.</li>
                              <li><strong>Read Control:</strong> During <code>T2-T3</code>, the 8288 asserts Read Command (<code>/MRDC</code> low), signaling RAM memory to drive stored data onto the bus.</li>
                              <li><strong>Data Input:</strong> During <code>T3-T4</code>, the CPU reads the 16-bit data from <code>AD0-AD15</code> and latches it into the target register (e.g. AX).</li>
                              <li><strong>Increment SP:</strong> The CPU increments the Stack Pointer by 2 (<code>SP ➔ SP + 2</code>) to deallocate the word from the stack.</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Quick tips */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              mode === 'minimum' ? 'bg-white border-amber-200/50 text-amber-950 shadow-xs' :
              mode === 'maximum' ? 'bg-white border-purple-200/50 text-purple-950 shadow-xs' :
              'bg-white border-indigo-200/50 text-indigo-950 shadow-xs'
            }`}>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wide block ${
                mode === 'minimum' ? 'text-amber-800' :
                mode === 'maximum' ? 'text-purple-800' :
                'text-indigo-800'
              }`}>B.Tech Student Hardware Tip</span>
              <p className="text-[11px] leading-relaxed mt-1">
                Notice pin 33 (<strong className="font-mono">MN/MX</strong>). Connecting this directly to Vcc (+5V) switches the entire CPU to Minimum Mode (ideal for single-processor, simple systems). Connecting it to GND switches to Maximum Mode (requiring an external 8288 Bus Controller for multi-processor environments).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* External System Interconnect Modal */}
      <AnimatePresence>
        {showInterconnectModal && (
          <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${isInterconnectMaximized ? 'p-2' : 'p-4'}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`bg-slate-50 border border-slate-200 text-slate-800 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
                isInterconnectMaximized ? 'w-[98vw] max-w-none h-[98vh] max-h-none rounded-2xl' : 'w-full max-w-5xl max-h-[95vh] rounded-2xl'
              }`}
            >
              {/* Modal Header */}
              <div className="bg-white px-6 py-4.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">8086 Physical Bus Interconnect &amp; Demultiplexing</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Interactive simulation of how the 8086 microcomputer addresses and talks to memory/IO devices</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsInterconnectMaximized(!isInterconnectMaximized)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all cursor-pointer"
                    title={isInterconnectMaximized ? "Minimize Screen" : "Maximize Screen"}
                  >
                    {isInterconnectMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowInterconnectModal(false)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Contents Grid */}
              <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-100/50">
                
                {/* SVG Schematic View (8 cols) */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
                  {/* Top Schematic HUD bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 mb-3">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                      Hardware Schematic Simulator
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> AD Bus
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Addr Bus
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span> Data Bus
                      </span>
                    </div>
                  </div>

                  {/* SVG Container */}
                  <div className="relative flex items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[300px]">
                    <svg className="w-full h-auto max-h-[350px]" viewBox="0 0 660 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <style>{`
                        @keyframes path-flow-forward {
                          to { stroke-dashoffset: -20; }
                        }
                        @keyframes path-flow-backward {
                          to { stroke-dashoffset: 20; }
                        }
                        .flow-forward {
                          stroke-dasharray: 6, 6;
                          animation: path-flow-forward 0.9s linear infinite;
                        }
                        .flow-backward {
                          stroke-dasharray: 6, 6;
                          animation: path-flow-backward 0.9s linear infinite;
                        }
                      `}</style>

                      {/* Definitions */}
                      <defs>
                        <linearGradient id="cpu-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f8fafc" />
                          <stop offset="100%" stopColor="#e2e8f0" />
                        </linearGradient>
                        <linearGradient id="latch-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fffbeb" />
                          <stop offset="100%" stopColor="#fef3c7" />
                        </linearGradient>
                        <linearGradient id="trans-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f0fdfa" />
                          <stop offset="100%" stopColor="#ccfbf1" />
                        </linearGradient>
                        <linearGradient id="mem-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f0fdf4" />
                          <stop offset="100%" stopColor="#dcfce7" />
                        </linearGradient>
                        <linearGradient id="io-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#faf5ff" />
                          <stop offset="100%" stopColor="#f3e8ff" />
                        </linearGradient>
                      </defs>

                      {/* Bus Pipelines - Thicker background conduits */}
                      {/* AD Bus branch */}
                      <path d="M 140 75 L 185 75" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 185 75 L 240 75" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 185 75 L 185 230 L 240 230" stroke="#cbd5e1" strokeWidth="8" strokeLinejoin="round" />
                      
                      {/* Address bus (Latch output) */}
                      <path d="M 340 75 L 430 75 L 430 90 L 500 90" stroke="#cbd5e1" strokeWidth="8" strokeLinejoin="round" />

                      {/* Data bus (Transceiver output) */}
                      <path d="M 340 230 L 430 230 L 430 250 L 500 250" stroke="#cbd5e1" strokeWidth="8" strokeLinejoin="round" />

                      {/* Control lines background conduits */}
                      {interconnectMode === 'MIN' ? (
                        <>
                          <path d="M 140 120 L 500 120" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
                          <path d="M 140 150 L 195 150 L 195 110 L 240 110" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />
                          <path d="M 140 190 L 450 190 L 450 150 L 500 150" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />
                          <path d="M 140 220 L 460 220 L 460 195 L 500 195" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />
                          <path d="M 140 260 L 170 260 L 170 290 L 240 290" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />
                          <path d="M 140 295 L 210 295 L 210 260 L 240 260" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />
                        </>
                      ) : (
                        <>
                          {/* S2, S1, S0 Status Inputs from CPU to 8288 */}
                          <path d="M 140 120 L 165 120" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
                          <path d="M 140 190 L 165 190" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
                          <path d="M 140 260 L 155 260 L 155 210 L 165 210" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />

                          {/* Outputs from 8288 to Latch and Transceiver */}
                          <path d="M 225 125 L 225 110 L 240 110" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />
                          <path d="M 210 225 L 210 290 L 240 290" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />
                          <path d="M 225 225 L 225 260 L 240 260" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />

                          {/* Control Commands outputs from 8288 directly to Memory / IO device */}
                          <path d="M 250 145 L 450 145 L 450 150 L 500 150" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />
                          <path d="M 250 175 L 460 175 L 460 195 L 500 195" stroke="#e2e8f0" strokeWidth="4" strokeLinejoin="round" />
                        </>
                      )}

                      {/* Animated Signal Flows (dashed line flowing) */}
                      {/* AD Bus multiplexed line */}
                      {modalStep === 'T1_ADDRESS' ? (
                        <>
                          {/* Flows from CPU to Latch */}
                          <path d="M 140 75 L 185 75 L 240 75" stroke="#3b82f6" strokeWidth="3" className="flow-forward" strokeLinecap="round" />
                          <path d="M 185 75 L 185 230 L 240 230" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" /> {/* Transceiver isolated */}
                        </>
                      ) : (
                        <>
                          {/* Isolated from latch, active with Transceiver */}
                          <path d="M 140 75 L 185 75" stroke="#0d9488" strokeWidth="3" className={interconnectAction === 'WRITE' ? "flow-forward" : "flow-backward"} strokeLinecap="round" />
                          <path d="M 185 75 L 240 75" stroke="#cbd5e1" strokeWidth="2" /> {/* Latch input isolated */}
                          <path d="M 185 75 L 185 230 L 240 230" stroke="#0d9488" strokeWidth="3" className={interconnectAction === 'WRITE' ? "flow-forward" : "flow-backward"} strokeLinejoin="round" />
                        </>
                      )}

                      {/* Control signal flows depending on Min/Max operating mode */}
                      {interconnectMode === 'MIN' ? (
                        <>
                          {/* M/IO Pin flow */}
                          <path
                            d="M 140 120 L 500 120"
                            stroke={interconnectDevice === 'MEMORY' ? "#059669" : "#7c3aed"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="flow-forward"
                          />

                          {/* ALE Pin flow */}
                          <path
                            d="M 140 150 L 195 150 L 195 110 L 240 110"
                            stroke={modalStep === 'T1_ADDRESS' ? "#f59e0b" : "#cbd5e1"}
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            className={modalStep === 'T1_ADDRESS' ? "flow-forward" : ""}
                          />

                          {/* DEN Pin flow */}
                          <path
                            d="M 140 260 L 170 260 L 170 290 L 240 290"
                            stroke={modalStep === 'T2_T4_DATA' ? "#10b981" : "#cbd5e1"}
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            className={modalStep === 'T2_T4_DATA' ? "flow-forward" : ""}
                          />

                          {/* DT/R Pin flow */}
                          <path
                            d="M 140 295 L 210 295 L 210 260 L 240 260"
                            stroke={modalStep === 'T2_T4_DATA' ? (interconnectAction === 'WRITE' ? "#f59e0b" : "#94a3b8") : "#cbd5e1"}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            className={modalStep === 'T2_T4_DATA' ? "flow-forward" : ""}
                          />

                          {/* RD Pin direct line to Memory */}
                          <path
                            d="M 140 190 L 450 190 L 450 150 L 500 150"
                            stroke={modalStep === 'T2_T4_DATA' && interconnectAction === 'READ' ? "#10b981" : "#cbd5e1"}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            className={modalStep === 'T2_T4_DATA' && interconnectAction === 'READ' ? "flow-forward" : ""}
                          />

                          {/* WR Pin direct line to Memory */}
                          <path
                            d="M 140 220 L 460 220 L 460 195 L 500 195"
                            stroke={modalStep === 'T2_T4_DATA' && interconnectAction === 'WRITE' ? "#10b981" : "#cbd5e1"}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            className={modalStep === 'T2_T4_DATA' && interconnectAction === 'WRITE' ? "flow-forward" : ""}
                          />
                        </>
                      ) : (
                        <>
                          {/* S2 status line flow */}
                          <path
                            d="M 140 120 L 165 120"
                            stroke={interconnectDevice === 'MEMORY' ? "#10b981" : "#8b5cf6"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="flow-forward"
                          />

                          {/* S1 status line flow */}
                          <path
                            d="M 140 190 L 165 190"
                            stroke={interconnectAction === 'READ' ? "#0d9488" : "#64748b"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="flow-forward"
                          />

                          {/* S0 status line flow */}
                          <path
                            d="M 140 260 L 155 260 L 155 210 L 165 210"
                            stroke={interconnectAction === 'WRITE' ? "#ec4899" : "#64748b"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="flow-forward"
                          />

                          {/* Latch ALE from 8288 */}
                          <path
                            d="M 225 125 L 225 110 L 240 110"
                            stroke={modalStep === 'T1_ADDRESS' ? "#f59e0b" : "#cbd5e1"}
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            className={modalStep === 'T1_ADDRESS' ? "flow-forward" : ""}
                          />

                          {/* Transceiver DEN from 8288 */}
                          <path
                            d="M 210 225 L 210 290 L 240 290"
                            stroke={modalStep === 'T2_T4_DATA' ? "#10b981" : "#cbd5e1"}
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            className={modalStep === 'T2_T4_DATA' ? "flow-forward" : ""}
                          />

                          {/* Transceiver DT/R from 8288 */}
                          <path
                            d="M 225 225 L 225 260 L 240 260"
                            stroke={modalStep === 'T2_T4_DATA' ? (interconnectAction === 'WRITE' ? "#f59e0b" : "#94a3b8") : "#cbd5e1"}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            className={modalStep === 'T2_T4_DATA' ? "flow-forward" : ""}
                          />

                          {/* Command MRDC or IORC from 8288 */}
                          <path
                            d="M 250 145 L 450 145 L 450 150 L 500 150"
                            stroke={modalStep === 'T2_T4_DATA' && interconnectAction === 'READ' ? "#10b981" : "#cbd5e1"}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            className={modalStep === 'T2_T4_DATA' && interconnectAction === 'READ' ? "flow-forward" : ""}
                          />

                          {/* Command MWTC or IOWC from 8288 */}
                          <path
                            d="M 250 175 L 460 175 L 460 195 L 500 195"
                            stroke={modalStep === 'T2_T4_DATA' && interconnectAction === 'WRITE' ? "#10b981" : "#cbd5e1"}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            className={modalStep === 'T2_T4_DATA' && interconnectAction === 'WRITE' ? "flow-forward" : ""}
                          />
                        </>
                      )}

                      {/* Latch Output (Clean Address Bus) */}
                      {modalStep === 'T1_ADDRESS' ? (
                        <path d="M 340 75 L 430 75 L 430 90 L 500 90" stroke="#f59e0b" strokeWidth="3" className="flow-forward" strokeLinejoin="round" />
                      ) : (
                        /* Latched static address output (stable yellow, not moving) */
                        <path d="M 340 75 L 430 75 L 430 90 L 500 90" stroke="#f59e0b" strokeWidth="3" strokeLinejoin="round" />
                      )}

                      {/* Transceiver Output (Clean Data Bus) */}
                      {modalStep === 'T2_T4_DATA' ? (
                        <path
                          d="M 340 230 L 430 230 L 430 250 L 500 250"
                          stroke="#0d9488"
                          strokeWidth="3.5"
                          className={interconnectAction === 'WRITE' ? "flow-forward" : "flow-backward"}
                          strokeLinejoin="round"
                        />
                      ) : (
                        <path d="M 340 230 L 430 230 L 430 250 L 500 250" stroke="#cbd5e1" strokeWidth="2" strokeLinejoin="round" />
                      )}


                      {/* Component Boxes */}

                      {/* 1. 8086 CPU */}
                      <rect x="25" y="30" width="115" height="300" rx="10" fill="url(#cpu-grad)" stroke="#94a3b8" strokeWidth="2" />
                      <text x="82.5" y="55" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">i8086 CPU</text>
                      <text x="82.5" y="70" fill="#475569" fontSize="8" fontFamily="monospace" textAnchor="middle">Intel 16-Bit</text>
                      
                      {/* CPU Pins / Terminals */}
                      <g fill="#334155" fontSize="8" fontFamily="monospace">
                        <circle cx="140" cy="75" r="3" fill="#3b82f6" />
                        <text x="132" y="78" textAnchor="end">AD0 - AD15 (Pins 16-2)</text>

                        {interconnectMode === 'MIN' ? (
                          <>
                            <circle cx="140" cy="120" r="3" fill={interconnectDevice === 'MEMORY' ? "#059669" : "#7c3aed"} />
                            <text x="132" y="123" textAnchor="end">M/IO (Pin 28)</text>

                            <circle cx="140" cy="150" r="3" fill={modalStep === 'T1_ADDRESS' ? "#f59e0b" : "#cbd5e1"} />
                            <text x="132" y="153" textAnchor="end">ALE (Pin 25)</text>

                            <circle cx="140" cy="190" r="3" fill={modalStep === 'T2_T4_DATA' && interconnectAction === 'READ' ? "#10b981" : "#cbd5e1"} />
                            <text x="132" y="193" textAnchor="end">RD (Pin 32)</text>

                            <circle cx="140" cy="220" r="3" fill={modalStep === 'T2_T4_DATA' && interconnectAction === 'WRITE' ? "#10b981" : "#cbd5e1"} />
                            <text x="132" y="223" textAnchor="end">WR (Pin 29)</text>

                            <circle cx="140" cy="260" r="3" fill={modalStep === 'T2_T4_DATA' ? "#10b981" : "#cbd5e1"} />
                            <text x="132" y="263" textAnchor="end">DEN (Pin 26)</text>

                            <circle cx="140" cy="295" r="3" fill={modalStep === 'T2_T4_DATA' ? "#475569" : "#cbd5e1"} />
                            <text x="132" y="298" textAnchor="end">DT/R (Pin 27)</text>
                          </>
                        ) : (
                          <>
                            <circle cx="140" cy="120" r="3" fill="#7c3aed" />
                            <text x="132" y="123" textAnchor="end" className="font-bold">/S2 (Pin 28)</text>

                            <circle cx="140" cy="150" r="3" fill="#64748b" />
                            <text x="132" y="153" textAnchor="end">QS0 (Pin 25)</text>

                            <circle cx="140" cy="190" r="3" fill={modalStep === 'T2_T4_DATA' ? "#7c3aed" : "#cbd5e1"} />
                            <text x="132" y="193" textAnchor="end">/S1 (Pin 27)</text>

                            <circle cx="140" cy="220" r="3" fill="#64748b" />
                            <text x="132" y="223" textAnchor="end">LOCK (Pin 29)</text>

                            <circle cx="140" cy="260" r="3" fill={modalStep === 'T2_T4_DATA' ? "#7c3aed" : "#cbd5e1"} />
                            <text x="132" y="263" textAnchor="end" className="font-bold">/S0 (Pin 26)</text>

                            <circle cx="140" cy="295" r="3" fill="#64748b" />
                            <text x="132" y="298" textAnchor="end">QS1 (Pin 24)</text>
                          </>
                        )}

                        {/* MN/MX strap hardware pin indicator on CPU */}
                        <circle cx="82.5" cy="30" r="3" fill={interconnectMode === 'MIN' ? "#f59e0b" : "#7c3aed"} />
                        <text x="82.5" y="23" textAnchor="middle" fontSize="7" fill={interconnectMode === 'MIN' ? "#b45309" : "#5b21b6"} fontWeight="bold">
                          {interconnectMode === 'MIN' ? "MN/MX = Vcc (+5V)" : "MN/MX = GND (0V)"}
                        </text>
                      </g>


                      {/* 1.5 8288 Bus Controller (Only rendered in Maximum Mode) */}
                      {interconnectMode === 'MAX' && (
                        <g className="transition-all duration-300">
                          <rect x="165" y="115" width="75" height="120" rx="8" fill="url(#cpu-grad)" stroke="#7c3aed" strokeWidth="1.8" />
                          <text x="202.5" y="132" fill="#5b21b6" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">8288</text>
                          <text x="202.5" y="141" fill="#6d28d9" fontSize="6.5" fontFamily="monospace" textAnchor="middle">BUS CONTROLLER</text>
                          
                          {/* Status inputs S2, S1, S0 */}
                          <circle cx="165" cy="120" r="2.5" fill="#7c3aed" />
                          <text x="171" y="123" fill="#6d28d9" fontSize="7" fontFamily="monospace">S2</text>
                          
                          <circle cx="165" cy="190" r="2.5" fill="#7c3aed" />
                          <text x="171" y="193" fill="#6d28d9" fontSize="7" fontFamily="monospace">S1</text>
                          
                          <circle cx="165" cy="210" r="2.5" fill="#7c3aed" />
                          <text x="171" y="213" fill="#6d28d9" fontSize="7" fontFamily="monospace">S0</text>
                          
                          {/* Signal outputs */}
                          <circle cx="225" cy="125" r="2.5" fill={modalStep === 'T1_ADDRESS' ? "#f59e0b" : "#cbd5e1"} />
                          <text x="221" y="131" fill="#64748b" fontSize="6.5" fontFamily="monospace" textAnchor="end">ALE</text>
                          
                          <circle cx="210" cy="225" r="2.5" fill={modalStep === 'T2_T4_DATA' ? "#10b981" : "#cbd5e1"} />
                          <text x="206" y="221" fill="#64748b" fontSize="6.5" fontFamily="monospace" textAnchor="end">DEN</text>
                          
                          <circle cx="225" cy="225" r="2.5" fill={modalStep === 'T2_T4_DATA' ? "#cbd5e1" : "#cbd5e1"} />
                          <text x="228" y="221" fill="#64748b" fontSize="6.5" fontFamily="monospace">DT/R</text>

                          {/* Control lines outputs */}
                          <circle cx="240" cy="145" r="2.5" fill={modalStep === 'T2_T4_DATA' && interconnectAction === 'READ' ? "#10b981" : "#cbd5e1"} />
                          <text x="236" y="151" fill="#4b5563" fontSize="6" fontFamily="monospace" textAnchor="end">
                            {interconnectDevice === 'MEMORY' ? "MRDC" : "IORC"}
                          </text>

                          <circle cx="240" cy="175" r="2.5" fill={modalStep === 'T2_T4_DATA' && interconnectAction === 'WRITE' ? "#10b981" : "#cbd5e1"} />
                          <text x="236" y="181" fill="#4b5563" fontSize="6" fontFamily="monospace" textAnchor="end">
                            {interconnectDevice === 'MEMORY' ? "MWTC" : "IOWC"}
                          </text>
                        </g>
                      )}


                      {/* 2. 8282 Address Latch */}
                      <rect x="240" y="35" width="100" height="95" rx="8" fill="url(#latch-grad)" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="290" y="52" fill="#78350f" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">8282 LATCH</text>
                      <text x="290" y="62" fill="#92400e" fontSize="7.5" fontFamily="monospace" textAnchor="middle">(Or 74LS373)</text>
                      {/* Latch input/output indicators */}
                      <circle cx="240" cy="75" r="2.5" fill="#475569" />
                      <text x="246" y="78" fill="#475569" fontSize="7" fontFamily="monospace">DI</text>
                      <circle cx="340" cy="75" r="2.5" fill="#f59e0b" />
                      <text x="334" y="78" fill="#b45309" fontSize="7" fontFamily="monospace" textAnchor="end">DO</text>
                      
                      <circle cx="240" cy="110" r="2.5" fill={modalStep === 'T1_ADDRESS' ? "#f59e0b" : "#cbd5e1"} />
                      <text x="246" y="113" fill={modalStep === 'T1_ADDRESS' ? "#b45309" : "#64748b"} fontSize="7" fontFamily="monospace">STB</text>
                      <text x="290" y="120" fill={modalStep === 'T1_ADDRESS' ? "#d97706" : "#4b5563"} fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        {modalStep === 'T1_ADDRESS' ? "🔓 PASSING" : "🔒 LATCHED"}
                      </text>


                      {/* 3. 8286 Data Transceiver */}
                      <rect x="240" y="210" width="100" height="95" rx="8" fill="url(#trans-grad)" stroke="#0d9488" strokeWidth="1.5" />
                      <text x="290" y="226" fill="#115e59" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">8286 TRANS</text>
                      <text x="290" y="235" fill="#0f766e" fontSize="7.5" fontFamily="monospace" textAnchor="middle">(Or 74LS245)</text>
                      
                      <circle cx="240" cy="230" r="2.5" fill="#475569" />
                      <text x="246" y="233" fill="#475569" fontSize="7" fontFamily="monospace">A</text>
                      <circle cx="340" cy="230" r="2.5" fill="#0d9488" />
                      <text x="334" y="233" fill="#0f766e" fontSize="7" fontFamily="monospace" textAnchor="end">B</text>

                      <circle cx="240" cy="260" r="2.5" fill={modalStep === 'T2_T4_DATA' ? "#475569" : "#cbd5e1"} />
                      <text x="246" y="263" fill="#64748b" fontSize="7" fontFamily="monospace">T/R</text>

                      <circle cx="240" cy="290" r="2.5" fill={modalStep === 'T2_T4_DATA' ? "#10b981" : "#cbd5e1"} />
                      <text x="246" y="293" fill="#64748b" fontSize="7" fontFamily="monospace">OE</text>
                      
                      <text x="290" y="292" fill={modalStep === 'T2_T4_DATA' ? "#0f766e" : "#64748b"} fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        {modalStep === 'T2_T4_DATA' ? (interconnectAction === 'WRITE' ? "➔ A TO B (TX)" : "◀ B TO A (RX)") : "✖ DISABLE"}
                      </text>


                      {/* 4. External Memory / Device */}
                      <rect 
                        x="500" 
                        y="60" 
                        width="120" 
                        height="240" 
                        rx="10" 
                        fill={interconnectDevice === 'MEMORY' ? "url(#mem-grad)" : "url(#io-grad)"} 
                        stroke={interconnectDevice === 'MEMORY' ? "#10b981" : "#8b5cf6"} 
                        strokeWidth="1.8" 
                        className="transition-all duration-300"
                      />
                      <text 
                        x="560" 
                        y="80" 
                        fill={interconnectDevice === 'MEMORY' ? "#065f46" : "#5b21b6"} 
                        fontSize="11" 
                        fontWeight="bold" 
                        fontFamily="sans-serif" 
                        textAnchor="middle"
                        className="transition-colors duration-300"
                      >
                        {interconnectDevice === 'MEMORY' ? "EXTERNAL" : "I/O DEVICE"}
                      </text>
                      <text 
                        x="560" 
                        y="93" 
                        fill={interconnectDevice === 'MEMORY' ? "#047857" : "#6d28d9"} 
                        fontSize="10.5" 
                        fontWeight="bold" 
                        fontFamily="sans-serif" 
                        textAnchor="middle"
                        className="transition-colors duration-300"
                      >
                        {interconnectDevice === 'MEMORY' ? "RAM / ROM" : "8255 PPI / UART"}
                      </text>
                      
                      {/* Device Terminals */}
                      <g fill="#334155" fontSize="7.5" fontFamily="monospace">
                        <circle cx="500" cy="90" r="3" fill="#f59e0b" />
                        <text x="508" y="93">{interconnectDevice === 'MEMORY' ? "A0 - A19 (Addr)" : "A0 - A7 (Port Addr)"}</text>

                        <circle cx="500" cy="120" r="3" fill={interconnectDevice === 'MEMORY' ? "#059669" : "#7c3aed"} />
                        <text x="508" y="123" className="font-bold">
                          {interconnectMode === 'MIN' ? (interconnectDevice === 'MEMORY' ? "M/IO (High=Mem)" : "M/IO (Low=I/O)") : "CS (Decoder Select)"}
                        </text>

                        <circle cx="500" cy="150" r="3" fill={modalStep === 'T2_T4_DATA' && interconnectAction === 'READ' ? "#10b981" : "#cbd5e1"} />
                        <text x="508" y="153">{interconnectDevice === 'MEMORY' ? "OE (Read En)" : "IOR (I/O Read)"}</text>

                        <circle cx="500" cy="195" r="3" fill={modalStep === 'T2_T4_DATA' && interconnectAction === 'WRITE' ? "#10b981" : "#cbd5e1"} />
                        <text x="508" y="198">{interconnectDevice === 'MEMORY' ? "WE (Write En)" : "IOW (I/O Write)"}</text>

                        <circle cx="500" cy="250" r="3" fill={modalStep === 'T2_T4_DATA' ? "#0d9488" : "#cbd5e1"} />
                        <text x="508" y="253">D0 - D15 (Data)</text>
                      </g>

                      {/* Dynamic LED indicators */}
                      {modalStep === 'T1_ADDRESS' ? (
                        <g>
                          <circle cx="290" cy="85" r="4.5" fill="#f59e0b" className="animate-ping opacity-60" />
                          <circle cx="290" cy="85" r="3" fill="#f59e0b" />
                        </g>
                      ) : (
                        <g>
                          <circle cx="290" cy="260" r="4.5" fill="#0d9488" className="animate-ping opacity-60" />
                          <circle cx="290" cy="260" r="3" fill="#0d9488" />
                        </g>
                      )}
                    </svg>
                  </div>

                  {/* Interactive Phase Selector Controls */}
                  <div className="space-y-3 mt-4">
                    <span className="text-xs font-bold text-slate-500 block font-mono">Simulated Cycle Timing Phase:</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setModalStep('T1_ADDRESS')}
                        className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          modalStep === 'T1_ADDRESS'
                            ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-md'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span>Phase 1: Address T1 State</span>
                        <span className="text-[9.5px] font-normal opacity-70">Multiplex Address & Latch STB (ALE=1)</span>
                      </button>

                      <button
                        onClick={() => setModalStep('T2_T4_DATA')}
                        className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          modalStep === 'T2_T4_DATA'
                            ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-md'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span>Phase 2: Data T2 - T4 States</span>
                        <span className="text-[9.5px] font-normal opacity-70">Lock Latch, Enable Transceiver (DEN=0)</span>
                      </button>
                    </div>

                    {/* Interactive Target Device Selection */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Target Device Type (M/IO Pin 28):</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Toggle between Memory Space (RAM/ROM) or I/O Port Peripheral</span>
                      </div>
                      <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                        <button
                          onClick={() => setInterconnectDevice('MEMORY')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            interconnectDevice === 'MEMORY'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          Memory (High)
                        </button>
                        <button
                          onClick={() => setInterconnectDevice('IO')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            interconnectDevice === 'IO'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          I/O Port (Low)
                        </button>
                      </div>
                    </div>

                    {/* Sub-toggle: Memory Read or Memory Write (Only shown in T2-T4 States) */}
                    {modalStep === 'T2_T4_DATA' && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-4"
                      >
                        <div>
                          <span className="text-xs font-bold text-teal-800 block">Bus Transaction Type:</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Change direction of data flowing through transceiver</span>
                        </div>
                        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                          <button
                            onClick={() => setInterconnectAction('READ')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                              interconnectAction === 'READ'
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {interconnectDevice === 'MEMORY' ? "Memory READ" : "I/O READ"}
                          </button>
                          <button
                            onClick={() => setInterconnectAction('WRITE')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                              interconnectAction === 'WRITE'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {interconnectDevice === 'MEMORY' ? "Memory WRITE" : "I/O WRITE"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Real-time Oscilloscope-Style Signal Timing Waveforms */}
                  <div className="mt-5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                          Bus Cycle Timing Waveforms (i8086 Oscilloscope)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Status: <strong className={modalStep === 'T1_ADDRESS' ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                          {modalStep === 'T1_ADDRESS' ? "T1 (Address Latch)" : `T2-T4 (Data ${interconnectAction})`}
                        </strong>
                      </span>
                    </div>
 
                    <div className="relative w-full overflow-x-auto select-none">
                      <svg className="w-full min-w-[540px] h-[245px]" viewBox="0 0 600 245" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Grid lines background */}
                        <g stroke="#e2e8f0" strokeWidth="1">
                          <line x1="100" y1="10" x2="100" y2="238" strokeDasharray="3,3" />
                          <line x1="220" y1="10" x2="220" y2="238" strokeDasharray="3,3" />
                          <line x1="340" y1="10" x2="340" y2="238" strokeDasharray="3,3" />
                          <line x1="460" y1="10" x2="460" y2="238" strokeDasharray="3,3" />
                          <line x1="580" y1="10" x2="580" y2="238" strokeDasharray="3,3" />
                          
                          {/* Horizontal row dividers */}
                          <line x1="10" y1="45" x2="580" y2="45" opacity="0.6" />
                          <line x1="10" y1="85" x2="580" y2="85" opacity="0.6" />
                          <line x1="10" y1="125" x2="580" y2="125" opacity="0.6" />
                          <line x1="10" y1="165" x2="580" y2="165" opacity="0.6" />
                          <line x1="10" y1="202" x2="580" y2="202" opacity="0.6" />
                        </g>
 
                        {/* Phase columns highlighting background */}
                        {modalStep === 'T1_ADDRESS' ? (
                          <g>
                            <rect x="100" y="10" width="120" height="228" fill="#f59e0b" fillOpacity="0.08" rx="4" />
                            <text x="160" y="234" fill="#b45309" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">ADDR PHASE ACTIVE</text>
                          </g>
                        ) : (
                          <g>
                            <rect x="220" y="10" width="360" height="228" fill="#10b981" fillOpacity="0.07" rx="4" />
                            <text x="400" y="234" fill="#047857" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">DATA TRANSFER PHASE ACTIVE</text>
                          </g>
                        )}
 
                        {/* T-state header markers */}
                        <g fill="#475569" fontSize="10.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                          <text x="160" y="24" fill={modalStep === 'T1_ADDRESS' ? "#b45309" : "#64748b"}>T1 State</text>
                          <text x="280" y="24" fill={modalStep === 'T2_T4_DATA' ? "#047857" : "#64748b"}>T2 State</text>
                          <text x="400" y="24" fill={modalStep === 'T2_T4_DATA' ? "#047857" : "#64748b"}>T3 State</text>
                          <text x="520" y="24" fill={modalStep === 'T2_T4_DATA' ? "#047857" : "#64748b"}>T4 State</text>
                        </g>
 
                        {/* WAVEFORM 1: CLK (Clock) */}
                        <g>
                          <text x="15" y="38" fill="#334155" fontSize="10.5" fontFamily="monospace" fontWeight="bold">CLK</text>
                          <path d="M 100 38 L 130 38 L 130 28 L 160 28 L 160 38 L 190 38 L 190 28 L 220 28 L 220 38 L 250 38 L 250 28 L 280 28 L 280 38 L 310 38 L 310 28 L 340 28 L 340 38 L 370 38 L 370 28 L 400 28 L 400 38 L 430 38 L 430 28 L 460 28 L 460 38 L 490 38 L 490 28 L 520 28 L 520 38 L 550 38 L 550 28 L 580 28" stroke="#475569" strokeWidth="1.8" fill="none" />
                        </g>
 
                        {/* WAVEFORM 2: ALE (Address Latch Enable) */}
                        <g>
                          <text x="15" y="73" fill="#334155" fontSize="10.5" fontFamily="monospace" fontWeight="bold">ALE</text>
                          <path 
                            d="M 100 78 L 120 78 L 120 62 L 180 62 L 180 78 L 580 78" 
                            stroke={modalStep === 'T1_ADDRESS' ? "#d97706" : "#cbd5e1"} 
                            strokeWidth={modalStep === 'T1_ADDRESS' ? "2.5" : "1.8"} 
                            fill="none" 
                            className="transition-all duration-300"
                          />
                          {modalStep === 'T1_ADDRESS' && (
                            <text x="150" y="58" fill="#b45309" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle" className="animate-pulse">STB Pulse</text>
                          )}
                        </g>
 
                        {/* WAVEFORM 3: AD0-AD15 (Multiplexed Bus) */}
                        <g>
                          <text x="15" y="113" fill="#334155" fontSize="10.5" fontFamily="monospace" fontWeight="bold">AD0-AD15</text>
                          
                          {/* Envelope - Address Block */}
                          <path 
                            d="M 100 113 L 110 105 L 200 105 L 210 113 L 200 121 L 110 121 Z" 
                            fill={modalStep === 'T1_ADDRESS' ? "rgba(217, 119, 6, 0.12)" : "rgba(226, 232, 240, 0.4)"} 
                            stroke={modalStep === 'T1_ADDRESS' ? "#d97706" : "#94a3b8"} 
                            strokeWidth={modalStep === 'T1_ADDRESS' ? "2" : "1.5"}
                            className="transition-all duration-300"
                          />
                          <text x="155" y="116" fill={modalStep === 'T1_ADDRESS' ? "#78350f" : "#475569"} fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                            A0 - A15 Address
                          </text>
 
                          {/* Float - Turnaround segment */}
                          <line 
                            x1="210" y1="113" x2="260" y2="113" 
                            stroke="#94a3b8" 
                            strokeWidth="1.5" 
                            strokeDasharray="2,2" 
                          />
                          <text x="235" y="108" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">Float</text>
 
                          {/* Envelope - Data Block */}
                          <path 
                            d="M 260 113 L 270 105 L 560 105 L 570 113 L 560 121 L 270 121 Z" 
                            fill={modalStep === 'T2_T4_DATA' ? "rgba(5, 150, 105, 0.12)" : "rgba(226, 232, 240, 0.4)"} 
                            stroke={modalStep === 'T2_T4_DATA' ? "#059669" : "#94a3b8"} 
                            strokeWidth={modalStep === 'T2_T4_DATA' ? "2" : "1.5"}
                            className="transition-all duration-300"
                          />
                          <text x="415" y="116" fill={modalStep === 'T2_T4_DATA' ? "#064e3b" : "#475569"} fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                            D0 - D15 Data ({interconnectAction})
                          </text>
                        </g>
 
                        {/* WAVEFORM 4: DEN (Data Enable) */}
                        <g>
                          <text x="15" y="153" fill="#334155" fontSize="10.5" fontFamily="monospace" fontWeight="bold">DEN (Active Low)</text>
                          <path 
                            d="M 100 143 L 220 143 L 220 157 L 560 157 L 560 143 L 580 143" 
                            stroke={modalStep === 'T2_T4_DATA' ? "#059669" : "#cbd5e1"} 
                            strokeWidth={modalStep === 'T2_T4_DATA' ? "2.5" : "1.8"} 
                            fill="none"
                            className="transition-all duration-300"
                          />
                          {modalStep === 'T2_T4_DATA' && (
                            <text x="390" y="169" fill="#047857" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                              Transceiver Enabled
                            </text>
                          )}
                        </g>
 
                        {/* WAVEFORM 5: RD or WR (Active Low) */}
                        <g>
                          <text x="15" y="191" fill="#334155" fontSize="10.5" fontFamily="monospace" fontWeight="bold">
                            {interconnectAction === 'READ' ? (interconnectDevice === 'MEMORY' ? "RD" : "IOR") : (interconnectDevice === 'MEMORY' ? "WR" : "IOW")} (Active Low)
                          </text>
                          <path 
                            d="M 100 180 L 240 180 L 240 194 L 540 194 L 540 180 L 580 180" 
                            stroke={modalStep === 'T2_T4_DATA' ? (interconnectAction === 'READ' ? "#059669" : "#d97706") : "#cbd5e1"} 
                            strokeWidth={modalStep === 'T2_T4_DATA' ? "2.5" : "1.8"} 
                            fill="none"
                            className="transition-all duration-300"
                          />
                          {modalStep === 'T2_T4_DATA' && (
                            <text x="390" y="205" fill={interconnectAction === 'READ' ? (interconnectDevice === 'MEMORY' ? "#047857" : "#5b21b6") : (interconnectDevice === 'MEMORY' ? "#b45309" : "#6d28d9")} fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                              {interconnectAction === 'READ' 
                                ? (interconnectDevice === 'MEMORY' ? "Memory Read Command (Active)" : "I/O Read Command (Active)") 
                                : (interconnectDevice === 'MEMORY' ? "Memory Write Command (Active)" : "I/O Write Command (Active)")}
                            </text>
                          )}
                        </g>

                        {/* WAVEFORM 6: M/IO (Memory vs I/O space) */}
                        <g>
                          <text x="15" y="224" fill="#334155" fontSize="10.5" fontFamily="monospace" fontWeight="bold">M/IO Pin 28</text>
                          {interconnectDevice === 'MEMORY' ? (
                            <>
                              <path 
                                d="M 100 215 L 580 215" 
                                stroke="#059669" 
                                strokeWidth="2.5" 
                                fill="none"
                                className="transition-all duration-300"
                              />
                              <text x="340" y="222" fill="#047857" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                Memory Address Space Selected (Logic 1 / High)
                              </text>
                            </>
                          ) : (
                            <>
                              <path 
                                d="M 100 227 L 580 227" 
                                stroke="#7c3aed" 
                                strokeWidth="2.5" 
                                fill="none"
                                className="transition-all duration-300"
                              />
                              <text x="340" y="221" fill="#6d28d9" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                I/O Port Address Space Selected (Logic 0 / Low)
                              </text>
                            </>
                          )}
                        </g>
                      </svg>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 font-mono leading-relaxed border-t border-slate-200 pt-2 flex justify-between">
                      <span>• Amber/Green indicates active electrical logic flow</span>
                      <span className="text-right">4 full CLK periods = 1 Standard Bus Cycle (approx. 800ns @ 5MHz)</span>
                    </div>
                  </div>
                </div>

                {/* Physical Explanations Panel (4 cols) */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                  {/* Real-time Pin Logic Levels Dashboard */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                    <span className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-1.5">
                      Electrical Logic Levels
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                        <span className="text-slate-500 block text-[9.5px]">
                          {interconnectMode === 'MIN' ? "ALE (Strobe):" : "8288 ALE:"}
                        </span>
                        <strong className={modalStep === 'T1_ADDRESS' ? "text-amber-600 font-black" : "text-slate-400"}>
                          {modalStep === 'T1_ADDRESS' ? "HIGH (1)" : "LOW (0)"}
                        </strong>
                      </div>

                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                        <span className="text-slate-500 block text-[9.5px]">
                          {interconnectMode === 'MIN' ? "DEN (Enable):" : "8288 DEN:"}
                        </span>
                        <strong className={modalStep === 'T2_T4_DATA' ? "text-emerald-600 font-black" : "text-slate-400"}>
                          {modalStep === 'T2_T4_DATA' ? "LOW (0 - Active)" : "HIGH (1 - Idle)"}
                        </strong>
                      </div>

                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg col-span-2">
                        <span className="text-slate-500 block text-[9.5px]">AD0-AD15 multiplexed lines carry:</span>
                        <strong className={modalStep === 'T1_ADDRESS' ? "text-amber-600 text-xs" : "text-teal-600 text-xs"}>
                          {modalStep === 'T1_ADDRESS' ? "Physical Addr (A0-A15)" : `Data Words (D0-D15) - ${interconnectAction}`}
                        </strong>
                      </div>

                      {interconnectMode === 'MIN' ? (
                        <>
                          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                            <span className="text-slate-500 block text-[9.5px]">RD (Read Ctrl):</span>
                            <strong className={modalStep === 'T2_T4_DATA' && interconnectAction === 'READ' ? "text-emerald-600 font-black" : "text-slate-400"}>
                              {modalStep === 'T2_T4_DATA' && interconnectAction === 'READ' ? "LOW (0)" : "HIGH (1)"}
                            </strong>
                          </div>

                          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                            <span className="text-slate-500 block text-[9.5px]">WR (Write Ctrl):</span>
                            <strong className={modalStep === 'T2_T4_DATA' && interconnectAction === 'WRITE' ? "text-emerald-600 font-black" : "text-slate-400"}>
                              {modalStep === 'T2_T4_DATA' && interconnectAction === 'WRITE' ? "LOW (0)" : "HIGH (1)"}
                            </strong>
                          </div>

                          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg col-span-2">
                            <span className="text-slate-500 block text-[9.5px]">M/IO Pin 28:</span>
                            <strong className="text-emerald-700">
                              {interconnectDevice === 'MEMORY' ? "HIGH (1 - Memory)" : "LOW (0 - I/O)"}
                            </strong>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                            <span className="text-slate-500 block text-[9.5px]">S2,S1,S0 Code:</span>
                            <strong className="text-purple-600 font-black">
                              {interconnectDevice === 'MEMORY' ? '1' : '0'}{interconnectAction === 'READ' ? '01' : '10'}
                            </strong>
                          </div>

                          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg">
                            <span className="text-slate-500 block text-[9.5px]">Command Bus:</span>
                            <strong className={modalStep === 'T2_T4_DATA' ? "text-indigo-600 font-black text-[10.5px]" : "text-slate-400 text-[10.5px]"}>
                              {modalStep === 'T2_T4_DATA' 
                                ? (interconnectAction === 'READ' 
                                  ? (interconnectDevice === 'MEMORY' ? "/MRDC Active" : "/IORC Active")
                                  : (interconnectDevice === 'MEMORY' ? "/MWTC Active" : "/IOWC Active"))
                                : "Commands Inactive"}
                            </strong>
                          </div>

                          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg col-span-2">
                            <span className="text-slate-500 block text-[9.5px]">8288 Operation Status:</span>
                            <span className="text-slate-700 font-semibold block text-[10px]">
                              {modalStep === 'T1_ADDRESS' ? (
                                "Decoding Status inputs S2-S0, generating ALE pulse."
                              ) : (
                                `Generating ${interconnectAction === 'READ' ? "Read" : "Write"} command and enabling 8286 transceiver.`
                              )}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg col-span-2">
                        <span className="text-slate-500 block text-[9.5px]">DT/R (Direction):</span>
                        <strong className={modalStep === 'T2_T4_DATA' ? (interconnectAction === 'WRITE' ? "text-amber-600" : "text-teal-600") : "text-slate-400"}>
                          {modalStep === 'T2_T4_DATA' ? (interconnectAction === 'WRITE' ? "HIGH (1 - Transmit)" : "LOW (0 - Receive)") : "Vcc High (Address)"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Step Walkthrough Explanations */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex-1 flex flex-col justify-between shadow-xs">
                    <div>
                      <span className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-1.5 mb-2.5">
                        Cycle Step Explanation
                      </span>

                      {modalStep === 'T1_ADDRESS' ? (
                        <div className="space-y-3.5 text-xs text-slate-700 animate-in fade-in duration-200">
                          {interconnectMode === 'MIN' ? (
                            <>
                              <p className="leading-relaxed">
                                <strong className="text-amber-700">1. Address Broadcasting:</strong> Every read or write starts here. The CPU wants to access external memory/device. It drives the multiplexed AD0-AD15 lines with address bits A0-A15.
                              </p>
                              <p className="leading-relaxed">
                                <strong className="text-amber-700">2. Address Latching:</strong> Because these address bits will disappear shortly (multiplexing), the CPU sends a high-level pulse on the <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">ALE (Address Latch Enable)</strong> pin.
                              </p>
                              <p className="leading-relaxed">
                                <strong className="text-amber-700">3. 8282 Transparent Mode:</strong> Upon receiving high ALE on its STB input, the <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">8282 latch</strong> becomes transparent. The memory address flows directly through it to the RAM/ROM address inputs.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="leading-relaxed">
                                <strong className="text-purple-700">1. Status Line Output:</strong> The CPU sets status lines <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">/S2, /S1, /S0</strong> to specify what type of cycle is starting (e.g., {interconnectDevice === 'MEMORY' ? '1,0,1 for Memory Read' : '0,0,1 for I/O Read'}).
                              </p>
                              <p className="leading-relaxed">
                                <strong className="text-purple-700">2. 8288 Decoding &amp; ALE:</strong> The external <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">8288 Bus Controller</strong> chip detects status change, decodes the cycle type, and immediately issues a high-level pulse on the <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">ALE</strong> output pin.
                              </p>
                              <p className="leading-relaxed">
                                <strong className="text-purple-700">3. Transparent Latch:</strong> The high ALE pulse goes to the STB input of the 8282 Address Latch, allowing address bits A0-A15 from the CPU AD0-AD15 pins to flow straight through to RAM/ROM inputs.
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3.5 text-xs text-slate-700 animate-in fade-in duration-200">
                          {interconnectMode === 'MIN' ? (
                            <>
                              <p className="leading-relaxed">
                                <strong className="text-teal-700">1. Address Locking (Latch Frozen):</strong> At the end of T1, ALE falls to 0V. The <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">8282 latch</strong> locks instantly! Even though the CPU removes the address from the AD0-AD15 pins, the latch holds and keeps the address stable for the memory chip.
                              </p>
                              
                              {interconnectAction === 'READ' ? (
                                <>
                                  <p className="leading-relaxed">
                                    <strong className="text-teal-700">2. Transceiver Direction:</strong> The CPU sets <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">DT/R to LOW</strong>, instructing the <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">8286 Transceiver</strong> to drive data from system bus (B) back into the local processor bus (A).
                                  </p>
                                  <p className="leading-relaxed">
                                    <strong className="text-teal-700">3. Transceiver Enable &amp; Read:</strong> The CPU drives <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">DEN low</strong> to enable the transceiver, and pulls <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">RD low</strong>. Memory responds by outputting data on its D0-D15 pins, which passes back into the CPU!
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="leading-relaxed">
                                    <strong className="text-amber-700">2. Transceiver Direction:</strong> The CPU sets <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">DT/R to HIGH</strong>, instructing the <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">8286 Transceiver</strong> to transmit data from the local processor bus (A) out into the system bus (B).
                                  </p>
                                  <p className="leading-relaxed">
                                    <strong className="text-amber-700">3. Transceiver Enable &amp; Write:</strong> The CPU drives <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">DEN low</strong> to enable the transceiver, outputs write data on AD0-AD15, and pulls <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">WR low</strong>. The data flows out and is written directly to the external device!
                                  </p>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="leading-relaxed">
                                <strong className="text-purple-700">1. Latch Locked &amp; Stable Address:</strong> ALE from the 8288 goes low, freezing the 8282 latch outputs. The physical address is held perfectly stable on the system address bus for RAM/ROM.
                              </p>

                              {interconnectAction === 'READ' ? (
                                <>
                                  <p className="leading-relaxed">
                                    <strong className="text-purple-700">2. Transceiver Direction:</strong> The 8288 Bus Controller sets <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">DT/R low</strong> and enables the 8286 transceiver by setting <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">DEN low</strong>.
                                  </p>
                                  <p className="leading-relaxed">
                                    <strong className="text-purple-700">3. Decoded Command Pulse:</strong> Based on the status inputs, the 8288 pulls the <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">/MRDC</strong> (or /IORC) line low. The memory responds to this command by outputting data onto the local data bus, which flows back into the CPU.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="leading-relaxed">
                                    <strong className="text-purple-700">2. Transceiver Direction:</strong> The 8288 Bus Controller sets <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">DT/R high</strong> and enables the 8286 transceiver by setting <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">DEN low</strong>.
                                  </p>
                                  <p className="leading-relaxed">
                                    <strong className="text-purple-700">3. Decoded Write Command:</strong> The 8288 drives the <strong className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">/MWTC</strong> (or /IOWC) line low. The CPU drives write data onto the bus, which passes through the transceiver and is written to the RAM/ROM or IO device.
                                  </p>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10.5px] text-slate-500 font-mono italic leading-normal">
                      Note: This demultiplexing circuit is mandatory in 8086 microcomputers because address and data lines physically share the same metal package pins.
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-white px-6 py-4.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Binary className="w-3.5 h-3.5 text-blue-600" />
                  <span>Real-time Hardware Animation Pipeline</span>
                </div>
                <button
                  onClick={() => setShowInterconnectModal(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Close Schematic Viewer
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
