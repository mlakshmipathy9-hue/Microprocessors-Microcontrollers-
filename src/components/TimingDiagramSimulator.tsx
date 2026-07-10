import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RefreshCw, Layers, Clock, AlertCircle } from 'lucide-react';

interface WaveformSignal {
  name: string;
  states: ('high' | 'low' | 'pulse' | 'address' | 'data' | 'float')[]; // T1, T2, T3, T4
  desc: string;
}

const signals: WaveformSignal[] = [
  {
    name: 'CLK',
    states: ['pulse', 'pulse', 'pulse', 'pulse'],
    desc: 'System clock cycle reference. Controls internal timing.'
  },
  {
    name: 'ALE',
    states: ['high', 'low', 'low', 'low'],
    desc: 'Address Latch Enable. High during T1 to indicate a valid address is on the AD bus.'
  },
  {
    name: 'AD0-AD15',
    states: ['address', 'float', 'data', 'data'],
    desc: 'Multiplexed Address/Data bus. Transmits Address during T1, floats/transitions in T2, transmits/receives Data during T3-T4.'
  },
  {
    name: 'RD (Read)',
    states: ['high', 'low', 'low', 'high'],
    desc: 'Read signal (Active Low). Lowers during T2 to signal memory/IO devices to place data on the bus.'
  },
  {
    name: 'DEN',
    states: ['high', 'low', 'low', 'low'],
    desc: 'Data Enable (Active Low). Enables 8286 transceivers to connect CPU to the system data bus.'
  }
];

