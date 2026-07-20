import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, RefreshCw, Cpu, Layers, Play, Pause, 
  FastForward, RotateCcw, AlertTriangle, ArrowRight, 
  Database, Zap, ChevronRight, TrendingUp, Info, 
  BookOpen, CheckSquare, Award, PlayCircle, ShieldAlert, XCircle, CheckCircle, Sparkles
} from 'lucide-react';

interface Instruction {
  id: number;
  label: string;
  bytes: string[];
  desc: string;
  isJump?: boolean;
  effect?: (regs: any) => any;
}

const SCENARIOS = {
  sequential: {
    name: 'Sequential Execution',
    desc: 'Demonstrates a continuous pipeline where the BIU fetches bytes and the EU executes instructions concurrently without branches or stalls.',
    instructions: [
      { id: 0, label: 'MOV AX, 1234H', bytes: ['B8', '34', '12'], desc: 'Move 16-bit value 1234H into AX', effect: (regs: any) => ({ ...regs, AX: '1234H' }) },
      { id: 1, label: 'MOV BX, 1111H', bytes: ['BB', '11', '11'], desc: 'Move 16-bit value 1111H into BX', effect: (regs: any) => ({ ...regs, BX: '1111H' }) },
      { id: 2, label: 'ADD AX, BX', bytes: ['01', 'D8'], desc: 'Add BX content to AX (AX = 2345H)', effect: (regs: any) => ({ ...regs, AX: '2345H' }) },
      { id: 3, label: 'INC BX', bytes: ['43'], desc: 'Increment BX by 1 (BX = 1112H)', effect: (regs: any) => ({ ...regs, BX: '1112H' }) },
      { id: 4, label: 'ADD AX, BX', bytes: ['01', 'D8'], desc: 'Add BX to AX (AX = 3457H)', effect: (regs: any) => ({ ...regs, AX: '3457H' }) }
    ]
  },
  branch: {
    name: 'JMP Branch (Pipeline Flush)',
    desc: 'Demonstrates control hazards. When the EU executes JMP, it flushes all pre-fetched bytes in the queue because the program execution jumps.',
    instructions: [
      { id: 0, label: 'MOV AX, 0005H', bytes: ['B8', '05', '00'], desc: 'Load 5 into AX', effect: (regs: any) => ({ ...regs, AX: '0005H' }) },
      { id: 1, label: 'DEC AX', bytes: ['48'], desc: 'Decrement AX (AX = 0004H)', effect: (regs: any) => ({ ...regs, AX: '0004H' }) },
      { id: 2, label: 'JMP 00H', bytes: ['EB', 'FA'], desc: 'Jump back to instruction 0 (Flushes Pipeline!)', isJump: true, effect: (regs: any) => regs },
      { id: 3, label: 'MOV BX, 9999H', bytes: ['BB', '99', '99'], desc: 'Unreachable code (Pre-fetched but discarded)', effect: (regs: any) => ({ ...regs, BX: '9999H' }) },
      { id: 4, label: 'SUB AX, BX', bytes: ['29', 'D8'], desc: 'Unreachable Instruction', effect: (regs: any) => regs }
    ]
  },
  saturation: {
    name: 'Queue Saturation',
    desc: 'Demonstrates structural state. If instructions are short (1 byte NOPs), the EU completes them fast, and the queue saturates to 6/6 bytes, halting BIU prefetch.',
    instructions: [
      { id: 0, label: 'NOP', bytes: ['90'], desc: 'No Operation (1 byte, EU processes instantly)', effect: (regs: any) => regs },
      { id: 1, label: 'NOP', bytes: ['90'], desc: 'No Operation (1 byte, EU processes instantly)', effect: (regs: any) => regs },
      { id: 2, label: 'NOP', bytes: ['90'], desc: 'No Operation (1 byte, EU processes instantly)', effect: (regs: any) => regs },
      { id: 3, label: 'MOV AX, [5000H]', bytes: ['A1', '00', '50'], desc: 'Move memory word to AX (3 bytes)', effect: (regs: any) => ({ ...regs, AX: '78ABH' }) },
      { id: 4, label: 'MOV BX, [5002H]', bytes: ['8B', '1E', '02', '50'], desc: 'Move memory word to BX (4 bytes)', effect: (regs: any) => ({ ...regs, BX: '9CDEH' }) }
    ]
  }
};

interface CycleRecord {
  cycle: number;
  biuState: string;
  queueBytes: string[];
  euState: string;
  isFlush: boolean;
}

interface CycleStep {
  queue: string[];
  biuPointer: { instIdx: number; byteIdx: number };
  euPointer: number;
  euProgress: 'fetch' | 'decode' | 'execute' | 'idle';
  euBytes: string[];
  registers: { AX: string; BX: string; ZF: number; CF: number; SF: number };
  biuAction: string;
  queueStatus: string;
  euStatus: string;
  parallelNote: string;
  whatHappened: string;
  whyHappened: string;
  whatNext: string;
  log: string;
  highlightedFetchSlot?: number | null;
  highlightedConsumeSlot?: number | null;
  parallelBadge?: boolean;
  flushBadge?: boolean;
  registersChanged?: string[];
  registersExplain?: string;
  insight?: string;
}

