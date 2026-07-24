import { Module } from '../types';

export const courseData: Module[] = [
  {
    id: 'm1',
    title: 'Module 1: Evolution of Microprocessors',
    slides: [
      {
        id: 'm1-s1',
        title: '1. Welcome to Microprocessors & Microcontrollers!',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          'Designed specifically for B.Tech beginners starting their hardware engineering journey.',
          'Microprocessor: A multipurpose, programmable, clock-driven, register-based electronic device.',
          'It reads binary instructions from a storage device (Memory), accepts binary data as input, processes data according to instructions, and provides results as output.',
          'The 8086 is a monumental 16-bit microprocessor launched by Intel in 1978, establishing the classic x86 architecture.'
        ]
      },
      {
        id: 'm1-s3', // Must be m1-s3 so SlidePresenter triggers the "vs" tab by default
        title: '2. Microprocessor vs Microcontroller',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          'Microprocessor (MPU) contains only the Central Processing Unit (CPU). Memory (RAM, ROM) and I/O timers are connected externally.',
          'Microcontroller (MCU) integrates CPU, RAM, ROM, I/O ports, timers, and serial interfaces onto a single silicon chip.',
          'MPUs are general-purpose, flexible, fast, and expensive (used in laptops, servers).',
          'MCUs are application-specific, power-efficient, and highly cost-effective (used in washing machines, automotive ECUs, remote controllers).'
        ],
        interactiveType: 'evolution'
      },
      {
        id: 'm1-s2',
        title: '3. Evolution of Microprocessors',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          '1st Generation (1971): 4-bit processors (Intel 4004) - designed for calculator logic.',
          '2nd Generation (1974): 8-bit processors (Intel 8080 / 8085) - birth of home computers.',
          '3rd Generation (1978): 16-bit processors (Intel 8086 / 8088) - massive memory mapping up to 1 MB.',
          '4th Generation (1985): 32-bit processors (Intel 80386 / 80486) - introduced paging and multitasking.',
          '5th Generation (1993-Present): 64-bit superscalar processors (Pentium, Core i7, Xeon).'
        ],
        interactiveType: 'evolution'
      },
      {
        id: 'm1-s5',
        title: '4. Evolution to Pentium Series',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          '80386 (1985): Intel\'s first true 32-bit x86 processor. Introduced virtual memory paging, supporting up to 4 GB of RAM.',
          '80486 (1989): Integrated a floating-point unit (FPU/math coprocessor) and 8 KB of L1 cache onto the CPU core.',
          'Pentium (1993): Launched superscalar execution (two independent execution pipelines, U and V), allowing it to process two instructions per clock cycle.'
        ]
      },
      {
        id: 'm1-s6',
        title: '5. Features & Key Parameters of Intel 8086',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        points: [
          'It is a 16-bit MPU: It possesses a 16-bit ALU, 16-bit internal registers, and a 16-bit Data Bus.',
          '20-Bit Address Bus: Can access up to 1,048,576 bytes (1 MB) of physical memory space.',
          'Pipelined Architecture: Divided into Bus Interface Unit (BIU) and Execution Unit (EU) operating in parallel.',
          'Applications of 8086: High-precision calculators, simple industrial robotics control, traffic light sequencers, and early personal computing.'
        ]
      },
      {
        id: 'm1-quiz',
        title: 'Module 1 Recap Quiz',
        moduleTitle: 'Module 1: Evolution of Microprocessors',
        moduleId: 'm1',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What is the word length of the Intel 8086 microprocessor?',
            options: ['4-bit', '8-bit', '16-bit', '32-bit'],
            correctAnswer: 2,
            explanation: 'The Intel 8086 is a 16-bit microprocessor because its internal registers, Arithmetic Logic Unit (ALU), and internal data paths are all 16 bits wide.'
          },
          {
            question: 'In a microprocessor-based system, where are memory and peripheral devices located?',
            options: ['Integrated inside the CPU chip', 'Connected externally to the CPU via system buses', 'Inside the instruction prefetch queue', 'Directly in the ALU'],
            correctAnswer: 1,
            explanation: 'In a classic microprocessor system (MPU), memory and input/output peripherals are separate ICs located externally on the circuit board, connected via address, data, and control buses.'
          },
          {
            question: 'Which of the following represents a major advantage of a Microcontroller (MCU) over a Microprocessor (MPU) for dedicated applications?',
            options: ['Higher computational speed for running desktop operating systems', 'Single-chip integration of CPU, RAM, ROM, and I/O timers, reducing size and cost', 'Larger external physical memory addressing space', 'Support for multiple operating systems'],
            correctAnswer: 1,
            explanation: 'Microcontrollers (MCUs) integrate CPU, RAM, ROM, and peripheral controllers on a single silicon chip, making them highly compact, low-power, and economical for embedded and dedicated applications.'
          },
          {
            question: 'To which generation of microprocessors does the Intel 8086 belong?',
            options: ['First Generation', 'Second Generation', 'Third Generation', 'Fourth Generation'],
            correctAnswer: 2,
            explanation: 'The 16-bit microprocessors (like Intel 8086, 8088, and Zilog Z8000) constitute the Third Generation of microprocessors, introduced in the late 1970s.'
          },
          {
            question: 'What is the primary physical difference between the Intel 8086 and the Intel 8088 microprocessor?',
            options: ['The 8088 has a smaller instruction set than the 8086', 'The 8088 has an 8-bit external data bus, while the 8086 has a 16-bit external data bus', 'The 8088 does not support memory segmentation', 'The 8088 has a larger physical memory capacity'],
            correctAnswer: 1,
            explanation: 'Internally, the 8086 and 8088 are identical. However, externally, the 8088 has only an 8-bit data bus (compared to 8086\'s 16-bit bus). This allowed IBM to build the original PC using cheaper, standard 8-bit support chips.'
          },
          {
            question: 'Which of the following microprocessors was the first true 32-bit x86 processor to introduce virtual memory paging?',
            options: ['Intel 80186', 'Intel 80286', 'Intel 80386', 'Intel Pentium'],
            correctAnswer: 2,
            explanation: 'The Intel 80386 was a major milestone, introducing a 32-bit register set, 32-bit address bus, and a memory management unit with virtual memory paging.'
          },
          {
            question: 'Which Intel x86 processor integrated a DMA controller, timers, and interrupt controllers directly on-chip, but did not see wide adoption in PCs?',
            options: ['Intel 8085', 'Intel 80186', 'Intel 80486', 'Intel Pentium II'],
            correctAnswer: 1,
            explanation: 'The 80186 integrated several motherboard support chips (DMA, Timers, Interrupt Controller) onto the CPU die. It was widely used in embedded systems rather than mainstream IBM-compatible PCs.'
          },
          {
            question: 'What does the term "superscalar" mean in the context of the Intel Pentium microprocessor?',
            options: ['It can address more than 1 MB of memory', 'It contains multiple parallel execution pipelines to run multiple instructions per clock', 'It operates with an external clock generator', 'It uses only 8-bit registers'],
            correctAnswer: 1,
            explanation: 'A superscalar processor contains multiple, independent execution pipelines (like the Pentium\'s U and V pipelines) that allow it to execute more than one instruction simultaneously during a single clock cycle.'
          }
        ]
      }
    ]
  },
  {
    id: 'm2',
    title: 'Module 2: 8086 Internal Architecture & Execution Unit',
    slides: [
      {
        id: 'm2-s1',
        title: '1. Internal Architecture Overview',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        points: [
          'Bus Interface Unit (BIU) fetches instructions, generates physical addresses, reads/writes memory, stores bytes in the prefetch queue, and handles bus operations.',
          'Execution Unit (EU) takes bytes from the prefetch queue, decodes instructions, executes instructions, performs ALU operations, and updates registers/flags.'
        ]
      },
      {
        id: 'm2-pipelining',
        title: '2. Instruction Pipelining & Prefetch Queue',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        points: [
          'Two MOV Instructions Pipelining Example: Consider two sequential instructions: MOV AX, 1234H (B8 34 12) and MOV BX, 5678H (BB 78 56).',
          'Phase 1 (Fetch Instruction 1): The Bus Interface Unit (BIU) fetches the 3 bytes for MOV AX, 1234H from memory into the 6-byte FIFO Prefetch Queue.',
          'Phase 2 (Parallel Overlap): While the Execution Unit (EU) decodes and executes MOV AX, 1234H (loading 1234H into AX), the BIU concurrently prefetches the 3 bytes for MOV BX, 5678H from memory into the queue.',
          'Phase 3 (Zero Delay Execution): When MOV AX finishes, MOV BX, 5678H is already sitting in the queue. The EU executes it immediately with zero memory fetch delay (loading 5678H into BX).'
        ],
        interactiveType: 'pipelining'
      },
      {
        id: 'm2-s2',
        title: '3. Execution Unit (EU) & Registers',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        points: [
          'The EU executes instruction bytes popped from the BIU instruction queue.',
          'Main Components: Arithmetic Logic Unit (ALU), Control Circuitry, Instruction Decoder, and register array.',
          'General Purpose Registers (EU): AX, BX, CX, DX (Can be split into 8-bit high/low halves).',
          'Pointer & Index Registers (EU): SP (Stack Pointer), BP (Base Pointer), SI (Source Index), DI (Destination Index).'
        ],
        interactiveType: 'architecture'
      },
      {
        id: 'm2-s3',
        title: '4. Register Organization & Flag Register Details 📋',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        points: [
          '8086 Register Organization Overview: The 8086 CPU contains fourteen 16-bit internal registers categorized into General Purpose, Segment, Pointer & Index, and Special/Flag registers.',
          'General Purpose Registers (AX, BX, CX, DX): 16-bit registers in EU used for arithmetic, logic, and data operations. Each can be accessed as two independent 8-bit high/low byte registers (AH/AL, BH/BL, CH/CL, DH/DL).',
          'Segment Registers (CS, DS, SS, ES): 16-bit registers in BIU holding base addresses for Code, Data, Stack, and Extra memory segments (1 MB physical space).',
          'Pointers & Index Registers (IP, SP, BP, SI, DI): 16-bit registers holding memory offset addresses. IP points to next instruction; SP/BP manage stack frame; SI/DI handle source/destination indexing.',
          '16-Bit Flag Register (Status & Control Flags): Contains 9 active bits out of 16 bits. 6 Status Flags (CF, PF, AF, ZF, SF, OF) automatically updated by ALU operations, and 3 Control Flags (DF, IF, TF) set or cleared by software instructions (CLI, STI, CLD, STD).'
        ],
        interactiveType: 'flags'
      },
      {
        id: 'm2-quiz',
        title: 'Module 2 Recap Quiz',
        moduleTitle: 'Module 2: 8086 Internal Architecture & Execution Unit',
        moduleId: 'm2',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'How is the general-purpose 16-bit AX register split into 8-bit registers?',
            options: ['AH (High byte) and AL (Low byte)', 'AS (Sign byte) and AC (Carry byte)', 'AP (Pointer) and AD (Data)', 'AX cannot be split'],
            correctAnswer: 0,
            explanation: 'The 16-bit AX register consists of two independent 8-bit registers: AH (Accumulator High) and AL (Accumulator Low).'
          },
          {
            question: 'Which status flag is set to 1 if the output of an arithmetic or logical operation is exactly zero?',
            options: ['Carry Flag (CF)', 'Sign Flag (SF)', 'Zero Flag (ZF)', 'Overflow Flag (OF)'],
            correctAnswer: 2,
            explanation: 'The Zero Flag (ZF) is automatically set to 1 by the ALU if the result of the executed instruction is zero; otherwise, it is cleared to 0.'
          },
          {
            question: 'Which 16-bit general register is automatically utilized as a count register by loop and shift instructions?',
            options: ['AX (Accumulator)', 'BX (Base Register)', 'CX (Count Register)', 'DX (Data Register)'],
            correctAnswer: 2,
            explanation: 'CX is the designated Count register. Loop instructions (LOOP) and shift/rotate instructions automatically decrement CX or use CL as the iteration counter.'
          },
          {
            question: 'Which of the following represent the three control flags in the 8086 Flag Register?',
            options: ['CF, ZF, SF', 'DF, IF, TF', 'OF, PF, AF', 'SP, BP, IP'],
            correctAnswer: 1,
            explanation: 'The three control flags are DF (Direction Flag), IF (Interrupt Enable Flag), and TF (Trap/Single-Step Flag).'
          },
          {
            question: 'What is the function of the Auxiliary Carry (AF) flag in the 8086 microprocessor?',
            options: ['To signal overflow in signed operations', 'To track carry/borrow out of bit 3 (lower nibble) to support BCD (Binary Coded Decimal) arithmetic', 'To enable hardware interrupts', 'To reverse the direction of string operations'],
            correctAnswer: 1,
            explanation: 'The AF flag is set if there is a carry out of bit 3 (the lowest 4 bits or nibble) during addition, or a borrow during subtraction. This is used by BCD adjustment instructions like AAA or DAA.'
          },
          {
            question: 'Which 16-bit register in the Execution Unit holds the offset of the top of the stack relative to the Stack Segment (SS) register?',
            options: ['Base Pointer (BP)', 'Source Index (SI)', 'Stack Pointer (SP)', 'Instruction Pointer (IP)'],
            correctAnswer: 2,
            explanation: 'The Stack Pointer (SP) register always holds the 16-bit offset of the current top of the stack within the Stack Segment (SS).'
          },
          {
            question: 'What happens to the 8086 prefetch queue when a branch instruction (like JMP or JZ) is executed?',
            options: [
              'The queue continues fetching from the next sequential address without changes',
              'The queue is flushed (emptied), and the BIU begins fetching from the new target address',
              'The BIU freezes and triggers a hardware interrupt',
              'The Execution Unit takes over prefetching directly from memory'
            ],
            correctAnswer: 1,
            explanation: 'When a branch instruction is executed, the pre-fetched sequential instruction bytes are no longer valid. The BIU flushes (empties) the 6-byte queue and starts fetching from the branch\'s target address, introducing a small delay called branch penalty.'
          },
          {
            question: 'Which functional unit within the 8086 microprocessor is responsible for decoding and executing fetched instructions?',
            options: ['Bus Interface Unit (BIU)', 'Execution Unit (EU)', 'Interrupt Vector Table (IVT)', 'Address Latch Enable (ALE)'],
            correctAnswer: 1,
            explanation: 'The Execution Unit (EU) contains the instruction decoder, ALU, and control circuitry that decodes instructions popped from the queue and executes them.'
          },
          {
            question: 'Which of the following registers are general-purpose 16-bit registers that reside inside the Execution Unit (EU)?',
            options: ['CS, DS, SS, ES', 'AX, BX, CX, DX', 'SP, BP, SI, DI', 'IP, Flags, Queue, Latch'],
            correctAnswer: 1,
            explanation: 'AX, BX, CX, DX are general-purpose registers located in the EU. They can be accessed as 16-bit registers or as 8-bit register halves.'
          }
        ]
      }
    ]
  },
  {
    id: 'm3',
    title: 'Module 3: Bus Interface Unit (BIU) & Memory Segmentation',
    slides: [
      {
        id: 'm3-s1',
        title: '1. What is Memory Segmentation?',
        moduleTitle: 'Module 3: Bus Interface Unit (BIU) & Memory Segmentation',
        moduleId: 'm3',
        points: [
          'Memory Segmentation: The technique of partitioning the 8086\'s 1 MB physical memory address space into smaller logical blocks (segments) of up to 64 KB each.',
          'Active Segments: At any time, the 8086 can actively reference four main memory areas: Code (CS), Data (DS), Stack (SS), and Extra (ES).',
          'Segment Registers: These are four dedicated 16-bit registers (CS, DS, SS, ES) in the BIU that hold the starting base address of each respective segment.',
          '16-Bit Offset: A compact 16-bit pointer holds the relative offset address inside the active 64 KB segment, enabling fast, localized memory access.'
        ]
      },
      {
        id: 'm3-s2',
        title: '2. 1 MB Memory Bit & Byte Math',
        moduleTitle: 'Module 3: Bus Interface Unit (BIU) & Memory Segmentation',
        moduleId: 'm3',
        points: [
          'Addressable Locations: With a 20-bit address bus, the 8086 can address 2²⁰ physical locations: 2²⁰ = 1,048,576 locations.',
          'Byte-Addressable Memory: Each individual location stores exactly 1 Byte (8 bits). Therefore, maximum addressable memory capacity is exactly 1,048,576 Bytes (1 MB).',
          'Capacity in Bits: Since 1 MB = 1,048,576 Bytes and 1 Byte = 8 bits, the total capacity is 1,048,576 × 8 = 8,388,608 bits.',
          'Exponentials Formula: Maximum Capacity = 1 MB = 2²⁰ Bytes = 2²³ bits. Understanding these conversions is key for exams!'
        ]
      },
      {
        id: 'm3-s3',
        title: '3. Need & Types of Memory Segmentation',
        moduleTitle: 'Module 3: Bus Interface Unit (BIU) & Memory Segmentation',
        moduleId: 'm3',
        points: [
          'Addressing the 20-bit Bus: The 8086 has a 20-bit address bus (1 MB physical space) but only 16-bit registers (capable of addressing only 64 KB). Segmentation bridges this gap.',
          'Program Relocated on-the-fly: Code and variables can be loaded anywhere in RAM. The compiler uses offsets; the program runs seamlessly just by loading the active segment base.',
          'Segment Overlap: Segments can overlap fully or partially because base addresses can begin at any 16-byte (Paragraph) boundary. This conserves physical memory and simplifies subroutine data transfers.',
          'Isolated I/O Space: Separate 64 KB Port Address space using dedicated instructions (IN, OUT) and low M/IO pin signaling, completely separated from main memory.'
        ]
      },
      {
        id: 'm3-s4',
        title: '4. Physical Address Calculation',
        moduleTitle: 'Module 3: Bus Interface Unit (BIU) & Memory Segmentation',
        moduleId: 'm3',
        points: [
          'BIU Generation: The Bus Interface Unit automatically calculates the 20-bit physical address by combining a 16-bit Segment Base and a 16-bit Offset.',
          'Shift-and-Add Formula: Physical Address = (Segment Register * 10H) + Offset Register.',
          'Step-by-Step Example: If CS = 1000H and IP = 2000H, the BIU shifts CS to 10000H and adds IP: 10000H + 2000H = 12000H (Physical Address).',
          'Practice and Interactive Mapping: Use the simulator on the right to practice calculations and explore overlap styles visually.'
        ],
        interactiveType: 'memory-calc'
      },
      {
        id: 'm3-quiz',
        title: 'Module 3 Recap Quiz',
        moduleTitle: 'Module 3: Bus Interface Unit (BIU) & Memory Segmentation',
        moduleId: 'm3',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In an 8086 microprocessor, the current Code Segment (CS) register contains 3456H and the Instruction Pointer (IP) register contains abcH. What is the physical memory address of the instruction to be fetched?',
            options: ['34560H', '3E120H', '3501CH', '3501BH'],
            correctAnswer: 2,
            explanation: 'Using the 8086 address segmentation formula: Physical Address = (CS * 10H) + IP. Since CS = 3456H, CS * 10H = 34560H. Adding IP offset (abcH): 34560H + 0abcH = 3501CH.'
          },
          {
            question: 'If Segment Address = 3000H and Offset = 0100H, what is the computed 20-bit Physical Address?',
            options: ['30100H', '30000H', '301000H', '3100H'],
            correctAnswer: 0,
            explanation: 'Following the formula: (3000H * 10H) + 0100H = 30000H + 0100H = 30100H.'
          },
          {
            question: 'What is the maximum size of a single memory segment in the 8086?',
            options: ['16 KB', '64 KB', '256 KB', '1 MB'],
            correctAnswer: 1,
            explanation: 'Since segment offsets are stored in 16-bit registers (2¹⁶ = 65,536 bytes), the maximum addressable boundary of any segment is exactly 64 KB.'
          },
          {
            question: 'What are the four segment registers in the 8086 Bus Interface Unit?',
            options: ['AX, BX, CX, DX', 'SP, BP, SI, DI', 'CS, DS, SS, ES', 'IP, flags, ALU, decoder'],
            correctAnswer: 2,
            explanation: 'The 8086 BIU defines four 16-bit segment registers: Code Segment (CS), Data Segment (DS), Stack Segment (SS), and Extra Segment (ES).'
          },
          {
            question: 'How many bytes can the 8086 instruction prefetch queue store?',
            options: ['2 bytes', '4 bytes', '6 bytes', '8 bytes'],
            correctAnswer: 2,
            explanation: 'The 8086 contains a 6-byte instruction queue, whereas the 8088 contains a 4-byte instruction queue.'
          },
          {
            question: 'Which 16-bit offset register is automatically paired with the CS segment register to fetch instructions?',
            options: ['SP (Stack Pointer)', 'IP (Instruction Pointer)', 'SI (Source Index)', 'BX (Base Register)'],
            correctAnswer: 1,
            explanation: 'The Code Segment (CS) register is always paired with the Instruction Pointer (IP) register to locate the next instruction byte in physical memory (CS:IP).'
          },
          {
            question: 'Why does the 8086 use memory segmentation?',
            options: ['To increase the physical memory capacity beyond 1 MB', 'To allow writing modular, relocatable programs within 64 KB segments and fit 16-bit registers', 'To run programs without a clock generator', 'To isolate software from hardware interrupts'],
            correctAnswer: 1,
            explanation: 'Memory segmentation allows the 16-bit internal architecture of 8086 to reference a larger 20-bit physical space using relocatable segments, where code, data, and stack are neatly separated.'
          }
        ]
      }
    ]
  },
  {
    id: 'm4',
    title: 'Module 4: 8086 Pin Configuration & Operating Modes',
    slides: [
      {
        id: 'm4-s1',
        title: '1. Operating Modes Overview',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        points: [
          'To maximize flexibility, the 8086 operates in two distinct modes depending on physical system wiring.',
          'Minimum Mode: Standard simple configuration. Pin MN/MX = +5V. CPU operates alone on the bus, generating signals directly.',
          'Maximum Mode: Advanced multi-processor configuration. Pin MN/MX = 0V (GND). Status lines are sent to external 8288 Bus Controller.'
        ],
        interactiveType: 'min-mode-hardware'
      },
      {
        id: 'm4-s2',
        title: '2. Pin Configuration Overview',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        points: [
          'The Intel 8086 is housed in a 40-Pin Dual In-line Package (DIP) operating on a single +5V power supply.',
          'It contains multiplexed buses to save pin count (AD0-AD15 share Address and Data).',
          'Multiplexing: Pins transmit Address during the T1 clock state, and transition to transmit Data during T2, T3, and T4 states.',
          'Power Supply: Vcc (Pin 40, +5V DC) and GND (Pins 1 & 20).'
        ]
      },
      {
        id: 'm4-s3',
        title: '3. Interactive 8086 Pin Diagram',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        points: [
          'Address/Data Bus Pins: AD0 to AD15 (Pins 2-16 & 39).',
          'Control Signals: RD (Read), WR (Write), ALE (Address Latch Enable), READY (Acknowledge from slow memory).',
          'Status Signals: S0 to S7 (shared with address lines A16-A19 and BHE).',
          'MN/MX Pin (Pin 33): Configures the chip to operate in Minimum Mode (+5V) or Maximum Mode (GND).'
        ],
        interactiveType: 'pins'
      },
      {
        id: 'm4-s4',
        title: '4. Interactive Mode Wiring Comparator',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        points: [
          'Observe pins 24 to 31. They completely change functions depending on system wiring!',
          'Minimum mode pins: ALE, DEN, WR, M/IO, HOLD, HLDA, INTA, DT/R.',
          'Maximum mode pins: S0, S1, S2, LOCK, QS0, QS1, RQ/GT0, RQ/GT1.',
          'Max mode supports numeric co-processors like 8087 (Math coprocessor) using status decoding.'
        ],
        interactiveType: 'modes'
      },
      {
        id: 'm4-quiz',
        title: 'Module 4 Recap Quiz',
        moduleTitle: 'Module 4: 8086 Pin Configuration & Operating Modes',
        moduleId: 'm4',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which pin on the Intel 8086 is used to switch between Minimum and Maximum operating modes?',
            options: ['ALE (Pin 25)', 'RESET (Pin 21)', 'MN/MX (Pin 33)', 'READY (Pin 22)'],
            correctAnswer: 2,
            explanation: 'The MN/MX (Minimum/Maximum) pin is connected to +5V for Minimum Mode or connected to Ground (0V) for Maximum Mode.'
          },
          {
            question: 'Why does the 8086 multiplex its address and data buses?',
            options: ['To speed up memory access operations', 'To reduce the physical pin count of the processor package, allowing a compact 40-pin layout', 'To bypass the need for an external clock', 'To allow the use of only 8-bit segment registers'],
            correctAnswer: 1,
            explanation: 'By multiplexing the lower 16 address lines with the 16 data lines (AD0 - AD15), the 8086 saves 16 pins, keeping the chip size in a standard 40-pin DIP layout.'
          },
          {
            question: 'What is the physical package configuration of the Intel 8086 microprocessor?',
            options: ['100-pin Flat Pack', '40-pin Dual In-line Package (DIP)', '68-pin Pin Grid Array (PGA)', '28-pin Small Outline Integrated Circuit (SOIC)'],
            correctAnswer: 1,
            explanation: 'The Intel 8086 is housed in a standard 40-pin Dual In-line Package (DIP) with 20 pins on each side.'
          },
          {
            question: 'What signal does the 8086 output to indicate that multiplexed pins AD0-AD15 contain a valid memory address?',
            options: ['DEN (Data Enable)', 'DT/R (Data Transmit/Receive)', 'ALE (Address Latch Enable)', 'INTR (Interrupt Request)'],
            correctAnswer: 2,
            explanation: 'The ALE (Address Latch Enable) signal goes high during the T1 state of a bus cycle, signaling external latches (e.g., 8282) to capture and hold the address.'
          },
          {
            question: 'Which chip is required in 8086 Maximum Mode to decode CPU status lines and generate bus controls?',
            options: ['Intel 8284 Clock Generator', 'Intel 8282 Address Latch', 'Intel 8288 Bus Controller', 'Intel 8255 PPI'],
            correctAnswer: 2,
            explanation: 'In Maximum Mode, status pins S0, S1, S2 are wired to an external Intel 8288 Bus Controller, which decodes the state and outputs clean bus control signals.'
          },
          {
            question: 'Which of the following status signal encodings represents an active Instruction Fetch bus cycle in Maximum Mode?',
            options: ['S2, S1, S0 = 100', 'S2, S1, S0 = 011', 'S2, S1, S0 = 111 (Passive)', 'S2, S1, S0 = 101'],
            correctAnswer: 1,
            explanation: 'In Maximum Mode, the status code S2, S1, S0 = 011 indicates a "Read Code Segment" or instruction fetch bus cycle.'
          },
          {
            question: 'What is the purpose of the LOCK signal in Maximum Mode?',
            options: ['To freeze the processor clock', 'To prevent other bus master controllers from gaining bus control during critical instructions', 'To lock the keyboard input', 'To secure memory segmentation boundaries'],
            correctAnswer: 1,
            explanation: 'The LOCK prefix instruction activates the active-low LOCK signal, preventing other processors or DMA controllers from taking over the system bus.'
          },
          {
            question: 'What do the Queue Status pins (QS0 and QS1) represent in Maximum Mode?',
            options: ['The speed of instruction fetching', 'The status of the BIU\'s instruction queue (Empty, Fetch first byte, Subsequent byte, or No operation)', 'The number of active memory segments', 'The priority of hardware interrupts'],
            correctAnswer: 1,
            explanation: 'QS0 and QS1 allow external coprocessors (like the 8087) to monitor the internal 8086 instruction queue and track when instructions are executed.'
          },
          {
            question: 'Which pin on the 8086 is used to synchronize slow memory or peripheral devices with the processor clock by inserting Wait states?',
            options: ['NMI (Non-Maskable Interrupt)', 'RESET', 'READY', 'ALE'],
            correctAnswer: 2,
            explanation: 'The READY pin allows slow memory or I/O devices to request additional time. If READY is pulled low, the 8086 inserts Wait states (Tw) to hold the bus until the device is ready.'
          }
        ]
      }
    ]
  },
  {
    id: 'm5',
    title: 'Module 5: System Timing & Bus Cycles',
    slides: [
      {
        id: 'm5-s1',
        title: '1. Understanding System Timing',
        moduleTitle: 'Module 5: System Timing & Bus Cycles',
        moduleId: 'm5',
        points: [
          'Clock Cycle (T-state): The basic unit of time, equal to one period of the CLK input.',
          'Bus Cycle / Machine Cycle: Time taken to perform one external access (e.g. read, write, I/O). Comprises exactly 4 T-states (T1, T2, T3, T4).',
          'T1: Address phase. CPU outputs physical address, ALE goes high.',
          'T2: Bus turnaround. Read/Write control signals go Low. Data direction is selected.',
          'T3: Data phase. Data transfer is performed. Slow memory inserts WAIT states.',
          'T4: Rest phase. Controls return to inactive states, ending cycle.'
        ]
      },
      {
        id: 'm5-s2',
        title: '2. Interactive Waveform Timing Explorer',
        moduleTitle: 'Module 5: System Timing & Bus Cycles',
        moduleId: 'm5',
        points: [
          'Observe ALE going high strictly during T1 to capture the address multiplexed on the bus.',
          'RD / WR go active low during T2, staying low throughout T3 to allow signal settling.',
          'DEN controls external buffer connection to avoid bus collision noise.'
        ],
        interactiveType: 'timing'
      },
      {
        id: 'm5-quiz',
        title: 'Module 5 Recap Quiz',
        moduleTitle: 'Module 5: System Timing & Bus Cycles',
        moduleId: 'm5',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'How many clock cycles (T-states) make up a standard 8086 machine bus cycle?',
            options: ['1', '2', '4', '8'],
            correctAnswer: 2,
            explanation: 'A basic 8086 bus cycle consists of 4 clock cycles (designated T1, T2, T3, and T4).'
          },
          {
            question: 'What signal goes high in the T1 cycle to tell external latches to hold the multiplexed address?',
            options: ['RD (Read)', 'ALE (Address Latch Enable)', 'DEN (Data Enable)', 'READY'],
            correctAnswer: 1,
            explanation: 'ALE (Address Latch Enable) pulses high during T1, signaling external latch ICs (like 8282) to latch and hold the 20-bit address.'
          },
          {
            question: 'During which clock state (T-state) of a bus cycle do the Read (RD) or Write (WR) signals transition to active-low?',
            options: ['T1', 'T2', 'T3', 'T4'],
            correctAnswer: 1,
            explanation: 'In the T2 clock state, control signals (RD/WR) go low, and data bus direction is established.'
          },
          {
            question: 'What are the status lines S3 and S4 encoded to represent during a bus cycle?',
            options: ['The interrupt vector type being serviced', 'The active segment register being accessed (CS, DS, SS, ES)', 'The speed of the external RAM chips', 'The number of instruction bytes in the queue'],
            correctAnswer: 1,
            explanation: 'Status pins S3 and S4 encode which segment register was used to generate the current physical address: 00=ES, 01=SS, 10=CS, 11=DS.'
          },
          {
            question: 'What is the purpose of the DEN (Data Enable) signal in 8086 timing?',
            options: ['To enable the address latch', 'To enable external bidirectional data transceivers (like the 8286)', 'To select memory or I/O', 'To request bus lock'],
            correctAnswer: 1,
            explanation: 'DEN is an active-low signal used to activate external transceivers to safely buffer and pass data onto the system bus without collision.'
          },
          {
            question: 'If the memory device is too slow to provide data during a read, in which clock state can "Wait" states (Tw) be inserted?',
            options: ['Between T1 and T2', 'Between T2 and T3', 'Between T3 and T4', 'After T4'],
            correctAnswer: 2,
            explanation: 'If the READY line is low at the start of T3, the MPU will insert one or more Wait states (Tw) between T3 and T4 to allow memory to settle.'
          }
        ]
      }
    ]
  },
  {
    id: 'm6',
    title: 'Module 6: 8086 Interrupts & Response',
    slides: [
      {
        id: 'm6-s1',
        title: '1. Introduction to 8086 Interrupts',
        moduleTitle: 'Module 6: 8086 Interrupts & Response',
        moduleId: 'm6',
        points: [
          'An interrupt is a hardware or software signal that halts current CPU program execution to perform a specialized service (ISR).',
          'Interrupt Service Routine (ISR): A custom program written to handle the specific interrupt event.',
          'Hardware Interrupts: NMI (Non-Maskable, Pin 17), INTR (Maskable, Pin 18).',
          'Software Interrupts: Triggered by executing INT instructions (e.g., INT 21H, INT 3).'
        ],
        interactiveType: 'intro-interrupts'
      },
      {
        id: 'm6-s2',
        title: '2. Interrupt Vector Table (IVT) & Response',
        moduleTitle: 'Module 6: 8086 Interrupts & Response',
        moduleId: 'm6',
        points: [
          'The first 1 KB of physical RAM (00000H - 003FFH) stores the 256 vector pointers.',
          'When an interrupt occurs: Flags are saved, IF & TF are cleared, Return CS and IP are saved to stack, and CS:IP loads new values from IVT.',
          'Formula: Vector RAM address = Interrupt Type * 4.'
        ],
        interactiveType: 'interrupts'
      },
      {
        id: 'm6-quiz',
        title: 'Module 6 Recap Quiz',
        moduleTitle: 'Module 6: 8086 Interrupts & Response',
        moduleId: 'm6',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Where is the Interrupt Vector Table (IVT) located in the 8086 memory map?',
            options: ['At the very end of memory (FFFF0H - FFFFFH)', 'In the middle segment (50000H - 503FFH)', 'At the very beginning (00000H - 003FFH)', 'Inside the CPU cache'],
            correctAnswer: 2,
            explanation: 'The IVT is hard-coded to reside in the lowest 1 KB of RAM, from physical addresses 00000H to 003FFH.'
          },
          {
            question: 'If the CPU receives a software INT 3, what IVT physical address does it read to fetch the ISR vector?',
            options: ['00003H', '0000CH (12)', '00008H', '00012H'],
            correctAnswer: 1,
            explanation: 'Since each interrupt type requires a 4-byte pointer, the address is Type * 4. Thus: Type 3 * 4 = 12 = 0000CH.'
          },
          {
            question: 'Which hardware pin on the 8086 is used for maskable external interrupt requests?',
            options: ['NMI (Pin 17)', 'INTR (Pin 18)', 'RESET (Pin 21)', 'READY (Pin 22)'],
            correctAnswer: 1,
            explanation: 'INTR is the Maskable Interrupt Request pin. It can be ignored if the software clears the Interrupt Flag (IF = 0).'
          },
          {
            question: 'What is the size in bytes of a single interrupt vector stored in the Interrupt Vector Table (IVT)?',
            options: ['1 byte', '2 bytes', '4 bytes', '8 bytes'],
            correctAnswer: 2,
            explanation: 'Each interrupt vector contains a 2-byte CS segment address and a 2-byte IP offset address, totaling exactly 4 bytes.'
          },
          {
            question: 'What is the maximum number of interrupt vectors supported by the 8086 microprocessor?',
            options: ['16', '64', '128', '256'],
            correctAnswer: 3,
            explanation: 'The 8086 architecture supports up to 256 distinct interrupt vectors (Types 0 through 255), filling the entire 1 KB IVT.'
          },
          {
            question: 'Which instruction is executed at the end of an Interrupt Service Routine (ISR) to return control back to the main program?',
            options: ['RET', 'RETI', 'IRET', 'HLT'],
            correctAnswer: 2,
            explanation: 'The IRET (Interrupt Return) instruction pops the IP, CS, and the Flag register back from the stack to resume original execution.'
          }
        ]
      }
    ]
  },
  {
    id: 'm7',
    title: 'Module 7: GATE Microprocessor Solved Exam Practice',
    slides: [
      {
        id: 'm7-s1',
        title: '1. GATE Microprocessor Exam Preparation',
        moduleTitle: 'Module 7: GATE Exam Practice',
        moduleId: 'm7',
        points: [
          'The Graduate Aptitude Test in Engineering (GATE) is a premium national-level competitive exam in India, testing in-depth conceptual and practical knowledge of microprocessors.',
          'Core 8086 syllabus areas tested in GATE include: Segmented-memory Physical Address calculations, Arithmetic overflows & status flags, Interrupt Vector Table (IVT) mapping, and memory system hardware interfacing.',
          'Memory Bank Interfacing (BHE and A0 pins) and bus cycles/timing parameters (T-states and Tw Wait states) are heavily featured in 1-mark and 2-mark GATE questions.',
          'This dedicated exam prep module aggregates authentic, past GATE microprocessor questions with comprehensive step-by-step mathematical solutions to boost academic performance.'
        ]
      },
      {
        id: 'm7-quiz',
        title: 'GATE Solved Practice Quiz',
        moduleTitle: 'Module 7: GATE Exam Practice',
        moduleId: 'm7',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In an 8086 microprocessor, the current Code Segment (CS) register contains 3456H and the Instruction Pointer (IP) register contains 0ABCH. What is the computed physical memory address of the next instruction byte to be fetched?',
            options: ['34560H', '3E120H', '3501CH', '3501BH'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2005',
            explanation: 'To find the physical address, shift the CS value by 4 bits (multiply by 10H) and add the IP offset: CS * 10H = 34560H. Physical Address = 34560H + 0ABCH = 3501CH.'
          },
          {
            question: 'In an 8086 microprocessor, how many machine bus cycles are required to read a 16-bit word from an ODD physical memory address?',
            options: ['One bus cycle', 'Two bus cycles', 'Three bus cycles', 'Four bus cycles'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2012',
            explanation: 'The 8086 memory is partitioned into Even (Lower) and Odd (Upper) byte banks. A 16-bit word starting at an odd address spans across a 16-bit boundary, meaning its lower byte resides in the odd bank and its upper byte resides in the next even address. The 8086 must perform two consecutive 8-bit bus cycles (one for each bank) to assemble the full 16-bit word.'
          },
          {
            question: 'Consider the execution of the instructions "MOV AL, 7FH" and "ADD AL, 01H" in an 8086 microprocessor. What are the resulting values of the Carry Flag (CF) and the Overflow Flag (OF)?',
            options: ['CF = 0, OF = 0', 'CF = 0, OF = 1', 'CF = 1, OF = 0', 'CF = 1, OF = 1'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2004',
            explanation: '7FH (01111111B) represents +127 as an 8-bit signed integer. Adding 01H results in 80H (10000000B), which represents -128 in signed 8-bit notation. There is no unsigned carry out of the MSB, so CF = 0. However, adding two positive numbers (+127 and +1) produced a negative result (-128), which is a signed arithmetic overflow. Thus, OF = 1.'
          },
          {
            question: 'In an 8086 microprocessor system, the physical memory address space allocated for the complete Interrupt Vector Table (IVT) is:',
            options: ['00000H to 000FFH', '00000H to 003FFH', 'F0000H to FFFFFH', 'FFF00H to FFFFFH'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2006',
            explanation: 'The 8086 supports 256 interrupts (Types 0 to 255). Since each interrupt vector consists of a 4-byte pointer (2 bytes for CS, 2 bytes for IP), the total memory required is 256 * 4 = 1024 bytes (1 KB). This table is hard-coded to reside at the beginning of memory, from physical addresses 00000H to 003FFH.'
          },
          {
            question: 'During a memory read cycle, if the READY pin of the 8086 is sampled low during T2 and T3, how are the "Wait" states (Tw) inserted by the microprocessor?',
            options: ['Prior to the T1 clock state', 'Between T2 and T3', 'Between T3 and T4', 'Immediately after T4'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2008',
            explanation: 'The 8086 samples the status of the READY pin during clock cycles T2 and T3. If the memory or external peripheral pulls READY low (indicating it is too slow to provide data), the microprocessor inserts extra "Wait states" (Tw) into the machine cycle between T3 and T4, delaying data transfer until the device can respond.'
          },
          {
            question: 'To interface an 8-bit EPROM memory chip to the lower bank of the 8086 memory system, which combination of signals must be decoded for the chip-select input?',
            options: ['A0 = 0 and BHE = 1', 'A0 = 0 and BHE = 0', 'A0 = 1 and BHE = 0', 'A0 = 1 and BHE = 1'],
            correctAnswer: 0,
            isGateQuestion: true,
            gateYear: 'GATE 2015',
            explanation: 'In the 8086, the lower byte bank contains all even addresses and is selected when A0 is active low (A0 = 0). The upper byte bank contains odd addresses and is selected when BHE is active low (BHE = 0). Therefore, to interface an 8-bit memory chip to the lower bank, we decode A0 = 0, and the upper bank is disabled, which means BHE = 1.'
          },
          {
            question: 'Which of the following 8086 registers can be used as pointer or index registers for indirect memory addressing (offset pointer calculation) within the Data Segment (DS) by default?',
            options: ['AX, BX, CX, DX', 'SP, BP, IP, FR', 'BX, SI, DI', 'CS, DS, SS, ES'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2011',
            explanation: 'In the 8086 microprocessor, general indirect memory addressing is restricted to the base register BX and the index registers SI and DI when addressing the Data Segment (DS) by default. The Base Pointer (BP) is also a pointer register, but it addresses the Stack Segment (SS) by default.'
          },
          {
            question: 'In the 8086 microprocessor, which segment register is associated with the Base Pointer (BP) by default when calculating the 20-bit physical address for an instruction such as "MOV AX, [BP + 08H]"?',
            options: ['Code Segment (CS)', 'Data Segment (DS)', 'Stack Segment (SS)', 'Extra Segment (ES)'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2009',
            explanation: 'By default, any memory addressing referencing the Base Pointer (BP) or Stack Pointer (SP) automatically uses the Stack Segment (SS) register to resolve the 20-bit physical address. In contrast, memory references using BX, SI, or DI target the Data Segment (DS) register by default.'
          },
          {
            question: 'Which of the following 16-bit registers in the 8086 microprocessor is automatically decremented or incremented by 2 during PUSH and POP execution cycles respectively?',
            options: ['Base Pointer (BP)', 'Stack Pointer (SP)', 'Source Index (SI)', 'Instruction Pointer (IP)'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2013',
            explanation: 'The Stack Pointer (SP) register tracks the offset of the stack top within the Stack Segment (SS). During a PUSH instruction, SP is decremented by 2 to allocate space for a 16-bit word (since the stack grows downward). During a POP instruction, SP is incremented by 2 after retrieving the word.'
          },
          {
            question: 'In the Intel 8086 microprocessor, the size of the instruction prefetch queue is ____ bytes, while in the 8088 microprocessor, it is ____ bytes.',
            options: ['4, 6', '6, 4', '8, 6', '6, 8'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2004',
            explanation: 'The 8086 has a 16-bit external data bus and features a 6-byte instruction prefetch queue. The 8088 has an 8-bit external data bus and features a smaller 4-byte instruction prefetch queue to coordinate with its narrower external bus.'
          }
        ]
      }
    ]
  },
  {
    id: 'm8',
    title: 'Module 8: Program Development Steps & Tools',
    slides: [
      {
        id: 'm8-s1',
        title: '8086 Program Development Steps',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          '1. Specification & Design: Define the problem statement, write down inputs/outputs, and outline the core algorithm and flowchart.',
          '2. Assembly Coding: Translate the flowchart blocks into 8086 assembly instructions using a plain text editor (resulting in a file like program.asm).',
          '3. Assembling: Pass the .ASM source code through an assembler (MASM or TASM). It reads instructions, checks syntax, and produces an Object file (program.obj) along with a Listing file (program.lst) showing addresses and machine codes.',
          '4. Linking: Run a linker (LINK or TLINK) to merge multiple object files and resolve library dependencies, generating a final relocatable executable (program.exe).',
          '5. Execution & Debugging: Load the program into physical RAM or run it inside an emulator (DEBUG, emu8086) to monitor registers, flags, and memory to trace and fix any logical bugs.'
        ]
      },
      {
        id: 'm8-s2',
        title: 'Interactive 8086 Development Steps Lab',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          'Visualise the complete compilation, linking, and execution pipeline of an 8086 assembly program.',
          'Step through the pipeline: Text Editor -> Assembler (MASM) -> Linker (LINK) -> Debugger/Emulator.',
          'Learn the intermediate file formats: see how .ASM generates .OBJ & .LST, which then link into .EXE.',
          'Use the Interactive Pipeline Simulator on the right to understand how each software tool prepares code for the CPU.'
        ],
        interactiveType: 'dev-pipeline'
      },
      {
        id: 'm8-s3',
        title: 'One-Pass vs Two-Pass Assemblers',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          'Two-Pass Assembler: The standard design for assemblers like MASM or TASM. It scans the source code exactly twice to resolve forward references.',
          'Pass 1 (Symbol Table construction): The assembler scans the source file to build a "Symbol Table". It identifies all user-defined labels (like START, LOOP, NUM1) and assigns them relative offset addresses based on instruction sizes.',
          'Pass 2 (Machine Code Translation): The assembler re-scans the file from the top. Using the Symbol Table, it substitutes mnemonics with binary opcodes, translates labels into numeric offsets, and creates the Object file (.OBJ) and Listing file (.LST).',
          'One-Pass Assembler: Scans code once and translates directly. If it encounters a "forward reference" (a jump to a label defined later in the file), it must leave a blank placeholder and patch it later, making it less elegant for complex structures.'
        ],
        interactiveType: 'assembler-passes'
      },
      {
        id: 'm8-s3b',
        title: 'Assembler Outputs: .OBJ vs .LST Files',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        interactiveType: 'assembler-outputs',
        points: [
          'Object (.OBJ) File - Machine-Readable Output: The main binary file produced by the assembler containing translated machine instructions. It is NOT directly executable yet.',
          'What .OBJ Contains: (1) Translated binary machine code and constants. (2) Relocation Information (for segment linking). (3) Symbol Names (lists of external and public variables/labels to be resolved by the Linker). (4) Segment structures and sizing records.',
          'Listing (.LST) File - Human-Readable Log: An optional, highly detailed plain-text document created during assembly. It is extremely useful for debugging logical errors and verifying offset calculations.',
          'What .LST Contains: (1) Full Source Code printed side-by-side with computed offset addresses and translated Hex codes. (2) Symbol Table listing every variable, segment, label, and macro with its offset. (3) Warnings and syntax error messages with exact line numbers.'
        ]
      },
      {
        id: 'm8-s4',
        title: 'The Linker and Loader Roles',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          'The Linker (LINK.EXE / TLINK.EXE): Merges separate Object (.OBJ) files into a single, relocatable Executable (.EXE). It resolves cross-module references and links library files (.LIB) containing pre-written subroutines.',
          'Relocation Dictionary: The Linker builds an EXE header containing a "Relocation Table". Because the starting address in RAM is unknown at link-time, addresses are kept relocatable.',
          'The Loader: A component of the Operating System (or DOS) that active-loads programs from disk into physical memory before run time.',
          'Loading & Relocation: The Loader finds free space in RAM, copies the program, and uses the Relocation Table to patch all segment-dependent addresses (CS, DS, SS) to map to their actual, physical memory positions.'
        ]
      },
      {
        id: 'm8-s5',
        title: 'DOS DEBUG Utility & Commands',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        points: [
          'DEBUG.EXE: The classic 8086 interactive software test utility used to execute, trace, and troubleshoot compiled executable and COM files directly on the processor.',
          'Core Inspection Commands: Use R (Registers) to dump or edit current general and segment registers, and D (Dump) / E (Enter) to view or write raw hex values in memory segments.',
          'Execution Commands: Use T (Trace) to single-step execution instruction-by-instruction (inspecting register updates after every step), and G (Go) to run code to a specific breakpoint or till completion.',
          'Utility Commands: Use A (Assemble) to write inline assembly instructions directly into memory, and U (Unassemble) to disassemble hex machine code back to readable assembly mnemonics.'
        ]
      },
      {
        id: 'm8-quiz',
        title: 'Module 8 Recap Quiz',
        moduleTitle: 'Module 8: Program Development Steps & Tools',
        moduleId: 'm8',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which of the following files is produced by the assembler and contains the translated binary code, but is not yet fully linked or directly executable?',
            options: ['program.asm', 'program.lst', 'program.obj', 'program.exe'],
            correctAnswer: 2,
            explanation: 'The assembler (MASM/TASM) translates source code into machine language and stores it in an Object file (.OBJ). However, this file is not yet executable because external references and starting memory offsets have not been resolved by the linker.'
          },
          {
            question: 'What is the primary function of a Linker (LINK / TLINK) in the 8086 software development process?',
            options: ['To compile plain text assembly instructions into binary codes', 'To combine multiple object (.OBJ) files and libraries into a single executable (.EXE) file', 'To execute the program and display error warnings', 'To format and print the source code listing'],
            correctAnswer: 1,
            explanation: 'The Linker takes one or more object files (.OBJ) and merges them, resolving memory starting points and subroutines, to produce a final, executable binary program (.EXE).'
          },
          {
            question: 'Which development file contains a complete side-by-side view of the original assembly code, translated hexadecimal machine codes, and memory offsets?',
            options: ['.ASM file', '.EXE file', '.OBJ file', '.LST (Listing) file'],
            correctAnswer: 3,
            explanation: 'The Listing file (.LST) is optionally created by the assembler to assist programmers. It shows the source code lines alongside their generated binary codes and memory segment offsets.'
          },
          {
            question: 'In the 8086 development workflow, which software tool is used to execute the code instruction-by-instruction, inspect register values, and modify memory content live for troubleshooting?',
            options: ['Text Editor', 'Assembler', 'Linker', 'Debugger / Emulator (like DEBUG or emu8086)'],
            correctAnswer: 3,
            explanation: 'The Debugger or Emulator allows developers to step through program execution one instruction at a time, checking register states (AX, BX, IP) and memory segments to track down logical bugs.'
          },
          {
            question: 'During the assembling phase using MASM, what is the primary objective of "Pass 1" of a Two-Pass Assembler?',
            options: [
              'To translate mnemonics into hexadecimal machine codes',
              'To build the Symbol Table by resolving the offsets of all user-defined variables and labels',
              'To link external library subroutines into the object file',
              'To load the relocatable binary directly into physical RAM'
            ],
            correctAnswer: 1,
            explanation: 'In a Two-Pass Assembler, Pass 1 is dedicated to scanning the source file to build the Symbol Table, identifying the size of each instruction, and determining the relative offset address of every label and variable.'
          },
          {
            question: 'Which software component is responsible for reading the relocation table header of a .EXE file, copying the code into free physical RAM, and updating the CS, DS, and SS segments dynamically?',
            options: ['The Text Editor', 'The Linker', 'The Loader', 'The Assembler'],
            correctAnswer: 2,
            explanation: 'The Loader (part of the OS runtime) is responsible for loading the relocatable executable from disk into a free region of physical RAM and dynamically adjusting segment register references (relocation) to point to actual memory bases.'
          },
          {
            question: 'In the classic DOS DEBUG interactive program, which command is used to single-step execution instruction-by-instruction to inspect registers and status flags live?',
            options: ['D (Dump)', 'T (Trace)', 'A (Assemble)', 'G (Go)'],
            correctAnswer: 1,
            explanation: 'The T (Trace) command in the DEBUG utility performs single-step execution, executing exactly one instruction, updating the Instruction Pointer (IP), and outputting the exact state of all MPU registers and status flags.'
          }
        ]
      }
    ]
  },
  {
    id: 'm9',
    title: 'Module 9: 8086 Addressing Modes',
    slides: [
      {
        id: 'm9-s1',
        title: 'Understanding 8086 Addressing Modes',
        moduleTitle: 'Module 9: 8086 Addressing Modes',
        moduleId: 'm9',
        points: [
          'Addressing Mode: The method by which an instruction specifies where its operand(s) are located (registers, memory, or immediate constants).',
          'Immediate Addressing: The operand is a constant value embedded directly inside the instruction byte stream (e.g., MOV AX, 1234H). Highly efficient.',
          'Register Addressing: Operands reside entirely in 16-bit or 8-bit general registers (e.g., MOV AX, BX). No memory bus access is required.',
          'Memory Addressing Modes: Accesses physical RAM by computing a 16-bit offset called Effective Address (EA). Examples include Direct, Indirect, Based, Indexed, Based-Indexed, and Relative Based-Indexed.',
          'Dynamic Memory Access: Combining base (BX, BP) and index (SI, DI) registers with constant displacements is critical for traversing arrays, matrices, and parameters on the stack.'
        ]
      },
      {
        id: 'm9-s2',
        title: 'Effective Address Calculation Lab',
        moduleTitle: 'Module 9: 8086 Addressing Modes',
        moduleId: 'm9',
        points: [
          'Effective Address (EA): The net 16-bit logical offset generated inside the instruction (EA = Base + Index + Displacement).',
          'Default Segment Selection: Memory calculations using base registers BX, SI, or DI target the Data Segment (DS) by default. References using BP target the Stack Segment (SS) by default.',
          'Segment Override Prefix: Forces the processor to use a specified segment rather than the default (e.g., MOV AL, ES:[BX] overrides DS with ES).',
          'Physical Address Translation: The BIU takes the selected 16-bit segment base, shifts it by 4 bits, and adds the computed 16-bit EA.',
          'Use the Interactive Addressing Mode Lab on the right to simulate calculations and see the physical mapping of memory addresses.'
        ],
        interactiveType: 'addressing-modes'
      },
      {
        id: 'm9-quiz',
        title: 'Module 9 Recap Quiz',
        moduleTitle: 'Module 9: 8086 Addressing Modes',
        moduleId: 'm9',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'By default, which segment register is used to calculate the 20-bit physical address for the memory operand in the instruction "MOV AL, [BP + SI + 05H]"?',
            options: ['Code Segment (CS)', 'Data Segment (DS)', 'Stack Segment (SS)', 'Extra Segment (ES)'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2009',
            explanation: 'Any instruction referencing the Base Pointer (BP) as part of its memory offset calculation targets the Stack Segment (SS) by default. In contrast, memory offsets using BX, SI, or DI target the Data Segment (DS) by default.'
          },
          {
            question: 'What is the Addressing Mode of the source operand in the instruction "MOV DX, [SI]"?',
            options: ['Direct Addressing', 'Register Addressing', 'Register Indirect Addressing', 'Indexed Addressing'],
            correctAnswer: 2,
            explanation: 'In "MOV DX, [SI]", the operand is in memory, and its 16-bit offset is contained inside the index register SI. This is called Register Indirect addressing.'
          },
          {
            question: 'What is the Effective Address (EA) of the memory operand in the instruction "MOV AX, [BX + DI + 2000H]" if BX = 1000H, DI = 0500H, and DS = 3000H?',
            options: ['1500H', '3500H', '33500H', '3500H (with DS override)'],
            correctAnswer: 1,
            explanation: 'The Effective Address (EA) is the 16-bit logical offset. EA = BX + DI + Displacement = 1000H + 0500H + 2000H = 3500H. Note that the segment register DS is used for the Physical Address calculation, but is not part of the logical EA.'
          },
          {
            question: 'In the instruction "MOV CL, ES:[BX]", what is the purpose of "ES:"?',
            options: ['It is an immediate operand', 'It represents an Extra Segment override prefix, directing the CPU to read from ES instead of the default DS segment', 'It is a register indirect operand pointing to the stack segment', 'It triggers a software interrupt vector'],
            correctAnswer: 1,
            explanation: 'By default, references to memory using BX target the Data Segment (DS). The "ES:" syntax is a Segment Override Prefix which explicitly directs the processor to calculate the physical address using the Extra Segment (ES) register instead.'
          }
        ]
      }
    ]
  },
  {
    id: 'm10',
    title: 'Module 10: 8086 Instruction Set',
    slides: [
      {
        id: 'm10-s1',
        title: '1. Introduction 📖',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'Understand the 8086 instruction set and instruction structure.',
          'Instruction: A command given to the microprocessor to perform a specific task or operation (e.g., addition, data movement, logic analysis).',
          'Instruction Set: The complete list of instructions that a microprocessor is designed to recognize and execute. The 8086 supports more than 20,000 instruction variations!',
          'Execution Flow: The 8086 decodes instruction bytes in its Execution Unit (EU) after the Bus Interface Unit (BIU) fetches them from memory into the prefetch queue.'
        ]
      },
      {
        id: 'm10-s2',
        title: '2. General 8086 Machine Instruction Format & Builder 🧩',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        interactiveType: 'instruction-builder',
        points: [
          '8. General 8086 Machine Instruction Format: An 8086 instruction may contain different fields depending on the instruction. Not every instruction contains every field. Length varies from 1 to 6 bytes.',
          'Format Layout: [ Prefix ] | [ Opcode ] | [ MOD ] | [ REG ] | [ R/M ] | [ Displacement ] | [ Immediate Data ]',
          'Prefix (Optional): Repeat (REP) or segment override prefix (e.g. CS:, ES:).',
          'Opcode (Required): Specifies the operation to perform (6-bit opcode + D & W status bits).',
          'MOD (Addressing Mode): 2-bit field specifying register mode or displacement length (0, 1, or 2 bytes).',
          'REG (Register): 3-bit field specifying a 16-bit or 8-bit register operand.',
          'R/M (Register/Memory): 3-bit field specifying target register or base/index displacement combination.',
          'Displacement (Optional): 8-bit or 16-bit memory address offset.',
          'Immediate Data (Optional): 8-bit or 16-bit constant data value embedded in machine code.',
          '9. Interactive Instruction Builder 🧩: Use the interactive tool on the right to select operations (MOV, ADD, SUB, INC, CMP), destination/source registers, or immediate values, dynamically construct assembly instructions, and run the 4-step CPU Decode pipeline (FETCH → DECODE OPCODE → IDENTIFY OPERANDS → EXECUTE).',
          '10. Quick Comparison: Opcode (What operation to perform), Operand (Data or location involved), Destination (Where result goes), Source (Where data comes from), Addressing Mode (How operand is accessed), Machine Code (CPU binary/hex representation).',
          '11. Remember 🧠: OPCODE = WHAT TO DO | OPERAND = ON WHAT TO DO | ADDRESSING MODE = HOW TO FIND OPERAND.',
          'Execution Flow: Assembly Language → Opcode + Operand(s) → Machine Code → 8086 Executes.',
          'Key Facts: 8086 instructions are variable length (1 to 6 bytes). Not every instruction contains all fields. The 8086 uses Little-Endian storage for multi-byte data.'
        ]
      },
      {
        id: 'm10-s3',
        title: '3. Data Transfer Instructions 🔄',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'MOV: Moves (actually copies) byte or word from source to destination (e.g., MOV AX, BX). Note: Memory-to-Memory moves are illegal!',
          'PUSH & POP: Manipulates the stack segment. PUSH decrements SP by 2 and writes a 16-bit word. POP reads a 16-bit word and increments SP by 2.',
          'XCHG: Exchanges/swaps contents of two registers or register and memory (e.g., XCHG AX, BX). Segment registers are illegal here.',
          'LEA (Load Effective Address): Calculates the 16-bit logical offset of a memory variable and loads it into a target register (e.g., LEA BX, [SI+4]).',
          'Use the Interactive Simulator on the right to load and test Data Transfer instructions like MOV, PUSH, POP, and LEA.'
        ],
        interactiveType: 'instruction-decoder'
      },

      {
        id: 'm10-s4',
        title: '4. Arithmetic Instructions ➕',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'ADD & ADC: Adds source and destination. ADC (Add with Carry) also includes the current value of the Carry Flag, which is crucial for 32-bit or higher multi-word math.',
          'SUB & SBB: Subtracts source from destination. SBB (Subtract with Borrow) also subtracts the Carry/Borrow flag.',
          'INC & DEC: Increments or decrements a register/memory by 1 (e.g., INC CX). Note: INC/DEC do NOT affect the Carry Flag (CF)!',
          'MUL & DIV: Performs unsigned multiplication and division. AX (and DX) are used implicitly. Division by zero triggers an instant Type 0 CPU Exception.',
          'CMP: Subtracts source from destination but does NOT save the result; it only updates status flags (ZF, CF, SF) to compare values.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s5',
        title: '5. Logical Instructions ⚙️',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'AND & OR: Performs bitwise AND / OR operations. Useful for masking out bits (AND clears bits, OR sets bits). Affects CF, OF, ZF, PF, and SF.',
          'XOR: Performs bitwise Exclusive-OR (e.g., XOR AX, AX). A classic, fast way to clear a register to 0000H with smaller machine code size than MOV AX, 0.',
          "NOT: Inverts all bits of an operand (one's complement). Note: NOT does NOT affect any status flags!",
          'TEST: Performs a logical AND on operands but does NOT store the result; only updates flags (ZF, SF, PF). Perfect for checking if a specific bit is set (e.g., TEST AL, 01H).'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s6',
        title: '6. Shift & Rotate Instructions 🔁',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'SHL / SHR: Logical shift left and right. Moves bits left/right, inserting 0 into empty positions. The last bit shifted out enters the Carry Flag (CF).',
          'SAR: Arithmetic shift right. Shifts bits right while preserving the sign bit (most significant bit). Critical for signed division by powers of 2.',
          'ROL / ROR: Rotate left and right. Bits shifted out of one end wrap around and enter the other end, and are also copied into the Carry Flag (CF).',
          'RCL / RCR: Rotate through Carry left and right. Bits are rotated through the Carry Flag, making the Carry Flag act as a 17th bit of the register.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s7',
        title: '7. Branch & Control Transfer Instructions 🔀',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'Unconditional Branch: JMP directs the Instruction Pointer (IP) immediately to a new memory offset address.',
          'Conditional Jumps: Jumps are executed only if a specific status flag condition is met (e.g., JZ/JE jumps if ZF=1; JC/JB jumps if CF=1). They use an 8-bit relative displacement (-128 to +127 bytes).',
          'LOOP: Automatically decrements CX by 1. If CX is not 0, it jumps to the specified target label. Avoids manually writing DEC CX followed by JNZ.',
          'CALL & RET: Used for subroutines (procedures). CALL pushes the current IP (and CS for far calls) onto the stack and jumps; RET pops the saved IP back, returning to the caller.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s8',
        title: '8. String Instructions 📦',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'MOVS / MOVSB / MOVSW: Copies a byte or word from source string [DS:SI] to destination string [ES:DI]. SI and DI are automatically adjusted.',
          'Direction Flag (DF): Cleared with CLD (auto-increment SI/DI by 1 or 2) or set with STD (auto-decrement SI/DI). Must always be initialized before string operations!',
          'LODS & STOS: LODS loads AL/AX with string elements at [SI]; STOS stores AL/AX to string memory at [DI].',
          'CMPS & SCAS: CMPS compares strings byte/word by byte/word; SCAS scans a string looking for a match with AL/AX.',
          'REP / REPE / REPNE Prefix: Repeats the string instruction CX times, automatically decrementing CX and updating SI/DI on each iteration.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-s9',
        title: '9. Processor Control Instructions 🎛️',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        points: [
          'Flag Clear & Set: CLI/STI clears/sets the Interrupt Enable Flag (IF) to disable/enable maskable interrupts. CLC/STC clears/sets Carry Flag (CF). CLD/STD clears/sets Direction Flag (DF).',
          'HLT: Halts CPU execution. The CPU enters an idle state until a hardware interrupt or reset occurs.',
          'NOP (No Operation): Takes 1 byte of space and 3 clock cycles of time, performing no operation. Frequently used for creating software time delays or patching machine code.',
          'ESC (Escape): Provides an instruction prefix allowing external co-processors (like the 8087 Numeric Data Processor) to read data/instructions from the 8086 bus.',
          'LOCK Prefix: Asserts the hardware LOCK pin to prevent other bus masters from taking control of the system bus during multi-processor shared resource operations.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm10-quiz',
        title: 'Module 10 Recap Quiz',
        moduleTitle: 'Module 10: 8086 Instruction Set',
        moduleId: 'm10',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which of the following instructions is physically illegal in the 8086 microprocessor architecture?',
            options: ['MOV AX, [BX]', 'MOV [BX], [DI]', 'MOV DS, AX', 'MOV AL, [SI + 02H]'],
            correctAnswer: 1,
            explanation: 'The 8086 does not support memory-to-memory data transfers directly. "MOV [BX], [DI]" is illegal because both operands cannot refer to memory locations in a single instruction. You must first load the source value into a register, then store it.'
          },
          {
            question: 'What happens to the Carry Flag (CF) when the "INC CX" instruction is executed in an 8086 processor?',
            options: ['CF is set to 1 if CX overflows from FFFFH to 0000H', 'CF is unaffected because INC and DEC instructions do not alter the Carry Flag', 'CF is always cleared to 0', 'CF is set to the value of the auxiliary carry flag'],
            correctAnswer: 1,
            explanation: 'In the 8086 instruction set, the INC (Increment) and DEC (Decrement) instructions do NOT affect the Carry Flag (CF). They do affect other status flags like ZF, SF, OF, PF, and AF, but the Carry Flag is explicitly preserved.'
          },
          {
            question: 'Which of the following shift instructions preserves the sign bit (most significant bit) of the operand, allowing for signed division?',
            options: ['SHL (Shift Left)', 'SHR (Shift Right)', 'SAR (Shift Arithmetic Right)', 'ROL (Rotate Left)'],
            correctAnswer: 2,
            explanation: 'SAR (Shift Arithmetic Right) shifts bits to the right, but instead of inserting a 0 at the MSB (like SHR does), it duplicates the current sign bit (MSB). This preserves the arithmetic sign of signed numbers.'
          },
          {
            question: 'What are the default segment registers used by the source index (SI) and destination index (DI) in string instructions (like MOVSB)?',
            options: ['SI uses DS; DI uses ES', 'SI uses DS; DI uses SS', 'SI uses CS; DI uses ES', 'SI uses ES; DI uses DS'],
            correctAnswer: 0,
            explanation: 'In 8086 string operations, the source operand is always pointed to by SI and is located in the Data Segment (DS) by default. The destination operand is always pointed to by DI and is strictly located in the Extra Segment (ES).'
          },
          {
            question: 'Which instruction clears the Direction Flag (DF) to ensure that SI and DI increment automatically during string operations?',
            options: ['STD', 'CLD', 'CLI', 'CLC'],
            correctAnswer: 1,
            explanation: 'CLD (Clear Direction Flag) sets DF = 0, which directs the 8086 string execution logic to automatically increment SI and DI after each step. STD sets DF = 1, which causes them to decrement.'
          },
          {
            question: 'What occurs when the CPU attempts to execute a "DIV CX" instruction but the divisor in CX is 0000H?',
            options: ['The instruction is ignored and the program continues', 'The division result is set to FFFFH and Carry is set', 'The CPU instantly triggers a Type 0 (Divide by Zero) hardware interrupt exception', 'The CPU halts execution permanently'],
            correctAnswer: 2,
            explanation: 'When a division by zero is attempted on the 8086, the processor automatically suspends normal execution and executes a Type 0 (Divide by Zero) interrupt exception handler to safely deal with the mathematical error.'
          },
          {
            question: 'Which physical address formula does the 8086 CPU use to fetch the translated byte during the execution of the "XLAT" instruction?',
            options: ['DS:[BX + AL]', 'ES:[SI + AL]', 'DS:[BP + AL]', 'SS:[SP + AL]'],
            correctAnswer: 0,
            explanation: 'The XLAT instruction calculates the lookup address by adding the unsigned index in AL to the base offset in BX, accessing the Data Segment (DS) by default. Therefore, the physical memory location accessed is DS:[BX + AL].'
          },
          {
            question: 'In the 8086 microprocessor stack architecture, what micro-steps occur when the instruction "PUSH AX" is executed?',
            options: ['SP is incremented by 2, then AX is written to SS:[SP]', 'SP is decremented by 2, then the 16-bit word in AX is written to SS:[SP]', 'AX is written to memory, then SP is set to 0000H', 'SP is decremented by 1, then AL is written'],
            correctAnswer: 1,
            explanation: 'The 8086 stack grows DOWNWARDS towards lower memory addresses. Executing PUSH AX first decrements SP by 2 (SP ← SP - 2), and then writes the 16-bit word from AX into memory at location SS:[SP].'
          },
          {
            question: 'Where is the Base of the Stack (BOS) located relative to the Top of the Stack (TOS) in the 8086 memory architecture as items are pushed?',
            options: ['Base of Stack is at a LOWER memory address than Top of Stack', 'Base of Stack is at a HIGHER memory address than Top of Stack because the stack grows downward', 'Base of Stack and Top of Stack are always at the exact same address', 'Base of Stack resides in the Extra Segment (ES) while TOS resides in Code Segment (CS)'],
            correctAnswer: 1,
            explanation: 'Because the 8086 stack grows downward from high offsets to low offsets, the Base of the Stack (initial maximum SP) sits at a HIGHER memory address, while the Top of the Stack (current SP) moves to LOWER memory addresses as data is pushed.'
          }
        ]
      }
    ]
  },
  {
    id: 'm11',
    title: 'Module 11: Assembler Directives',
    slides: [
      {
        id: 'm11-s1',
        title: 'Definition of Assembler Directives',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        points: [
          'What are Assembler Directives?: Also called pseudo-instructions, these are special commands embedded in the source code meant solely for the assembler (MASM/TASM).',
          'Purpose & Role: They guide the compiler during translation, controlling segment allocation, memory layout, symbol definitions, and assembly processes.',
          'No Machine Code Generation: Unlike CPU instructions (e.g., MOV, ADD), assembler directives do NOT produce executable binary CPU opcodes or runtime machine instructions.',
          'Assembly vs Directives: Instructions tell the 8086 processor what operations to execute at runtime, whereas directives tell the assembler software how to assemble the program at compile-time.'
        ]
      },
      {
        id: 'm11-s2',
        title: 'Types of Assembly Programming Styles',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        points: [
          '8086 Program Formats: 8086 assembly source code can be written in three distinct programming styles: 1) Standard Segment-Ends Style, 2) Simplified Dot-Model Style, and 3) Tiny .COM Program Style.',
          '1. Standard Segment Style (EXE): Explicitly frames memory sections using logical "SEGMENT" and "ENDS" boundary identifiers. Requires the compile-time "ASSUME" directive to validate register bounds and manual runtime DS register loading via: MOV AX, DATA_SEG followed by MOV DS, AX.',
          '2. Simplified Dot-Model Style (EXE): Replaces verbose wrappers with modern shortcuts (.MODEL, .STACK, .DATA, .CODE). Automatically pre-configures segment mappings based on model sizes (e.g., .MODEL SMALL maps 64KB for code, 64KB for data).',
          '3. Tiny .COM Style (Single Segment): Utilizes ".MODEL TINY" to merge the code, data, and stack into a single unified 64KB physical memory segment. The OS automatically sets CS = DS = SS = ES upon loading.'
        ],
        interactiveType: 'directive-sandbox'
      },
      {
        id: 'm11-s2b',
        title: '8086 Memory Models (.MODEL Directive) 🧠',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        points: [
          'The .MODEL Directive: Defines the memory organization and allocation limits for code and data segments in simplified dot-model programs (Syntax: .MODEL <Size>).',
          '1. TINY Model: Code + Data + Stack all share ONE unified 64KB segment. Generates lightweight DOS .COM executables where CS = DS = SS = ES.',
          '2. SMALL Model: One 64KB Code Segment + One 64KB Data Segment (max 128KB total). Uses NEAR pointers by default. Perfect for standard 8086 assembly routines.',
          '3. MEDIUM Model: Code spans MULTIPLE segments (>64KB using FAR calls), while Data is restricted to ONE 64KB segment.',
          '4. COMPACT Model: Code is limited to ONE 64KB segment (NEAR calls), while Data spans MULTIPLE segments (>64KB using FAR pointers).',
          '5. LARGE Model: Both Code and Data span MULTIPLE 64KB segments (FAR calls & FAR pointers). Individual arrays are capped at 64KB.',
          '6. HUGE Model: Multiple Code and Data segments, AND single data structures/arrays CAN exceed 64KB by performing segment arithmetic.',
          'Explore our Interactive Memory Models & Directive Sandbox on the right to compare segment structures and layout parameters!'
        ],
        interactiveType: 'directive-sandbox'
      },
      {
        id: 'm11-s2c',
        title: 'NEAR and FAR Code Calls (PROC & PTR Directives) 📞',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        points: [
          'What are NEAR and FAR Calls?: In 8086 segmented architecture, procedure calls are categorized based on whether the destination subroutine is in the SAME code segment (NEAR) or a DIFFERENT code segment (FAR).',
          '1. NEAR Call (Intra-segment Call): Called when the procedure resides within the current 64KB Code Segment. The CS register remains unchanged. The CPU pushes ONLY the 16-bit Instruction Pointer (IP) onto the stack (2 bytes).',
          '2. FAR Call (Inter-segment Call): Called when the procedure resides in a DIFFERENT code segment. The CPU pushes BOTH the 16-bit CS register AND the 16-bit IP register onto the stack (4 bytes total: CS first, then IP).',
          'Procedure Directives (PROC NEAR / PROC FAR): Tell the assembler (MASM/TASM) whether to generate an intra-segment or inter-segment call, and whether the procedure ending RET should assemble into a 2-byte NEAR return (RETN) or 4-byte FAR return (RETF).',
          'PTR Directive Overrides: "CALL NEAR PTR MyLabel" forces a 16-bit offset call, while "CALL FAR PTR MyLabel" forces a 32-bit CS:IP inter-segment call.',
          'Memory Model Defaults: In .MODEL SMALL, subroutines default to NEAR. In .MODEL MEDIUM, LARGE, and HUGE, subroutines default to FAR because code spans multiple 64KB code segments.',
          'Interactive Simulator: Use the "NEAR & FAR Calls" tab in our Directive Sandbox on the right to simulate stack frame pushes and CS:IP register changes!'
        ],
        interactiveType: 'directive-sandbox'
      },
      {
        id: 'm11-quiz',
        title: 'Module 11 Recap Quiz',
        moduleTitle: 'Module 11: Assembler Directives',
        moduleId: 'm11',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What is the primary difference between an 8086 CPU instruction (like MOV or ADD) and an Assembler Directive?',
            options: [
              'Instructions guide the assembler at compile time, while directives execute in the ALU at runtime',
              'Directives are pseudo-instructions that guide the assembler during compilation and do NOT produce CPU machine code, whereas instructions produce executable opcodes',
              'Directives are executed by the 8087 math co-processor',
              'There is no difference between instructions and directives'
            ],
            correctAnswer: 1,
            explanation: 'Assembler directives (pseudo-instructions) are directives for the assembler software (e.g. MASM/TASM) during translation and produce no executable CPU machine code, whereas CPU instructions are translated directly into binary opcodes.'
          },
          {
            question: 'Which 8086 memory model restricts code to a single 64KB segment, but allows data to span MULTIPLE segments using FAR pointers?',
            options: ['SMALL Model', 'MEDIUM Model', 'COMPACT Model', 'TINY Model'],
            correctAnswer: 2,
            explanation: 'In the COMPACT memory model, code is restricted to one 64KB segment (using NEAR calls), while data can span multiple data segments using 32-bit FAR pointers.'
          },
          {
            question: 'In which 8086 memory model can a single large array or data structure exceed the 64KB segment size boundary?',
            options: ['LARGE Model', 'MEDIUM Model', 'HUGE Model', 'SMALL Model'],
            correctAnswer: 2,
            explanation: 'The HUGE memory model allows both multiple code/data segments AND permits single arrays to exceed 64KB by automatically handling segment arithmetic.'
          },
          {
            question: 'Which of the following programming styles merges code, data, and stack into a single 64KB physical segment where CS = DS = SS = ES?',
            options: ['Standard Segment Style (explicit SEGMENT/ENDS)', 'Simplified Dot-Model Style (.MODEL SMALL)', 'Tiny .COM Style (.MODEL TINY)', 'None of the above'],
            correctAnswer: 2,
            explanation: 'In Tiny .COM style (.MODEL TINY), code, data, and stack all share a single unified 64KB physical segment, and the operating system automatically sets CS, DS, SS, and ES to the same base address upon loading.'
          },
          {
            question: 'What are the three primary assembly programming styles in 8086 software development?',
            options: [
              'RISC Style, CISC Style, and Microcode Style',
              'Standard Segment-Ends Style, Simplified Dot-Model Style, and Tiny .COM Program Style',
              'Direct Style, Indirect Style, and Relative Style',
              'High-Level Style, Low-Level Style, and Machine Style'
            ],
            correctAnswer: 1,
            explanation: 'The three programming styles for 8086 programs are Standard Segment-Ends Style (explicit SEGMENT/ENDS), Simplified Dot-Model Style (.MODEL shortcuts), and Tiny .COM Program Style (.MODEL TINY).'
          },
          {
            question: 'During the execution of a FAR CALL instruction in the 8086 CPU, what values are pushed onto the Stack?',
            options: [
              'Only the 16-bit Instruction Pointer (IP)',
              'Only the 16-bit Code Segment (CS)',
              'Both the 16-bit CS register and the 16-bit IP register (4 bytes total)',
              'Both AX and BX registers'
            ],
            correctAnswer: 2,
            explanation: 'A FAR call is an inter-segment call to a subroutine in a different code segment. Therefore, the 8086 CPU must save both the current Code Segment (CS) and Instruction Pointer (IP) onto the stack so it can return back to the caller segment.'
          },
          {
            question: 'How many bytes are popped from the stack when a procedure declared as "PROC NEAR" completes execution via a RET instruction?',
            options: ['1 Byte', '2 Bytes (16-bit IP)', '4 Bytes (32-bit CS:IP)', '8 Bytes'],
            correctAnswer: 1,
            explanation: 'A NEAR procedure resides in the same 64KB code segment. When it completes, the RET instruction pops only the saved 16-bit Instruction Pointer (IP) from the stack, which consumes 2 bytes.'
          }
        ]
      }
    ]
  },
  {
    id: 'm12',
    title: 'Module 12: Writing Simple Programs',
    slides: [
      {
        id: 'm12-s1',
        title: 'Simple Arithmetic Programs (Addition, Subtraction, Multiplication & Division)',
        moduleTitle: 'Module 12: Writing Simple Programs',
        moduleId: 'm12',
        points: [
          '8086 arithmetic programming is register-intensive and follows systematic load, process, and store execution cycles using physical memory.',
          'Program 1: 16-Bit Unsigned Addition: Loads two 16-bit operands into AX and BX using MOV, executes ADD AX, BX, updates status flags (ZF, CF, SF), and stores the result to memory at location 1004H.',
          'Program 2: 16-Bit Unsigned Subtraction: Loads minuend and subtrahend into AX and BX, executes SUB AX, BX, sets the borrow flag (CF=1) if underflow occurs, and stores the 16-bit difference to memory.',
          'Program 3: 16-Bit Unsigned Multiplication: Loads multiplicand into AX and multiplier into BX, executes MUL BX (AX × BX), generating a 32-bit product stored across DX (High Word) and AX (Low Word).',
          'Program 4: 16-Bit Unsigned Division: Clears high word DX (XOR DX, DX), loads dividend into AX and divisor into BX, executes DIV BX (DX:AX ÷ BX), resulting in quotient in AX and remainder in DX.'
        ]
      },
      {
        id: 'm12-s2',
        title: '8086 Assembly Emulator & Debugger',
        moduleTitle: 'Module 12: Writing Simple Programs',
        moduleId: 'm12',
        points: [
          'An Emulator mimics the 8086 hardware, allowing execution of instructions without physical IC hardware.',
          'Single Step Debugging: Runs exactly one instruction cycle, letting you inspect registers (AX, BX, CX, DX) and pointers (IP) after each step.',
          'Register Monitoring: Track variables stored inside 16-bit general registers or their 8-bit split halves.',
          'Flag Status: Zero Flag (ZF), Carry Flag (CF), and Sign Flag (SF) update interactively after each arithmetic instruction.',
          'Explore our Live 8086 Assembly Playground on the right! Select a template, run instructions step-by-step, and see register changes.'
        ],
        interactiveType: 'assembler-playground'
      },
      {
        id: 'm12-quiz',
        title: 'Module 12 Recap Quiz',
        moduleTitle: 'Module 12: Writing Simple Programs',
        moduleId: 'm12',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which register is automatically decremented by 1 when the "LOOP label" instruction is executed in 8086 assembly language?',
            options: ['AX', 'BX', 'CX', 'DX'],
            correctAnswer: 2,
            explanation: 'The LOOP instruction uses the CX register (Count register) as its counter. Each time LOOP executes, the CPU automatically decrements CX by 1. If CX is not 0, it jumps to the target label; otherwise, it falls through.'
          },
          {
            question: 'In string copy instructions such as MOVSB, which register pair is used to hold the starting addresses of the Source and Destination strings respectively?',
            options: ['BX and DX', 'SP and BP', 'SI (Source Index) and DI (Destination Index)', 'AX and CX'],
            correctAnswer: 2,
            explanation: '8086 string instructions require SI (Source Index) to point to the source string relative to the Data Segment (DS), and DI (Destination Index) to point to the destination relative to the Extra Segment (ES).'
          },
          {
            question: 'Which instruction should be executed before string operations to ensure that the SI and DI index registers automatically INCREMENT (step forward) during string operations?',
            options: ['STD (Set Direction Flag)', 'CLD (Clear Direction Flag)', 'STI (Set Interrupt Flag)', 'CLI (Clear Interrupt Flag)'],
            correctAnswer: 1,
            explanation: 'CLD (Clear Direction Flag) clears DF to 0, which directs string instructions (like MOVSB/MOVSW) to automatically increment SI and DI after processing. In contrast, STD sets DF to 1, causing SI and DI to decrement.'
          },
          {
            question: 'What is the primary advantage of single-step execution in an 8086 software emulator or debugger when running assembly programs?',
            options: [
              'It automatically fixes syntax errors in the source code',
              'It executes one instruction at a time, allowing developers to inspect register values (AX, BX, SP) and flag states after each step',
              'It converts assembly code directly into high-level C++ source code',
              'It doubles the hardware clock speed of the physical processor'
            ],
            correctAnswer: 1,
            explanation: 'Single-step execution executes exactly one machine instruction at a time, enabling developers to observe real-time register updates, memory writes, and status flag changes step by step.'
          }
        ]
      }
    ]
  },
  {
    id: 'm13',
    title: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
    slides: [
      {
        id: 'm13-s1',
        title: '1. Semiconductor Memories Interfacing (RAM & ROM) 💾',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        points: [
          'Memory Interfacing Fundamentals: Primary memory interfacing involves connecting RAM (SRAM/DRAM for temporary data and stack) and ROM (EPROM/EEPROM/Flash for boot firmware) to the 8086 address, data, and control buses.',
          '8086 Memory Address Space: The 8086 possesses a 20-bit address bus (A0-A19), allowing it to address up to 1 MB (1,048,576 bytes) of physical memory spanning from 00000H to FFFFFH.',
          'Even and Odd Memory Banks: To achieve 16-bit wide data transfers, 1 MB memory is organized into two 512 KB banks: Even Bank (connected to D0-D7, selected by A0=0) and Odd Bank (connected to D8-D15, selected by BHE#=0).',
          'Address Decoding Circuits: Higher-order address lines (e.g. A17-A19 or A14-A19) are decoded using 3-to-8 line decoders (such as IC 74LS138) to generate active-low Chip Select (CS# or CE#) signals for memory ICs.',
          'Control Signal Matching: MPU control signals RD# (Read) and WR# (Write) are combined with memory enable lines (OE# - Output Enable, WE# - Write Enable) to gate data cleanly onto the system data bus.'
        ]
      },
      {
        id: 'm13-s2',
        title: '2. Memory Map Design & Address Decoding 📐',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        points: [
          'Memory Mapping Concept: A memory map defines the exact start and end physical addresses assigned to each RAM and ROM chip within the 1 MB address space.',
          'Calculating Memory Address Range: For a 64 KB memory chip (2^16 bytes), 16 address lines (A0-A15) are connected directly to the chip address pins, while the remaining 4 high address lines (A16-A19) connect to the address decoder.',
          'ROM Address Mapping in 8086: Because the 8086 automatically starts instruction execution from physical address FFFF0H upon RESET, the system EPROM/ROM must be mapped to the top of memory space (ending at FFFFFH).',
          'RAM Address Mapping in 8086: RAM is usually mapped at lower memory addresses starting at 00000H because the Interrupt Vector Table (IVT) occupies addresses 00000H to 003FFH.',
          'Absolute vs Partial Decoding: Absolute decoding uses all unused address lines to ensure each memory byte has a unique address; Partial decoding ignores some high address lines to save hardware, resulting in mirror addresses.'
        ]
      },
      {
        id: 'm13-quiz',
        title: 'Module 13 Recap Quiz',
        moduleTitle: 'Module 13: Semiconductor Memory Interfacing (RAM & ROM)',
        moduleId: 'm13',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Why is the 1 MB physical memory of the 8086 microprocessor divided into two 512 KB banks (Even Bank and Odd Bank)?',
            options: [
              'To allow simultaneous access to two independent programs',
              'To enable 16-bit word transfers in a single bus cycle using 8-bit memory chips',
              'To separate user data from operating system code',
              'To reduce total power consumption during instruction fetching'
            ],
            correctAnswer: 1,
            explanation: 'The 8086 data bus is 16 bits wide. Dividing memory into Even Bank (D0-D7, selected by A0=0) and Odd Bank (D8-D15, selected by BHE#=0) allows the 8086 to fetch either an 8-bit byte or a full 16-bit word in a single memory cycle.'
          },
          {
            question: 'Where must system ROM (EPROM/Flash) containing boot code be mapped in the 8086 memory address space?',
            options: [
              'At address 00000H because IVT starts there',
              'At address 80000H in the middle of memory',
              'At the top of memory near FFFF0H because 8086 jumps to FFFF0H upon RESET',
              'Anywhere in memory as long as CS# is connected to A0'
            ],
            correctAnswer: 2,
            explanation: 'Upon hardware RESET, the 8086 automatically sets CS = FFFFH and IP = 0000H, yielding physical address FFFF0H. Boot code/ROM must reside at FFFF0H to execute startup code.'
          },
          {
            question: 'Which integrated circuit (IC) is commonly used as a 3-to-8 line address decoder for generating Chip Select (CS#) signals in memory interfacing?',
            options: ['74LS138', '74LS245', '74LS373', '8255 PPI'],
            correctAnswer: 0,
            explanation: 'The 74LS138 is a 3-to-8 decoder with active-low outputs, ideal for decoding 3 address lines (e.g. A17-A19) into 8 distinct chip select (CS#) outputs.'
          }
        ]
      }
    ]
  },
  {
    id: 'm14',
    title: 'Module 14: Intel 8255 Programmable Peripheral Interface',
    slides: [
      {
        id: 'm14-s1',
        title: '1. Intel 8255 PPI Architecture & Pin Configuration 🔌',
        moduleTitle: 'Module 14: Intel 8255 Programmable Peripheral Interface',
        moduleId: 'm14',
        points: [
          'Overview of 8255 PPI: The Intel 8255 is a general-purpose programmable I/O device designed to interface parallel I/O devices (switches, LEDs, displays) to microprocessors.',
          'Internal Port Structure: Features 24 I/O pins organized into three 8-bit ports: Port A (PA0-PA7), Port B (PB0-PB7), and Port C (PC0-PC7).',
          'Port C Splitting: Port C is internally split into Port C Upper (PC4-PC7) and Port C Lower (PC0-PC3), which can act as independent 4-bit I/O ports or as handshake control lines for Ports A and B.',
          'Group A and Group B Controls: Group A controls Port A and Port C Upper; Group B controls Port B and Port C Lower.',
          'Bus Interface Signals: CS# (Chip Select), A0, A1 (Port selection lines), RD#, WR#, RESET, and bidirectional 8-bit Data Bus (D0-D7).'
        ]
      },
      {
        id: 'm14-s2',
        title: '2. 8255 Operating Modes & Control Word Format ⚙️',
        moduleTitle: 'Module 14: Intel 8255 Programmable Peripheral Interface',
        moduleId: 'm14',
        points: [
          'Mode 0 (Basic I/O): All ports (A, B, C) operate as simple input or output ports without handshaking. Data is written or read directly.',
          'Mode 1 (Strobed I/O): Ports A and B use Port C lines as handshake signals (STB#, IBF, ACK#, OBF#, INTR) to synchronize data transfer with peripheral devices.',
          'Mode 2 (Strobed Bi-directional Bus I/O): Port A functions as a 8-bit bi-directional data bus with Port C supplying 5 handshake control lines. (Port B can operate in Mode 0 or 1).',
          'I/O Mode Set Control Word: Written to Control Register when D7 = 1. Configures mode selection for Group A (D6,D5) and Group B (D2), and port directions (D4 for Port A, D3 for Port C Upper, D1 for Port B, D0 for Port C Lower).',
          'BSR Mode (Bit Set/Reset): Activated when D7 = 0. Allows individual setting (1) or resetting (0) of any single bit in Port C without affecting other bits.'
        ]
      },
      {
        id: 'm14-quiz',
        title: 'Module 14 Recap Quiz',
        moduleTitle: 'Module 14: Intel 8255 Programmable Peripheral Interface',
        moduleId: 'm14',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'How many total programmable I/O pins are available on the Intel 8255 PPI chip?',
            options: ['16 pins', '24 pins', '32 pins', '40 pins'],
            correctAnswer: 1,
            explanation: 'The 8255 PPI has 24 programmable I/O pins divided into Port A (8 bits), Port B (8 bits), and Port C (8 bits).'
          },
          {
            question: 'Which 8255 mode enables Port A to act as a Strobed Bi-directional I/O bus using Port C pins for handshaking?',
            options: ['Mode 0', 'Mode 1', 'Mode 2', 'BSR Mode'],
            correctAnswer: 2,
            explanation: 'Mode 2 is the Strobed Bi-directional Bus I/O mode, available exclusively on Port A of the 8255 PPI.'
          },
          {
            question: 'What is the control byte value to configure Port A as Input, Port B as Output, and Port C as Output in Mode 0?',
            options: ['90H', '80H', '82H', '92H'],
            correctAnswer: 0,
            explanation: 'D7=1 (I/O mode), D6D5=00 (Mode 0 for Group A), D4=1 (Port A Input), D3=0 (Port C Upper Output), D2=0 (Mode 0 for Group B), D1=0 (Port B Output), D0=0 (Port C Lower Output) -> Binary 10010000 = 90H.'
          }
        ]
      }
    ]
  },
  {
    id: 'm15',
    title: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
    slides: [
      {
        id: 'm15-s1',
        title: '1. Interfacing Switches, LEDs & Seven Segment Displays 💡',
        moduleTitle: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
        moduleId: 'm15',
        points: [
          'Switch Interfacing & Debouncing: Mechanical push switches generate contact bounce noise when pressed; hardware (SR flip-flops, RC filters) or software delays (~20 ms) resolve bounce.',
          'LED Interfacing: LEDs require current-limiting resistors (220Ω - 330Ω). In Active-Low logic, MPU outputs 0 to light LED; in Active-High logic, MPU outputs 1.',
          'Seven Segment Display Types: Common Anode (all anodes connected to +5V; active-low logic 0 turns on segment) and Common Cathode (all cathodes grounded; active-high logic 1 turns on segment).',
          'Display Segment Mapping: 7 segments (a, b, c, d, e, f, g) plus Decimal Point (dp) are mapped to 8-bit port lines (D0-D7). For Common Cathode digit "0" (a,b,c,d,e,f ON), 7-segment code is 3FH.',
          'Multiplexed Display System: Uses 8255 Port A to send segment data and Port C to drive digit select transistors sequentially for multi-digit displays.'
        ]
      },
      {
        id: 'm15-s2',
        title: '2. Stepper Motor Architecture & Interfacing 🔄',
        moduleTitle: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
        moduleId: 'm15',
        points: [
          'Stepper Motor Principle: Electromechanical device that converts electrical digital pulses into discrete mechanical angular movements (steps).',
          'Step Angle Calculation: Step Angle (β) = 360° / (Number of Stator Phases × Rotor Teeth). Common step angles include 1.8° (200 steps/rev) and 7.5° (48 steps/rev).',
          'Excitation Sequences: Wave Drive (one phase ON at a time: 11H -> 22H -> 44H -> 88H), Full-Step Drive (two phases ON: 33H -> 66H -> CCH -> 99H), and Half-Step Drive (alternating 1 and 2 phases for twice the angular resolution).',
          'Driver IC (ULN2003 / L293D): Microprocessor pins cannot supply high inductive current (~500mA); high-current Darlington transistor array ICs (ULN2003) buffer 8255 port pins.',
          '8086 Control Program: MPU outputs sequence bytes to 8255 Port A with software delay loops between step pulses to control motor speed and rotation direction.'
        ]
      },
      {
        id: 'm15-quiz',
        title: 'Module 15 Recap Quiz',
        moduleTitle: 'Module 15: Peripheral Interfacing (LEDs, Displays & Stepper Motor)',
        moduleId: 'm15',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In a Common Anode 7-segment display, what logic level must be applied to an individual segment pin (e.g. segment "a") to turn it ON?',
            options: [
              'Logic HIGH (1 or +5V)',
              'Logic LOW (0 or 0V)',
              'High impedance state',
              'Pulsed 1 kHz square wave'
            ],
            correctAnswer: 1,
            explanation: 'In Common Anode displays, all anodes share +5V. To complete the circuit current path through an LED segment, the corresponding cathode pin must be pulled LOW (Logic 0).'
          },
          {
            question: 'Why is a high-current driver IC like ULN2003 required between 8255 PPI ports and a stepper motor coil?',
            options: [
              'To invert the step control pulse frequency',
              'Because 8255 I/O port pins cannot sink/source the high currents (hundreds of mA) required by stepper motor coils',
              'To decode 3-bit step codes into 8-bit binary codes',
              'To store the step position in non-volatile memory'
            ],
            correctAnswer: 1,
            explanation: '8255 I/O pins provide max ~1.6 mA current, whereas stepper motor coils draw 100 mA to 1 A. ULN2003 Darlington array provides high current amplification and back-EMF diode protection.'
          },
          {
            question: 'How many total full steps are required for a stepper motor with a 1.8° step angle to execute one complete 360° revolution?',
            options: ['100 steps', '180 steps', '200 steps', '360 steps'],
            correctAnswer: 2,
            explanation: 'Total steps per revolution = 360° / Step Angle = 360° / 1.8° = 200 steps.'
          }
        ]
      }
    ]
  },
  {
    id: 'm16',
    title: 'Module 16: Analog Interfacing (A/D & D/A Converters)',
    slides: [
      {
        id: 'm16-s1',
        title: '1. Analog-to-Digital Converter (ADC 0808/0809) Interfacing 📊',
        moduleTitle: 'Module 16: Analog Interfacing (A/D & D/A Converters)',
        moduleId: 'm16',
        points: [
          'Need for A/D Conversion: Real-world sensors (temperature, pressure, light) produce continuous analog signals; ADCs convert these into digital binary values for 8086 processing.',
          'ADC 0808 Features: 8-bit successive-approximation ADC with an internal 8-channel analog multiplexer, requiring no external zero/full-scale adjustment.',
          'Control Signals for ADC 0808: ADD A, B, C (Channel Select), ALE (Address Latch Enable), START / SOC (Start of Conversion pulse), EOC (End of Conversion status signal), and OE (Output Enable to release tri-state outputs).',
          'Conversion Steps in 8086 Program: 1. Output channel address and pulse ALE & START HIGH. 2. Monitor EOC pin until it goes HIGH (conversion complete). 3. Assert OE HIGH to read 8-bit digital output via 8255 Port A.',
          'Resolution Calculation: Resolution = Vref / 2^n. For Vref = 5V and 8-bit ADC, resolution = 5V / 256 = 19.53 mV per LSB step.'
        ]
      },
      {
        id: 'm16-s2',
        title: '2. Digital-to-Analog Converter (DAC 0800) & Waveform Generation 📈',
        moduleTitle: 'Module 16: Analog Interfacing (A/D & D/A Converters)',
        moduleId: 'm16',
        points: [
          'Need for D/A Conversion: Microprocessors produce digital outputs; DACs convert binary values into continuous analog voltages/currents to drive actuators, speakers, and motors.',
          'DAC 0800 Architecture: High-speed 8-bit multiplying DAC utilizing an R-2R resistor ladder network to output proportional analog current (Iout).',
          'Current-to-Voltage Op-Amp Stage: An external Operational Amplifier (e.g. LM741) in transimpedance configuration converts DAC output current into output voltage Vout = Vref × (Digital Data / 256).',
          'Square Wave Generation: 8086 outputs 00H to 8255 Port A, delays, then outputs FFH, creating a square wave.',
          'Sawtooth & Triangular Wave Generation: Sawtooth is generated by continuously incrementing port value from 00H to FFH in a loop; Triangular wave increments from 00H to FFH and then decrements back to 00H.'
        ]
      },
      {
        id: 'm16-quiz',
        title: 'Module 16 Recap Quiz',
        moduleTitle: 'Module 16: Analog Interfacing (A/D & D/A Converters)',
        moduleId: 'm16',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What is the function of the EOC (End of Conversion) pin on the ADC 0808 chip during interfacing?',
            options: [
              'It signals the 8086 processor that digital conversion is finished and data is ready',
              'It turns off the internal clock generator',
              'It selects channel 0 on the 8-channel multiplexer',
              'It resets the internal registers to 00H'
            ],
            correctAnswer: 0,
            explanation: 'The EOC pin goes LOW when conversion begins and transitions HIGH when conversion completes, signaling the 8086/8255 that valid digital data is ready to be read.'
          },
          {
            question: 'What is the voltage resolution of an 8-bit DAC with a reference voltage (Vref) of +5.0 Volts?',
            options: ['1.0 V', '19.53 mV', '50.0 mV', '0.195 V'],
            correctAnswer: 1,
            explanation: 'Resolution = Vref / 2^8 = 5.0 V / 256 ≈ 0.01953 V = 19.53 mV.'
          },
          {
            question: 'Which operational amplifier configuration is connected to the output pins of a DAC 0800 IC to produce a voltage output?',
            options: [
              'Non-inverting Voltage Amplifier',
              'Transimpedance Current-to-Voltage Converter',
              'Differential Voltage Comparator',
              'Voltage Follower Buffer'
            ],
            correctAnswer: 1,
            explanation: 'The DAC 0800 provides a complementary current output (Iout). An op-amp connected as a current-to-voltage converter converts Iout into a scaled output voltage.'
          }
        ]
      }
    ]
  },
  {
    id: 'm17',
    title: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
    slides: [
      {
        id: 'm17-s1',
        title: '1. Software & Hardware Interrupt Applications in 8086 ⚡',
        moduleTitle: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
        moduleId: 'm17',
        points: [
          'Interrupt Concept: An interrupt suspends normal program execution, forcing MPU to jump to a specific Interrupt Service Routine (ISR), and returns via IRET instruction.',
          'Hardware Interrupt Pins: NMI (Non-Maskable Interrupt, edge-triggered, Type 2, highest hardware priority) and INTR (Maskable Interrupt, level-triggered, controlled by Interrupt Flag IF).',
          'Software Interrupts: Triggered by instructions like INT n (e.g. INT 21H for DOS system calls), INTO (Interrupt on Overflow), and INT 3 (Breakpoint debugging).',
          'Interrupt Vector Table (IVT): Occupies physical memory 00000H to 003FFH (1 KB). Stores 256 4-byte vectors containing CS:IP ISR entry addresses. Vector Address = Type Number × 4.',
          'Dedicated Interrupt Types: Type 0 (Divide-by-zero), Type 1 (Single Step / Trap), Type 2 (NMI), Type 3 (Breakpoint INT 3), Type 4 (Overflow INTO).'
        ]
      },
      {
        id: 'm17-s2',
        title: '2. Need for 8259 PIC & Internal Architecture 🧠',
        moduleTitle: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
        moduleId: 'm17',
        points: [
          'Need for 8259 PIC: 8086 has only ONE hardware INTR pin. The 8259 PIC expands this single pin to manage up to 8 vectored hardware interrupt requests (IR0-IR7) with programmable priorities.',
          'Cascading Capability: Master and Slave 8259 controllers can be cascaded via CAS0-CAS2 lines to manage up to 64 hardware interrupt requests.',
          'Interrupt Request Register (IRR): Stores all incoming interrupt levels (IR0-IR7) requesting service.',
          'In-Service Register (ISR): Stores the interrupt levels currently being serviced by the 8086 CPU.',
          'Interrupt Mask Register (IMR): 8-bit register that stores mask bits; setting bit n to 1 disables/masks interrupt request IRn.',
          'Priority Resolver (PR): Determines the highest priority request among unmasked bits in IRR and passes it to MPU.'
        ]
      },
      {
        id: 'm17-s3',
        title: '3. 8259 Command Words (ICWs & OCWs) 📜',
        moduleTitle: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
        moduleId: 'm17',
        points: [
          'Initialization Command Words (ICW1 - ICW4): Sent sequentially after hardware reset to configure fundamental 8259 operating parameters.',
          'ICW1: Defines single/cascade mode, edge/level trigger mode, and indicates if ICW4 is needed.',
          'ICW2: Sets the base Interrupt Vector Type (e.g. 08H for IR0-IR7 mapping to INT 08H - INT 0FH).',
          'ICW3: Master/Slave cascade pin connection mapping (only needed if cascade mode selected in ICW1).',
          'ICW4: Specifies 8086/8088 mode, Auto/Normal End of Interrupt (EOI), and buffered mode.',
          'Operation Command Words (OCWs): Written during normal execution to dynamically control interrupt operation. OCW1 (sets IMR mask bits), OCW2 (sends EOI commands and priority rotation), OCW3 (reads IRR/ISR status).'
        ]
      },
      {
        id: 'm17-quiz',
        title: 'Module 17 Recap Quiz',
        moduleTitle: 'Module 17: Interrupt Systems & Intel 8259 Programmable Interrupt Controller',
        moduleId: 'm17',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What is the physical starting memory address in the Interrupt Vector Table (IVT) for software interrupt INT 21H?',
            options: ['00021H', '00084H', '00210H', '00400H'],
            correctAnswer: 1,
            explanation: 'IVT vector physical address = Type Number × 4 = 21H × 4 = 15H × 4 = 84 decimal = 00084H.'
          },
          {
            question: 'Which internal register in the Intel 8259 PIC holds the hardware interrupt levels that are currently requesting service but not yet serviced?',
            options: [
              'Interrupt Request Register (IRR)',
              'In-Service Register (ISR)',
              'Interrupt Mask Register (IMR)',
              'Priority Resolver (PR)'
            ],
            correctAnswer: 0,
            explanation: 'The IRR (Interrupt Request Register) stores bits for all interrupt request lines (IR0-IR7) currently asserting a request.'
          },
          {
            question: 'What is the maximum number of hardware interrupt request lines that can be managed by cascading 8259 PIC controllers?',
            options: ['8 lines', '16 lines', '32 lines', '64 lines'],
            correctAnswer: 3,
            explanation: '1 Master 8259 connected to 8 Slave 8259 controllers yields 8 × 8 = 64 total hardware interrupt request lines.'
          }
        ]
      }
    ]
  },
  {
    id: 'm18',
    title: 'Module 18: Serial Communication & Intel 8251 USART',
    slides: [
      {
        id: 'm18-s1',
        title: '1. Serial Communication Fundamentals & 8251 Architecture 📡',
        moduleTitle: 'Module 18: Serial Communication & Intel 8251 USART',
        moduleId: 'm18',
        points: [
          'Parallel vs Serial Data Transfer: Parallel transfers entire 8/16-bit words simultaneously over short distances; Serial transmits bits sequentially over a single pair of wires over long distances.',
          'Synchronous vs Asynchronous Serial Transmission: Asynchronous uses Start/Stop framing bits without a shared clock; Synchronous uses transmitter/receiver clock synchronization with sync characters.',
          'Baud Rate Definition: Number of signal state changes or bits transmitted per second (e.g. 9600 Baud).',
          'Overview of 8251 USART: Universal Synchronous Asynchronous Receiver Transmitter chip that converts MPU parallel data into serial format for transmission, and incoming serial data into parallel format.',
          'Functional Blocks of 8251: Transmitter Buffer & Register, Receiver Buffer & Register, Data Bus Buffer, Read/Write Control Logic, Modem Control (RTS#, CTS#, DTR#, DSR#).'
        ]
      },
      {
        id: 'm18-s2',
        title: '2. 8251 USART Programming & Control Register ⚙️',
        moduleTitle: 'Module 18: Serial Communication & Intel 8251 USART',
        moduleId: 'm18',
        points: [
          '8251 Control Logic & C/D# Pin: C/D# = 0 accesses Data Buffer; C/D# = 1 accesses Control/Status Register.',
          'Mode Instruction Format: Sent first after RESET to select Asynchronous/Synchronous mode, baud rate factor (x1, x16, x64), character length (5-8 bits), parity enable/type, and stop bit count (1, 1.5, 2).',
          'Command Instruction Format: Controls operational functions such as Transmit Enable (TXEN), Receive Enable (RXE), Error Reset (ER), and Internal Reset (IR).',
          'Status Read Register: Reading 8251 with C/D# = 1 provides status flags: TxRDY (Transmitter Ready), RxRDY (Receiver Ready), TxEMPTY, Framing Error (FE), Overrun Error (OE), Parity Error (PE).',
          'RS-232C Voltage Level Shifting: MPU TTL voltage levels (0V/5V) are converted to RS-232C bipolar standards (-12V / +12V) using line driver ICs like MAX232.'
        ]
      },
      {
        id: 'm18-quiz',
        title: 'Module 18 Recap Quiz',
        moduleTitle: 'Module 18: Serial Communication & Intel 8251 USART',
        moduleId: 'm18',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In asynchronous serial data transmission, what is the purpose of adding Start and Stop bits around each character frame?',
            options: [
              'To increase bit transfer speed by 50%',
              'To synchronize receiver bit-timing without requiring a shared continuous clock line',
              'To encrypt data against bus snooping',
              'To enable multi-master bus arbitration'
            ],
            correctAnswer: 1,
            explanation: 'Asynchronous serial transmission uses a Start bit (logic 0) to signal character arrival and Stop bit(s) (logic 1) to mark frame end, allowing receiver clock resynchronization.'
          },
          {
            question: 'Which status flag in the 8251 USART status register indicates that received serial data is ready in the Rx buffer to be read by the MPU?',
            options: ['TxRDY', 'RxRDY', 'TxEMPTY', 'DSR'],
            correctAnswer: 1,
            explanation: 'RxRDY (Receiver Ready) goes HIGH when 8251 has assembled a complete serial character into the internal receive buffer and is ready for MPU read.'
          },
          {
            question: 'Which driver IC is standardly used to convert 0V/5V TTL logic levels to ±12V RS-232C serial communication signal levels?',
            options: ['MAX232', 'ULN2003', '74LS373', '8259 PIC'],
            correctAnswer: 0,
            explanation: 'The MAX232 IC features internal charge pump capacitors to convert 5V TTL levels to ±10V/12V RS-232 signal levels.'
          }
        ]
      }
    ]
  },
  {
    id: 'm19',
    title: 'Module 19: Direct Memory Access & Intel 8237A DMA Controller',
    slides: [
      {
        id: 'm19-s1',
        title: '1. Direct Memory Access (DMA) & 8237A Architecture 🚀',
        moduleTitle: 'Module 19: Direct Memory Access & Intel 8237A DMA Controller',
        moduleId: 'm19',
        points: [
          'DMA Concept: Direct Memory Access transfers high-speed data directly between I/O peripherals and RAM without CPU intervention, bypassing MPU register fetch-execute cycles.',
          'Bus Master Concept: During DMA, the DMA Controller takes control of the address, data, and control buses from the 8086 microprocessor.',
          'Handshake Signals: HRQ (Hold Request sent by 8237 to 8086 HOLD pin) and HLDA (Hold Acknowledge sent by 8086 HLDA pin to 8237, signaling bus tri-stating).',
          'Overview of 8237A DMAC: High-performance programmable DMA controller containing 4 independent DMA channels (Channel 0 - Channel 3).',
          'Internal Channel Registers: Each channel contains a 16-bit Base Address Register, 16-bit Current Address Register, 16-bit Base Count Register, and 16-bit Current Count Register.'
        ]
      },
      {
        id: 'm19-s2',
        title: '2. 8237A DMA Modes & Bus Transfer Types 🔄',
        moduleTitle: 'Module 19: Direct Memory Access & Intel 8237A DMA Controller',
        moduleId: 'm19',
        points: [
          'DMA Operating Modes: Single Transfer Mode (releases bus after 1 byte), Block Transfer Mode (transfers entire block until count reaches zero), Demand Transfer Mode (transfers continuously as long as DRQ remains active), Cascade Mode.',
          'DMA Transfer Types: Memory-to-I/O Read, I/O-to-Memory Write, and Memory-to-Memory Transfer (using Channel 0 and Channel 1).',
          'Peripheral Handshake Signals: DRQ0-DRQ3 (DMA Request inputs from peripherals) and DACK0-DACK3 (DMA Acknowledge outputs to peripherals).',
          'Auto-initialization Feature: Automatically reloads base address and count values into current registers after block completion without CPU intervention.',
          'Performance Impact: DMA increases data transfer speeds from ~100 KB/s (CPU-driven string loops) to multi-megabytes per second.'
        ]
      },
      {
        id: 'm19-quiz',
        title: 'Module 19 Recap Quiz',
        moduleTitle: 'Module 19: Direct Memory Access & Intel 8237A DMA Controller',
        moduleId: 'm19',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'What happens to the 8086 microprocessor system buses (address, data, control) when it asserts the HLDA (Hold Acknowledge) signal to the DMA controller?',
            options: [
              'The buses are forced to 0V ground',
              'The buses are placed in high-impedance (tri-state) condition so the DMAC can drive them',
              'The buses execute an internal memory refresh cycle',
              'The buses latch the current instruction pointer IP'
            ],
            correctAnswer: 1,
            explanation: 'In response to HOLD from 8237, the 8086 asserts HLDA and releases its address, data, and control lines into high-impedance (tri-state) so the 8237 can master the system bus.'
          },
          {
            question: 'How many independent DMA channels are available on a single Intel 8237A DMA Controller IC?',
            options: ['2 channels', '4 channels', '8 channels', '16 channels'],
            correctAnswer: 1,
            explanation: 'The Intel 8237A provides 4 independent DMA channels (Channel 0 to Channel 3).'
          },
          {
            question: 'Which 8237A DMA transfer mode transfers data bytes continuously until the terminal count register reaches zero or EOP# is asserted?',
            options: [
              'Single Transfer Mode',
              'Block Transfer Mode',
              'Cycle Stealing Mode',
              'Software Interrupt Mode'
            ],
            correctAnswer: 1,
            explanation: 'In Block Transfer mode, once DRQ triggers the DMAC, data is transferred continuously until the Word Count register decrements to zero (Terminal Count).'
          }
        ]
      }
    ]
  }
];