export default function TimingDiagramSimulator() {
  const [currentTState, setCurrentTState] = useState<number>(0); // 0=T1, 1=T2, 2=T3, 3=T4
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [cycleType, setCycleType] = useState<'read' | 'write'>('read');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTState(prev => (prev + 1) % 4);
      }, 2000); // 2 seconds per T-state for clear reading
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetCycle = () => {
    setIsPlaying(false);
    setCurrentTState(0);
  };

  const getSignalVisual = (signalName: string, stateIndex: number, currentActive: boolean) => {
    let state = signals.find(s => s.name === signalName)?.states[stateIndex] || 'low';
    
    // Customize RD/WR signal based on selected cycle type
    if (signalName === 'RD (Read)') {
      if (cycleType === 'write') {
        signalName = 'WR (Write)';
        state = stateIndex === 0 ? 'high' : stateIndex === 3 ? 'high' : 'low';
      }
    }

    const baseClass = `h-10 border rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all ${
      currentActive 
        ? 'ring-2 ring-indigo-500 scale-102 bg-white text-indigo-900 border-indigo-300 shadow-xs' 
        : 'bg-slate-50 text-slate-400 border-slate-100'
    }`;

    switch (state) {
      case 'pulse':
        return (
          <div className={baseClass}>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono">Pulse (1→0)</span>
              <div className="flex gap-1 items-center mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${currentActive ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`}></span>
                <span className={`w-1.5 h-1.5 rounded-full ${currentActive ? 'bg-indigo-600 animate-pulse delay-75' : 'bg-slate-300'}`}></span>
              </div>
            </div>
          </div>
        );
      case 'high':
        return (
          <div className={`${baseClass} border-t-4 border-t-emerald-500`}>
            High (1)
          </div>
        );
      case 'low':
        return (
          <div className={`${baseClass} border-b-4 border-b-rose-500`}>
            Low (0)
          </div>
        );
      case 'address':
        return (
          <div className={`${baseClass} bg-indigo-50 border-indigo-200 text-indigo-900`}>
            16-Bit Address
          </div>
        );
      case 'float':
        return (
          <div className={`${baseClass} border-slate-200 text-slate-400 border-dashed`}>
            Float / Hi-Z
          </div>
        );
      case 'data':
        return (
          <div className={`${baseClass} bg-amber-50 border-amber-200 text-amber-900`}>
            16-Bit Data
          </div>
        );
      default:
        return <div className={baseClass}>-</div>;
    }
  };

  const tStateDescriptions = [
    {
      name: 'T1 State',
      desc: 'Address is sent. The processor places the target 20-bit Memory/IO Address on the multiplexed AD0-AD15 bus. ALE signal pulses high to latch the address externally.'
    },
    {
      name: 'T2 State',
      desc: 'Bus transitions. Address is removed. RD/WR goes Low. For Read, the bus is floated so the external memory/device can drive data lines. For Write, CPU starts driving data.'
    },
    {
      name: 'T3 State',
      desc: 'Data Transfer. Data is read or written. If the device is slow, it pulls the READY line low, forcing the CPU to insert wait states between T3 and T4.'
    },
    {
      name: 'T4 State',
      desc: 'Cycle Completion. Read or Write control line goes high. Transceivers are disabled. The bus is freed, concluding the machine cycle.'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-slate-700 font-display">8086 Read/Write Machine Cycle Timing Diagrams</span>
        </div>

        <div className="inline-flex rounded-lg bg-slate-200/60 p-1">
          <button
            onClick={() => setCycleType('read')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              cycleType === 'read' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Read Cycle
          </button>
          <button
            onClick={() => setCycleType('write')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              cycleType === 'write' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Write Cycle
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto">
        {/* Left Diagram Panel */}
        <div className="lg:col-span-8 bg-slate-50/50 rounded-2xl border border-slate-100 p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">Interactive Timing waveform</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause Cycle' : 'Play Cycle (Slow)'}
                </button>
                <button
                  onClick={resetCycle}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Grid Layout of Waveform States */}
            <div className="grid grid-cols-12 gap-3 mb-4">
              {/* Labels Col */}
              <div className="col-span-3 flex flex-col justify-between py-1 space-y-2 text-right pr-3 border-r border-slate-200 font-mono text-[11px] font-bold text-slate-600">
                <div className="h-10 flex items-center justify-end">CLK (Clock)</div>
                <div className="h-10 flex items-center justify-end">ALE (Address Latch)</div>
                <div className="h-10 flex items-center justify-end">AD0-AD15 (Bus)</div>
                <div className="h-10 flex items-center justify-end">{cycleType === 'read' ? 'RD (Read)' : 'WR (Write)'}</div>
                <div className="h-10 flex items-center justify-end">DEN (Data Enable)</div>
              </div>

              {/* T1 Column */}
              <button onClick={() => { setIsPlaying(false); setCurrentTState(0); }} className="col-span-2 flex flex-col justify-between py-1 space-y-2 cursor-pointer">
                <span className={`text-[10px] font-mono text-center block font-bold ${currentTState === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>T1</span>
                {getSignalVisual('CLK', 0, currentTState === 0)}
                {getSignalVisual('ALE', 0, currentTState === 0)}
                {getSignalVisual('AD0-AD15', 0, currentTState === 0)}
                {getSignalVisual('RD (Read)', 0, currentTState === 0)}
                {getSignalVisual('DEN', 0, currentTState === 0)}
              </button>

              {/* T2 Column */}
              <button onClick={() => { setIsPlaying(false); setCurrentTState(1); }} className="col-span-2 flex flex-col justify-between py-1 space-y-2 cursor-pointer">
                <span className={`text-[10px] font-mono text-center block font-bold ${currentTState === 1 ? 'text-indigo-600' : 'text-slate-400'}`}>T2</span>
                {getSignalVisual('CLK', 1, currentTState === 1)}
                {getSignalVisual('ALE', 1, currentTState === 1)}
                {getSignalVisual('AD0-AD15', 1, currentTState === 1)}
                {getSignalVisual('RD (Read)', 1, currentTState === 1)}
                {getSignalVisual('DEN', 1, currentTState === 1)}
              </button>

              {/* T3 Column */}
              <button onClick={() => { setIsPlaying(false); setCurrentTState(2); }} className="col-span-2 flex flex-col justify-between py-1 space-y-2 cursor-pointer">
                <span className={`text-[10px] font-mono text-center block font-bold ${currentTState === 2 ? 'text-indigo-600' : 'text-slate-400'}`}>T3</span>
                {getSignalVisual('CLK', 2, currentTState === 2)}
                {getSignalVisual('ALE', 2, currentTState === 2)}
                {getSignalVisual('AD0-AD15', 2, currentTState === 2)}
                {getSignalVisual('RD (Read)', 2, currentTState === 2)}
                {getSignalVisual('DEN', 2, currentTState === 2)}
              </button>

              {/* T4 Column */}
              <button onClick={() => { setIsPlaying(false); setCurrentTState(3); }} className="col-span-3 flex flex-col justify-between py-1 space-y-2 cursor-pointer">
                <span className={`text-[10px] font-mono text-center block font-bold ${currentTState === 3 ? 'text-indigo-600' : 'text-slate-400'}`}>T4</span>
                {getSignalVisual('CLK', 3, currentTState === 3)}
                {getSignalVisual('ALE', 3, currentTState === 3)}
                {getSignalVisual('AD0-AD15', 3, currentTState === 3)}
                {getSignalVisual('RD (Read)', 3, currentTState === 3)}
                {getSignalVisual('DEN', 3, currentTState === 3)}
              </button>
            </div>
          </div>

          {/* Clock cycle explainers */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-slate-600">
              <strong>Tip:</strong> Click on any T-state column (T1, T2, T3, T4) above to freeze the timing diagram at that precise instant and read the hardware description.
            </p>
          </div>
        </div>

        {/* Right Active State Detail Card */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="bg-indigo-50 text-indigo-950 font-mono text-xs px-2.5 py-1 rounded-md inline-block font-bold">
                Currently Inspecting State
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <h4 className="font-display font-bold text-lg text-slate-800">
                  {tStateDescriptions[currentTState].name}
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {tStateDescriptions[currentTState].desc}
                </p>
              </div>
            </div>

            {/* General bus cycle key parameters */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-4 space-y-2 text-[11px] text-slate-700">
              <div className="font-bold text-slate-800 uppercase font-mono text-[10px]">Timing Key terms</div>
              <div>
                <strong>Clock Cycle:</strong> The time period between two positive clock edges.
              </div>
              <div>
                <strong>Bus Cycle:</strong> The entire process of fetching an address and reading/writing data (typically 4 clock cycles).
              </div>
              <div>
                <strong>Machine Cycle:</strong> Time required to perform one basic operations (Memory read, Memory write, I/O read, I/O write).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