const CYCLE_DATABASE: Record<'sequential' | 'branch' | 'saturation', CycleStep[]> = {
  sequential: [
    {
      queue: ['B8'],
      biuPointer: { instIdx: 0, byteIdx: 1 },
      euPointer: 0,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of MOV AX (B8H)',
      queueStatus: '[B8]',
      euStatus: 'Waiting... (needs 3 bytes)',
      parallelNote: 'The BIU starts pre-fetching instruction bytes from memory sequentially. The EU is currently stalled because it requires 3 bytes (opcode + 2 operand bytes) to execute this instruction.',
      whatHappened: 'BIU fetched the first byte (B8H) of the first instruction from memory and pushed it into the prefetch queue.',
      whyHappened: 'The 8086 processor always begins by pre-fetching instructions from memory. The EU cannot start executing because it does not have the complete instruction.',
      whatNext: 'The BIU will fetch the second byte (34H) of the MOV instruction while the EU continues waiting.',
      log: 'BIU fetched byte B8H from memory. Queue now contains 1 byte. EU is waiting because MOV AX, 1234H needs 3 bytes.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: null,
      insight: 'The prefetch queue decouples instruction fetching from execution.'
    },
    {
      queue: ['34'],
      biuPointer: { instIdx: 0, byteIdx: 2 },
      euPointer: 0,
      euProgress: 'fetch',
      euBytes: ['B8'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 2 of MOV AX (34H)',
      queueStatus: '[34]',
      euStatus: 'Retrieved B8H (1/3 bytes)',
      parallelNote: 'Parallel Activity! The BIU fetches the next operand byte while the EU simultaneously consumes the first opcode byte from the queue.',
      whatHappened: 'The BIU fetched the second byte (34H) of the instruction, while the EU popped the first byte (B8H) from the prefetch queue into its internal registers.',
      whyHappened: 'Both units work independently in parallel. Since there was a byte in the queue, the EU immediately pulled it, leaving room for the BIU to write.',
      whatNext: 'The BIU will fetch the third byte (12H) to complete the first instruction.',
      log: 'BIU fetched byte 34H. EU retrieved B8H from queue. Parallel fetch/execution overlap active.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: 0,
      parallelBadge: true,
      insight: 'Fetching and execution are now overlapping. BIU and EU operate concurrently.'
    },
    {
      queue: ['12'],
      biuPointer: { instIdx: 1, byteIdx: 0 },
      euPointer: 0,
      euProgress: 'fetch',
      euBytes: ['B8', '34'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 3 of MOV AX (12H)',
      queueStatus: '[12]',
      euStatus: 'Retrieved 34H (2/3 bytes)',
      parallelNote: 'The prefetch stream flows continuously. The BIU is prefetching sequentially into the queue while the EU is emptying the queue from the front.',
      whatHappened: 'The BIU fetched the final byte (12H) of the instruction. Concurrently, the EU popped the second byte (34H) from the prefetch queue.',
      whyHappened: 'The 8086 queue is a First-In, First-Out (FIFO) buffer. The EU retrieves bytes in the exact order they were fetched by the BIU.',
      whatNext: 'The EU will pop the final instruction byte (12H) to complete instruction retrieval, preparing to decode.',
      log: 'BIU fetched byte 12H. EU retrieved 34H from queue. Queue occupancy remains stable.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: 0,
      parallelBadge: true,
      insight: 'Queue occupancy decreased because instruction bytes were consumed.'
    },
    {
      queue: ['BB'],
      biuPointer: { instIdx: 1, byteIdx: 1 },
      euPointer: 0,
      euProgress: 'decode',
      euBytes: ['B8', '34', '12'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for MOV BX (BBH)',
      queueStatus: '[BB]',
      euStatus: 'Retrieved 12H (3/3 bytes)',
      parallelNote: 'The EU has retrieved all 3 bytes of the MOV AX instruction and is ready to decode it. In parallel, the BIU pre-fetches the opcode of the next instruction (BBH).',
      whatHappened: 'The BIU fetched the opcode (BBH) for MOV BX, 1111H. The EU popped the final operand byte (12H) of the first instruction and is now ready to decode.',
      whyHappened: 'All 3 bytes required for MOV AX, 1234H are now inside the EU. The EU can now transition from fetching to decoding.',
      whatNext: 'The EU will decode the first instruction while the BIU pre-fetches its operand byte (11H).',
      log: 'BIU fetched byte BBH. EU has retrieved all 3 bytes of MOV AX, 1234H. Decoding begins.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: 0,
      parallelBadge: true,
      insight: 'The EU begins execution only after all instruction bytes are available.'
    },
    {
      queue: ['BB', '11'],
      biuPointer: { instIdx: 1, byteIdx: 2 },
      euPointer: 0,
      euProgress: 'execute',
      euBytes: ['B8', '34', '12'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of MOV BX (11H)',
      queueStatus: '[BB][11]',
      euStatus: 'Decoding MOV AX, 1234H',
      parallelNote: 'The internal instruction decoder of the EU translates the opcode. Because decoding does not require pulling bytes from the queue, the BIU is able to fill up more queue slots.',
      whatHappened: 'The BIU fetched the first operand byte (11H). The EU decoded the MOV AX instruction.',
      whyHappened: 'Decoding is an internal hardware function of the EU. This allows the prefetch queue to accumulate bytes sequentially, buffering against memory delay.',
      whatNext: 'The EU will execute the decoded MOV AX, 1234H, while the BIU fetches the next operand byte (11H).',
      log: 'BIU fetched byte 11H. EU decoded MOV AX, 1234H. Queue grows to 2 bytes.',
      highlightedFetchSlot: 1,
      highlightedConsumeSlot: null,
      insight: 'The queue is filling because free space is available.'
    },
    {
      queue: ['BB', '11', '11'],
      biuPointer: { instIdx: 2, byteIdx: 0 },
      euPointer: 1,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '1234H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 2 of MOV BX (11H)',
      queueStatus: '[BB][11][11]',
      euStatus: 'Executed MOV AX, 1234H',
      parallelNote: 'Register AX is now updated! In parallel with execution, the BIU pre-fetches the second operand of the second instruction into the queue.',
      whatHappened: 'The EU executed the MOV AX, 1234H instruction, updating the AX register to 1234H. Simultaneously, the BIU fetched the last operand byte (11H).',
      whyHappened: 'Executing instructions changes the processor registers. Because the BIU fetched concurrently, the next instruction bytes are already waiting in the queue!',
      whatNext: 'The EU will fetch the next instruction (MOV BX, 1111H) from the queue.',
      log: 'EU executed MOV AX, 1234H. AX updated to 1234H. BIU fetched byte 11H.',
      highlightedFetchSlot: 2,
      highlightedConsumeSlot: null,
      registersChanged: ['AX'],
      registersExplain: 'MOV AX, 1234H completes, loading immediate value 1234H into register AX.',
      insight: 'BIU is working independently of the EU.'
    },
    {
      queue: ['11', '11', '01'],
      biuPointer: { instIdx: 2, byteIdx: 1 },
      euPointer: 1,
      euProgress: 'fetch',
      euBytes: ['BB'],
      registers: { AX: '1234H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for ADD AX, BX (01H)',
      queueStatus: '[11][11][01]',
      euStatus: 'Retrieved BBH (1/3 bytes)',
      parallelNote: 'Concurrency is at its peak! The BIU pre-fetches the ADD AX, BX instruction opcode, while the EU pops the next MOV BX opcode (BBH) from the queue.',
      whatHappened: 'The BIU fetched opcode (01H) of the third instruction. The EU popped the opcode (BBH) of the second instruction.',
      whyHappened: 'The queue functions as a bidirectional buffer, letting the BIU append at the back while the EU pulls from the front.',
      whatNext: 'The EU will retrieve the next operand byte (11H) of the MOV BX instruction.',
      log: 'BIU fetched byte 01H. EU retrieved BBH from queue. Concurrency active.',
      highlightedFetchSlot: 2,
      highlightedConsumeSlot: 0,
      parallelBadge: true,
      insight: 'Overlap reduces idle time: memory reads and instruction execute run together.'
    },
    {
      queue: ['11', '01', 'D8'],
      biuPointer: { instIdx: 3, byteIdx: 0 },
      euPointer: 1,
      euProgress: 'fetch',
      euBytes: ['BB', '11'],
      registers: { AX: '1234H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of ADD AX, BX (D8H)',
      queueStatus: '[11][01][D8]',
      euStatus: 'Retrieved 11H (2/3 bytes)',
      parallelNote: 'The pipeline flows seamlessly. The BIU is prefetching the second byte of ADD AX, BX while the EU pops the second byte of MOV BX.',
      whatHappened: 'The BIU fetched operand byte (D8H). Concurrently, the EU popped operand byte (11H).',
      whyHappened: 'Standard parallel operation. The bus interface unit and execution unit utilize separate execution clocks for concurrent access.',
      whatNext: 'The EU will pop the final operand byte (11H) of the MOV BX instruction.',
      log: 'BIU fetched byte D8H. EU retrieved 11H from queue.',
      highlightedFetchSlot: 2,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['01', 'D8', '43'],
      biuPointer: { instIdx: 4, byteIdx: 0 },
      euPointer: 1,
      euProgress: 'decode',
      euBytes: ['BB', '11', '11'],
      registers: { AX: '1234H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for INC BX (43H)',
      queueStatus: '[01][D8][43]',
      euStatus: 'Retrieved 11H (3/3 bytes)',
      parallelNote: 'The EU has retrieved all 3 bytes of the second instruction and is ready to decode it. Simultaneously, the BIU fetches the INC BX opcode (43H).',
      whatHappened: 'The BIU fetched the opcode (43H) for INC BX. The EU popped the final operand byte (11H) of the MOV BX instruction.',
      whyHappened: 'All 3 bytes of MOV BX are inside the EU, completing the fetch phase for this instruction.',
      whatNext: 'The EU will decode the MOV BX instruction while the BIU pre-fetches the last instruction opcode.',
      log: 'BIU fetched byte 43H. EU has retrieved all 3 bytes of MOV BX. Decoding begins.',
      highlightedFetchSlot: 2,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['01', 'D8', '43', '01'],
      biuPointer: { instIdx: 4, byteIdx: 1 },
      euPointer: 1,
      euProgress: 'execute',
      euBytes: ['BB', '11', '11'],
      registers: { AX: '1234H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for final ADD AX, BX (01H)',
      queueStatus: '[01][D8][43][01]',
      euStatus: 'Decoding MOV BX, 1111H',
      parallelNote: 'As the EU decodes, queue occupancy increases. The BIU pre-fetches the final ADD instruction opcode (01H).',
      whatHappened: 'The BIU fetched opcode (01H) for the final instruction. The EU decoded the MOV BX instruction.',
      whyHappened: 'Decoding is internal to the EU, so the queue buffer fills up. Occupancy has reached 4 bytes.',
      whatNext: 'The EU will execute MOV BX, 1111H (updating BX), while the BIU fetches the final byte (D8H).',
      log: 'BIU fetched byte 01H. EU decoded MOV BX. Queue occupancy is 4/6.',
      highlightedFetchSlot: 3,
      highlightedConsumeSlot: null
    },
    {
      queue: ['01', 'D8', '43', '01', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 2,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '1234H', BX: '1111H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of final ADD AX, BX (D8H)',
      queueStatus: '[01][D8][43][01][D8]',
      euStatus: 'Executed MOV BX, 1111H',
      parallelNote: 'Register BX is now updated to 1111H! Meanwhile, the BIU has fetched the last byte of the program instruction stream.',
      whatHappened: 'The EU executed MOV BX, 1111H, updating register BX to 1111H. The BIU fetched the final operand byte (D8H) from RAM.',
      whyHappened: 'The Execution Unit modifies general-purpose registers upon instruction execution. The BIU has now pre-fetched all instructions in this program.',
      whatNext: 'The BIU will become idle. The EU will pop the next instruction (ADD AX, BX) from the queue.',
      log: 'EU executed MOV BX, 1111H. BX updated to 1111H. BIU fetched final byte D8H.',
      highlightedFetchSlot: 4,
      highlightedConsumeSlot: null,
      registersChanged: ['BX'],
      registersExplain: 'MOV BX, 1111H completes, loading immediate value 1111H into register BX.'
    },
    {
      queue: ['D8', '43', '01', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 2,
      euProgress: 'fetch',
      euBytes: ['01'],
      registers: { AX: '1234H', BX: '1111H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle (Prefetch complete)',
      queueStatus: '[D8][43][01][D8]',
      euStatus: 'Retrieved 01H (1/2 bytes)',
      parallelNote: 'The BIU is now idle because it has reached the end of the memory stream. The EU continues execution, pulling bytes from the queue.',
      whatHappened: 'The EU popped opcode (01H) for the ADD AX, BX instruction. The BIU is idle.',
      whyHappened: 'The queue has buffered all upcoming instructions, allowing the EU to execute continuously even if memory fetches stop.',
      whatNext: 'The EU will pop the second byte (D8H) to complete the ADD AX, BX instruction.',
      log: 'EU retrieved 01H from queue. BIU is standby.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: 0
    },
    {
      queue: ['43', '01', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 2,
      euProgress: 'decode',
      euBytes: ['01', 'D8'],
      registers: { AX: '1234H', BX: '1111H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: '[43][01][D8]',
      euStatus: 'Retrieved D8H (2/2 bytes)',
      parallelNote: 'The EU has retrieved all 2 bytes of the ADD AX, BX instruction from the queue and is ready to decode.',
      whatHappened: 'The EU popped operand byte (D8H) from the queue. Both bytes of the ADD instruction are now in the EU.',
      whyHappened: 'ADD AX, BX requires 2 bytes. The EU can now decode.',
      whatNext: 'The EU will decode ADD AX, BX.',
      log: 'EU retrieved D8H from queue. ADD AX, BX is ready to decode.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: 0
    },
    {
      queue: ['43', '01', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 2,
      euProgress: 'execute',
      euBytes: ['01', 'D8'],
      registers: { AX: '1234H', BX: '1111H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: '[43][01][D8]',
      euStatus: 'Decoding ADD AX, BX',
      parallelNote: 'The EU instruction decoder translates the addition operation.',
      whatHappened: 'The EU decoded the ADD AX, BX instruction.',
      whyHappened: 'Internal ALU control lines are being configured to execute addition.',
      whatNext: 'The EU will execute ADD AX, BX, which adds AX (1234H) and BX (1111H) to get AX = 2345H.',
      log: 'EU decoded ADD AX, BX.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: null
    },
    {
      queue: ['43', '01', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 3,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '2345H', BX: '1111H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: '[43][01][D8]',
      euStatus: 'Executed ADD AX, BX',
      parallelNote: 'Register AX is now updated to 2345H! The ALU performs the binary addition.',
      whatHappened: 'The EU executed ADD AX, BX. AX updated to 2345H.',
      whyHappened: 'ALU added 1234H and 1111H, writing the result 2345H back into register AX.',
      whatNext: 'The EU will fetch the next instruction (INC BX) from the queue.',
      log: 'EU executed ADD AX, BX. AX updated to 2345H.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: null,
      registersChanged: ['AX'],
      registersExplain: 'ADD AX, BX completes: 1234H + 1111H = 2345H. The result is stored in AX.'
    },
    {
      queue: ['01', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 3,
      euProgress: 'decode',
      euBytes: ['43'],
      registers: { AX: '2345H', BX: '1111H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: '[01][D8]',
      euStatus: 'Retrieved 43H (1/1 byte)',
      parallelNote: 'The EU pops the single-byte INC BX instruction (43H) from the front of the queue.',
      whatHappened: 'The EU popped opcode (43H) from the queue. Retrieval of INC BX is complete.',
      whyHappened: 'INC BX is a single-byte instruction, so it immediately proceeds to decode.',
      whatNext: 'The EU will decode INC BX.',
      log: 'EU retrieved 43H from queue. INC BX is ready to decode.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: 0
    },
    {
      queue: ['01', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 3,
      euProgress: 'execute',
      euBytes: ['43'],
      registers: { AX: '2345H', BX: '1111H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: '[01][D8]',
      euStatus: 'Decoding INC BX',
      parallelNote: 'Decoding the single-byte increment BX instruction.',
      whatHappened: 'The EU decoded the INC BX instruction.',
      whyHappened: 'Decoding translates opcode 43H to increment control signals.',
      whatNext: 'The EU will execute INC BX, updating BX to 1112H.',
      log: 'EU decoded INC BX.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: null
    },
    {
      queue: ['01', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 4,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '2345H', BX: '1112H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: '[01][D8]',
      euStatus: 'Executed INC BX',
      parallelNote: 'Register BX is now updated to 1112H! The ALU incremented the register.',
      whatHappened: 'The EU executed INC BX, incrementing register BX to 1112H.',
      whyHappened: 'ALU incremented 1111H by 1 to get 1112H, writing back to BX.',
      whatNext: 'The EU will fetch the final instruction (ADD AX, BX) from the queue.',
      log: 'EU executed INC BX. BX updated to 1112H.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: null,
      registersChanged: ['BX'],
      registersExplain: 'INC BX completes: 1111H + 1 = 1112H. BX is updated.'
    },
    {
      queue: ['D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 4,
      euProgress: 'fetch',
      euBytes: ['01'],
      registers: { AX: '2345H', BX: '1112H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: '[D8]',
      euStatus: 'Retrieved 01H (1/2 bytes)',
      parallelNote: 'Retrieving the last instruction (ADD AX, BX) from the prefetch queue.',
      whatHappened: 'The EU popped opcode (01H) from the queue.',
      whyHappened: 'Starting the retrieval of the final instruction.',
      whatNext: 'The EU will pop the final byte (D8H) from the queue.',
      log: 'EU retrieved 01H from queue.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: 0
    },
    {
      queue: [],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 4,
      euProgress: 'decode',
      euBytes: ['01', 'D8'],
      registers: { AX: '2345H', BX: '1112H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: 'Empty',
      euStatus: 'Retrieved D8H (2/2 bytes)',
      parallelNote: 'The queue is now completely empty. The EU has retrieved all bytes of the final instruction and is ready to decode.',
      whatHappened: 'The EU popped the final operand byte (D8H) from the prefetch queue, leaving the queue empty.',
      whyHappened: 'The final instruction has been completely retrieved into the EU.',
      whatNext: 'The EU will decode ADD AX, BX.',
      log: 'EU retrieved D8H from queue. Queue is now empty.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: 0
    },
    {
      queue: [],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 4,
      euProgress: 'execute',
      euBytes: ['01', 'D8'],
      registers: { AX: '2345H', BX: '1112H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: 'Empty',
      euStatus: 'Decoding ADD AX, BX',
      parallelNote: 'Decoding the final addition operation before executing.',
      whatHappened: 'The EU decoded ADD AX, BX.',
      whyHappened: 'ALU control lines prepare the register operands AX and BX.',
      whatNext: 'The EU will execute the final ADD AX, BX, adding AX (2345H) and BX (1112H) to get AX = 3457H.',
      log: 'EU decoded ADD AX, BX.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: null
    },
    {
      queue: [],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 4,
      euProgress: 'idle',
      euBytes: [],
      registers: { AX: '3457H', BX: '1112H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle',
      queueStatus: 'Empty',
      euStatus: 'Executed ADD AX, BX',
      parallelNote: 'The program is complete! Register AX has been successfully updated to 3457H.',
      whatHappened: 'The EU executed the final ADD AX, BX instruction. AX updated to 3457H.',
      whyHappened: 'Final ALU addition: 2345H + 1112H = 3457H.',
      whatNext: 'The simulation has finished executing the sequential program successfully!',
      log: 'EU executed ADD AX, BX. AX updated to 3457H. Program complete!',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: null,
      registersChanged: ['AX'],
      registersExplain: 'Final ADD AX, BX completes: 2345H + 1112H = 3457H. Result is stored in AX.'
    }
  ],
  branch: [
    {
      queue: ['B8'],
      biuPointer: { instIdx: 0, byteIdx: 1 },
      euPointer: 0,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of MOV AX (B8H)',
      queueStatus: '[B8]',
      euStatus: 'Waiting... (needs 3 bytes)',
      parallelNote: 'The BIU starts pre-fetching instruction bytes from memory. The EU is currently stalled awaiting 3 bytes.',
      whatHappened: 'BIU fetched the first opcode byte (B8H) of MOV AX, 0005H and placed it into the queue.',
      whyHappened: 'Instruction bytes are retrieved sequentially from memory first. The EU waits because it has no complete instruction yet.',
      whatNext: 'The BIU will fetch the second byte (05H).',
      log: 'BIU fetched B8H. Queue now contains 1 byte. EU is waiting.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: null
    },
    {
      queue: ['05'],
      biuPointer: { instIdx: 0, byteIdx: 2 },
      euPointer: 0,
      euProgress: 'fetch',
      euBytes: ['B8'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 2 of MOV AX (05H)',
      queueStatus: '[05]',
      euStatus: 'Retrieved B8H (1/3 bytes)',
      parallelNote: 'The BIU fetches the next instruction operand, while the EU pops the first opcode byte (B8H) from the queue.',
      whatHappened: 'BIU fetched operand (05H). EU popped opcode (B8H) from the prefetch queue.',
      whyHappened: 'Independent, simultaneous hardware execution. The EU pulls bytes from the front of the queue, freeing space.',
      whatNext: 'The BIU will fetch the third byte (00H).',
      log: 'BIU fetched byte 05H. EU retrieved B8H from queue.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['00'],
      biuPointer: { instIdx: 1, byteIdx: 0 },
      euPointer: 0,
      euProgress: 'fetch',
      euBytes: ['B8', '05'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 3 of MOV AX (00H)',
      queueStatus: '[00]',
      euStatus: 'Retrieved 05H (2/3 bytes)',
      parallelNote: 'Continuous prefetching of the first instruction bytes.',
      whatHappened: 'BIU fetched operand (00H). EU popped operand (05H) from the queue.',
      whyHappened: 'FIFO order is maintained. EU reads the second byte sequentially.',
      whatNext: 'The EU will pop the final byte (00H) to complete the instruction retrieval.',
      log: 'BIU fetched byte 00H. EU retrieved 05H from queue.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['48'],
      biuPointer: { instIdx: 1, byteIdx: 1 },
      euPointer: 0,
      euProgress: 'decode',
      euBytes: ['B8', '05', '00'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for DEC AX (48H)',
      queueStatus: '[48]',
      euStatus: 'Retrieved 00H (3/3 bytes)',
      parallelNote: 'The EU has retrieved all 3 bytes and is ready to decode. The BIU pre-fetches the DEC AX opcode (48H).',
      whatHappened: 'BIU fetched opcode (48H). EU popped the final operand byte (00H) of the first instruction and is ready to decode.',
      whyHappened: 'The full 3 bytes are in the EU. Decoding can begin.',
      whatNext: 'The EU will decode the instruction while the BIU pre-fetches the JMP opcode.',
      log: 'BIU fetched byte 48H. EU retrieved 00H. Decoding MOV AX, 0005H.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['48', 'EB'],
      biuPointer: { instIdx: 2, byteIdx: 1 },
      euPointer: 0,
      euProgress: 'execute',
      euBytes: ['B8', '05', '00'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for JMP 00H (EBH)',
      queueStatus: '[48][EB]',
      euStatus: 'Decoding MOV AX, 0005H',
      parallelNote: 'Decoding is internal to the EU, so the queue buffer increases to 2 bytes.',
      whatHappened: 'BIU fetched opcode (EBH) for JMP 00H. EU decoded the MOV AX instruction.',
      whyHappened: 'Internal EU decoder translations allow the prefetch queue to accumulate bytes.',
      whatNext: 'The EU will execute MOV AX, 0005H (AX becomes 0005H).',
      log: 'BIU fetched byte EBH. EU decoded MOV AX.',
      highlightedFetchSlot: 1,
      highlightedConsumeSlot: null
    },
    {
      queue: ['48', 'EB', 'FA'],
      biuPointer: { instIdx: 3, byteIdx: 0 },
      euPointer: 1,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '0005H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 2 of JMP 00H (FAH)',
      queueStatus: '[48][EB][FA]',
      euStatus: 'Executed MOV AX, 0005H',
      parallelNote: 'Register AX is now updated to 0005H! Concurrently, the BIU pre-fetches the second byte of JMP (FAH).',
      whatHappened: 'EU executed MOV AX, 0005H, loading value 0005H into AX. BIU fetched the offset byte (FAH) of JMP.',
      whyHappened: 'Register writes occur on execution. Parallel fetching is maintained.',
      whatNext: 'The EU will fetch the next instruction (DEC AX) from the queue.',
      log: 'EU executed MOV AX, 0005H. AX updated to 0005H. BIU fetched byte FAH.',
      highlightedFetchSlot: 2,
      highlightedConsumeSlot: null,
      registersChanged: ['AX'],
      registersExplain: 'Loads AX with value 0005H.'
    },
    {
      queue: ['EB', 'FA', 'BB'],
      biuPointer: { instIdx: 3, byteIdx: 1 },
      euPointer: 1,
      euProgress: 'fetch',
      euBytes: ['48'],
      registers: { AX: '0005H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for unreachable MOV BX (BBH)',
      queueStatus: '[EB][FA][BB]',
      euStatus: 'Retrieved 48H (1/1 byte)',
      parallelNote: 'The BIU pre-fetches opcode (BBH) of the next (unreachable) instruction, while the EU pops the DEC AX opcode (48H).',
      whatHappened: 'BIU fetched opcode (BBH). EU popped opcode (48H) for DEC AX from the queue.',
      whyHappened: 'Even if there is a branch instruction ahead, the 8086 continues prefetching sequentially because it does not know it is a branch until executed!',
      whatNext: 'The EU will decode the DEC AX instruction.',
      log: 'BIU fetched byte BBH. EU retrieved 48H from queue.',
      highlightedFetchSlot: 2,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['EB', 'FA', 'BB', '99'],
      biuPointer: { instIdx: 3, byteIdx: 2 },
      euPointer: 1,
      euProgress: 'decode',
      euBytes: ['48'],
      registers: { AX: '0005H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of unreachable MOV BX (99H)',
      queueStatus: '[EB][FA][BB][99]',
      euStatus: 'Decoding DEC AX',
      parallelNote: 'The queue has accumulated 4 bytes because the EU is busy decoding DEC AX.',
      whatHappened: 'BIU fetched operand (99H). EU decoded the DEC AX instruction.',
      whyHappened: 'Since decoding takes 1 cycle, the prefetch queue fills up further.',
      whatNext: 'The EU will execute DEC AX, decrementing AX.',
      log: 'BIU fetched byte 99H. EU decoded DEC AX. Queue is 4/6 full.',
      highlightedFetchSlot: 3,
      highlightedConsumeSlot: null
    },
    {
      queue: ['EB', 'FA', 'BB', '99', '99'],
      biuPointer: { instIdx: 4, byteIdx: 0 },
      euPointer: 2,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '0004H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 2 of unreachable MOV BX (99H)',
      queueStatus: '[EB][FA][BB][99][99]',
      euStatus: 'Executed DEC AX',
      parallelNote: 'Register AX is now decremented to 0004H! Meanwhile, the BIU pre-fetches the second operand byte of the unreachable instruction.',
      whatHappened: 'EU executed DEC AX, decrementing AX to 0004H. BIU fetched the second operand byte (99H).',
      whyHappened: 'Register AX updates on execution. Sequential prefetching continues blindly.',
      whatNext: 'The EU will fetch JMP 00H (EB FA) from the queue.',
      log: 'EU executed DEC AX. AX updated to 0004H. BIU fetched byte 99H.',
      highlightedFetchSlot: 4,
      highlightedConsumeSlot: null,
      registersChanged: ['AX'],
      registersExplain: 'AX is decremented from 0005H to 0004H.'
    },
    {
      queue: ['FA', 'BB', '99', '99', '29'],
      biuPointer: { instIdx: 4, byteIdx: 1 },
      euPointer: 2,
      euProgress: 'fetch',
      euBytes: ['EB'],
      registers: { AX: '0004H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for final SUB AX, BX (29H)',
      queueStatus: '[FA][BB][99][99][29]',
      euStatus: 'Retrieved EBH (1/2 bytes)',
      parallelNote: 'The BIU pre-fetches opcode (29H) while the EU pops the JMP opcode (EBH) from the queue.',
      whatHappened: 'BIU fetched opcode (29H). EU popped JMP opcode (EBH) from the queue.',
      whyHappened: 'Autonomous dual units. Queue buffer keeps the pipeline occupied.',
      whatNext: 'The EU will pop the JMP offset byte (FAH) to complete the JMP instruction.',
      log: 'BIU fetched byte 29H. EU retrieved EBH from queue.',
      highlightedFetchSlot: 4,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['BB', '99', '99', '29', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 2,
      euProgress: 'decode',
      euBytes: ['EB', 'FA'],
      registers: { AX: '0004H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of final SUB (D8H)',
      queueStatus: '[BB][99][99][29][D8]',
      euStatus: 'Retrieved FAH (2/2 bytes)',
      parallelNote: 'The EU has retrieved all 2 bytes of the JMP instruction and is ready to decode it. In parallel, the BIU fetches the last byte (D8H).',
      whatHappened: 'BIU fetched operand (D8H). EU popped the JMP offset byte (FAH).',
      whyHappened: 'Both bytes of JMP are now inside the EU, completing the JMP fetch phase.',
      whatNext: 'The EU will decode the JMP instruction.',
      log: 'BIU fetched byte D8H. EU retrieved FAH. JMP 00H is ready to decode.',
      highlightedFetchSlot: 4,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['BB', '99', '99', '29', 'D8'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 2,
      euProgress: 'execute',
      euBytes: ['EB', 'FA'],
      registers: { AX: '0004H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Idle (Queue full)',
      queueStatus: '[BB][99][99][29][D8]',
      euStatus: 'Decoding JMP 00H',
      parallelNote: 'The EU decodes JMP 00H. The BIU is idle because the queue has 5 bytes.',
      whatHappened: 'EU decoded the JMP 00H instruction. BIU remains standby.',
      whyHappened: 'Decoding JMP 00H reveals that a branch is about to occur!',
      whatNext: 'CRITICAL CYCLE: The EU will execute JMP 00H, which will trigger a pipeline flush!',
      log: 'EU decoded JMP 00H.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: null
    },
    {
      queue: [],
      biuPointer: { instIdx: 0, byteIdx: 0 },
      euPointer: 0,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '0004H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Queue Flush in Progress',
      queueStatus: 'Empty (Flushed)',
      euStatus: 'Executed JMP (Control Hazard!)',
      parallelNote: 'CONTROL HAZARD DETECTED! The Execution Unit executed the JMP instruction. This causes an immediate branch to instruction 00H, flushing all pre-fetched bytes in the queue!',
      whatHappened: 'The EU executed the JMP instruction, which instantly flushed all pre-fetched bytes in the queue (BBH, 99H, 29H, D8H).',
      whyHappened: 'A branch changes the program counter (IP). The instructions already stored in the prefetch queue are from the sequential path, which is no longer correct. They must be discarded to prevent erroneous execution.',
      whatNext: 'The BIU will restart fetching sequentially from the target branch address 00H (MOV AX, 0005H).',
      log: 'Executed JMP branch! Queue has been flushed (Control Hazard). BIU pointer reset to 00H.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: null,
      flushBadge: true,
      insight: 'Queue flushed due to a branch instruction. This is a control hazard.'
    }
  ],
  saturation: [
    {
      queue: ['90'],
      biuPointer: { instIdx: 0, byteIdx: 1 },
      euPointer: 0,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of NOP (90H)',
      queueStatus: '[90]',
      euStatus: 'Waiting... (needs 1 byte)',
      parallelNote: 'The BIU starts pre-fetching the first instruction. NOP is a single-byte instruction.',
      whatHappened: 'BIU fetched NOP opcode (90H) and stored it in Queue Slot 1.',
      whyHappened: 'The processor always pre-fetches bytes into the queue buffer sequentially.',
      whatNext: 'The EU will pop the NOP opcode in the next cycle.',
      log: 'BIU fetched byte 90H. Queue contains 1 byte.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: null
    },
    {
      queue: ['90'],
      biuPointer: { instIdx: 1, byteIdx: 1 },
      euPointer: 0,
      euProgress: 'fetch',
      euBytes: ['90'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of NOP 2 (90H)',
      queueStatus: '[90]',
      euStatus: 'Retrieved 90H (1/1 byte)',
      parallelNote: 'The EU pops the first NOP from the queue, while the BIU pre-fetches the second NOP.',
      whatHappened: 'BIU fetched the second NOP opcode (90H). EU popped the first NOP opcode (90H).',
      whyHappened: 'The EU retrieves instructions from the queue to process them.',
      whatNext: 'The EU will decode NOP 1 while the BIU pre-fetches NOP 3.',
      log: 'BIU fetched byte 90H. EU retrieved 90H from queue.',
      highlightedFetchSlot: 0,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['90', '90'],
      biuPointer: { instIdx: 2, byteIdx: 1 },
      euPointer: 0,
      euProgress: 'decode',
      euBytes: ['90'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of NOP 3 (90H)',
      queueStatus: '[90][90]',
      euStatus: 'Decoding NOP 1',
      parallelNote: 'The EU decodes the first NOP. The BIU pre-fetches NOP 3. The queue grows to 2 bytes.',
      whatHappened: 'BIU fetched the third NOP (90H). EU decoded NOP 1.',
      whyHappened: 'Decoding is internal to the EU, allowing the prefetch queue to accumulate bytes.',
      whatNext: 'The EU will execute NOP 1 while the BIU pre-fetches the MOV AX instruction.',
      log: 'BIU fetched byte 90H. EU decoded NOP 1. Queue occupancy is 2/6.',
      highlightedFetchSlot: 1,
      highlightedConsumeSlot: null
    },
    {
      queue: ['90', '90', 'A1'],
      biuPointer: { instIdx: 3, byteIdx: 1 },
      euPointer: 1,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for MOV AX (A1H)',
      queueStatus: '[90][90][A1]',
      euStatus: 'Executed NOP 1',
      parallelNote: 'The EU executes NOP 1 (No operation). The BIU pre-fetches the MOV AX opcode (A1H).',
      whatHappened: 'EU executed NOP 1. BIU fetched the MOV AX opcode (A1H).',
      whyHappened: 'NOP has no architectural side effects. Sequential prefetching continues.',
      whatNext: 'The EU will fetch NOP 2 (90H) from the queue.',
      log: 'EU executed NOP 1. BIU fetched byte A1H. Queue is 3/6 full.',
      highlightedFetchSlot: 2,
      highlightedConsumeSlot: null
    },
    {
      queue: ['90', 'A1', '00'],
      biuPointer: { instIdx: 3, byteIdx: 2 },
      euPointer: 1,
      euProgress: 'fetch',
      euBytes: ['90'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of MOV AX offset (00H)',
      queueStatus: '[90][A1][00]',
      euStatus: 'Retrieved 90H (1/1 byte)',
      parallelNote: 'The BIU pre-fetches the MOV AX offset byte (00H). The EU pops NOP 2 (90H) from the queue.',
      whatHappened: 'BIU fetched operand (00H). EU popped NOP 2 (90H) from the queue.',
      whyHappened: 'Continuous parallel retrieval. The FIFO queue shifts left.',
      whatNext: 'The EU will decode NOP 2 while the BIU pre-fetches the second offset byte.',
      log: 'BIU fetched byte 00H. EU retrieved 90H.',
      highlightedFetchSlot: 2,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['90', 'A1', '00', '50'],
      biuPointer: { instIdx: 3, byteIdx: 3 },
      euPointer: 1,
      euProgress: 'decode',
      euBytes: ['90'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 2 of MOV AX offset (50H)',
      queueStatus: '[90][A1][00][50]',
      euStatus: 'Decoding NOP 2',
      parallelNote: 'Queue occupancy grows to 4 bytes as the EU decodes NOP 2.',
      whatHappened: 'BIU fetched operand (50H). EU decoded NOP 2.',
      whyHappened: 'Decoding is internal to the EU, so queue occupancy climbs.',
      whatNext: 'The EU will execute NOP 2 while the BIU pre-fetches the MOV BX opcode.',
      log: 'BIU fetched byte 50H. EU decoded NOP 2. Queue is 4/6 full.',
      highlightedFetchSlot: 3,
      highlightedConsumeSlot: null
    },
    {
      queue: ['90', 'A1', '00', '50', '8B'],
      biuPointer: { instIdx: 4, byteIdx: 1 },
      euPointer: 2,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching opcode for MOV BX (8BH)',
      queueStatus: '[90][A1][00][50][8B]',
      euStatus: 'Executed NOP 2',
      parallelNote: 'The queue occupancy reaches 5 bytes. The BIU pre-fetches the MOV BX opcode (8BH).',
      whatHappened: 'EU executed NOP 2. BIU fetched the MOV BX opcode (8BH).',
      whyHappened: 'NOP executes with no register changes. Sequential prefetching continues.',
      whatNext: 'The EU will fetch NOP 3 (90H) from the queue.',
      log: 'EU executed NOP 2. BIU fetched byte 8BH. Queue is 5/6 full.',
      highlightedFetchSlot: 4,
      highlightedConsumeSlot: null
    },
    {
      queue: ['A1', '00', '50', '8B', '1E'],
      biuPointer: { instIdx: 4, byteIdx: 2 },
      euPointer: 2,
      euProgress: 'fetch',
      euBytes: ['90'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 1 of MOV BX offset (1EH)',
      queueStatus: '[A1][00][50][8B][1E]',
      euStatus: 'Retrieved 90H (1/1 byte)',
      parallelNote: 'The BIU pre-fetches the offset (1EH). The EU pops NOP 3 (90H).',
      whatHappened: 'BIU fetched operand (1EH). EU popped NOP 3.',
      whyHappened: 'Concurrent operations keep the dual units humming.',
      whatNext: 'The EU will decode NOP 3.',
      log: 'BIU fetched byte 1EH. EU retrieved 90H from queue.',
      highlightedFetchSlot: 4,
      highlightedConsumeSlot: 0,
      parallelBadge: true
    },
    {
      queue: ['A1', '00', '50', '8B', '1E', '02'],
      biuPointer: { instIdx: 4, byteIdx: 3 },
      euPointer: 2,
      euProgress: 'decode',
      euBytes: ['90'],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Fetching byte 2 of MOV BX offset (02H)',
      queueStatus: '[A1][00][50][8B][1E][02]',
      euStatus: 'Decoding NOP 3',
      parallelNote: 'QUEUE SATURATION DETECTED! The prefetch queue has reached maximum capacity of 6/6 bytes because the EU has been executing short instructions.',
      whatHappened: 'BIU fetched operand (02H), which completely fills the 6-byte prefetch queue. EU decoded NOP 3.',
      whyHappened: 'Because NOP instructions are processed rapidly but the BIU pre-fetches continuously, the queue reaches its maximum 6-byte storage capacity.',
      whatNext: 'The BIU will suspend prefetching in the next cycle because the queue is full.',
      log: 'BIU fetched byte 02H. Queue is now completely SATURATED (6/6 bytes).',
      highlightedFetchSlot: 5,
      highlightedConsumeSlot: null,
      insight: 'The queue has reached maximum occupancy (6/6 bytes). BIU prefetching will halt.'
    },
    {
      queue: ['A1', '00', '50', '8B', '1E', '02'],
      biuPointer: { instIdx: 4, byteIdx: 3 },
      euPointer: 3,
      euProgress: 'fetch',
      euBytes: [],
      registers: { AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 },
      biuAction: 'Suspended (Queue Full 6/6)',
      queueStatus: '[A1][00][50][8B][1E][02]',
      euStatus: 'Executed NOP 3',
      parallelNote: 'STRUCTURAL LIMIT! The BIU enters a suspended standby state. It cannot fetch any more bytes from memory until the EU pulls bytes and frees up at least 2 slots in the queue.',
      whatHappened: 'The BIU suspended prefetching because the 6-byte prefetch queue is fully saturated. Meanwhile, the EU executed NOP 3.',
      whyHappened: 'The 8086 architecture halts memory fetching when the queue has no free slots, preventing unnecessary bus traffic and memory contention.',
      whatNext: 'The EU will fetch the MOV AX instruction from the queue. Once the EU retrieves enough bytes, the queue occupancy will drop, and the BIU will resume.',
      log: 'BIU prefetch suspended. EU executed NOP 3.',
      highlightedFetchSlot: null,
      highlightedConsumeSlot: null,
      insight: 'BIU enters standby mode when queue is full. This prevents memory bus clutter.'
    }
  ]
};

interface AnalogyStation {
  name: string;
  desc: string;
  active: boolean;
  complete?: boolean;
}

interface AnalogyStep {
  cycle: number;
  station1: AnalogyStation;
  station2: AnalogyStation;
  station3: AnalogyStation;
  explanation: string;
}

const SANDWICH_SEQUENTIAL_STEPS: AnalogyStep[] = [
  {
    cycle: 1,
    station1: { name: 'Customer 1', desc: '🍔 Ordering Sandwich', active: true },
    station2: { name: 'Empty', desc: '💤 Idle', active: false },
    station3: { name: 'Empty', desc: '💤 Idle', active: false },
    explanation: 'Worker 1 is taking Customer 1\'s order. Other stations are completely idle because they have no work yet. Efficiency is extremely low.'
  },
  {
    cycle: 2,
    station1: { name: 'Empty', desc: '💤 Idle', active: false },
    station2: { name: 'Customer 1', desc: '🔥 Toasting & Fillings', active: true },
    station3: { name: 'Empty', desc: '💤 Idle', active: false },
    explanation: 'Customer 1\'s sandwich is being toasted at Station 2. Since this is non-pipelined, Customer 2 is forced to wait outside. Station 1 and 3 sit completely idle!'
  },
  {
    cycle: 3,
    station1: { name: 'Empty', desc: '💤 Idle', active: false },
    station2: { name: 'Empty', desc: '💤 Idle', active: false },
    station3: { name: 'Customer 1', desc: '💰 Wrapping & Paying', active: true },
    explanation: 'Customer 1 is paying and wrapping up. Stations 1 and 2 are completely idle. Customer 2 and 3 are still waiting in line outside!'
  },
  {
    cycle: 4,
    station1: { name: 'Customer 2', desc: '🍔 Ordering Sandwich', active: true },
    station2: { name: 'Empty', desc: '💤 Idle', active: false },
    station3: { name: 'Empty', desc: '💤 Idle', active: false },
    explanation: 'Customer 1 has left. Customer 2 can finally step inside and order. The sequential cycle restarts. Still, Stations 2 and 3 remain idle.'
  },
  {
    cycle: 5,
    station1: { name: 'Empty', desc: '💤 Idle', active: false },
    station2: { name: 'Customer 2', desc: '🔥 Toasting & Fillings', active: true },
    station3: { name: 'Empty', desc: '💤 Idle', active: false },
    explanation: 'Customer 2\'s sandwich is being toasted. No other station is active. Customer 3 continues to wait outside.'
  },
  {
    cycle: 6,
    station1: { name: 'Empty', desc: '💤 Idle', active: false },
    station2: { name: 'Empty', desc: '💤 Idle', active: false },
    station3: { name: 'Customer 2', desc: '💰 Wrapping & Paying', active: true },
    explanation: 'Customer 2 is paying and wrapping up. Once again, Stations 1 and 2 are idle, and Customer 3 is still waiting.'
  },
  {
    cycle: 7,
    station1: { name: 'Customer 3', desc: '🍔 Ordering Sandwich', active: true },
    station2: { name: 'Empty', desc: '💤 Idle', active: false },
    station3: { name: 'Empty', desc: '💤 Idle', active: false },
    explanation: 'Customer 3 can finally order. Worker 1 is busy, but Workers 2 and 3 are sitting idle.'
  },
  {
    cycle: 8,
    station1: { name: 'Empty', desc: '💤 Idle', active: false },
    station2: { name: 'Customer 3', desc: '🔥 Toasting & Fillings', active: true },
    station3: { name: 'Empty', desc: '💤 Idle', active: false },
    explanation: 'Customer 3\'s sandwich is being toasted.'
  },
  {
    cycle: 9,
    station1: { name: 'Empty', desc: '💤 Idle', active: false },
    station2: { name: 'Empty', desc: '💤 Idle', active: false },
    station3: { name: 'Customer 3', desc: '💰 Wrapping & Paying', active: true },
    explanation: 'Customer 3 is paying. All 3 customers are finally served after 9 cycles. Total idle time for the workers was a massive 66%!'
  }
];

const SANDWICH_PIPELINED_STEPS: AnalogyStep[] = [
  {
    cycle: 1,
    station1: { name: 'Customer 1', desc: '🍔 Ordering Sandwich', active: true },
    station2: { name: 'Empty', desc: '💤 Idle', active: false },
    station3: { name: 'Empty', desc: '💤 Idle', active: false },
    explanation: 'Customer 1 starts ordering at Station 1. The other stations are idle because they are waiting for work to flow down the line.'
  },
  {
    cycle: 2,
    station1: { name: 'Customer 2', desc: '🍔 Ordering Sandwich', active: true },
    station2: { name: 'Customer 1', desc: '🔥 Toasting & Fillings', active: true },
    station3: { name: 'Empty', desc: '💤 Idle', active: false },
    explanation: '🚀 Parallel Overlap! While Customer 1\'s sandwich is being toasted at Station 2, Worker 1 is already taking Customer 2\'s order at Station 1! No waiting.'
  },
  {
    cycle: 3,
    station1: { name: 'Customer 3', desc: '🍔 Ordering Sandwich', active: true },
    station2: { name: 'Customer 2', desc: '🔥 Toasting & Fillings', active: true },
    station3: { name: 'Customer 1', desc: '💰 Wrapping & Paying', active: true },
    explanation: '🌟 Maximum Efficiency! All 3 stations are busy simultaneously! Customer 1 is paying, Customer 2 is getting toppings, and Customer 3 is ordering.'
  },
  {
    cycle: 4,
    station1: { name: '✅ Finished', desc: 'Next Customer', active: false, complete: true },
    station2: { name: 'Customer 3', desc: '🔥 Toasting & Fillings', active: true },
    station3: { name: 'Customer 2', desc: '💰 Wrapping & Paying', active: true },
    explanation: 'Customer 1 has already left the store happy! Customer 2 is paying, and Customer 3 is at Station 2. Continuous output is being maintained!'
  },
  {
    cycle: 5,
    station1: { name: '✅ Finished', desc: 'Next Customer', active: false, complete: true },
    station2: { name: '✅ Finished', desc: 'Next Customer', active: false, complete: true },
    station3: { name: 'Customer 3', desc: '💰 Wrapping & Paying', active: true },
    explanation: 'Customer 2 has left. Customer 3 is paying. All 3 customers are fully served in just 5 cycles, nearly twice as fast as sequential!'
  }
];

const HARDWARE_SEQUENTIAL_STEPS = [
  {
    cycle: 1,
    biu: { name: 'Instruction 1', desc: '📥 Fetching (Memory Access)', active: true },
    eu: { name: 'Empty', desc: '💤 Idle (Stalled)', active: false },
    explanation: 'The Bus Interface Unit (BIU) is fetching Instruction 1 from external memory. The Execution Unit (EU) is stalled waiting for code.'
  },
  {
    cycle: 2,
    biu: { name: 'Empty', desc: '💤 Idle', active: false },
    eu: { name: 'Instruction 1', desc: '⚙️ Executing (ALU Core)', active: true },
    explanation: 'The EU is executing Instruction 1. Since pipelining is turned OFF, the BIU remains completely idle and does not fetch Instruction 2 yet!'
  },
  {
    cycle: 3,
    biu: { name: 'Instruction 2', desc: '📥 Fetching (Memory Access)', active: true },
    eu: { name: 'Empty', desc: '💤 Idle (Stalled)', active: false },
    explanation: 'Instruction 1 has completed execution. Now, the BIU wakes up to fetch Instruction 2 while the EU sits idle waiting.'
  },
  {
    cycle: 4,
    biu: { name: 'Empty', desc: '💤 Idle', active: false },
    eu: { name: 'Instruction 2', desc: '⚙️ Executing (ALU Core)', active: true },
    explanation: 'The EU executes Instruction 2. The BIU goes back to sleep. Total execution is slow and disjointed.'
  },
  {
    cycle: 5,
    biu: { name: 'Instruction 3', desc: '📥 Fetching (Memory Access)', active: true },
    eu: { name: 'Empty', desc: '💤 Idle (Stalled)', active: false },
    explanation: 'The BIU fetches the third instruction from memory. The EU is once again stalled.'
  },
  {
    cycle: 6,
    biu: { name: 'Empty', desc: '💤 Idle', active: false },
    eu: { name: 'Instruction 3', desc: '⚙️ Executing (ALU Core)', active: true },
    explanation: 'The EU executes Instruction 3. All 3 instructions are completed in 6 cycles.'
  }
];

const HARDWARE_PIPELINED_STEPS = [
  {
    cycle: 1,
    biu: { name: 'Instruction 1', desc: '📥 Fetching (Memory Access)', active: true },
    eu: { name: 'Empty', desc: '💤 Idle (Stalled)', active: false },
    explanation: 'The BIU fetches Instruction 1 from memory into the prefetch queue. The EU is idle because it is cycle 1.'
  },
  {
    cycle: 2,
    biu: { name: 'Instruction 2', desc: '📥 Prefetching (Overlap!)', active: true },
    eu: { name: 'Instruction 1', desc: '⚙️ Executing (ALU Core)', active: true },
    explanation: '🚀 Parallel overlap! While the EU executes Instruction 1, the BIU asynchronously prefetches Instruction 2 from memory into the queue. Zero cycle delay!'
  },
  {
    cycle: 3,
    biu: { name: 'Instruction 3', desc: '📥 Prefetching (Overlap!)', active: true },
    eu: { name: 'Instruction 2', desc: '⚙️ Executing (ALU Core)', active: true },
    explanation: '🌟 Seamless concurrency! The EU executes Instruction 2, while the BIU prefetches Instruction 3 into the queue. The ALU never stalls.'
  },
  {
    cycle: 4,
    biu: { name: 'Empty', desc: '💤 Complete (Standby)', active: false },
    eu: { name: 'Instruction 3', desc: '⚙️ Executing (ALU Core)', active: true },
    explanation: 'All instructions have been prefetched. The EU executes the final instruction (Instruction 3) from the queue. Total time: 4 cycles instead of 6!'
  }
];

export default function PipeliningSimulator() {
  const [activeTab, setActiveTab] = useState<'intro' | 'architecture' | 'simulation' | 'analysis' | 'summary'>('intro');
  const [activeScenario, setActiveScenario] = useState<'sequential' | 'branch' | 'saturation'>('sequential');
  
  const currentScenario = SCENARIOS[activeScenario];
  const INSTRUCTIONS = currentScenario.instructions;

  // Simplified Analogy States
  const [introMode, setIntroMode] = useState<'analogy' | 'hardware'>('analogy');
  const [analogyStyle, setAnalogyStyle] = useState<'sequential' | 'pipelined'>('pipelined');
  const [analogyStep, setAnalogyStep] = useState<number>(1);

  useEffect(() => {
    setAnalogyStep(1);
  }, [analogyStyle, introMode]);

  // Concept Clarification Helper state
  const [helpTab, setHelpTab] = useState<'shift' | 'fetch' | 'cycle5'>('shift');

  // Simulator States
  const [queue, setQueue] = useState<string[]>([]); // Max 6 bytes
  const [biuPointer, setBiuPointer] = useState({ instIdx: 0, byteIdx: 0 }); // BIU prefetching position
  const [euPointer, setEuPointer] = useState(0); // EU active instruction
  const [euProgress, setEuProgress] = useState<'idle' | 'fetch' | 'decode' | 'execute'>('idle');
  const [euBytes, setEuBytes] = useState<string[]>([]); // Bytes retrieved by EU so far
  const [registers, setRegisters] = useState({ AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 });
  const [prevRegisters, setPrevRegisters] = useState({ AX: '0000H', BX: '0000H' });
  const [learningInsight, setLearningInsight] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1500); // Speed configuration
  const [flushFlash, setFlushFlash] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[System] Pipeline Simulator Initialized. Queue is empty.']);
  const [stepCount, setStepCount] = useState(0);
  const [currentExplanation, setCurrentExplanation] = useState<{
    biuAction: string;
    queueStatus: string;
    euStatus: string;
    parallelNote: string;
  } | null>(null);

  // Active Flow Animation flags
  const [animFlow, setAnimFlow] = useState<'none' | 'mem-to-biu' | 'biu-to-queue' | 'queue-to-eu'>('none');

  // Timeline history log
  const [cycleHistory, setCycleHistory] = useState<CycleRecord[]>([]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Auto simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && activeTab === 'simulation') {
      interval = setInterval(() => {
        handleStep();
      }, speedMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speedMs, stepCount, activeScenario, activeTab]);

  // Trigger full reset when changing scenarios
  useEffect(() => {
    handleReset();
  }, [activeScenario]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message].slice(-45));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsCompleted(false);
    setQueue([]);
    setBiuPointer({ instIdx: 0, byteIdx: 0 });
    setEuPointer(0);
    setEuProgress('idle');
    setEuBytes([]);
    setRegisters({ AX: '0000H', BX: '0000H', ZF: 0, CF: 0, SF: 0 });
    setPrevRegisters({ AX: '0000H', BX: '0000H' });
    setLogs([`Cycle 0: BIU initialized. Queue is empty. Execution Unit is idle.`]);
    setStepCount(0);
    setFlushFlash(false);
    setCurrentExplanation(null);
    setLearningInsight(null);
    setCycleHistory([]);
    setAnimFlow('none');
  };

  const handleStep = () => {
    const database = CYCLE_DATABASE[activeScenario];
    if (stepCount >= database.length) {
      setIsCompleted(true);
      setIsPlaying(false);
      addLog("Simulation completed! Reset or select another scenario.");
      return;
    }

    const nextStepNum = stepCount + 1;
    const cycleData = database[stepCount];

    // Trigger sequential animations to guide the eye
    if (cycleData.animFlow === 'mem-to-biu') {
      setAnimFlow('mem-to-biu');
      setTimeout(() => setAnimFlow('biu-to-queue'), 350);
    } else if (cycleData.animFlow) {
      setAnimFlow(cycleData.animFlow as any);
    } else {
      setAnimFlow('none');
    }

    // Save previous register state for visual delta highlighting
    setPrevRegisters({ AX: registers.AX, BX: registers.BX });

    // Update state variables directly from the Cycle Database
    setQueue(cycleData.queue);
    setBiuPointer(cycleData.biuPointer);
    setEuPointer(cycleData.euPointer);
    setEuProgress(cycleData.euProgress as any);
    setEuBytes(cycleData.euBytes);
    setRegisters(cycleData.registers);

    if (cycleData.isFlush) {
      setFlushFlash(true);
      setTimeout(() => setFlushFlash(false), 850);
    }

    // Update explanations
    setCurrentExplanation({
      biuAction: cycleData.biuAction,
      queueStatus: cycleData.queueStatus,
      euStatus: cycleData.euStatus,
      parallelNote: cycleData.parallelNote
    });

    // Handle learning insight popup notification
    if (cycleData.insight) {
      setLearningInsight(cycleData.insight);
    } else {
      setLearningInsight(null);
    }

    // Save history for Timeline
    const historyRecord: CycleRecord = {
      cycle: nextStepNum,
      biuState: cycleData.biuAction.includes("Fetching") 
        ? `Fetch ${cycleData.biuAction.match(/([0-9A-F]+H)/)?.[1] || 'Byte'}`
        : 'Standby',
      queueBytes: [...cycleData.queue],
      euState: cycleData.euProgress === 'idle' ? 'Idle' : `${cycleData.euProgress.toUpperCase()}`,
      isFlush: cycleData.isFlush || false
    };
    setCycleHistory(prev => [...prev, historyRecord].slice(-6));

    // Append cycle log messages
    if (cycleData.log) {
      setLogs(prev => [...prev, `Cycle ${nextStepNum}: ${cycleData.log}`].slice(-45));
    }

    setStepCount(nextStepNum);

    if (nextStepNum >= database.length) {
      setIsCompleted(true);
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-sky-50 text-slate-800 rounded-xl overflow-hidden font-sans border border-sky-200">
      
      {/* HEADER TABS: Curriculum Index Path */}
      <div className="bg-sky-100/90 border-b border-sky-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base font-bold text-sky-950 tracking-tight font-display">
              8086 Instruction Pipelining Lesson
            </h1>
          </div>
          <p className="text-xs text-sky-800 mt-1">
            A comprehensive, progressive module on Intel 8086 dual-core parallel operations.
          </p>
        </div>

        {/* 5 Lesson Steps Navigation */}
        <div className="flex flex-wrap bg-sky-200/50 p-1 rounded-lg border border-sky-200/80 gap-1">
          <button
            onClick={() => setActiveTab('intro')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'intro' ? 'bg-indigo-600 text-white shadow-sm' : 'text-sky-800 hover:text-sky-950 hover:bg-sky-200/30'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            1. Intro
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'architecture' ? 'bg-indigo-600 text-white shadow-sm' : 'text-sky-800 hover:text-sky-950 hover:bg-sky-200/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Architecture
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulation' ? 'bg-indigo-600 text-white shadow-sm' : 'text-sky-800 hover:text-sky-950 hover:bg-sky-200/30'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            3. Simulator
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analysis' ? 'bg-indigo-600 text-white shadow-sm' : 'text-sky-800 hover:text-sky-950 hover:bg-sky-200/30'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            4. Analysis
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'summary' ? 'bg-indigo-600 text-white shadow-sm' : 'text-sky-800 hover:text-sky-950 hover:bg-sky-200/30'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            5. Summary
          </button>
        </div>
      </div>

      {/* CORE AREA DYNAMIC RENDERING BASED ON ACTIVE TAB */}
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full bg-sky-50/50">
        
        {/* TAB 1: CONCEPT INTRODUCTION */}
        {activeTab === 'intro' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-3xl mx-auto py-4"
          >
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 font-mono">Section 1: Core Concept</span>
              <h2 className="text-2xl font-bold text-sky-950">What is Instruction Pipelining?</h2>
              <div className="h-1 w-20 bg-indigo-500 rounded mt-2"></div>
            </div>

            <div className="text-sm text-slate-700 space-y-4 leading-relaxed font-sans">
              <p>
                Instruction Pipelining is a fundamental hardware performance improvement technique introduced in the Intel 8086 microprocessor to accelerate program execution.
              </p>
              <p>
                In older processors, the execution loop was strictly sequential: the CPU had to <strong className="text-indigo-600 font-bold">fetch</strong> an instruction from memory, wait for it to arrive, <strong className="text-indigo-600 font-bold">execute</strong> it, and only then fetch the subsequent instruction. Since memory chips are physically slower than processor cores, the CPU spent a large portion of its clock cycles sitting idle.
              </p>
              <p>
                The 8086 eliminates this latency by <strong className="text-emerald-700 font-bold">overlapping the fetch and execute phases</strong>. Instead of waiting, the microprocessor continuously fetches upcoming instruction bytes from memory ahead of time, ensuring the execution unit almost always has its next operation ready to run.
              </p>
            </div>

            {/* Parallel Units Detail */}
            <div className="bg-white rounded-xl p-5 border border-sky-100 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-sky-900 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                The Two Independent Silicon Units
              </h3>
              <p className="text-xs text-slate-500">
                The 8086 physical silicon chip is split into two asynchronous processing blocks operating concurrently:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="bg-sky-100/30 border border-sky-100 rounded-lg p-3">
                  <strong className="text-indigo-600 text-xs font-mono block mb-1">1. Bus Interface Unit (BIU)</strong>
                  <span className="text-xs text-slate-600">
                    The prefetch module that communicates directly with external memory and continuously fetches instruction bytes.
                  </span>
                </div>
                <div className="bg-sky-100/30 border border-sky-100 rounded-lg p-3">
                  <strong className="text-emerald-600 text-xs font-mono block mb-1">2. Execution Unit (EU)</strong>
                  <span className="text-xs text-slate-600">
                    The core engine that pulls bytes from the prefetch queue, decodes their meaning, and executes them instantly.
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Simplified Concept Clarifier */}
            <div className="bg-white rounded-xl p-5 border border-indigo-150 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-950 uppercase tracking-wider font-mono">
                      Interactive Pipeline Concept Clarifier
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Step through clock cycles to see why pipelining is so much faster!
                    </p>
                  </div>
                </div>
                {/* Mode Selector */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
                  <button
                    onClick={() => setIntroMode('analogy')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                      introMode === 'analogy'
                        ? 'bg-indigo-600 text-white shadow-3xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🍔 Sandwich Analogy
                  </button>
                  <button
                    onClick={() => setIntroMode('hardware')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                      introMode === 'hardware'
                        ? 'bg-indigo-600 text-white shadow-3xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ Microprocessor Clock
                  </button>
                </div>
              </div>

              {/* Selector for Style: Sequential vs Pipelined */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">Workflow Method</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${analogyStyle === 'pipelined' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
                    <span className="text-xs font-bold text-slate-800">
                      {analogyStyle === 'pipelined' ? 'Pipelined (Overlapped parallel activity)' : 'Sequential (One at a time)'}
                    </span>
                  </div>
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 text-xs gap-1">
                  <button
                    onClick={() => setAnalogyStyle('sequential')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      analogyStyle === 'sequential'
                        ? 'bg-rose-600 text-white shadow-3xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Sequential (Slow)
                  </button>
                  <button
                    onClick={() => setAnalogyStyle('pipelined')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      analogyStyle === 'pipelined'
                        ? 'bg-emerald-600 text-white shadow-3xs'
                        : 'text-emerald-700 hover:text-emerald-950'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Pipelined (Fast)
                  </button>
                </div>
              </div>

              {/* Interactive Cycle Stepper Controller */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 font-mono">ACTIVE CYCLE:</span>
                  <div className="bg-indigo-100 text-indigo-800 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-indigo-200">
                    Cycle {analogyStep}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAnalogyStep(prev => Math.max(1, prev - 1))}
                    disabled={analogyStep === 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                    title="Previous Cycle"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  {/* Slider of cycle numbers */}
                  <div className="flex gap-1">
                    {Array.from(
                      { length: analogyStyle === 'sequential' ? (introMode === 'analogy' ? 9 : 6) : (introMode === 'analogy' ? 5 : 4) },
                      (_, i) => i + 1
                    ).map((n) => (
                      <button
                        key={n}
                        onClick={() => setAnalogyStep(n)}
                        className={`w-6 h-6 rounded-md text-[10.5px] font-mono font-bold border transition-all cursor-pointer ${
                          analogyStep === n
                            ? analogyStyle === 'pipelined'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-3xs'
                              : 'bg-rose-600 text-white border-rose-600 shadow-3xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setAnalogyStep(prev => Math.min(analogyStyle === 'sequential' ? (introMode === 'analogy' ? 9 : 6) : (introMode === 'analogy' ? 5 : 4), prev + 1))}
                    disabled={analogyStep === (analogyStyle === 'sequential' ? (introMode === 'analogy' ? 9 : 6) : (introMode === 'analogy' ? 5 : 4))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                    title="Next Cycle"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* RENDER DYNAMIC VISUALIZATION CANVAS */}
              {introMode === 'analogy' ? (
                // Sandwich Analogy Rendering
                <div className="space-y-4 pt-1">
                  {/* Visual Row of 3 Stations */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        title: 'Station 1: Take Order',
                        biuEquiv: 'BIU Fetch equivalent',
                        data: (analogyStyle === 'sequential' ? SANDWICH_SEQUENTIAL_STEPS : SANDWICH_PIPELINED_STEPS)[analogyStep - 1]?.station1,
                        colorClass: 'border-blue-100 bg-blue-50/20 text-blue-900',
                        activeColorClass: 'border-blue-500 bg-blue-50 text-blue-950 shadow-xs ring-1 ring-blue-500/15',
                        dotColor: 'bg-blue-500'
                      },
                      {
                        title: 'Station 2: Add Fillings',
                        biuEquiv: 'Prefetch Queue equivalent',
                        data: (analogyStyle === 'sequential' ? SANDWICH_SEQUENTIAL_STEPS : SANDWICH_PIPELINED_STEPS)[analogyStep - 1]?.station2,
                        colorClass: 'border-purple-100 bg-purple-50/20 text-purple-900',
                        activeColorClass: 'border-purple-500 bg-purple-50 text-purple-950 shadow-xs ring-1 ring-purple-500/15',
                        dotColor: 'bg-purple-500'
                      },
                      {
                        title: 'Station 3: Wrap & Pay',
                        biuEquiv: 'EU Execute equivalent',
                        data: (analogyStyle === 'sequential' ? SANDWICH_SEQUENTIAL_STEPS : SANDWICH_PIPELINED_STEPS)[analogyStep - 1]?.station3,
                        colorClass: 'border-emerald-100 bg-emerald-50/20 text-emerald-900',
                        activeColorClass: 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-500/15',
                        dotColor: 'bg-emerald-500'
                      }
                    ].map((st, idx) => {
                      const isActive = st.data?.active;
                      const isComplete = st.data?.complete;
                      return (
                        <div
                          key={idx}
                          className={`border-2 rounded-xl p-3.5 transition-all duration-300 flex flex-col justify-between h-28 ${
                            isActive ? st.activeColorClass : st.colorClass
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase font-mono tracking-wide">{st.title}</span>
                              {isActive && <span className="flex h-2 w-2 relative">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${st.dotColor} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${st.dotColor}`}></span>
                              </span>}
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{st.biuEquiv}</span>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200/50 flex items-center gap-2">
                            {isActive ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">👤</span>
                                <span className="text-xs font-bold font-mono">{st.data.name}</span>
                              </div>
                            ) : isComplete ? (
                              <span className="text-xs text-emerald-600 font-bold font-mono flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Serviced
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic font-mono">💤 Worker Idle</span>
                            )}
                          </div>
                          {isActive && (
                            <span className="text-[10px] text-slate-500 font-sans block truncate">{st.data.desc}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Real-time Dynamic Analogy Explainer Text */}
                  <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-widest font-mono block">ANALYSIS & WHY IT HAPPENS:</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {(analogyStyle === 'sequential' ? SANDWICH_SEQUENTIAL_STEPS : SANDWICH_PIPELINED_STEPS)[analogyStep - 1]?.explanation}
                    </p>
                  </div>
                </div>
              ) : (
                // Hardware Simulator Concept Rendering
                <div className="space-y-4 pt-1">
                  {/* High level units block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        name: 'Bus Interface Unit (BIU)',
                        role: 'FETCH PHASE',
                        data: (analogyStyle === 'sequential' ? HARDWARE_SEQUENTIAL_STEPS : HARDWARE_PIPELINED_STEPS)[analogyStep - 1]?.biu,
                        borderClass: 'border-blue-100 bg-blue-50/20 text-blue-900',
                        activeBorderClass: 'border-blue-500 bg-blue-50 text-blue-950 shadow-xs ring-1 ring-blue-500/15',
                        dotColor: 'bg-blue-500'
                      },
                      {
                        name: 'Execution Unit (EU)',
                        role: 'EXECUTE PHASE',
                        data: (analogyStyle === 'sequential' ? HARDWARE_SEQUENTIAL_STEPS : HARDWARE_PIPELINED_STEPS)[analogyStep - 1]?.eu,
                        borderClass: 'border-emerald-100 bg-emerald-50/20 text-emerald-900',
                        activeBorderClass: 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-500/15',
                        dotColor: 'bg-emerald-500'
                      }
                    ].map((u, idx) => {
                      const isActive = u.data?.active;
                      return (
                        <div
                          key={idx}
                          className={`border-2 rounded-xl p-4 transition-all duration-300 flex flex-col justify-between h-28 ${
                            isActive ? u.activeBorderClass : u.borderClass
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold font-mono uppercase tracking-wide">{u.name}</span>
                              {isActive && <span className="flex h-2 w-2 relative">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${u.dotColor} opacity-75`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${u.dotColor}`}></span>
                              </span>}
                            </div>
                            <span className="text-[9.5px] text-slate-400 font-extrabold font-mono uppercase">{u.role}</span>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200/50 flex flex-col">
                            {isActive ? (
                              <div>
                                <span className="text-xs font-bold font-mono text-slate-800">{u.data.name}</span>
                                <span className="text-[10px] text-slate-500 block font-mono">{u.data.desc}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic font-mono flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Unit Suspended (Idle)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Real-time Dynamic Hardware Explanation text */}
                  <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-widest font-mono block">HARDWARE EXPLANATION:</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {(analogyStyle === 'sequential' ? HARDWARE_SEQUENTIAL_STEPS : HARDWARE_PIPELINED_STEPS)[analogyStep - 1]?.explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic Comparison Summary Footer Card */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2">
                <span className="text-slate-500">Compare Total Execution Steps:</span>
                <div className="flex flex-wrap gap-3">
                  <span className="text-slate-700">
                    🔄 Sequential: <strong className="text-red-600 font-extrabold">{introMode === 'analogy' ? '9 Steps' : '6 Cycles'}</strong>
                  </span>
                  <span className="text-slate-700">
                    🚀 Pipelined: <strong className="text-emerald-600 font-extrabold">{introMode === 'analogy' ? '5 Steps' : '4 Cycles'}</strong>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                    ~{introMode === 'analogy' ? '44%' : '33%'} Faster!
                  </span>
                </div>
              </div>
            </div>

            {/* Important Note Callout block */}
            <div className="bg-indigo-50/50 border-l-4 border-indigo-500 rounded-r-xl p-4 text-indigo-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-600 font-mono">
                <Info className="w-4 h-4" />
                Important Academic Note
              </div>
              <p className="text-xs leading-relaxed text-indigo-950">
                "Pipelining improves performance by overlapping instruction fetch and execution. It does not execute multiple instructions simultaneously."
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setActiveTab('architecture')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                Proceed to Pipeline Architecture
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 2: 8086 PIPELINE ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 py-4"
          >
            <div className="space-y-2 max-w-3xl mx-auto text-center md:text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 font-mono">Section 2: Inside the Silicon</span>
              <h2 className="text-2xl font-bold text-sky-950">The 8086 Pipeline Hardware Architecture</h2>
              <p className="text-xs text-slate-500">
                Explore the three key components that make continuous hardware prefetching possible.
              </p>
            </div>

            {/* Three Educational Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Card 1: BIU */}
              <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Database className="w-5 h-5" />
                    <h3 className="font-bold text-sm font-mono tracking-wider uppercase">Bus Interface Unit (BIU)</h3>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    The BIU acts as the gateway to the external system bus and physical RAM chips. It works asynchronously to retrieve instructions.
                  </p>
                  <ul className="space-y-2 text-[11px] text-slate-600 list-disc list-inside">
                    <li>Communicates with memory</li>
                    <li>Fetches instruction bytes from RAM</li>
                    <li>Reads and writes data variables</li>
                    <li>Maintains 16-bit Segment Registers</li>
                    <li>Continuously fills the queue when space is free</li>
                  </ul>
                </div>
                <div className="bg-indigo-50/50 p-2.5 rounded border border-indigo-100 text-[10px] text-indigo-700 font-mono leading-relaxed">
                  💡 <strong>Professor Note:</strong> The BIU operates independently of the Execution Unit, eliminating waiting states.
                </div>
              </div>

              {/* Card 2: Prefetch Queue */}
              <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Layers className="w-5 h-5" />
                    <h3 className="font-bold text-sm font-mono tracking-wider uppercase">Prefetch Queue</h3>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    A dedicated, high-speed 6-byte FIFO (First-In, First-Out) internal cache buffer that acts as the bridge between both blocks.
                  </p>
                  <ul className="space-y-2 text-[11px] text-slate-600 list-disc list-inside">
                    <li>The BIU inserts bytes at the rear</li>
                    <li>The EU removes bytes from the front</li>
                    <li>Operates as standard FIFO buffer</li>
                    <li>Holds up to 6 decoded/raw bytes</li>
                    <li>Decouples memory fetch speed from ALU speed</li>
                  </ul>
                </div>
                <div className="bg-amber-50/50 p-2.5 rounded border border-amber-100 text-[10px] text-amber-700 font-mono leading-relaxed">
                  🛒 <strong>FIFO Example:</strong> Think of a queue at a movie counter. The first byte that enters is the first one decoded & executed by the EU!
                </div>
              </div>

              {/* Card 3: Execution Unit */}
              <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Cpu className="w-5 h-5" />
                    <h3 className="font-bold text-sm font-mono tracking-wider uppercase">Execution Unit (EU)</h3>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    The core mathematical unit of the microprocessor. It takes bytes from the queue rather than requesting memory directly.
                  </p>
                  <ul className="space-y-2 text-[11px] text-slate-600 list-disc list-inside">
                    <li>Reads bytes directly from the FIFO</li>
                    <li>Decodes instruction meanings</li>
                    <li>Executes operations (ALU core)</li>
                    <li>Updates internal registers (AX, BX, etc.)</li>
                    <li>Calculates and updates status flags</li>
                  </ul>
                </div>
                <div className="bg-emerald-50/50 p-2.5 rounded border border-emerald-100 text-[10px] text-emerald-700 font-mono leading-relaxed">
                  ❌ <strong>Hardware Rule:</strong> The EU never communicates with memory directly to fetch instructions; it only reads from the queue.
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-6 max-w-3xl mx-auto">
              <button
                onClick={() => setActiveTab('intro')}
                className="text-xs text-slate-500 hover:text-sky-950 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                Back to Section 1
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                Launch Interactive Simulator
                <PlayCircle className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 3: INTERACTIVE PIPELINE SIMULATION */}
        {activeTab === 'simulation' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Simulation Header and Scenario Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-sky-200/50 pb-4 gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 font-mono">Section 3: Interactive Stage</span>
                <h2 className="text-xl font-bold text-sky-950 flex items-center gap-2 mt-1">
                  8086 Clock-by-Clock Pipeline Simulator
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step through the execution clock cycles or auto-run to visualize the queue operation and flush cycles.
                </p>
              </div>

              {/* Scenario Selector */}
              <div className="flex bg-sky-200/50 p-1 rounded-lg border border-sky-200/80 text-xs self-start lg:self-auto gap-1">
                {(Object.keys(SCENARIOS) as Array<keyof typeof SCENARIOS>).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveScenario(key)}
                    className={`px-3 py-1.5 rounded font-semibold transition-all cursor-pointer ${
                      activeScenario === key
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-sky-800 hover:text-sky-950 hover:bg-sky-200/20'
                    }`}
                  >
                    {SCENARIOS[key].name}
                  </button>
                ))}
              </div>
            </div>

            {isCompleted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="flex gap-3 items-start text-left">
                  <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-emerald-950">
                      Scenario Complete!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed font-mono">
                      You have completed the <strong className="font-extrabold">{SCENARIOS[activeScenario].name}</strong> simulation. You can click 'Reset Simulation' or select another scenario to compare pipeline characteristics.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={handleReset}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-all"
                  >
                    Rerun Scenario
                  </button>
                  <button 
                    onClick={() => setActiveTab('analysis')}
                    className="bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-800 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-all"
                  >
                    Go to Analysis →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Grid Layout: Hardware Simulation Sandbox */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT Sandbox View (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Pipeline Bus Diagram */}
                <div className={`relative rounded-xl border p-5 transition-all duration-300 ${
                  flushFlash 
                    ? 'border-red-500 bg-red-50 shadow-lg shadow-red-100/50' 
                    : 'border-sky-200/60 bg-white'
                }`}>
                  {flushFlash && (
                    <div className="absolute inset-0 bg-red-50/95 rounded-xl z-50 flex flex-col items-center justify-center text-center p-4">
                      <ShieldAlert className="w-10 h-10 text-red-500 animate-bounce mb-2" />
                      <h4 className="text-sm font-extrabold text-red-700 uppercase font-mono tracking-wider">
                        Branch Hazard: Pipeline Flushed!
                      </h4>
                      <p className="text-xs text-slate-700 max-w-md mt-1 leading-relaxed">
                        A JMP branch instruction has altered the Instruction Pointer (IP). Prefetched bytes in the queue are now invalid and cleared instantly.
                      </p>
                    </div>
                  )}

                  {/* Flow Animation Nodes */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-sky-100 pb-2 mb-2">
                      <span className="text-[10px] font-bold font-mono uppercase text-sky-800 tracking-wider">
                        Hardware Bus Data-Flow Waveform
                      </span>
                      <div className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-mono text-indigo-700 font-semibold">
                        CLK Cycle: {stepCount}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-2 pt-2 relative">
                      
                      {/* Block A: Memory Stream */}
                      <div className="md:col-span-2 bg-sky-50/50 border border-sky-100 p-3 rounded-lg text-center space-y-1">
                        <span className="text-[9px] font-bold font-mono uppercase text-sky-700 block">External RAM</span>
                        <div className="font-mono text-xs text-indigo-700 font-semibold bg-sky-100/50 py-1.5 px-2 rounded border border-sky-100 truncate">
                          {INSTRUCTIONS[biuPointer.instIdx] 
                            ? `RAM [Byte ${biuPointer.byteIdx}]: ${INSTRUCTIONS[biuPointer.instIdx].bytes[biuPointer.byteIdx]}H` 
                            : 'EOF'
                          }
                        </div>
                      </div>

                      {/* Connection 1 */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center text-center relative py-2">
                        <span className="text-[8px] font-mono text-sky-700">Fetch Bus</span>
                        <div className="w-full h-1 bg-sky-100 rounded-full relative overflow-hidden">
                          {animFlow === 'mem-to-biu' && (
                            <motion.div 
                              initial={{ left: '-50%' }}
                              animate={{ left: '100%' }}
                              transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                              className="absolute w-6 h-full bg-indigo-500 rounded-full" 
                            />
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-sky-700 mt-1" />
                      </div>

                      {/* Block B: BIU */}
                      <div className="md:col-span-1 bg-sky-50/50 border border-sky-100 p-3 rounded-lg text-center">
                        <span className="text-[9px] font-bold font-mono uppercase text-sky-700 block mb-1">BIU Unit</span>
                        <div className="font-mono text-[10px] font-bold text-sky-950">
                          {queue.length < 6 ? 'ACTIVE' : 'IDLE (SUSPEND)'}
                        </div>
                      </div>

                      {/* Connection 2 */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center text-center relative py-2">
                        <span className="text-[8px] font-mono text-sky-700">Prefetch Bus</span>
                        <div className="w-full h-1 bg-sky-100 rounded-full relative overflow-hidden">
                          {animFlow === 'biu-to-queue' && (
                            <motion.div 
                              initial={{ left: '-50%' }}
                              animate={{ left: '100%' }}
                              transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                              className="absolute w-6 h-full bg-amber-500 rounded-full" 
                            />
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-sky-700 mt-1" />
                      </div>

                      {/* Block C: EU Core */}
                      <div className="md:col-span-2 bg-sky-50/50 border border-sky-100 p-3 rounded-lg text-center space-y-1">
                        <span className="text-[9px] font-bold font-mono uppercase text-sky-700 block">EU Decoder</span>
                        <div className="font-mono text-xs text-emerald-700 font-semibold bg-sky-100/50 py-1.5 px-2 rounded border border-sky-100 uppercase">
                          {euProgress === 'fetch' ? 'Fetching Opcode' : `${euProgress} phase`}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* 6-Byte FIFO Queue Visualization */}
                <div className="bg-white border border-sky-200/60 rounded-xl p-5 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-950">
                        BIU 6-Byte FIFO Instruction Prefetch Queue
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded">
                      Occupancy: {queue.length} / 6 Bytes Saturated
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-3">
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const byte = queue[idx];
                      const exists = !!byte;
                      return (
                        <div
                           key={idx}
                           className={`h-14 rounded-lg border relative flex flex-col items-center justify-center transition-all ${
                             exists 
                               ? 'bg-amber-50/75 border-amber-400 shadow-xs ring-1 ring-amber-300/30' 
                               : 'bg-sky-50/30 border-dashed border-sky-200'
                           }`}
                        >
                          <span className="absolute top-1 left-2 text-[8px] font-mono text-sky-800/80 uppercase">
                            Slot {idx + 1}
                          </span>
                          {exists ? (
                            <span className="text-xs font-bold font-mono text-amber-750 mt-2 animate-fade-in">
                              {byte}H
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400 mt-2 italic">
                              Empty
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-slate-600 px-1 pt-1 border-t border-sky-100">
                    <span className="flex items-center gap-1 text-emerald-600">
                      ← EU pulls from Front (Slot 1)
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600">
                      BIU appends at Rear →
                    </span>
                  </div>
                </div>

                {/* Interactive Concept Clarifier Q&A */}
                <div id="qna-explainer" className="bg-amber-50/40 border border-amber-200 rounded-xl p-5 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200/50 pb-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                      <div>
                        <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-950">
                          FIFO Queue & Memory Fetch Q&A Explainer
                        </h4>
                        <p className="text-[10px] text-amber-800 font-sans mt-0.5">
                          Highly requested clarifications about the internal 8086 pipeline architecture.
                        </p>
                      </div>
                    </div>

                    {/* Selector Tabs */}
                    <div className="flex bg-amber-100/60 p-0.5 rounded-lg border border-amber-250 text-[11px] self-start sm:self-auto font-mono flex-wrap gap-1">
                      <button
                        onClick={() => setHelpTab('shift')}
                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          helpTab === 'shift'
                            ? 'bg-amber-600 text-white shadow-3xs'
                            : 'text-amber-850 hover:text-amber-955'
                        }`}
                      >
                        🔄 Slot 1 Shifting
                      </button>
                      <button
                        onClick={() => setHelpTab('fetch')}
                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          helpTab === 'fetch'
                            ? 'bg-amber-600 text-white shadow-3xs'
                            : 'text-amber-850 hover:text-amber-955'
                        }`}
                      >
                        📥 Memory Bus Fetches
                      </button>
                      <button
                        onClick={() => setHelpTab('cycle5')}
                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          helpTab === 'cycle5'
                            ? 'bg-amber-600 text-white shadow-3xs'
                            : 'text-amber-850 hover:text-amber-955'
                        }`}
                      >
                        ⚡ Why Queue Grows (Cycle 5)
                      </button>
                    </div>
                  </div>

                  {helpTab === 'shift' ? (
                    <div className="space-y-4 text-xs">
                      <div className="bg-white/85 p-3.5 rounded-xl border border-amber-100/80 space-y-2">
                        <p className="font-bold text-amber-950 text-sm">
                          ❓ "Why is Slot 1 overwritten with 34H? Why isn't it written to Slot 2 instead?"
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          This is a very common source of confusion! The prefetch queue is a <strong>FIFO (First-In, First-Out) Shift Register</strong>, meaning it operates like a <strong>grocery checkout conveyor belt</strong> rather than a static array of slots.
                        </p>
                      </div>

                      {/* Interactive visual stepping diagram of the shift */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        <div className="bg-white border border-amber-100 rounded-lg p-3 space-y-2.5">
                          <span className="text-[9px] font-bold text-amber-750 uppercase font-mono block">Step 1: Opcode Fetched</span>
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <div className="w-12 h-8 rounded border border-amber-400 bg-amber-50 flex items-center justify-center font-bold text-amber-900">
                              B8H
                            </div>
                            <div className="w-12 h-8 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                              empty
                            </div>
                            <div className="w-12 h-8 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                              empty
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 font-sans leading-tight">
                            The BIU fetches <strong>B8H</strong> and pushes it. Since the queue is empty, it lands at the front in <strong>Slot 1</strong>.
                          </p>
                        </div>

                        <div className="bg-white border border-amber-100 rounded-lg p-3 space-y-2.5">
                          <span className="text-[9px] font-bold text-amber-750 uppercase font-mono block">Step 2: EU Pops B8H</span>
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <div className="w-12 h-8 rounded border border-dashed border-rose-300 bg-rose-50/70 flex items-center justify-center font-bold text-rose-700">
                              pop!
                            </div>
                            <div className="w-12 h-8 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                              empty
                            </div>
                            <div className="w-12 h-8 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                              empty
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 font-sans leading-tight">
                            In the next cycle, the EU <strong>pops</strong> B8H out of the queue to start processing. <strong>Slot 1 is now instantly empty again!</strong>
                          </p>
                        </div>

                        <div className="bg-white border border-amber-100 rounded-lg p-3 space-y-2.5">
                          <span className="text-[9px] font-bold text-amber-750 uppercase font-mono block">Step 3: New Byte Pushed</span>
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <div className="w-12 h-8 rounded border border-emerald-400 bg-emerald-50 flex items-center justify-center font-bold text-emerald-800">
                              34H
                            </div>
                            <div className="w-12 h-8 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                              empty
                            </div>
                            <div className="w-12 h-8 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                              empty
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 font-sans leading-tight">
                            Simultaneously, the BIU fetches the next byte <strong>34H</strong>. Since the queue shifted and Slot 1 was empty, <strong>34H goes straight into Slot 1</strong>!
                          </p>
                        </div>
                      </div>

                      <div className="bg-amber-100/50 border-l-4 border-amber-500 p-3 rounded-r-lg text-[11px] text-amber-900 leading-relaxed font-sans">
                        <strong>Summary:</strong> It was not an "overwrite" in memory. It is the behavior of a <strong>shifting pipeline</strong>. When the byte in front is consumed, the remaining space moves forward. If the EU hadn't consumed B8H, 34H would indeed have been written into Slot 2! But because B8H was retrieved, the conveyor belt advanced, placing 34H in Slot 1.
                      </div>
                    </div>
                  ) : helpTab === 'fetch' ? (
                    <div className="space-y-4 text-xs">
                      <div className="bg-white/85 p-3.5 rounded-xl border border-amber-100/80 space-y-2">
                        <p className="font-bold text-amber-950 text-sm">
                          ❓ "When `MOV AX, 1234H` is fetched from memory, is each byte fetched one-by-one or are all bytes fetched at once?"
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          <strong>They are fetched one-by-one over multiple clock cycles!</strong> The CPU cannot physically fetch all 3 bytes at the same time. Let's see why:
                        </p>
                      </div>

                      {/* Visual memory mapping of bytes */}
                      <div className="bg-white border border-amber-100 rounded-lg p-4 space-y-3.5">
                        <span className="text-[9px] font-bold text-amber-750 uppercase font-mono block">Memory Layout of 3-Byte instruction: MOV AX, 1234H</span>
                        
                        <div className="space-y-1.5 max-w-md">
                          <div className="flex items-center gap-3">
                            <span className="w-16 font-mono text-[10px] text-slate-500">Address 1000H:</span>
                            <div className="flex-1 h-7 border border-blue-200 bg-blue-50/50 rounded flex items-center justify-between px-3 font-mono text-[11px] text-blue-900">
                              <span className="font-bold">B8H</span>
                              <span className="text-[9px] text-blue-700 font-semibold">Opcode (Instructions for MOV AX)</span>
                            </div>
                            <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">Cycle 1 Fetch</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="w-16 font-mono text-[10px] text-slate-500">Address 1001H:</span>
                            <div className="flex-1 h-7 border border-emerald-200 bg-emerald-50/50 rounded flex items-center justify-between px-3 font-mono text-[11px] text-emerald-900">
                              <span className="font-bold">34H</span>
                              <span className="text-[9px] text-emerald-700 font-semibold">Low Byte of Immediate (1234H)</span>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">Cycle 2 Fetch</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="w-16 font-mono text-[10px] text-slate-500">Address 1002H:</span>
                            <div className="flex-1 h-7 border border-purple-200 bg-purple-50/50 rounded flex items-center justify-between px-3 font-mono text-[11px] text-purple-900">
                              <span className="font-bold">12H</span>
                              <span className="text-[9px] text-purple-700 font-semibold">High Byte of Immediate (1234H)</span>
                            </div>
                            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">Cycle 3 Fetch</span>
                          </div>
                        </div>

                        <div className="text-[10.5px] text-slate-600 leading-relaxed font-sans space-y-1.5 pt-1">
                          <p>
                            1. Memory in the 8086 system is strictly <strong>byte-addressable</strong> (each address holds exactly 8 bits / 1 byte).
                          </p>
                          <p>
                            2. To read the instruction, the BIU must trigger the external system bus to read Address 1000H first, then 1001H, then 1002H.
                          </p>
                          <p>
                            3. <strong>The Pipelining Advantage:</strong> Because reading memory over the system bus is slow, the BIU prefetches these bytes into the 6-byte queue in advance. That way, the execution core (EU) doesn't have to wait for the memory fetches—it gets them instantly from the queue!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // CYCLE 5 PIPELINE GROWTH WALKTHROUGH
                    <div className="space-y-4 text-xs">
                      <div className="bg-white/85 p-3.5 rounded-xl border border-amber-100/80 space-y-2">
                        <p className="font-bold text-amber-950 text-sm">
                          ❓ "In Cycle 5, how does the queue grow to 2 bytes?"
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          The queue size is determined by a simple balance equation: <br />
                          <strong className="text-amber-900 font-mono text-[11px] block mt-1.5 bg-amber-50 p-2 rounded border border-amber-150">
                            New Queue Size = Previous Size + (Bytes Fetched by BIU) - (Bytes Consumed by EU)
                          </strong>
                        </p>
                      </div>

                      {/* Interactive visual stepping diagram of the shift */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        <div className="bg-white border border-amber-100 rounded-xl p-3.5 space-y-3 shadow-3xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Cycle 4 (Setup)</span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono font-bold px-1.5 py-0.5 rounded">EU Pulls</span>
                          </div>
                          
                          <div className="space-y-2 border-t border-slate-100 pt-2 text-[11px] font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Queue State:</span>
                              <span className="font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded">['BB'] (1 Byte)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">EU Action:</span>
                              <span className="font-bold text-rose-600">Pops '12H' (-1)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">BIU Action:</span>
                              <span className="font-bold text-blue-600">Fetches 'BBH' (+1)</span>
                            </div>
                          </div>
                          <p className="text-[10.5px] text-slate-600 font-sans leading-relaxed pt-2 border-t border-slate-100">
                            The EU pops <strong>12H</strong> (the 3rd byte of <code>MOV AX</code>) into its decoder. Simultaneously, the BIU fetches the next instruction's opcode <strong>BBH</strong> into the queue.
                          </p>
                        </div>

                        <div className="bg-amber-50/30 border-2 border-amber-400 rounded-xl p-3.5 space-y-3 shadow-2xs relative">
                          <div className="absolute -top-2.5 right-3 bg-amber-600 text-white font-mono text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            Active Cycle
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-900 uppercase font-mono block">Cycle 5 (The Shift)</span>
                            <span className="text-[10px] bg-amber-200 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">Queue Grows!</span>
                          </div>
                          
                          <div className="space-y-2 border-t border-amber-200 pt-2 text-[11px] font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-amber-800">Queue Start:</span>
                              <span className="font-bold text-amber-900">['BB'] (1 Byte)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-amber-800">EU Action:</span>
                              <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-150">🧠 DECODE (0 Pops)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-amber-800">BIU Action:</span>
                              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-150">📥 FETCH '11H' (+1)</span>
                            </div>
                            <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-amber-350">
                              <span className="font-bold text-amber-950">Queue End:</span>
                              <span className="font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">['BB', '11'] (2)</span>
                            </div>
                          </div>
                          <p className="text-[10.5px] text-slate-700 font-sans leading-relaxed pt-2 border-t border-dashed border-amber-200">
                            <strong>Why does it grow?</strong> Since decoding is an <em>internal</em> CPU activity, the EU <strong>does not pull any bytes from the queue</strong> in Cycle 5 (consumed = 0). But the autonomous BIU keeps fetching and pushes <strong>11H</strong> (+1). Thus: 1 + 1 - 0 = <strong>2 bytes</strong>!
                          </p>
                        </div>

                        <div className="bg-white border border-amber-100 rounded-xl p-3.5 space-y-3 shadow-3xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Cycle 6 (Next Cycle)</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.5 rounded">Grows More</span>
                          </div>
                          
                          <div className="space-y-2 border-t border-slate-100 pt-2 text-[11px] font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Queue Start:</span>
                              <span className="font-bold text-slate-900">['BB', '11'] (2)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">EU Action:</span>
                              <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-150">⚡ EXECUTE (0 Pops)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">BIU Action:</span>
                              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-150">📥 FETCH '11H' (+1)</span>
                            </div>
                            <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-slate-200">
                              <span className="font-bold text-slate-950">Queue End:</span>
                              <span className="font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">['BB', '11', '11'] (3)</span>
                            </div>
                          </div>
                          <p className="text-[10.5px] text-slate-600 font-sans leading-relaxed pt-2 border-t border-slate-100">
                            The EU is now executing <code>MOV AX, 1234H</code> (consumed = 0). The BIU fetches the next operand <strong>11H</strong> (+1). The queue continues to grow: 2 + 1 - 0 = <strong>3 bytes</strong>!
                          </p>
                        </div>
                      </div>

                      <div className="bg-amber-100/50 border-l-4 border-amber-500 p-3 rounded-r-lg text-[11px] text-amber-900 leading-relaxed font-sans flex items-start gap-2">
                        <span className="text-base shrink-0">💡</span>
                        <span>
                          <strong>Key Takeaway:</strong> Pipelining works because the BIU can <strong>build up a backlog</strong> of instructions in the queue while the EU is busy decoding and executing instructions inside the chip. When the EU finishes execution, it doesn't have to wait for the memory bus—it pops the pre-fetched bytes immediately!
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Clock Timeline Overlap Trace Chart (Gantt representation) */}
                <div className="bg-white border border-sky-200/60 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-950">
                        Parallel Overlapping Activities Timeline
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-600 italic">Simulated Gantt Waveform</span>
                  </div>

                  {cycleHistory.length === 0 ? (
                    <div className="text-xs text-slate-500 italic font-mono py-8 text-center border border-dashed border-sky-200 rounded-lg">
                      No clock records simulated yet. Click "Step Cycle" or "Auto Run" to build timeline.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                      {cycleHistory.map((h, i) => (
                        <div 
                          key={i} 
                          className={`grid grid-cols-1 md:grid-cols-12 gap-2 text-[11px] font-mono p-2.5 rounded-lg border transition-all ${
                            h.isFlush 
                              ? 'bg-red-50 border-red-200 text-slate-800' 
                              : 'bg-sky-50/50 border-sky-100 text-slate-800'
                          }`}
                        >
                          <div className="md:col-span-2 flex items-center gap-1.5">
                            <span className="bg-indigo-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded">
                              CLK {h.cycle}
                            </span>
                            {h.isFlush && (
                              <span className="bg-red-650 text-white font-bold text-[8px] px-1 rounded animate-pulse">
                                FLUSHED
                              </span>
                            )}
                          </div>
                          <div className="md:col-span-4 border-l border-sky-100 md:pl-3">
                            <span className="text-[9px] text-slate-500 uppercase block leading-none mb-1">BIU Stage</span>
                            <span className="text-indigo-700 font-medium">{h.biuState}</span>
                          </div>
                          <div className="md:col-span-3 border-l border-sky-100 md:pl-3">
                            <span className="text-[9px] text-slate-500 uppercase block leading-none mb-1">FIFO Queue Content</span>
                            <span className="text-amber-300">
                              {h.queueBytes.length > 0 ? h.queueBytes.map(b => b + 'H').join(' | ') : 'Empty'}
                            </span>
                          </div>
                          <div className="md:col-span-3 border-l border-sky-100 md:pl-3">
                            <span className="text-[9px] text-slate-500 uppercase block leading-none mb-1">EU Stage</span>
                            <span className="text-emerald-700 font-medium">{h.euState}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT Controls & Monitor Panel (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Control Panel */}
                <div className="bg-white border border-sky-200/60 rounded-xl p-4 space-y-3.5 shadow-xs">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-950 border-b border-sky-100 pb-2">
                    Simulation Controllers
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isPlaying 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isPlaying ? 'Pause Run' : 'Auto Run'}
                    </button>
                    <button
                      onClick={handleStep}
                      disabled={isPlaying}
                      className="py-2 px-3 rounded-lg text-xs font-bold bg-sky-100 text-sky-800 hover:bg-sky-200/60 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 border border-sky-200 cursor-pointer"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      Step Cycle
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Cycle Speed Delay:</span>
                      <strong className="text-sky-950">{(speedMs / 1000).toFixed(1)}s</strong>
                    </div>
                    <input 
                      type="range"
                      min="500"
                      max="3000"
                      step="250"
                      value={speedMs}
                      onChange={(e) => setSpeedMs(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full py-1.5 px-3 rounded text-xs font-semibold bg-sky-50 text-sky-700 hover:text-sky-950 hover:bg-sky-100/60 transition-all flex items-center justify-center gap-1.5 border border-sky-100 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Simulation
                  </button>
                </div>

                {/* Clock Details Display Card */}
                <div className="bg-white border border-sky-200/60 rounded-xl p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-950 border-b border-sky-100 pb-2">
                    Active Step Parameters
                  </h4>
                  
                  <div className="space-y-2 text-xs font-mono">
                    <div className="bg-sky-100/30 border border-sky-100/60 p-2.5 rounded flex justify-between">
                      <span className="text-slate-600">Current Instruction:</span>
                      <strong className="text-indigo-600 font-bold">{INSTRUCTIONS[euPointer]?.label || 'HALT'}</strong>
                    </div>
                    <div className="bg-sky-100/30 border border-sky-100/60 p-2.5 rounded flex justify-between">
                      <span className="text-slate-600">Instruction Bytes:</span>
                      <strong className="text-sky-900 font-semibold">{INSTRUCTIONS[euPointer]?.bytes.join(' ')}H</strong>
                    </div>
                    <div className="bg-sky-100/30 border border-sky-100/60 p-2.5 rounded flex justify-between">
                      <span className="text-slate-600">Queue Contents:</span>
                      <strong className="text-amber-700 font-semibold">{currentExplanation ? currentExplanation.queueStatus : 'Empty'}</strong>
                    </div>
                    <div className="bg-sky-100/30 border border-sky-100/60 p-2.5 rounded flex justify-between">
                      <span className="text-slate-600">BIU Activity:</span>
                      <strong className="text-indigo-600 font-semibold text-right max-w-[150px] truncate">{currentExplanation ? currentExplanation.biuAction : 'Idle'}</strong>
                    </div>
                    <div className="bg-sky-100/30 border border-sky-100/60 p-2.5 rounded flex justify-between">
                      <span className="text-slate-600">EU Activity:</span>
                      <strong className="text-emerald-600 font-semibold text-right max-w-[150px] truncate">{currentExplanation ? currentExplanation.euStatus : 'Idle'}</strong>
                    </div>
                  </div>
                </div>

                {/* Registers Monitor & Flag Registers */}
                <div className="bg-white border border-sky-200/60 rounded-xl p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-950 border-b border-sky-100 pb-2">
                    Silicon States & Flags
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded flex flex-col items-center border transition-all duration-500 ${
                      registers.AX !== prevRegisters.AX 
                        ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-400/50 animate-pulse' 
                        : 'bg-sky-100/30 border-sky-100/60'
                    }`}>
                      <span className="text-[8px] font-mono font-bold text-slate-600 uppercase">AX Value</span>
                      <span className="text-xs font-bold font-mono text-indigo-600 mt-0.5">{registers.AX}</span>
                    </div>
                    <div className={`p-2 rounded flex flex-col items-center border transition-all duration-500 ${
                      registers.BX !== prevRegisters.BX 
                        ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-400/50 animate-pulse' 
                        : 'bg-sky-100/30 border-sky-100/60'
                    }`}>
                      <span className="text-[8px] font-mono font-bold text-slate-600 uppercase">BX Value</span>
                      <span className="text-xs font-bold font-mono text-emerald-600 mt-0.5">{registers.BX}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono pt-1">
                    <div className={`p-1.5 rounded border ${registers.ZF === 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold shadow-xs' : 'bg-sky-100/30 border-sky-100/50 text-slate-400'}`}>
                      ZF: {registers.ZF}
                    </div>
                    <div className={`p-1.5 rounded border ${registers.SF === 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold shadow-xs' : 'bg-sky-100/30 border-sky-100/50 text-slate-400'}`}>
                      SF: {registers.SF}
                    </div>
                    <div className={`p-1.5 rounded border ${registers.CF === 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold shadow-xs' : 'bg-sky-100/30 border-sky-100/50 text-slate-400'}`}>
                      CF: {registers.CF}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Professor Detailed Explanatory Panel with Learning Insight overlay */}
            <div className="space-y-4">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-2.5 shadow-xs">
                <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-indigo-600 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Active Cycle Explanation
                </h4>
                <p className="text-xs leading-relaxed text-indigo-950 font-mono">
                  {stepCount === 0 
                    ? "• System is currently reset. Click the 'Step Cycle' or 'Auto Run' button to start simulation cycles and view dynamic pipeline behaviors." 
                    : currentExplanation?.parallelNote
                  }
                </p>
              </div>

              {learningInsight && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-xl p-4 shadow-sm flex gap-3 items-start"
                >
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-950">
                      Professor's Core Learning Insight
                    </h5>
                    <p className="text-xs mt-1 leading-relaxed font-mono">
                      {learningInsight}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Instruction Stream Layout */}
            <div className="bg-white border border-sky-200/60 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wider block mb-2">Memory Segment Instruction Stream</span>
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                {INSTRUCTIONS.map((inst, idx) => {
                  const isBiuHere = biuPointer.instIdx === idx;
                  const isEuHere = euPointer === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 rounded text-xs transition-all border ${
                        isEuHere 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' 
                          : isBiuHere 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' 
                          : 'bg-sky-100/10 border-sky-100/40 text-slate-500 hover:bg-sky-100/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">0{idx}H:</span>
                        <span className="font-mono font-medium">{inst.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">[{inst.bytes.join(' ')}]</span>
                        {inst.isJump && (
                          <span className="bg-red-50 text-red-600 text-[8px] px-1 rounded border border-red-200 font-mono">
                            JMP HAZARD
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {isBiuHere && (
                          <span className="bg-indigo-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-indigo-600 font-bold">
                            BIU FETCHING
                          </span>
                        )}
                        {isEuHere && (
                          <span className="bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-emerald-600 font-bold">
                            EU EXECUTION
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REAL-TIME SYSTEM LOGS */}
            <div className="bg-white border border-sky-200/60 rounded-xl p-4 shadow-xs">
              <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-600 block mb-2">
                Real-Time Hardware Operation Logs
              </h4>
              <div className="bg-sky-50/50 border border-sky-100 rounded p-3 h-28 overflow-y-auto font-mono text-[10px] text-slate-700 space-y-1">
                {logs.map((log, lIdx) => (
                  <div key={lIdx} className="leading-relaxed">
                    • {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setActiveTab('architecture')}
                className="text-xs text-slate-500 hover:text-sky-950 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                Back to Architecture
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveTab('analysis');
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                Proceed to Pipeline Analysis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PIPELINE ANALYSIS */}
        {activeTab === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-3xl mx-auto py-4"
          >
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 font-mono">Section 4: Performance Study</span>
              <h2 className="text-2xl font-bold text-sky-950 font-display">Comparative Performance Analysis</h2>
              <div className="h-1 w-20 bg-indigo-500 rounded mt-2"></div>
            </div>

            <p className="text-xs text-slate-500 italic">
              See the direct impact of overlapping operations on total microprocessor execution clock cycles.
            </p>

            {/* Direct Comparison Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-sky-900 font-mono">
                Comparative Workflow: Non-Pipelined vs. Pipelined
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Without Pipelining Block */}
                <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase font-mono tracking-wider">Without Pipelining (Sequential CPU)</span>
                  </div>
                  <div className="space-y-2 font-mono text-[10px] text-slate-700">
                    <div className="bg-sky-50/50 p-2 rounded border border-sky-100/50 flex justify-between">
                      <span>Cycle 1: Fetch Inst 1</span>
                      <span className="text-slate-600">BIU Busy, EU Idle</span>
                    </div>
                    <div className="bg-sky-50/50 p-2 rounded border border-sky-100/50 flex justify-between">
                      <span>Cycle 2: Execute Inst 1</span>
                      <span className="text-slate-600">BIU Idle, EU Busy</span>
                    </div>
                    <div className="bg-sky-50/50 p-2 rounded border border-sky-100/50 flex justify-between">
                      <span>Cycle 3: Fetch Inst 2</span>
                      <span className="text-slate-600">BIU Busy, EU Idle</span>
                    </div>
                    <div className="bg-sky-50/50 p-2 rounded border border-sky-100/50 flex justify-between">
                      <span>Cycle 4: Execute Inst 2</span>
                      <span className="text-slate-600">BIU Idle, EU Busy</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    🔴 <strong>Result:</strong> Longer overall execution time. The processor wastes precious timing units waiting for slow memory chips.
                  </p>
                </div>

                {/* With Pipelining Block */}
                <div className="bg-white border border-emerald-200 rounded-xl p-5 space-y-3 shadow-xs ring-1 ring-emerald-500/10">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckSquare className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase font-mono tracking-wider">With Pipelining (8086 Architecture)</span>
                  </div>
                  <div className="space-y-2 font-mono text-[10px] text-slate-700">
                    <div className="bg-sky-50/50 p-2 rounded border border-sky-100/50 flex justify-between">
                      <span>Cycle 1: Fetch Inst 1</span>
                      <span className="text-slate-600">BIU Busy, EU Idle</span>
                    </div>
                    <div className="bg-sky-50/50 p-2 rounded border border-sky-100/50 flex justify-between">
                      <span>Cycle 2: Fetch Inst 2 + Execute Inst 1</span>
                      <span className="text-emerald-600 font-bold">BIU + EU Active</span>
                    </div>
                    <div className="bg-sky-50/50 p-2 rounded border border-sky-100/50 flex justify-between">
                      <span>Cycle 3: Fetch Inst 3 + Execute Inst 2</span>
                      <span className="text-emerald-600 font-bold">BIU + EU Active</span>
                    </div>
                    <div className="bg-sky-50/50 p-2 rounded border border-sky-100/50 flex justify-between">
                      <span>Cycle 4: Execute Inst 3</span>
                      <span className="text-slate-600">BIU Idle, EU Busy</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    🟢 <strong>Result:</strong> Much shorter execution time. Overlapped fetch/execution keeps the ALU working continuously.
                  </p>
                </div>

              </div>
            </div>

            {/* Architectural Limitations Callout */}
            <div className="bg-red-50/60 border border-red-200 rounded-xl p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                The Pipelining Bottleneck: Control Hazards
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Although instruction pipelining offers massive acceleration, it suffers from a fundamental design vulnerability: <strong className="text-red-700">Branching Hazards</strong>.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Branch instructions like <strong className="font-mono text-slate-800 font-bold">JMP, CALL, RET, and INT</strong> change the address of the next instruction. This immediately invalidates the entire 6-byte prefetch queue. The BIU is forced to dump the queue (flush), clear the pipeline, and fetch new bytes from the target destination. This adds multiple wait cycles (Branch Penalty) and temporarily decreases processor efficiency.
              </p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setActiveTab('simulation')}
                className="text-xs text-slate-500 hover:text-sky-950 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                Back to Simulator
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                Complete Lesson Summary
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 5: SUMMARY & KEY TAKEAWAYS */}
        {activeTab === 'summary' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-2xl mx-auto py-4"
          >
            <div className="space-y-2 text-center">
              <Award className="w-10 h-10 text-indigo-600 mx-auto" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 font-mono">Section 5: Final Takeaways</span>
              <h2 className="text-2xl font-bold text-sky-950 font-display">Lesson Summary & Highlights</h2>
              <div className="h-1 w-20 bg-indigo-500 mx-auto rounded mt-2"></div>
            </div>

            <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-sky-900">
                What you must understand for exams & laboratory designs:
              </h3>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold font-mono text-indigo-700 text-[10px] mt-0.5 shrink-0">
                    1
                  </div>
                  <p className="text-slate-700">
                    The Intel 8086 silicon is split into two asynchronous, independent processing structures: the <strong>Bus Interface Unit (BIU)</strong> and the <strong>Execution Unit (EU)</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold font-mono text-indigo-700 text-[10px] mt-0.5 shrink-0">
                    2
                  </div>
                  <p className="text-slate-700">
                    The <strong>BIU fetches</strong> instruction bytes ahead of time from physical system memory, while the <strong>EU executes</strong> previously fetched instructions in parallel.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold font-mono text-indigo-700 text-[10px] mt-0.5 shrink-0">
                    3
                  </div>
                  <p className="text-slate-700">
                    The <strong>6-byte FIFO queue</strong> is the temporary cache buffer that decouples slow external memory bus access cycles from fast arithmetic execution.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold font-mono text-indigo-700 text-[10px] mt-0.5 shrink-0">
                    4
                  </div>
                  <p className="text-slate-700">
                    Overlapping fetching and execution reduces overall processing time and <strong>minimizes processor idle states</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold font-mono text-indigo-700 text-[10px] mt-0.5 shrink-0">
                    5
                  </div>
                  <p className="text-slate-700">
                    <strong>Branch instructions</strong> (like JMP, CALL, RET) invalidate the prefetch buffer. The queue must be completely <strong>flushed</strong>, incurring penalty wait cycles.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-center shadow-xs">
              <p className="text-xs text-indigo-950 leading-normal font-sans">
                <strong>Conclusion:</strong> Instruction pipelining increases execution efficiency by minimizing processor idle time through parallel fetch and execute operations.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => {
                  handleReset();
                  setActiveTab('simulation');
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retake Simulation Lesson
              </button>
            </div>
          </motion.div>
        )}

      </div>

    </div>
  );
}
