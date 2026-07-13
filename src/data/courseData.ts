import { Module } from '../types';

export const courseData: Module[] = [
  {
    id: 'm1',
    title: 'Module 1: Introduction to Microprocessors',
    slides: [
      {
        id: 'm1-s1',
        title: 'Welcome to Microprocessors & Microcontrollers!',
        moduleTitle: 'Module 1: Introduction to Microprocessors',
        moduleId: 'm1',
        points: [
          'Designed specifically for B.Tech beginners starting their hardware engineering journey.',
          'Microprocessor: A multipurpose, programmable, clock-driven, register-based electronic device.',
          'It reads binary instructions from a storage device (Memory), accepts binary data as input, processes data according to instructions, and provides results as output.',
          'The 8086 is a monumental 16-bit microprocessor launched by Intel in 1978, establishing the classic x86 architecture.'
        ]
      },
      {
        id: 'm1-s2',
        title: 'Evolution of Microprocessors',
        moduleTitle: 'Module 1: Introduction to Microprocessors',
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
        id: 'm1-s3',
        title: 'Microprocessor vs Microcontroller',
        moduleTitle: 'Module 1: Introduction to Microprocessors',
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
        id: 'm1-s4',
        title: 'Features & Applications of Intel 8086',
        moduleTitle: 'Module 1: Introduction to Microprocessors',
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
        moduleTitle: 'Module 1: Introduction to Microprocessors',
        moduleId: 'm1',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In a microprocessor-based system, where are the memory (RAM, ROM) and peripheral devices typically located?',
            options: [
              'Integrated on the same silicon chip as the CPU',
              'Connected externally to the CPU via system buses',
              'Implemented purely within the CPU\'s general-purpose registers',
              'Not required for the system to perform any calculations'
            ],
            correctAnswer: 1,
            explanation: 'A microprocessor (MPU) contains only the CPU on the chip. All other system components, including RAM, ROM, timers, and I/O controllers, are located on separate chips and connected externally via system buses. This is in contrast to a microcontroller, which integrates them onto a single chip.'
          },
          {
            question: 'What is the word length of the Intel 8086 microprocessor?',
            options: ['4-bit', '8-bit', '16-bit', '32-bit'],
            correctAnswer: 2,
            explanation: 'Intel 8086 is a 16-bit microprocessor because its internal registers, ALU, and data bus are all 16 bits wide.'
          },
          {
            question: 'How much physical memory can the 8086 address?',
            options: ['64 KB', '1 MB', '16 MB', '4 GB'],
            correctAnswer: 1,
            explanation: 'With a 20-bit address bus, 8086 can address up to 2^20 bytes, which equals exactly 1 Megabyte (1 MB).'
          },
          {
            question: 'Which generation of microprocessors does the Intel 8086 belong to?',
            options: ['First Generation', 'Second Generation', 'Third Generation', 'Fourth Generation'],
            correctAnswer: 2,
            explanation: 'The Intel 8086, launched in 1978, is a classic representative of the 3rd generation of microprocessors, which introduced 16-bit word lengths.'
          },
          {
            question: 'What is a major advantage of a microcontroller over a microprocessor in embedded systems?',
            options: ['Higher processing speeds and cache memory sizes', 'Single-chip integration of CPU, RAM, ROM, and I/O timers', 'Ability to execute multiple operating systems simultaneously', 'Support for external floating-point math co-processors'],
            correctAnswer: 1,
            explanation: 'Microcontrollers integrate CPU, memory, and peripheral components on a single silicon chip, making them compact, power-efficient, and cost-effective.'
          },
          {
            question: 'What are the two major functional divisions of the Intel 8086 internal architecture?',
            options: ['ALU and Control Unit', 'Registers and Memory Unit', 'Bus Interface Unit (BIU) and Execution Unit (EU)', 'Input Unit and Output Unit'],
            correctAnswer: 2,
            explanation: 'The 8086 splits its internal tasks into the Bus Interface Unit (BIU) for memory accesses/segmentation and the Execution Unit (EU) for instruction execution.'
          },
          {
            question: 'Which bus width determines the maximum size of addressable memory in a microprocessor system?',
            options: ['Data Bus', 'Address Bus', 'Control Bus', 'System Clock Bus'],
            correctAnswer: 1,
            explanation: 'The width of the address bus determines how many unique memory addresses the processor can specify. For 8086, 2^20 wires allows addressing up to 1 MB.'
          }
        ]
      }
    ]
  },
  {
    id: 'm2',
    title: 'Module 2: 8086 Pin Configuration',
    slides: [
      {
        id: 'm2-s1',
        title: '8086 Pin Configuration Overview',
        moduleTitle: 'Module 2: 8086 Pin Configuration',
        moduleId: 'm2',
        points: [
          'The Intel 8086 is housed in a 40-Pin Dual In-line Package (DIP) operating on a single +5V power supply.',
          'It contains multiplexed buses to save pin count (AD0-AD15 share Address and Data).',
          'Multiplexing: Pins transmit Address during the T1 clock state, and transition to transmit Data during T2, T3, and T4 states.',
          'MN/MX Pin (Pin 33): Used to configure the entire chip to operate in Minimum Mode (single processor) or Maximum Mode (multiprocessor).'
        ]
      },
      {
        id: 'm2-s2',
        title: 'Interactive 8086 Pin Diagram',
        moduleTitle: 'Module 2: 8086 Pin Configuration',
        moduleId: 'm2',
        points: [
          'Address/Data Bus Pins: AD0 to AD15 (Pins 2-16 & 39).',
          'Control Signals: RD (Read), WR (Write), ALE (Address Latch Enable), READY (Acknowledge from slow memory).',
          'Status Signals: S0 to S7 (shared with address lines A16-A19 and BHE).',
          'Power Supply: Vcc (Pin 40, +5V DC) and GND (Pins 1 & 20).'
        ],
        interactiveType: 'pins'
      },
      {
        id: 'm2-quiz',
        title: 'Module 2 Recap Quiz',
        moduleTitle: 'Module 2: 8086 Pin Configuration',
        moduleId: 'm2',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'To interface an 8-bit memory chip to the lower bank of the 8086 memory system, which combination of signals must be decoded for the chip-select input?',
            options: ['A0 = 0 and BHE = 1', 'A0 = 0 and BHE = 0', 'A0 = 1 and BHE = 0', 'A0 = 1 and BHE = 1'],
            correctAnswer: 0,
            isGateQuestion: true,
            gateYear: 'GATE 2015',
            explanation: 'In the 8086, the lower byte bank contains all even addresses and is selected when A0 is active low (A0 = 0). The upper byte bank contains odd addresses and is selected when BHE is active low (BHE = 0). Thus, to interface a single 8-bit memory chip strictly to the lower bank, we select when A0 = 0, and the upper bank is disabled, i.e., BHE = 1.'
          },
          {
            question: 'Which pin acts as the Minimum/Maximum mode selector on the 8086?',
            options: ['Pin 40 (Vcc)', 'Pin 33 (MN/MX)', 'Pin 21 (RESET)', 'Pin 19 (CLK)'],
            correctAnswer: 1,
            explanation: 'Pin 33 (MN/MX) is the mode selector. Connecting it to +5V activates Minimum Mode, while grounding it (0V) activates Maximum Mode.'
          },
          {
            question: 'Why are Address and Data lines multiplexed on the 8086?',
            options: ['To increase speed', 'To reduce the physical pin count of the chip', 'To consume less power', 'To support memory segmentation'],
            correctAnswer: 1,
            explanation: 'Multiplexing sharing physical pins for both Address and Data (AD0-AD15) keeps the processor package compact at exactly 40 pins instead of needing 50+ dedicated pins.'
          },
          {
            question: 'What is the physical package type of the Intel 8086 microprocessor?',
            options: ['40-Pin DIP (Dual In-line Package)', '80-Pin QFP (Quad Flat Package)', '64-Pin PGA (Pin Grid Array)', '28-Pin PLCC'],
            correctAnswer: 0,
            explanation: 'The 8086 is housed in a classic 40-pin Dual In-line Package (DIP), operating on a single +5V DC power supply.'
          },
          {
            question: 'Which signal goes high to indicate that valid address bits are present on the multiplexed AD0-AD15 lines?',
            options: ['RD (Read)', 'WR (Write)', 'ALE (Address Latch Enable)', 'READY'],
            correctAnswer: 2,
            explanation: 'ALE (Address Latch Enable) pulses active-high during clock state T1 to notify external latches (like the 8282) to latch and hold the 20-bit address.'
          },
          {
            question: 'What is the purpose of the READY pin on the 8086 microprocessor?',
            options: ['To reset the processor', 'To synchronize slow memory/peripherals with the CPU speed', 'To trigger a software interrupt', 'To enable DMA transfer'],
            correctAnswer: 1,
            explanation: 'When slow memory or peripherals cannot complete a read/write in a standard bus cycle, they pull the READY pin low, forcing the 8086 to insert "WAIT" states.'
          },
          {
            question: 'Which of the following pins is a Non-Maskable Interrupt input?',
            options: ['INTR', 'NMI', 'RESET', 'TEST'],
            correctAnswer: 1,
            explanation: 'NMI (Pin 17) is the Non-Maskable Interrupt, which is edge-triggered and cannot be disabled or ignored by software instructions.'
          }
        ]
      }
    ]
  },
  {
    id: 'm3',
    title: 'Module 3: 8086 Microprocessor Family',
    slides: [
      {
        id: 'm3-s1',
        title: 'Intel x86 Family Tree',
        moduleTitle: 'Module 3: 8086 Microprocessor Family',
        moduleId: 'm3',
        points: [
          'Intel 8086 (1978): The baseline 16-bit processor with a 16-bit data bus.',
          'Intel 8088 (1979): Identical internally to 8086, but possesses an 8-bit external data bus. Chosen for the original IBM PC to reduce board-wiring costs.',
          'Intel 80186: Highly integrated version adding DMA controller, timers, and interrupt controllers directly on-chip.',
          'Intel 80286 (1982): Introduced multi-tasking, protected mode, and a 16 MB physical addressing range.'
        ],
        interactiveType: 'evolution'
      },
      {
        id: 'm3-s2',
        title: 'Evolution to Pentium Series',
        moduleTitle: 'Module 3: 8086 Microprocessor Family',
        moduleId: 'm3',
        points: [
          '80386 (1985): Intel\'s first true 32-bit x86 processor. Introduced virtual memory paging, supporting up to 4 GB of RAM.',
          '80486 (1989): Integrated a floating-point unit (FPU/math coprocessor) and 8 KB of L1 cache onto the CPU core.',
          'Pentium (1993): Launched superscalar execution (two independent execution pipelines, U and V), allowing it to process two instructions per clock cycle.'
        ]
      },
      {
        id: 'm3-quiz',
        title: 'Module 3 Recap Quiz',
        moduleTitle: 'Module 3: 8086 Microprocessor Family',
        moduleId: 'm3',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'An 8086 microprocessor has a 20-bit address bus. What is the start and end of its physical address range in hexadecimal representation?',
            options: ['0000h to FFFFh', '00000h to FFFF0h', '00000h to FFFFFh', '10000h to FFFFFh'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2007',
            explanation: 'A 20-bit address bus can address 2^20 = 1,048,576 memory locations (1 MB). In hexadecimal, 20 bits are represented by 5 hex digits, spanning from 00000h to FFFFFh.'
          },
          {
            question: 'What is the primary difference between the Intel 8086 and the Intel 8088?',
            options: ['8088 has a 32-bit register bank', '8088 has an 8-bit external data bus, while 8086 has a 16-bit external data bus', '8088 does not support interrupts', '8086 cannot run IBM software'],
            correctAnswer: 1,
            explanation: 'Both are internally identical, but the 8088 was built with an 8-bit external data bus to use cheaper 8-bit electronic circuit boards during the late 70s PC boom.'
          },
          {
            question: 'Which x86 processor first introduced 32-bit data registers and paging?',
            options: ['Intel 80186', 'Intel 80286', 'Intel 80386', 'Intel Pentium'],
            correctAnswer: 2,
            explanation: 'The Intel 80386 was the first true 32-bit x86 processor, introducing flat-memory models, paging mechanisms, and massive 4 GB addressing boundaries.'
          },
          {
            question: 'Which processor in the x86 family integrated a DMA controller, timers, and chip-select logic directly on the chip?',
            options: ['Intel 8085', 'Intel 8088', 'Intel 80186', 'Intel 80286'],
            correctAnswer: 2,
            explanation: 'The Intel 80186 was a highly integrated 16-bit processor, incorporating several support peripheral chips (timers, DMA, interrupts) directly on-chip.'
          },
          {
            question: 'What was the physical address bus width and memory limit of the Intel 80286?',
            options: ['20-bit, 1 MB', '24-bit, 16 MB', '32-bit, 4 GB', '16-bit, 64 KB'],
            correctAnswer: 1,
            explanation: 'The 80286 featured a 24-bit address bus, allowing it to address up to 16 MB of physical RAM, and first introduced protected mode.'
          },
          {
            question: 'What major feature did the Intel 80486 introduce directly onto the main processor silicon chip?',
            options: ['On-chip L1 Cache and Floating Point Unit (FPU)', '64-bit ALU', 'Dual-core processing', 'Integrated RAM memory'],
            correctAnswer: 0,
            explanation: 'The 80486 integrated a math coprocessor (FPU) and an 8 KB L1 Cache onto the core, greatly speeding up scientific calculations.'
          },
          {
            question: 'What does "Superscalar" mean in the context of the Intel Pentium processor?',
            options: ['It runs on multiple frequencies simultaneously', 'It contains multiple parallel execution pipelines to run multiple instructions per clock', 'It supports up to 1 TB of RAM', 'It can run both Windows and macOS natively'],
            correctAnswer: 1,
            explanation: 'A superscalar processor like the original Pentium has two execution pipelines ("U" and "V") that allow executing two independent instructions in parallel during a single clock cycle.'
          }
        ]
      }
    ]
  },
  {
    id: 'm4',
    title: 'Module 4: Internal Architecture',
    slides: [
      {
        id: 'm4-s1',
        title: '8086 Internal Architecture Overview',
        moduleTitle: 'Module 4: Internal Architecture',
        moduleId: 'm4',
        points: [
          'The 8086 internal architecture is split into two independent functional units:',
          '1. Bus Interface Unit (BIU): Responsible for external communication, instruction fetching, memory segmentation, and queueing.',
          '2. Execution Unit (EU): Responsible for decoding instructions, coordinating internal execution, and performing ALU math.',
          'Separating these units enables Pipelining - fetching instruction bytes from memory while executing previous ones.'
        ]
      },
      {
        id: 'm4-s2',
        title: 'Interactive Register Organization',
        moduleTitle: 'Module 4: Internal Architecture',
        moduleId: 'm4',
        points: [
          'Segment Registers (BIU): CS, DS, SS, ES (Used to point to 64 KB memory segments).',
          'General Purpose Registers (EU): AX, BX, CX, DX (Can be split into 8-bit high/low halves).',
          'Pointer & Index Registers (EU): SP (Stack Pointer), BP (Base Pointer), SI (Source Index), DI (Destination Index).',
          'Flag Register: Represents the current status of ALU arithmetic results.'
        ],
        interactiveType: 'architecture'
      },
      {
        id: 'm4-s3',
        title: 'The Flag Register Detail',
        moduleTitle: 'Module 4: Internal Architecture',
        moduleId: 'm4',
        points: [
          'The 8086 possesses a 16-bit Flag register with 9 active flags.',
          '6 Status Flags: CF (Carry), PF (Parity), AF (Auxiliary Carry), ZF (Zero), SF (Sign), OF (Overflow). Updated automatically by ALU.',
          '3 Control Flags: DF (Direction for strings), IF (Interrupt Enable), TF (Trap for debugging). Controlled by software instructions (CLI, STI, CLD, STD).'
        ],
        interactiveType: 'flags'
      },
      {
        id: 'm4-quiz',
        title: 'Module 4 Recap Quiz',
        moduleTitle: 'Module 4: Internal Architecture',
        moduleId: 'm4',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'How is the general purpose 16-bit AX register split into 8-bit registers?',
            options: ['AL and AL', 'AH and AL', 'AXH and AXL', 'A1 and A2'],
            correctAnswer: 1,
            explanation: 'The 16-bit AX register is split into AH (Accumulator High byte, bits 8-15) and AL (Accumulator Low byte, bits 0-7) which can be accessed independently in assembly.'
          },
          {
            question: 'Which flag is set to 1 if an arithmetic operation yields a zero result?',
            options: ['Carry Flag (CF)', 'Sign Flag (SF)', 'Zero Flag (ZF)', 'Parity Flag (PF)'],
            correctAnswer: 2,
            explanation: 'The Zero Flag (ZF) is automatically set to 1 by the hardware if the outcome of the latest instruction is exactly zero.'
          },
          {
            question: 'Which general-purpose register is automatically used as an implicit counter for loop instructions like LOOP?',
            options: ['AX (Accumulator)', 'BX (Base)', 'CX (Count)', 'DX (Data)'],
            correctAnswer: 2,
            explanation: 'CX is the Count register, designed to act as an automatic counter for loops, shifts, and string instructions.'
          },
          {
            question: 'What are the three control flags in the 8086 flag register?',
            options: ['CF, PF, AF', 'ZF, SF, OF', 'DF, IF, TF', 'SP, BP, IP'],
            correctAnswer: 2,
            explanation: 'The three Control flags are DF (Direction Flag), IF (Interrupt Flag), and TF (Trap Flag), which alter the CPU behavior under software control.'
          },
          {
            question: 'Which register holds the offset of the stack segment top?',
            options: ['Base Pointer (BP)', 'Stack Pointer (SP)', 'Source Index (SI)', 'Instruction Pointer (IP)'],
            correctAnswer: 1,
            explanation: 'The Stack Pointer (SP) register maintains the 16-bit offset of the current top of the stack segment (SS:SP).'
          },
          {
            question: 'What is the function of the Auxiliary Carry Flag (AF)?',
            options: ['To signal a carry out of bit 15', 'To support Binary Coded Decimal (BCD) arithmetic by tracking carries out of bit 3', 'To handle overflow on signed math', 'To control string copying directions'],
            correctAnswer: 1,
            explanation: 'The Auxiliary Carry Flag (AF) tracks carries out of the lower nibble (bit 3) into bit 4, supporting BCD adjustments like the DAA instruction.'
          }
        ]
      }
    ]
  },
  {
    id: 'm5',
    title: 'Module 5: Bus Interface Unit (BIU)',
    slides: [
      {
        id: 'm5-s1',
        title: '1. What is Memory Segmentation?',
        moduleTitle: 'Module 5: Bus Interface Unit (BIU)',
        moduleId: 'm5',
        points: [
          'Memory Segmentation: The technique of partitioning the 8086\'s 1 MB physical memory address space into smaller logical blocks (segments) of up to 64 KB each.',
          'Active Segments: At any time, the 8086 can actively reference four main memory areas: Code (CS), Data (DS), Stack (SS), and Extra (ES).',
          'Segment Registers: These are four dedicated 16-bit registers (CS, DS, SS, ES) in the BIU that hold the starting base address of each respective segment.',
          '16-Bit Offset: A compact 16-bit pointer holds the relative offset address inside the active 64 KB segment, enabling fast, localized memory access.'
        ]
      },
      {
        id: 'm5-s1-math',
        title: '2. 1 MB Memory Bit & Byte Math',
        moduleTitle: 'Module 5: Bus Interface Unit (BIU)',
        moduleId: 'm5',
        points: [
          'Addressable Locations: With a 20-bit address bus, the 8086 can address 2^20 physical locations: 2^20 = 1,048,576 locations.',
          'Byte-Addressable Memory: Each individual location stores exactly 1 Byte (8 bits). Therefore, maximum addressable memory capacity is exactly 1,048,576 Bytes (1 MB).',
          'Capacity in Bits: Since 1 MB = 1,048,576 Bytes and 1 Byte = 8 bits, the total capacity is 1,048,576 × 8 = 8,388,608 bits.',
          'Exponentials Formula: Maximum Capacity = 1 MB = 2^20 Bytes = 2^23 bits. Understanding these conversions is key for exams!'
        ]
      },
      {
        id: 'm5-s2',
        title: '3. Need for Memory Segmentation',
        moduleTitle: 'Module 5: Bus Interface Unit (BIU)',
        moduleId: 'm5',
        points: [
          'Addressing the 20-bit Bus: The 8086 has a 20-bit address bus (1 MB physical space) but only 16-bit registers (capable of addressing only 64 KB). Segmentation bridges this gap.',
          'Program Relocated on-the-fly: Code and variables can be loaded anywhere in RAM. The compiler uses offsets; the program runs seamlessly just by loading the active segment base.',
          'Modularity and Code Separation: Neatly isolates program executable instructions (CS) from static variables (DS) and transient context (SS).',
          'Memory Security & Protection: Helps prevent buggy data or stack writes from running over and corrupting the executing binary code.'
        ]
      },
      {
        id: 'm5-s3',
        title: '4. Types of Memory Segmentation',
        moduleTitle: 'Module 5: Bus Interface Unit (BIU)',
        moduleId: 'm5',
        points: [
          'Non-Overlapping Segments: Active segments are fully isolated in distinct 64 KB blocks, ensuring strict safety and logical structure.',
          'Overlapping Segments: Segments can overlap fully or partially because base addresses can begin at any 16-byte (Paragraph) boundary.',
          'Why Overlap?: Conserves physical memory for smaller tasks (avoids forced 64 KB gaps) and simplifies shared data/vector transfer across routines.',
          'Isolated I/O Address Space: Separate 64 KB Port Address space using dedicated instructions (IN, OUT) and low M/IO pin signaling, completely separated from Main Memory.'
        ]
      },
      {
        id: 'm5-s4',
        title: '5. Physical Address Calculation',
        moduleTitle: 'Module 5: Bus Interface Unit (BIU)',
        moduleId: 'm5',
        points: [
          'BIU Generation: The Bus Interface Unit automatically calculates the 20-bit physical address by combining a 16-bit Segment Base and a 16-bit Offset.',
          'Shift-and-Add Formula: Physical Address = (Segment Register * 10H) + Offset Register.',
          'Step-by-Step Example: If CS = 1000H and IP = 2000H, the BIU shifts CS to 10000H and adds IP: 10000H + 2000H = 12000H (Physical Address).',
          'Practice and Interactive Mapping: Use the simulator on the right to practice calculations and explore overlap styles visually.'
        ],
        interactiveType: 'memory-calc'
      },
      {
        id: 'm5-quiz',
        title: 'Module 5 Recap Quiz',
        moduleTitle: 'Module 5: Bus Interface Unit (BIU)',
        moduleId: 'm5',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In an 8086 microprocessor, the current Code Segment (CS) register contains 3456H and the Instruction Pointer (IP) register contains abcH. What is the physical memory address of the instruction to be fetched?',
            options: ['34560H', '3E120H', '3501CH', '3501BH'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2005',
            explanation: 'Using the 8086 address segmentation formula: Physical Address = (CS * 10H) + IP. Since CS = 3456H, CS * 10H = 34560H. Adding IP offset (abcH): 34560H + 0abcH = 3501CH. Therefore, the physical address is 3501CH.'
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
            explanation: 'Since segment offsets are stored in 16-bit registers (2^16 = 65,536 bytes), the maximum addressable boundary of any segment is exactly 64 KB.'
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
    id: 'm6',
    title: 'Module 6: Execution Unit (EU)',
    slides: [
      {
        id: 'm6-s1',
        title: 'Execution Unit (EU) Internal Components',
        moduleTitle: 'Module 6: Execution Unit (EU)',
        moduleId: 'm6',
        points: [
          'The EU executes instruction bytes popped from the BIU instruction queue.',
          'Main Components: Arithmetic Logic Unit (ALU), Control Circuitry, Instruction Decoder, and register array.',
          'Instruction Decoder: Translates opcode bytes into electrical control sequences.',
          'ALU: Performs 16-bit and 8-bit addition, subtraction, AND, OR, XOR, shifts, and compares.'
        ],
        interactiveType: 'architecture'
      },
      {
        id: 'm6-quiz',
        title: 'Module 6 Recap Quiz',
        moduleTitle: 'Module 6: Execution Unit (EU)',
        moduleId: 'm6',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which functional unit on the 8086 handles instruction decoding?',
            options: ['Bus Interface Unit (BIU)', 'Execution Unit (EU)', 'Interrupt Vector Table', '8288 Bus Controller'],
            correctAnswer: 1,
            explanation: 'The Execution Unit (EU) contains the instruction decoder, which translates opcodes fetched by the BIU into real CPU execution cycles.'
          },
          {
            question: 'What are the primary general-purpose 16-bit registers located in the Execution Unit?',
            options: ['CS, DS, SS, ES', 'SP, BP, SI, DI', 'AX, BX, CX, DX', 'IP and Flag Register'],
            correctAnswer: 2,
            explanation: 'AX, BX, CX, and DX are the four 16-bit general-purpose data registers located inside the Execution Unit (EU).'
          },
          {
            question: 'Which registers in the EU are classified as Index Registers?',
            options: ['SP and BP', 'SI and DI', 'AX and BX', 'CS and DS'],
            correctAnswer: 1,
            explanation: 'SI (Source Index) and DI (Destination Index) are index registers, primarily used in index-addressing modes and string copy instructions.'
          },
          {
            question: 'Where does the EU get the instructions it executes?',
            options: ['Directly from the external system RAM', 'From the 8284 clock generator chip', 'From the BIU\'s instruction prefetch queue', 'From the interrupt vector table'],
            correctAnswer: 2,
            explanation: 'The EU fetches instruction bytes from the BIU\'s 6-byte prefetch queue. If the queue is empty, the EU waits for the BIU to fetch more bytes.'
          },
          {
            question: 'Which register is automatically used during signed/unsigned 16-bit multiply instructions (MUL) to store the product result?',
            options: ['AX and DX', 'BX and CX', 'SI and DI', 'SP and BP'],
            correctAnswer: 0,
            explanation: 'A 16-bit multiplication in 8086 multiplies AX by another operand, storing the 32-bit product across the combined DX (high 16-bits) and AX (low 16-bits) registers.'
          },
          {
            question: 'Which register in the EU is typically used to point to data on the Stack Segment, other than the Stack Pointer?',
            options: ['Instruction Pointer (IP)', 'Base Register (BX)', 'Base Pointer (BP)', 'Extra Segment (ES)'],
            correctAnswer: 2,
            explanation: 'The Base Pointer (BP) is designed to reference data structures and parameters stored on the stack frame relative to the stack segment (SS:BP).'
          }
        ]
      }
    ]
  },
  {
    id: 'm7',
    title: 'Module 7: Interrupts',
    slides: [
      {
        id: 'm7-s1',
        title: 'Introduction to 8086 Interrupts',
        moduleTitle: 'Module 7: Interrupts',
        moduleId: 'm7',
        points: [
          'An interrupt is a hardware or software signal that halts current CPU program execution to perform a specialized service (ISR).',
          'Interrupt Service Routine (ISR): A custom program written to handle the specific interrupt event.',
          'Hardware Interrupts: NMI (Non-Maskable, Pin 17), INTR (Maskable, Pin 18).',
          'Software Interrupts: Triggered by executing INT instructions (e.g., INT 21H, INT 3).'
        ]
      },
      {
        id: 'm7-s2',
        title: 'Interrupt Vector Table (IVT) & Response',
        moduleTitle: 'Module 7: Interrupts',
        moduleId: 'm7',
        points: [
          'The first 1 KB of physical RAM (00000H - 003FFH) stores the 256 vector pointers.',
          'When an interrupt occurs: Flags are saved, IF & TF are cleared, Return CS and IP are saved to stack, and CS:IP loads new values from IVT.',
          'Formula: Vector RAM address = Interrupt Type * 4.'
        ],
        interactiveType: 'interrupts'
      },
      {
        id: 'm7-quiz',
        title: 'Module 7 Recap Quiz',
        moduleTitle: 'Module 7: Interrupts',
        moduleId: 'm7',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Where is the Interrupt Vector Table (IVT) located in the 8086 memory map?',
            options: ['At the very end of memory (FFFF0H - FFFFFH)', 'In the middle segment (50000H - 503FFH)', 'At the very beginning (00000H - 003FFH)', 'Inside the CPU cache'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2006',
            explanation: 'The IVT is hard-coded to reside in the lowest 1 KB of RAM, from physical addresses 00000H to 003FFH.'
          },
          {
            question: 'If the CPU receives a software INT 3, what IVT physical address does it read to fetch the ISR vector?',
            options: ['00003H', '0000CH (12)', '00008H', '00012H'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2005',
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
    id: 'm8',
    title: 'Module 8: System Timing',
    slides: [
      {
        id: 'm8-s1',
        title: 'Understanding 8086 System Timing',
        moduleTitle: 'Module 8: System Timing',
        moduleId: 'm8',
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
        id: 'm8-s2',
        title: 'Interactive Waveform Timing Explorer',
        moduleTitle: 'Module 8: System Timing',
        moduleId: 'm8',
        points: [
          'Observe ALE going high strictly during T1 to capture the address multiplexed on the bus.',
          'RD / WR go active low during T2, staying low throughout T3 to allow signal settling.',
          'DEN controls external buffer connection to avoid bus collision noise.'
        ],
        interactiveType: 'timing'
      },
      {
        id: 'm8-quiz',
        title: 'Module 8 Recap Quiz',
        moduleTitle: 'Module 8: System Timing',
        moduleId: 'm8',
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
            isGateQuestion: true,
            gateYear: 'GATE 2008',
            explanation: 'If the READY line is low at the start of T3, the MPU will insert one or more Wait states (Tw) between T3 and T4 to allow memory to settle.'
          }
        ]
      }
    ]
  },
  {
    id: 'm9',
    title: 'Module 9: Operating Modes',
    slides: [
      {
        id: 'm9-s1',
        title: '8086 Operating Modes Overview',
        moduleTitle: 'Module 9: Operating Modes',
        moduleId: 'm9',
        points: [
          'To maximize flexibility, the 8086 operates in two distinct modes depending on physical system wiring.',
          'Minimum Mode: Standard simple configuration. Pin MN/MX = +5V. CPU operates alone on the bus, generating signals directly.',
          'Maximum Mode: Advanced multi-processor configuration. Pin MN/MX = 0V (GND). Status lines are sent to external 8288 Bus Controller.'
        ],
        interactiveType: 'min-mode-hardware'
      },
      {
        id: 'm9-s2',
        title: 'Interactive Mode Wiring Comparator',
        moduleTitle: 'Module 9: Operating Modes',
        moduleId: 'm9',
        points: [
          'Observe pins 24 to 31. They completely change functions depending on system wiring!',
          'Minimum mode pins: ALE, DEN, WR, M/IO, HOLD, HLDA, INTA, DT/R.',
          'Maximum mode pins: S0, S1, S2, LOCK, QS0, QS1, RQ/GT0, RQ/GT1.',
          'Max mode supports numeric co-processors like 8087 (Math coprocessor).'
        ],
        interactiveType: 'modes'
      },
      {
        id: 'm9-quiz',
        title: 'Module 9 Recap Quiz',
        moduleTitle: 'Module 9: Operating Modes',
        moduleId: 'm9',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which chip is required in 8086 Maximum Mode to decode CPU status lines and generate bus controls?',
            options: ['Intel 8284 Clock Generator', 'Intel 8282 Address Latch', 'Intel 8288 Bus Controller', 'Intel 8255 PPI'],
            correctAnswer: 2,
            explanation: 'In Maximum Mode, the 8086 status pins S0, S1, S2 are wired to an external Intel 8288 Bus Controller, which decodes the state and outputs clean bus control signals.'
          },
          {
            question: 'What is the voltage level on the MN/MX pin for Maximum Mode?',
            options: ['+5V (High)', '0V (Ground/Low)', '+12V (High)', 'Floating (Hi-Z)'],
            correctAnswer: 1,
            explanation: 'Connecting the MN/MX (Pin 33) directly to Ground (0V) tells the 8086 to configure itself for Maximum Mode operation.'
          },
          {
            question: 'Which of the following signals is available ONLY in Minimum Mode?',
            options: ['ALE (Address Latch Enable)', 'S0, S1, S2', 'LOCK', 'QS0, QS1'],
            correctAnswer: 0,
            explanation: 'ALE is output directly by the 8086 in Minimum Mode (pin 25). In Maximum Mode, pin 25 transitions to QS0, and ALE is instead generated by the external 8288 Bus Controller.'
          },
          {
            question: 'What do the Queue Status pins (QS0 and QS1) represent in Maximum Mode?',
            options: ['The speed of instruction fetching', 'The status of the BIU\'s instruction queue (Empty, Fetch first byte, Subsequent byte, or No operation)', 'The number of active memory segments', 'The priority of hardware interrupts'],
            correctAnswer: 1,
            explanation: 'QS0 and QS1 allow external coprocessors (like the 8087) to monitor the internal 8086 instruction queue and track when instructions are executed.'
          },
          {
            question: 'What is the purpose of the LOCK signal in Maximum Mode?',
            options: ['To freeze the processor clock', 'To prevent other bus master controllers from gaining bus control during critical instructions', 'To lock the keyboard input', 'To secure memory segmentation boundaries'],
            correctAnswer: 1,
            explanation: 'The LOCK prefix instruction activates the active-low LOCK signal, preventing other processors or DMA controllers from taking over the system bus.'
          },
          {
            question: 'Which status signals on the 8086 in Maximum Mode represent an active Instruction Fetch bus cycle?',
            options: ['S2, S1, S0 = 100', 'S2, S1, S0 = 011', 'S2, S1, S0 = 111 (Passive)', 'S2, S1, S0 = 101'],
            correctAnswer: 1,
            explanation: 'In Maximum Mode, the status code S2, S1, S0 = 011 indicates a "Read Code Segment" or instruction fetch bus cycle, processed by the 8288.'
          }
        ]
      }
    ]
  },
  {
    id: 'm10',
    title: 'Module 10: GATE Microprocessor Solved Exam Practice',
    slides: [
      {
        id: 'm10-s1',
        title: 'GATE Microprocessor Exam Preparation',
        moduleTitle: 'Module 10: GATE Exam Practice',
        moduleId: 'm10',
        points: [
          'The Graduate Aptitude Test in Engineering (GATE) is a premium national-level competitive exam in India, testing in-depth conceptual and practical knowledge of microprocessors.',
          'Core 8086 syllabus areas tested in GATE include: Segmented-memory Physical Address calculations, Arithmetic overflows & status flags, Interrupt Vector Table (IVT) mapping, and memory system hardware interfacing.',
          'Memory Bank Interfacing (BHE and A0 pins) and bus cycles/timing parameters (T-states and Tw Wait states) are heavily featured in 1-mark and 2-mark GATE questions.',
          'This dedicated exam prep module aggregates authentic, past GATE microprocessor questions with comprehensive step-by-step mathematical solutions to boost academic performance.'
        ]
      },
      {
        id: 'm10-quiz',
        title: 'GATE Solved Practice Quiz',
        moduleTitle: 'Module 10: GATE Exam Practice',
        moduleId: 'm10',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'In an 8086 microprocessor, the current Code Segment (CS) register contains 3456H and the Instruction Pointer (IP) register contains 0ABCH. What is the computed physical memory address of the next instruction byte to be fetched?',
            options: ['34560H', '3E120H', '3501CH', '3501BH'],
            correctAnswer: 2,
            isGateQuestion: true,
            gateYear: 'GATE 2005',
            explanation: 'To find the physical address, shift the CS value by 4 bits (multiply by 10H) and add the IP offset: CS * 10H = 34560H. Physical Address = 34560H + 0ABCH = 3501CH. (Hex calculation: 0+C=C, 6+B=17=11H, write 1 carry 1, 5+A+1=16=10H, write 0 carry 1, 4+1=5, 3=3).'
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
    id: 'm11',
    title: 'Module 11: Program Development Steps & Tools',
    slides: [
      {
        id: 'm11-s1',
        title: '8086 Program Development Steps',
        moduleTitle: 'Module 11: Program Development Steps & Tools',
        moduleId: 'm11',
        points: [
          '1. Specification & Design: Define the problem statement, write down inputs/outputs, and outline the core algorithm and flowchart.',
          '2. Assembly Coding: Translate the flowchart blocks into 8086 assembly instructions using a plain text editor (resulting in a file like program.asm).',
          '3. Assembling: Pass the .ASM source code through an assembler (MASM or TASM). It reads instructions, checks syntax, and produces an Object file (program.obj) along with a Listing file (program.lst) showing addresses and machine codes.',
          '4. Linking: Run a linker (LINK or TLINK) to merge multiple object files and resolve library dependencies, generating a final relocatable executable (program.exe).',
          '5. Execution & Debugging: Load the program into physical RAM or run it inside an emulator (DEBUG, emu8086) to monitor registers, flags, and memory to trace and fix any logical bugs.'
        ]
      },
      {
        id: 'm11-s2',
        title: 'Interactive 8086 Development Steps Lab',
        moduleTitle: 'Module 11: Program Development Steps & Tools',
        moduleId: 'm11',
        points: [
          'Visualise the complete compilation, linking, and execution pipeline of an 8086 assembly program.',
          'Step through the pipeline: Text Editor -> Assembler (MASM) -> Linker (LINK) -> Debugger/Emulator.',
          'Learn the intermediate file formats: see how .ASM generates .OBJ & .LST, which then link into .EXE.',
          'Use the Interactive Pipeline Simulator on the right to understand how each software tool prepares code for the CPU.'
        ],
        interactiveType: 'dev-pipeline'
      },
      {
        id: 'm11-s3',
        title: 'One-Pass vs Two-Pass Assemblers',
        moduleTitle: 'Module 11: Program Development Steps & Tools',
        moduleId: 'm11',
        points: [
          'Two-Pass Assembler: The standard design for assemblers like MASM or TASM. It scans the source code exactly twice to resolve forward references.',
          'Pass 1 (Symbol Table construction): The assembler scans the source file to build a "Symbol Table". It identifies all user-defined labels (like START, LOOP, NUM1) and assigns them relative offset addresses based on instruction sizes.',
          'Pass 2 (Machine Code Translation): The assembler re-scans the file from the top. Using the Symbol Table, it substitutes mnemonics with binary opcodes, translates labels into numeric offsets, and creates the Object file (.OBJ) and Listing file (.LST).',
          'One-Pass Assembler: Scans code once and translates directly. If it encounters a "forward reference" (a jump to a label defined later in the file), it must leave a blank placeholder and patch it later, making it less elegant for complex structures.'
        ],
        interactiveType: 'assembler-passes'
      },
      {
        id: 'm11-s3b',
        title: 'Assembler Outputs: .OBJ vs .LST Files',
        moduleTitle: 'Module 11: Program Development Steps & Tools',
        moduleId: 'm11',
        interactiveType: 'assembler-outputs',
        points: [
          'Object (.OBJ) File - Machine-Readable Output: The main binary file produced by the assembler containing translated machine instructions. It is NOT directly executable yet.',
          'What .OBJ Contains: (1) Translated binary machine code and constants. (2) Relocation Information (for segment linking). (3) Symbol Names (lists of external and public variables/labels to be resolved by the Linker). (4) Segment structures and sizing records.',
          'Listing (.LST) File - Human-Readable Log: An optional, highly detailed plain-text document created during assembly. It is extremely useful for debugging logical errors and verifying offset calculations.',
          'What .LST Contains: (1) Full Source Code printed side-by-side with computed offset addresses and translated Hex codes. (2) Symbol Table listing every variable, segment, label, and macro with its offset. (3) Warnings and syntax error messages with exact line numbers.'
        ]
      },
      {
        id: 'm11-s4',
        title: 'The Linker and Loader Roles',
        moduleTitle: 'Module 11: Program Development Steps & Tools',
        moduleId: 'm11',
        points: [
          'The Linker (LINK.EXE / TLINK.EXE): Merges separate Object (.OBJ) files into a single, relocatable Executable (.EXE). It resolves cross-module references and links library files (.LIB) containing pre-written subroutines.',
          'Relocation Dictionary: The Linker builds an EXE header containing a "Relocation Table". Because the starting address in RAM is unknown at link-time, addresses are kept relocatable.',
          'The Loader: A component of the Operating System (or DOS) that active-loads programs from disk into physical memory before run time.',
          'Loading & Relocation: The Loader finds free space in RAM, copies the program, and uses the Relocation Table to patch all segment-dependent addresses (CS, DS, SS) to map to their actual, physical memory positions.'
        ]
      },
      {
        id: 'm11-s5',
        title: 'DOS DEBUG Utility & Commands',
        moduleTitle: 'Module 11: Program Development Steps & Tools',
        moduleId: 'm11',
        points: [
          'DEBUG.EXE: The classic 8086 interactive software test utility used to execute, trace, and troubleshoot compiled executable and COM files directly on the processor.',
          'Core Inspection Commands: Use R (Registers) to dump or edit current general and segment registers, and D (Dump) / E (Enter) to view or write raw hex values in memory segments.',
          'Execution Commands: Use T (Trace) to single-step execution instruction-by-instruction (inspecting register updates after every step), and G (Go) to run code to a specific breakpoint or till completion.',
          'Utility Commands: Use A (Assemble) to write inline assembly instructions directly into memory, and U (Unassemble) to disassemble hex machine code back to readable assembly mnemonics.'
        ]
      },
      {
        id: 'm11-quiz',
        title: 'Module 11 Recap Quiz',
        moduleTitle: 'Module 11: Program Development Steps & Tools',
        moduleId: 'm11',
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
    id: 'm12',
    title: 'Module 12: 8086 Addressing Modes',
    slides: [
      {
        id: 'm12-s1',
        title: 'Understanding 8086 Addressing Modes',
        moduleTitle: 'Module 12: 8086 Addressing Modes',
        moduleId: 'm12',
        points: [
          'Addressing Mode: The method by which an instruction specifies where its operand(s) are located (registers, memory, or immediate constants).',
          'Immediate Addressing: The operand is a constant value embedded directly inside the instruction byte stream (e.g., MOV AX, 1234H). Highly efficient.',
          'Register Addressing: Operands reside entirely in 16-bit or 8-bit general registers (e.g., MOV AX, BX). No memory bus access is required.',
          'Memory Addressing Modes: Accesses physical RAM by computing a 16-bit offset called Effective Address (EA). Examples include Direct, Indirect, Based, Indexed, Based-Indexed, and Relative Based-Indexed.',
          'Dynamic Memory Access: Combining base (BX, BP) and index (SI, DI) registers with constant displacements is critical for traversing arrays, matrices, and parameters on the stack.'
        ]
      },
      {
        id: 'm12-s2',
        title: 'Effective Address Calculation Lab',
        moduleTitle: 'Module 12: 8086 Addressing Modes',
        moduleId: 'm12',
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
        id: 'm12-quiz',
        title: 'Module 12 Recap Quiz',
        moduleTitle: 'Module 12: 8086 Addressing Modes',
        moduleId: 'm12',
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
    id: 'm13',
    title: 'Module 13: 8086 Instruction Set',
    slides: [
      {
        id: 'm13-s1',
        title: 'Classification of 8086 Instructions',
        moduleTitle: 'Module 13: 8086 Instruction Set',
        moduleId: 'm13',
        points: [
          'Data Transfer: Copy data between registers, memory, and ports (e.g., MOV, PUSH, POP, XCHG, IN, OUT, LEA). Crucially, these do NOT affect the flag register.',
          'Arithmetic: ADD, SUB, INC, DEC, CMP, MUL, DIV, and decimal BCD adjustments (AAA, DAA). These directly modify ALU status flags.',
          'Bit Manipulation: Perform logical operations (AND, OR, XOR, NOT, TEST) or bit shifts and rotations (SHL, SHR, SAR, ROL, ROR, RCL, RCR) to isolate or change bits.',
          'String Operations: Process sequential bytes/words extremely fast (MOVSB/MOVSW, CMPS, SCAS, LODS, STOS) using direction flag DF and repeat prefix REP.',
          'Program Flow & Control: Control branches and subroutines via jumps (unconditional JMP, conditional JZ/JNZ/JC), loops (LOOP), call/ret (CALL, RET), and interrupts.'
        ]
      },
      {
        id: 'm13-s2',
        title: 'Instruction Execution & ALU Flag Lab',
        moduleTitle: 'Module 13: 8086 Instruction Set',
        moduleId: 'm13',
        points: [
          'ALU Status Flags: Automatically updated by the Execution Unit (EU) after executing arithmetic, logical, and shift instructions.',
          'Zero Flag (ZF): Becomes 1 if the outcome of the instruction is exactly zero; otherwise 0. Critical for comparison and branching.',
          'Carry Flag (CF): Becomes 1 if there is an unsigned overflow (a carry out of the most significant bit) after an addition or borrow after a subtraction.',
          'Sign Flag (SF): Simply copies the MSB (sign bit) of the result to indicate positive (0) or negative (1).',
          'Use the Interactive Instruction Decoder & ALU simulator on the right to run opcodes and inspect flags and registers in real-time.'
        ],
        interactiveType: 'instruction-decoder'
      },
      {
        id: 'm13-quiz',
        title: 'Module 13 Recap Quiz',
        moduleTitle: 'Module 13: 8086 Instruction Set',
        moduleId: 'm13',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Consider the execution of the instructions "MOV AL, 7FH" followed by "ADD AL, 01H" in an 8086 microprocessor. What are the resulting values of the Carry Flag (CF) and the Overflow Flag (OF)?',
            options: ['CF = 0, OF = 0', 'CF = 0, OF = 1', 'CF = 1, OF = 0', 'CF = 1, OF = 1'],
            correctAnswer: 1,
            isGateQuestion: true,
            gateYear: 'GATE 2004',
            explanation: '7FH (01111111B) represents +127 signed. Adding 01H yields 80H (10000000B), which is -128 signed. There is no unsigned carry out of the MSB, so CF = 0. However, adding two positive numbers produced a negative result, which represents a signed arithmetic overflow. Thus, OF = 1.'
          },
          {
            question: 'Which of the following instructions does NOT modify any flags in the Flag Register?',
            options: ['ADD AX, BX', 'CMP CX, DX', 'MOV SI, 1000H', 'AND AL, 0FH'],
            correctAnswer: 2,
            explanation: 'Data transfer instructions like MOV, PUSH, POP, LEA, and XCHG do not modify any ALU flags in the status register, preserving the current flags. Arithmetic (ADD, CMP) and logical (AND) instructions always alter flags.'
          },
          {
            question: 'What is the difference between the "SUB AX, BX" and "CMP AX, BX" instructions?',
            options: ['SUB affects the register values, while CMP only updates flags without altering AX', 'SUB only updates flags, while CMP alters register values', 'SUB handles signed numbers, while CMP is strictly for unsigned numbers', 'There is no difference; they are synonymous'],
            correctAnswer: 0,
            explanation: 'Both instructions perform subtraction (AX - BX) and update the status flags (ZF, CF, SF, OF, PF) identically. However, "SUB AX, BX" overwrites AX with the subtraction result, whereas "CMP AX, BX" discards the arithmetic outcome, keeping AX unchanged.'
          },
          {
            question: 'Which instruction is used to multiply the AX register by a 16-bit operand and store the resulting 32-bit product across the combined DX and AX registers?',
            options: ['MUL', 'IMUL', 'DIV', 'Both MUL (for unsigned) and IMUL (for signed)'],
            correctAnswer: 3,
            explanation: 'MUL (unsigned multiplication) and IMUL (signed multiplication) take a single 16-bit register or memory operand, multiply it by the AX accumulator, and store the 32-bit product across DX (upper 16 bits) and AX (lower 16 bits).'
          }
        ]
      }
    ]
  },
  {
    id: 'm14',
    title: 'Module 14: Assembler Directives',
    slides: [
      {
        id: 'm14-s1',
        title: 'What are Assembler Directives?',
        moduleTitle: 'Module 14: Assembler Directives',
        moduleId: 'm14',
        points: [
          'Assembler Directives: Special commands embedded in the assembly source code that guide the assembler (MASM/TASM) during translation, but do NOT produce CPU machine code instructions.',
          'Data Definition Directives: Reserves memory and assigns initial values. DB (Define Byte - 1 byte), DW (Define Word - 2 bytes), DD (Define Doubleword - 4 bytes).',
          'Segment Mapping: SEGMENT and ENDS frame the start and end of logical segments (Code, Data, Stack) inside the source code module.',
          'Logical Connection (ASSUME): Informs the compiler which physical segment register (CS, DS, SS, ES) will point to which logical segment at runtime.',
          'Origin Control & Constants: ORG (Origin) defines the starting memory offset for code/data (e.g., ORG 100H for DOS .COM files). EQU (Equate) defines constant symbols.'
        ]
      },
      {
        id: 'm14-s2',
        title: 'Assembler Directives & Memory Layout',
        moduleTitle: 'Module 14: Assembler Directives',
        moduleId: 'm14',
        points: [
          'Directives structure how variables are laid out inside the Data Segment (DS) starting from logical offset 0000H.',
          'In a standard assembly program, the assembler allocates consecutive byte offsets to variables defined with DB (1 byte), DW (2 bytes), and DD (4 bytes).',
          'The DUP (Duplicate) operator allows reserving block arrays easily (e.g., ARR DB 10 DUP(0) allocates 10 bytes initialized to zero).',
          'Use the Interactive Directive Sandbox on the right to inspect a standard program layout and highlight directive boundaries.'
        ],
        interactiveType: 'directive-sandbox'
      },
      {
        id: 'm14-quiz',
        title: 'Module 14 Recap Quiz',
        moduleTitle: 'Module 14: Assembler Directives',
        moduleId: 'm14',
        interactiveType: 'quiz',
        quizQuestions: [
          {
            question: 'Which assembler directive is used to allocate 2 bytes of storage for a data variable, commonly representing a 16-bit word?',
            options: ['DB (Define Byte)', 'DW (Define Word)', 'DD (Define Doubleword)', 'DQ (Define Quadword)'],
            correctAnswer: 1,
            explanation: 'The DW (Define Word) directive directs the assembler to allocate 2 bytes (16 bits) of consecutive memory space for the associated variable.'
          },
          {
            question: 'What is the purpose of the ASSUME directive in 8086 MASM programs?',
            options: ['To initialize physical segment registers with segment starting addresses', 'To tell the assembler which logical segment belongs to which physical segment register (CS, DS, SS, ES) during code compilation', 'To perform addition inside the ALU', 'To define constants'],
            correctAnswer: 1,
            explanation: 'ASSUME is a compiler-only directive. It informs the assembler about the association between segment registers and logical segments, so the compiler can generate appropriate segment override prefixes if necessary. It does NOT load the segment registers with addresses at runtime (that must be done using MOV instructions).'
          },
          {
            question: 'How many bytes of physical memory are allocated by the directive "ARR DB 5 DUP(1, 2)"?',
            options: ['5 bytes', '10 bytes', '15 bytes', '2 bytes'],
            correctAnswer: 1,
            explanation: 'The DUP (Duplicate) operator duplicates the nested pattern. The pattern contains two bytes: (1, 2), which is 2 bytes wide. Duplicating this pattern 5 times allocates exactly 5 * 2 = 10 bytes of memory.'
          },
          {
            question: 'Which of the following directives defines a constant value that does NOT consume any physical space in the resulting executable program?',
            options: ['ORG', 'EQU', 'DB', 'ENDS'],
            correctAnswer: 1,
            explanation: 'The EQU (Equate) directive defines a compile-time constant alias. The assembler replaces all occurrences of the equated symbol with its value during compilation, consuming zero physical space in the compiled binary.'
          }
        ]
      }
    ]
  },
  {
    id: 'm15',
    title: 'Module 15: Writing Simple Programs',
    slides: [
      {
        id: 'm15-s1',
        title: 'Writing Basic Assembly Programs',
        moduleTitle: 'Module 15: Writing Simple Programs',
        moduleId: 'm15',
        points: [
          '8086 programming is register-intensive and revolves around load, process, and store cycles.',
          'Program 1: 16-bit Addition: Uses MOV to load variables from the data segment into AX and BX, executes ADD AX, BX, and stores the result back to memory.',
          'Program 2: Find Maximum: Loops through an array, uses CMP to compare values, and JGE (Jump if Greater or Equal) to keep the highest value in AX.',
          'Program 3: Array Summation: Sets a counter CX = array size, points SI to array start, and accumulates values using ADD AX, [SI] and INC SI inside a LOOP structure.',
          'Program 4: String Copy: Registers SI (Source) and DI (Destination) are loaded. Clear direction flag (CLD) makes SI/DI auto-increment, and REP MOVSB performs fast copies.'
        ]
      },
      {
        id: 'm15-s2',
        title: '8086 Assembly Emulator & Debugger',
        moduleTitle: 'Module 15: Writing Simple Programs',
        moduleId: 'm15',
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
        id: 'm15-quiz',
        title: 'Module 15 Recap Quiz',
        moduleTitle: 'Module 15: Writing Simple Programs',
        moduleId: 'm15',
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
            question: 'What happens when a PUSH AX instruction is executed in an 8086 program?',
            options: ['SP is decremented by 2, and the 16-bit value of AX is written to the Stack Segment memory at SS:SP', 'SP is incremented by 2, and the value of AX is pop-retrieved', 'AX is copied to the DS segment', 'The program halts'],
            correctAnswer: 0,
            explanation: 'The stack grows downwards in physical memory. When PUSH is called, SP is decremented by 2 to allocate a 16-bit word on the stack, and then the register contents are written to the stack memory address CS:SP (or SS:SP).'
          }
        ]
      }
    ]
  }
];

