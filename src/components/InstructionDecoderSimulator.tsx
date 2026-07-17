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
  Info,
  List,
  Terminal,
  ArrowLeftRight,
  Layers,
  Database,
  ShieldAlert
} from 'lucide-react';

interface SimulatorInstruction {
  opcode: string;
  category: 'Data Transfer' | 'Arithmetic' | 'BCD & ASCII Adjust' | 'Logical & Bitwise' | 'Control, Flag & IO';
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
  // ================= CATEGORY: DATA TRANSFER =================
  {
    opcode: 'MOV CX, 037AH',
    category: 'Data Transfer',
    desc: 'Copies the 16-bit immediate value 037AH directly into register CX.',
    setupDesc: 'Initializes CX = 0000H to show immediate data loading. Does not affect any flags.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, CX: 0x037A, IP: regs.IP + 3 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'The immediate value 037AH is moved directly into CX. Note that data transfer instructions (MOV, XCHG, LEA, etc.) NEVER modify any status flags on the 8086 CPU. The Instruction Pointer (IP) is incremented by 3 bytes to account for the size of the compiled instruction in memory.'
      };
    }
  },
  {
    opcode: 'XCHG AX, BX',
    category: 'Data Transfer',
    desc: 'Exchanges the contents of the AX and BX registers.',
    setupDesc: 'Initializes AX = 1234H and BX = ABCDH to demonstrate register-to-register exchange.',
    initialRegs: { AX: 0x1234, BX: 0xABCD, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, AX: regs.BX, BX: regs.AX, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: `AX (1234H) and BX (ABCDH) are swapped. At the end of the exchange, AX contains ABCDH and BX contains 1234H. Standard exchange operations consume zero physical flags but are extremely useful for sorting and buffer operations.`
      };
    }
  },
  {
    opcode: 'XLAT',
    category: 'Data Transfer',
    desc: 'Translates a byte in AL using a lookup table in memory starting at DS:BX.',
    setupDesc: 'Initializes AL = 03H (offset) and BX = 0300H (table start offset). We simulate translating to binary Gray Code.',
    initialRegs: { AX: 0x0003, BX: 0x0300, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // Look up table at 0300H contains gray codes: 00=00, 01=01, 02=03, 03=02
      // So index 3 should yield 02
      const newAL = 0x02;
      const newAX = (regs.AX & 0xFF00) | newAL;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'XLAT adds the index in AL (03H) to the base offset in BX (0300H) to fetch DS:[0303H]. The lookup table at this memory address contains the Gray Code corresponding to 3, which is 02H. The value is loaded back into AL. Flags are completely unaffected.'
      };
    }
  },
  {
    opcode: 'LEA BX, PRICES',
    category: 'Data Transfer',
    desc: 'Loads the Effective Address (offset) of a memory variable directly into the target 16-bit register.',
    setupDesc: 'Initializes BX = 0000H. The variable "PRICES" is located at offset offset 20A0H in the Data Segment.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, BX: 0x20A0, IP: regs.IP + 4 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'LEA (Load Effective Address) computes the logical offset of the source variable "PRICES" (which is 20A0H) and moves that offset directly into BX. Notice that it does NOT fetch the contents stored inside PRICES; it only copies the coordinate address itself. No flags are affected.'
      };
    }
  },
  {
    opcode: 'LDS SI, SPTR',
    category: 'Data Transfer',
    desc: 'Loads a doubleword (32-bit far pointer) from memory, copying the first word into SI and the second word into DS.',
    setupDesc: 'Initializes SI = 0000H, DS = 2000H. Memory contains an offset (4326H) and segment (5000H).',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x0000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, SI: 0x4326, DS: 0x5000, IP: regs.IP + 4 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'LDS (Load Data Segment Register) reads 4 bytes starting at SPTR. The lower 2 bytes (containing target offset 4326H) are loaded into SI, and the higher 2 bytes (containing segment 5000H) are loaded into DS. This allows DS:SI to point directly to a new block of data.'
      };
    }
  },
  {
    opcode: 'PUSH AX',
    category: 'Data Transfer',
    desc: 'Decrements the Stack Pointer (SP) by 2 and copies AX onto the stack.',
    setupDesc: 'Initializes AX = 1122H, SP = FFFEH to demonstrate pushing onto the CPU stack.',
    initialRegs: { AX: 0x1122, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, SP: 0xFFFC, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'PUSH AX decrements the Stack Pointer (SP) by 2 (changing SP from FFFEH to FFFCH) and copies the 16-bit content of AX (1122H) into the stack memory location pointed to by SS:FFFCH. Stack operations do not affect CPU status flags.'
      };
    }
  },
  {
    opcode: 'POP DX',
    category: 'Data Transfer',
    desc: 'Copies the word at the top of the stack into DX and then increments SP by 2.',
    setupDesc: 'Initializes SP = FFFCH (stack holds 1122H from a previous PUSH). DX is currently 0000H.',
    initialRegs: { AX: 0x1122, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFC, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, DX: 0x1122, SP: 0xFFFE, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'POP DX copies the 16-bit word (1122H) currently pointed to by SS:SP (FFFCH) directly into DX. It then automatically increments the Stack Pointer (SP) by 2 (returning SP to FFFEH), releasing that stack frame.'
      };
    }
  },

  // ================= CATEGORY: ARITHMETIC =================
  {
    opcode: 'ADD AL, 01H',
    category: 'Arithmetic',
    desc: 'Adds 1 to the 8-bit register AL, updating status flags.',
    setupDesc: 'Initializes AL = 7FH (+127 signed) to demonstrate a signed arithmetic overflow.',
    initialRegs: { AX: 0x007F, BX: 0x0001, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const result = (al + 1) & 0xFF;
      const newAX = (regs.AX & 0xFF00) | result;
      
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: al === 0xFF ? 1 : 0, // Unsigned overflow
        SF: (result & 0x80) ? 1 : 0, // MSB is 1
        OF: al === 0x7F ? 1 : 0, // +127 + 1 = -128 (Signed overflow!)
        AF: (al & 0x0F) === 0x0F ? 1 : 0, // Auxiliary Carry
        PF: 1 // Even parity (80H has 1 set bit, wait, 80H has odd parity. Parity is even if count of 1s is even. 80H contains one '1' bit, so PF is 0)
      };
      newFlags.PF = (result.toString(2).split('1').length - 1) % 2 === 0 ? 1 : 0;

      return {
        newRegs,
        newFlags,
        mathExplanation: 'AL contained 7FH (01111111B = +127 signed). Adding 01H results in 80H (10000000B = -128 signed). Because adding two positive numbers produced a negative result, a signed Arithmetic Overflow occurred: OF is set to 1. No unsigned carry was produced out of the 8th bit, so CF remains 0. The Sign Flag (SF) is set to 1 because the MSB of the result is 1.'
      };
    }
  },
  {
    opcode: 'ADC AX, BX',
    category: 'Arithmetic',
    desc: 'Adds AX, BX, and the Carry Flag (CF), saving the result in AX.',
    setupDesc: 'Initializes AX = 00FFH, BX = 0001H, and CF = 1 to show a double-carry propagate addition cycle.',
    initialRegs: { AX: 0x00FF, BX: 0x0001, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const sum = regs.AX + regs.BX + 1; // CF is 1
      const result = sum & 0xFFFF;
      const newRegs = { ...regs, AX: result, IP: regs.IP + 2 };
      
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: sum > 0xFFFF ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 1, // propagation across hex digit
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0; // standard 8086 parity tracks low-byte

      return {
        newRegs,
        newFlags,
        mathExplanation: `ADC adds AX + BX + Carry. AX (00FFH) + BX (0001H) + CF (1) = 0101H (257 in decimal). The carry propagates smoothly. Zero flag ZF = 0 because the result is non-zero, and CF becomes 0 because the sum fits inside a 16-bit word.`
      };
    }
  },
  {
    opcode: 'SUB AX, BX',
    category: 'Arithmetic',
    desc: 'Subtracts BX register value from AX, updating AX and setting status flags.',
    setupDesc: 'Initializes AX = 1000H, BX = 0200H.',
    initialRegs: { AX: 0x1000, BX: 0x0200, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.AX - regs.BX) & 0xFFFF;
      const newRegs = { ...regs, AX: result, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: regs.AX < regs.BX ? 1 : 0, // borrow
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 0,
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0;

      return {
        newRegs,
        newFlags,
        mathExplanation: `AX contained 1000H, BX contained 0200H. Subtracting: 1000H - 0200H = 0E00H (3584 in decimal). The result is non-zero, so ZF = 0. AX was greater than BX, so no borrow was required, meaning CF = 0. The MSB is 0, so SF = 0. This is a standard unsigned arithmetic subtraction.`
      };
    }
  },
  {
    opcode: 'SBB AX, BX',
    category: 'Arithmetic',
    desc: 'Subtracts BX and Carry (CF/Borrow) from AX, updating AX.',
    setupDesc: 'Initializes AX = 0010H, BX = 0005H, CF = 1.',
    initialRegs: { AX: 0x0010, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.AX - regs.BX - 1) & 0xFFFF;
      const newRegs = { ...regs, AX: result, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: regs.AX < (regs.BX + 1) ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 0,
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0;

      return {
        newRegs,
        newFlags,
        mathExplanation: 'SBB computes AX - BX - CF. AX (0010H) - BX (0005H) - CF (1) = 000AH (10 in decimal). No borrow was propagated beyond this point, so CF is updated to 0. ZF = 0 because the result is non-zero.'
      };
    }
  },
  {
    opcode: 'MUL BH',
    category: 'Arithmetic',
    desc: 'Performs unsigned multiplication: AX = AL * BH.',
    setupDesc: 'Initializes AL = 05H and BH = 10H (16 in decimal) to perform 8-bit unsigned multiplication.',
    initialRegs: { AX: 0x0005, BX: 0x1000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const bh = (regs.BX & 0xFF00) >> 8;
      const product = al * bh;
      const newRegs = { ...regs, AX: product, IP: regs.IP + 2 };
      // For 8-bit MUL, if upper half of product (AH) is 0, CF & OF are cleared; else set.
      const ah = (product & 0xFF00) >> 8;
      const cf_of = ah !== 0 ? 1 : 0;
      
      const newFlags = {
        ...flags,
        CF: cf_of,
        OF: cf_of,
        ZF: product === 0 ? 1 : 0
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: `MUL BH multiplies AL (05H = 5) * BH (10H = 16) resulting in 0050H (80 decimal) which is loaded into AX. Because the upper byte of the product (AH) is 00H, the Carry (CF) and Overflow (OF) flags are cleared to 0.`
      };
    }
  },
  {
    opcode: 'DIV BL',
    category: 'Arithmetic',
    desc: 'Performs unsigned division: AX divided by BL. Quotient saved in AL, Remainder in AH.',
    setupDesc: 'Initializes AX = 0019H (25 in decimal) and BL = 05H to perform 8-bit unsigned division.',
    initialRegs: { AX: 0x0019, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const ax = regs.AX;
      const bl = regs.BX & 0xFF;
      const quotient = Math.floor(ax / bl) & 0xFF;
      const remainder = (ax % bl) & 0xFF;
      const newAX = (remainder << 8) | quotient;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags }, // Division flags are undefined on 8086
        mathExplanation: `DIV BL divides AX (0019H = 25) by BL (05H = 5). Quotient = 5 (05H) goes into AL, and Remainder = 0 (00H) goes into AH, updating AX to 0005H. Status flags are technically undefined after execution.`
      };
    }
  },
  {
    opcode: 'INC CX',
    category: 'Arithmetic',
    desc: 'Increments the CX register by 1. Affects status flags except Carry (CF).',
    setupDesc: 'Initializes CX = FFFFH to demonstrate register wrap-around. Carry flag CF is unaffected.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0xFFFF, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.CX + 1) & 0xFFFF;
      const newRegs = { ...regs, CX: result, IP: regs.IP + 1 };
      const newFlags = {
        ...flags,
        ZF: result === 0 ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: regs.CX === 0x7FFF ? 1 : 0,
        AF: (regs.CX & 0x0F) === 0x0F ? 1 : 0
      };
      // CF remains unchanged for INC and DEC instructions
      return {
        newRegs,
        newFlags,
        mathExplanation: 'CX (FFFFH) is incremented by 1, wrapping around to 0000H. Because the result is zero, ZF is set to 1. Crucially, the Carry Flag (CF) is NOT affected by INC/DEC, so CF remains 0.'
      };
    }
  },
  {
    opcode: 'CMP AX, BX',
    category: 'Arithmetic',
    desc: 'Compares AX and BX by performing AX - BX, but does NOT save the subtraction result.',
    setupDesc: 'Initializes AX = 0500H and BX = 0500H to simulate an exact match comparison.',
    initialRegs: { AX: 0x0500, BX: 0x0500, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (regs.AX - regs.BX) & 0xFFFF;
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: regs.AX < regs.BX ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 0,
        PF: 1
      };
      return {
        newRegs: { ...regs, IP: regs.IP + 2 }, // unchanged registers!
        newFlags,
        mathExplanation: 'The CMP instruction performs a subtraction internally: AX (0500H) - BX (0500H) = 0000H. The subtraction results in exactly zero, which triggers the Zero Flag (ZF) to 1. No borrow was required (CF = 0) and the sign is positive (SF = 0). Crucially, the AX register value remains completely unmodified!'
      };
    }
  },

  // ================= CATEGORY: BCD & ASCII ADJUST =================
  {
    opcode: 'DAA',
    category: 'BCD & ASCII Adjust',
    desc: 'Decimal Adjust after Addition. Adjusts AL to be a valid packed BCD number.',
    setupDesc: 'Initializes AL = 8EH (from adding packed BCDs 59 and 35: 59H + 35H = 8EH). AF and CF are 0.',
    initialRegs: { AX: 0x008E, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // 8EH has lower nibble E > 9, so add 06H -> 8E + 6 = 94H
      const result = 0x94;
      const newAX = (regs.AX & 0xFF00) | result;
      const newFlags = {
        ...flags,
        CF: 0,
        ZF: 0,
        SF: 0,
        AF: 1
      };
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags,
        mathExplanation: 'DAA inspects AL (8EH). The lower nibble (EH) is greater than 9, so DAA adds 06H to AL: 8EH + 06H = 94H. The upper nibble (9) is valid (<= 9), so no further correction is needed. The final BCD result is 94H, representing the sum 94 in packed BCD. AF is set to 1.'
      };
    }
  },
  {
    opcode: 'DAS',
    category: 'BCD & ASCII Adjust',
    desc: 'Decimal Adjust after Subtraction. Adjusts AL to be a valid packed BCD number.',
    setupDesc: 'Initializes AL = D7H (subtracting packed BCDs: 49 BCD - 72 BCD yields D7H). CF is 0.',
    initialRegs: { AX: 0x00D7, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // D7H has upper nibble > 9, so subtract 60H -> D7H - 60H = 77H, set CF = 1
      const result = 0x77;
      const newAX = (regs.AX & 0xFF00) | result;
      const newFlags = {
        ...flags,
        CF: 1,
        ZF: 0,
        SF: 0,
        AF: 0
      };
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags,
        mathExplanation: 'DAS inspects AL (D7H). The upper nibble (DH) is greater than 9, so DAS subtracts 60H from AL: D7H - 60H = 77H, and sets the Carry Flag (CF = 1) to indicate a BCD borrow. The final packed BCD result is 77H with CF = 1 (borrow active).'
      };
    }
  },
  {
    opcode: 'AAM',
    category: 'BCD & ASCII Adjust',
    desc: 'ASCII Adjust after Multiplication. Converts a product in AL into two unpacked BCD digits in AH and AL.',
    setupDesc: 'Initializes AL = 2DH (45 decimal, which is 5 * 9). AAM will convert it to unpacked BCD.',
    initialRegs: { AX: 0x002D, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const ah = Math.floor(al / 10);
      const newAl = al % 10;
      const newAX = (ah << 8) | newAl;
      const newFlags = {
        ...flags,
        ZF: newAl === 0 ? 1 : 0,
        SF: (ah & 0x80) ? 1 : 0
      };
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags,
        mathExplanation: 'AAM divides AL (2DH = 45) by 10. The quotient (4) goes into AH (representing the tens digit), and the remainder (5) goes into AL (representing the ones digit). AX becomes 0405H, which is the exact unpacked BCD of 45.'
      };
    }
  },
  {
    opcode: 'AAD',
    category: 'BCD & ASCII Adjust',
    desc: 'ASCII Adjust before Division. Converts unpacked BCD in AH and AL to a single binary value in AL.',
    setupDesc: 'Initializes AH = 02H and AL = 05H (unpacked BCD representing 25).',
    initialRegs: { AX: 0x0205, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const ah = (regs.AX & 0xFF00) >> 8;
      const al = regs.AX & 0xFF;
      const binary = (ah * 10) + al;
      const newAX = binary & 0xFF; // AH cleared
      const newFlags = {
        ...flags,
        ZF: newAX === 0 ? 1 : 0,
        SF: (newAX & 0x80) ? 1 : 0
      };
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags,
        mathExplanation: 'AAD multiplies AH (02H = 2) by 10 and adds AL (05H = 5), clearing AH to 00H. The resulting binary value 25 (19H) is loaded into AL. This prepares the MPU for a division instruction.'
      };
    }
  },

  // ================= CATEGORY: LOGICAL & BITWISE =================
  {
    opcode: 'XOR AX, AX',
    category: 'Logical & Bitwise',
    desc: 'Performs bitwise XOR of AX with itself, clearing AX to 0.',
    setupDesc: 'Initializes AX = FFFFH. Logical instructions always clear Carry (CF) and Overflow (OF).',
    initialRegs: { AX: 0xFFFF, BX: 0x0020, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, AX: 0, IP: regs.IP + 2 };
      const newFlags = {
        ZF: 1, // Zero flag set to 1
        CF: 0, // Logic instructions clear CF
        SF: 0, 
        OF: 0,  // Logic instructions clear OF
        AF: 0,
        PF: 1
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'XORing any value with itself yields exactly zero (e.g., FFFFH XOR FFFFH = 0000H). This is a standard optimization to clear registers. By default design, logical instructions automatically clear CF and OF to 0 and update ZF, SF, and PF.'
      };
    }
  },
  {
    opcode: 'AND AL, 0FH',
    category: 'Logical & Bitwise',
    desc: 'Logical bitwise AND of AL with immediate constant 0FH to isolate the lower nibble.',
    setupDesc: 'Initializes AL = A5H. Logical operations clear CF and OF.',
    initialRegs: { AX: 0x00A5, BX: 0x0010, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 1, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const result = al & 0x0F;
      const newAX = (regs.AX & 0xFF00) | result;
      
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: 0, 
        SF: (result & 0x80) ? 1 : 0,
        OF: 0,
        AF: 0,
        PF: (result.toString(2).split('1').length - 1) % 2 === 0 ? 1 : 0
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'AL is ANDed with 0FH: A5H (10100101B) AND 0FH (00001111B) = 05H (00000101B). This masks out (clears) the high nibble (A), keeping only the low nibble (5). The result (05H) is non-zero, so ZF = 0. Logical operations always force CF = 0 and OF = 0.'
      };
    }
  },
  {
    opcode: 'OR AH, CL',
    category: 'Logical & Bitwise',
    desc: 'Performs logical bitwise OR between registers AH and CL, saving the result in AH.',
    setupDesc: 'Initializes AH = 50H and CL = 0FH.',
    initialRegs: { AX: 0x5000, BX: 0x0000, CX: 0x000F, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const ah = (regs.AX & 0xFF00) >> 8;
      const cl = regs.CX & 0xFF;
      const result = ah | cl;
      const newAX = (regs.AX & 0x00FF) | (result << 8);
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags, ZF: result === 0 ? 1 : 0, CF: 0, OF: 0, SF: (result & 0x80) ? 1 : 0 },
        mathExplanation: 'ORs AH (50H = 01010000B) with CL (0FH = 00001111B), resulting in 5FH (01011111B) in AH. CF and OF are forced to 0. ZF = 0 because the result is non-zero.'
      };
    }
  },
  {
    opcode: 'NOT BX',
    category: 'Logical & Bitwise',
    desc: 'Performs bit-by-bit complement (NOT) of register BX.',
    setupDesc: 'Initializes BX = 0000H. Crucially, the NOT instruction does NOT modify any flags!',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const result = (~regs.BX) & 0xFFFF;
      const newRegs = { ...regs, BX: result, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'NOT BX complements all bits of BX from 0000H (all zeros) to FFFFH (all ones). In the 8086 architecture, the NOT instruction is unique among logical operations because it does NOT alter any status flags in the flag register.'
      };
    }
  },
  {
    opcode: 'NEG BL',
    category: 'Logical & Bitwise',
    desc: 'Performs 2\'s complement negation of register BL.',
    setupDesc: 'Initializes BL = 02H. NEG updates all condition code flags (CF is set to 1 if source is non-zero).',
    initialRegs: { AX: 0x0000, BX: 0x0002, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const bl = regs.BX & 0xFF;
      const result = (-bl) & 0xFF;
      const newBX = (regs.BX & 0xFF00) | result;
      const newRegs = { ...regs, BX: newBX, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags, ZF: result === 0 ? 1 : 0, CF: bl !== 0 ? 1 : 0, SF: (result & 0x80) ? 1 : 0, OF: bl === 0x80 ? 1 : 0 },
        mathExplanation: 'NEG BL negates BL (02H) by computing its 2\'s complement: -2 in decimal is FEH (11111110B). FEH is loaded back into BL. Because the input was non-zero, the Carry Flag (CF) is set to 1. SF = 1 because the MSB of FEH is 1.'
      };
    }
  },
  {
    opcode: 'SHL CX, 1',
    category: 'Logical & Bitwise',
    desc: 'Shifts CX left by 1 bit position. Equivalent to multiplying CX by 2.',
    setupDesc: 'Initializes CX = 4000H to show a left shift where the sign bit changes.',
    initialRegs: { AX: 0x0012, BX: 0x0010, CX: 0x4000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const beforeVal = regs.CX;
      const result = (regs.CX << 1) & 0xFFFF;
      const newRegs = { ...regs, CX: result, IP: regs.IP + 2 };
      
      const carryOut = (beforeVal & 0x8000) ? 1 : 0;
      const beforeSign = (beforeVal & 0x8000) ? 1 : 0;
      const afterSign = (result & 0x8000) ? 1 : 0;

      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: carryOut,
        SF: afterSign,
        OF: beforeSign !== afterSign ? 1 : 0,
        AF: 0,
        PF: 1
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: `SHL CX, 1 shifts the bits of CX (4000H = 0100000000000000B) left by one, yielding 8000H (1000000000000000B). The value doubled from 16384 to 32768 in decimal. Because the sign bit (MSB) flipped from 0 to 1, the Overflow Flag (OF) is set to 1. CF = 0 because the bit shifted out of the MSB was 0.`
      };
    }
  },

  // ================= CATEGORY: CONTROL, FLAG & IO =================
  {
    opcode: 'STC',
    category: 'Control, Flag & IO',
    desc: 'Sets the Carry Flag (CF) to 1.',
    setupDesc: 'Initializes CF = 0.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, CF: 1 },
        mathExplanation: 'STC (Set Carry Flag) is a direct flag manipulation instruction. It forces the Carry Flag (CF) bit to 1, regardless of any previous mathematical outcomes. Very useful before executing ADC or SBB instructions.'
      };
    }
  },
  {
    opcode: 'LAHF',
    category: 'Control, Flag & IO',
    desc: 'Loads the AH register with the low byte of the Flag register (SF, ZF, AF, PF, CF).',
    setupDesc: 'Initializes AH = 00H, and sets ZF = 1, CF = 1 to show bits transfer.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 1, CF: 1, SF: 0, OF: 0, AF: 1, PF: 0 },
    execute: (regs, flags) => {
      // Flag register lower 8 bits on 8086: SF:ZF:0:AF:0:PF:1:CF
      // ZF=1, CF=1, AF=1 -> 01010011B = 53H
      const flagByte = 0x53;
      const newAX = (regs.AX & 0x00FF) | (flagByte << 8);
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'LAHF copies the five 8086 status flags (SF, ZF, AF, PF, CF) into specific bit positions of the AH register (forming the byte 53H due to active ZF, AF, CF). This was historically used to easily store flag status during subroutine context saving.'
      };
    }
  },
  {
    opcode: 'IN AL, 0C8H',
    category: 'Control, Flag & IO',
    desc: 'Reads an 8-bit byte from physical fixed I/O port 0C8H into AL.',
    setupDesc: 'Initializes AL = 00H. The external fixed port 0C8H holds the peripheral data value 39H.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newAX = (regs.AX & 0xFF00) | 0x39;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: 'The IN instruction copies 1 byte of hardware data (39H) directly from physical fixed port 0C8H into the AL register. Port addresses from 00H to FFH can be queried directly like this in fixed port addressing.'
      };
    }
  },
  {
    opcode: 'OUT DX, AL',
    category: 'Control, Flag & IO',
    desc: 'Outputs the byte in AL to the variable port address contained in DX.',
    setupDesc: 'Initializes DX = 0FFF8H (port address) and AL = A5H (data to output).',
    initialRegs: { AX: 0x00A5, BX: 0x0000, CX: 0x0000, DX: 0xFFF8, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: 'The OUT instruction copies the data byte in AL (A5H) to the variable I/O port address stored in DX (0FFF8H). Because DX is 16-bit, variable port addressing can access up to 65,536 sequential hardware registers (from 0000H to FFFFH).'
      };
    }
  },
  {
    opcode: 'LOCK XCHG [SI], AL',
    category: 'Control, Flag & IO',
    desc: 'Asserts the bus LOCK prefix before performing an exchange with shared memory.',
    setupDesc: 'Initializes AL = 01H (semaphore request token). SI holds the shared resource offset address.',
    initialRegs: { AX: 0x0001, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newAX = (regs.AX & 0xFF00) | 0x00; // memory had 0x00 (resource free)
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 3 },
        newFlags: { ...flags },
        mathExplanation: 'The LOCK prefix forces the physical microprocessor to assert its external lock pin, preventing other processors on the system bus from reading/writing memory until the atomic exchange finishes. AL changes from 01H to 00H, successfully acquiring the semaphore.'
      };
    }
  }
];

export default function InstructionDecoderSimulator() {
  const [activeTab, setActiveTab] = useState<'All' | 'Data Transfer' | 'Arithmetic' | 'BCD & ASCII Adjust' | 'Logical & Bitwise' | 'Control, Flag & IO'>('All');
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [regs, setRegs] = useState<Record<string, number>>(mockInstructions[0].initialRegs);
  const [flags, setFlags] = useState<Record<string, number>>(mockInstructions[0].initialFlags);
  const [executionState, setExecutionState] = useState<'idle' | 'fetching' | 'decoding' | 'alu' | 'done'>('idle');
  const [lastExplanation, setLastExplanation] = useState<string>('');
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  const activeInstruction = mockInstructions[selectedIdx];

  const filteredInstructions = mockInstructions
    .map((inst, index) => ({ inst, index }))
    .filter(item => activeTab === 'All' || item.inst.category === activeTab);

  const handleSelectInstruction = (idx: number) => {
    setSelectedIdx(idx);
    setRegs(mockInstructions[idx].initialRegs);
    setFlags(mockInstructions[idx].initialFlags);
    setExecutionState('idle');
    setLastExplanation('');
  };

  const handleExecute = () => {
    setExecutionState('fetching');

    // Pipeline Stage 1: Fetch (1000ms)
    setTimeout(() => {
      setExecutionState('decoding');
    }, 800);

    // Pipeline Stage 2: Decode (1000ms)
    setTimeout(() => {
      setExecutionState('alu');
    }, 1600);

    // Pipeline Stage 3: ALU & Writeback
    setTimeout(() => {
      const result = activeInstruction.execute(regs, flags);
      setRegs(result.newRegs);
      setFlags(result.newFlags);
      setLastExplanation(result.mathExplanation);
      setExecutionState('done');
    }, 2400);
  };

  const handleReset = () => {
    setRegs(activeInstruction.initialRegs);
    setFlags(activeInstruction.initialFlags);
    setExecutionState('idle');
    setLastExplanation('');
  };

  const hexFormat = (val: number): string => {
    return val.toString(16).toUpperCase().padStart(4, '0') + 'H';
  };

  // Safe manual adjustments for students to experiment
  const adjustRegister = (reg: string, delta: number) => {
    if (executionState !== 'idle' && executionState !== 'done') return;
    setRegs(prev => {
      const newVal = (prev[reg] + delta + 0x10000) & 0xFFFF;
      return { ...prev, [reg]: newVal };
    });
  };

  const toggleFlag = (flag: string) => {
    if (executionState !== 'idle' && executionState !== 'done') return;
    setFlags(prev => ({
      ...prev,
      [flag]: prev[flag] === 1 ? 0 : 1
    }));
  };

  const stageMetadata = [
    {
      num: 1,
      name: 'FETCH',
      key: 'fetching',
      icon: Database,
      title: 'Stage 1: FETCH (Instruction Fetch)',
      desc: 'The Bus Interface Unit (BIU) fetches instruction bytes from physical memory (CS:IP segment-offset) and places them into the 6-byte instruction queue.',
      colorClass: 'from-blue-500/10 to-indigo-500/5 border-indigo-200 text-indigo-700',
      activeColor: 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_12px_rgba(79,70,229,0.3)]'
    },
    {
      num: 2,
      name: 'DECODE',
      key: 'decoding',
      icon: Settings,
      title: 'Stage 2: DECODE (Instruction Decode)',
      desc: 'The Execution Unit (EU) Control System decodes the instruction bytes to determine the exact operation (opcode), registers, or memory addressing modes needed.',
      colorClass: 'from-purple-500/10 to-pink-500/5 border-purple-200 text-purple-700',
      activeColor: 'bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(147,51,234,0.3)]'
    },
    {
      num: 3,
      name: 'ALU OP',
      key: 'alu',
      icon: Cpu,
      title: 'Stage 3: ALU OP (Execution Unit ALU Operation)',
      desc: 'The Arithmetic Logic Unit (ALU) performs the designated arithmetic, logical, shift, or comparison operation on operands retrieved from registers/memory.',
      colorClass: 'from-amber-500/10 to-orange-500/5 border-amber-200 text-amber-700',
      activeColor: 'bg-amber-600 border-amber-500 text-white shadow-[0_0_12px_rgba(217,119,6,0.3)]'
    },
    {
      num: 4,
      name: 'WRITEBACK',
      key: 'done',
      icon: CheckCircle2,
      title: 'Stage 4: WRITEBACK (Register Save & Flag Update)',
      desc: 'The final result is saved back into the target registers or memory segment, and the Flag Register is updated with the new arithmetic condition codes (ZF, CF, SF, etc.).',
      colorClass: 'from-emerald-500/10 to-teal-500/5 border-emerald-200 text-emerald-700',
      activeColor: 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_12px_rgba(5,150,105,0.3)]'
    }
  ];

  return (
    <div id="instruction-decoder-simulator" className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 min-h-[520px] text-slate-800 flex flex-col justify-between shadow-xs">
      <div className="space-y-4">
        {/* Header Banner */}
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold font-display text-indigo-700 flex items-center gap-2">
              <Cpu className="w-5.5 h-5.5 text-indigo-600 animate-pulse" />
              8086 Execution Unit & ALU Flag Lab
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Interact with individual CPU registers and witness how arithmetic/logic instructions affect flags in real-time.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100/60 px-3 py-1 rounded-full font-bold self-start sm:self-auto shadow-2xs">
            Assoc. Prof. Dr. M Lakshmipathy
          </span>
        </div>

        {/* Category Tabs Switcher */}
        <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-indigo-100 border-b border-slate-100">
          {(['All', 'Data Transfer', 'Arithmetic', 'BCD & ASCII Adjust', 'Logical & Bitwise', 'Control, Flag & IO'] as const).map(tab => {
            const isSel = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  // Auto-select first matching instruction to avoid empty screens
                  const firstMatch = mockInstructions.findIndex(inst => tab === 'All' || inst.category === tab);
                  if (firstMatch !== -1) {
                    handleSelectInstruction(firstMatch);
                  }
                }}
                className={`px-3 py-1.5 text-[11px] font-sans font-bold rounded-lg border transition-all shrink-0 cursor-pointer ${
                  isSel
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Content Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Column A: Specific Instruction Selector & Play Console */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-indigo-700 font-mono block uppercase tracking-widest">
                Select Instruction to Load:
              </span>
              <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredInstructions.map(({ inst, index }) => {
                  const isSelected = selectedIdx === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectInstruction(index)}
                      disabled={executionState !== 'idle' && executionState !== 'done'}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex justify-between items-center ${
                        isSelected
                          ? 'bg-indigo-700 border-indigo-600 text-white font-bold scale-[1.01] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50/10'
                      }`}
                    >
                      <div>
                        <p className="font-mono text-[11.5px]">{inst.opcode}</p>
                        <p className={`text-[9px] mt-0.5 font-sans font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {inst.category}
                        </p>
                      </div>
                      {isSelected && (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parameter & Setup Box */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase font-mono">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Lesson Parameters
              </div>
              <p className="text-[10.5px] text-slate-600 leading-normal">
                {activeInstruction.setupDesc}
              </p>
              <div className="text-[9.5px] text-slate-400 leading-snug border-t border-slate-100 pt-1.5">
                <span className="font-bold text-indigo-600">Desc: </span>{activeInstruction.desc}
              </div>
            </div>

            {/* Run Console Buttons */}
            <div className="flex gap-2">
              <button
                disabled={executionState !== 'idle' && executionState !== 'done'}
                onClick={handleExecute}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                {executionState === 'idle' ? 'Run Pipeline' : executionState === 'done' ? 'Execute Again' : 'Executing...'}
              </button>
              <button
                onClick={handleReset}
                className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Reset values to preset default values"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Column B: Interactive Hardware Panel (Pipeline, Register File, and Flags) */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
            
            {/* 4-Stage Hardware Pipeline Tracker */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-3xs transition-all">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  Intel 8086 Instruction Execution Pipeline
                </span>
                <span className="text-slate-400 font-sans font-medium text-[9px] hidden sm:inline">
                  💡 Hover or click any stage to explore details
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {stageMetadata.map((stage) => {
                  const isCurrentActive = executionState === stage.key;
                  const isHovered = hoveredStage === stage.num;
                  const StageIcon = stage.icon;
                  
                  return (
                    <div
                      key={stage.num}
                      onMouseEnter={() => setHoveredStage(stage.num)}
                      onMouseLeave={() => setHoveredStage(null)}
                      onClick={() => setHoveredStage(stage.num)}
                      className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer text-center relative select-none flex flex-col justify-between ${
                        isCurrentActive
                          ? `${stage.activeColor} scale-[1.03] z-10 font-bold`
                          : isHovered
                          ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-2xs font-semibold'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[7.5px] sm:text-[8px] uppercase tracking-wider font-sans font-bold block ${
                          isCurrentActive ? 'text-white/90' : 'text-slate-400'
                        }`}>
                          Stage {stage.num}
                        </span>
                        <StageIcon className={`w-3.5 h-3.5 ${
                          isCurrentActive ? 'text-white' : 'text-slate-400'
                        }`} />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono tracking-tight font-extrabold block">
                        {stage.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic explanations for the stages */}
              <AnimatePresence mode="wait">
                {(() => {
                  let displayedStageNum = hoveredStage;
                  if (displayedStageNum === null) {
                    const currentStageIndex = stageMetadata.findIndex(s => executionState === s.key);
                    if (currentStageIndex !== -1) {
                      displayedStageNum = currentStageIndex + 1;
                    }
                  }

                  const stage = stageMetadata.find(s => s.num === displayedStageNum);
                  
                  return (
                    <motion.div
                      key={displayedStageNum ?? 'default'}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11.5px] shadow-3xs"
                    >
                      {stage ? (
                        <div className="space-y-1 font-sans">
                          <strong className="text-indigo-700 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
                            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            {stage.title}
                          </strong>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            {stage.desc}
                          </p>
                          {activeInstruction.opcode.includes('DIV') && (
                            <p className="text-[10px] text-amber-700 bg-amber-50/40 p-1.5 rounded border border-amber-100/50 mt-1.5 font-medium leading-relaxed">
                              📝 <strong>Division Context:</strong> For <code>{activeInstruction.opcode}</code>, this stage handles the complex 8-bit quotient and remainder logic.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic flex items-center gap-2 text-[11px] py-1 justify-center font-sans font-medium">
                          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 animate-bounce" />
                          <span>Hover over or click any pipeline stage to see its deep microprocessor function &amp; timing analysis.</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {/* Registers and Flags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Register File (12-cols -> 7-cols) */}
              <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-3xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-600 font-mono block uppercase tracking-widest">
                    Register File (16-bit)
                  </span>
                  <span className="text-[9px] text-slate-400 italic">Click arrows to manually edit</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {['AX', 'BX', 'CX', 'DX', 'SP', 'SI', 'DI', 'DS'].map(regName => (
                    <div key={regName} className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl flex justify-between items-center shadow-3xs group">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-indigo-600 font-extrabold">{regName}:</span>
                        <span className="text-slate-800 font-extrabold text-[12.5px] mt-0.5">{hexFormat(regs[regName] ?? 0)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => adjustRegister(regName, 1)} 
                          className="p-0.5 hover:bg-slate-100 rounded text-indigo-600 font-bold text-[9px] cursor-pointer"
                        >
                          ▲
                        </button>
                        <button 
                          onClick={() => adjustRegister(regName, -1)} 
                          className="p-0.5 hover:bg-slate-100 rounded text-indigo-600 font-bold text-[9px] cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Flag register (12-cols -> 5-cols) */}
              <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-3xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-[10px] font-bold text-slate-600 font-mono block uppercase tracking-widest">
                      ALU Status Flags
                    </span>
                    <span className="text-[9px] text-slate-400 italic">Click to flip</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono mt-3">
                    {['ZF', 'CF', 'SF', 'OF', 'AF', 'PF'].map(flagName => {
                      const isActive = flags[flagName] === 1;
                      return (
                        <button
                          key={flagName}
                          onClick={() => toggleFlag(flagName)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-between h-[50px] shadow-3xs ${
                            isActive 
                              ? 'bg-indigo-600 border-indigo-500 text-white font-bold scale-[1.02]' 
                              : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
                          }`}
                        >
                          <span className={`block text-[9px] font-bold ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{flagName}</span>
                          <span className="text-[11px] font-mono leading-none">{flags[flagName] ?? 0}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-2.5 text-[9.5px] text-indigo-800 leading-normal font-sans mt-3">
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Flags Guide:</span>
                  <span className="font-semibold">ZF</span> (Zero), <span className="font-semibold">CF</span> (Carry), <span className="font-semibold">SF</span> (Sign), <span className="font-semibold">OF</span> (Overflow), <span className="font-semibold">AF</span> (Aux Carry), <span className="font-semibold">PF</span> (Parity).
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-[11px] sm:text-xs font-sans min-h-[96px] leading-relaxed shadow-3xs">
              <AnimatePresence mode="wait">
                {lastExplanation ? (
                  <motion.div
                    key={selectedIdx + '_' + executionState}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    <span className="text-[10px] font-mono font-bold text-indigo-700 block uppercase tracking-wide flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                      ALU Mathematical Analysis & Writeback:
                    </span>
                    <p className="text-slate-600 leading-relaxed text-justify">{lastExplanation}</p>
                  </motion.div>
                ) : (
                  <div className="text-slate-400 italic text-center py-4 flex flex-col items-center justify-center gap-1.5">
                    <Info className="w-5 h-5 text-indigo-300" />
                    <span>Select an instruction, set registers or flags if desired, and click "Run Pipeline".</span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 font-mono text-right pt-4 border-t border-slate-100 shrink-0 mt-4 flex justify-between items-center">
        <span className="text-left text-[9px] text-slate-400">
          * Real instructions are simulated based on authentic Intel 8086 micro-architecture execution results.
        </span>
        <span>Interactive Instruction Laboratory</span>
      </div>
    </div>
  );
}
