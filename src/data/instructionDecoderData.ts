export interface SimulatorInstruction {
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

export const mockInstructions: SimulatorInstruction[] = [
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
        mathExplanation: 'The 16-bit immediate value 037AH is placed in CX. The instruction is 3 bytes long, so IP is incremented by 3. Status flags are unaffected by MOV.'
      };
    }
  },
  {
    opcode: 'XCHG AX, BX',
    category: 'Data Transfer',
    desc: 'Exchanges the 16-bit contents of AX and BX registers.',
    setupDesc: 'Initializes AX = 1234H, BX = ABCDH to demonstrate swapping values.',
    initialRegs: { AX: 0x1234, BX: 0xABCD, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, AX: regs.BX, BX: regs.AX, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'The contents of AX and BX are swapped. AX becomes ABCDH, and BX becomes 1234H. No flags are affected.'
      };
    }
  },
  {
    opcode: 'XLAT',
    category: 'Data Transfer',
    desc: 'Translates a byte in AL using a lookup table pointed to by DS:BX.',
    setupDesc: 'Initializes DS:BX to Gray Code Table. AL holds offset 3. Executes translation.',
    initialRegs: { AX: 0x0003, BX: 0x0200, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // In Gray code scenario, index 3 is 0x02
      const translated = 0x02; 
      const newAX = (regs.AX & 0xFF00) | translated;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'XLAT loads AL from DS:[BX + AL]. BX points to Gray Code table. Index AL=3 corresponds to 02H. AL is updated to 02H. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'LEA BX, PRICES',
    category: 'Data Transfer',
    desc: 'Loads the 16-bit offset/effective address of memory variable PRICES into BX.',
    setupDesc: 'Initializes PRICES offset = 20A0H. BX is cleared to 0000H.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, BX: 0x20A0, IP: regs.IP + 4 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'LEA calculates the offset of PRICES (20A0H) and loads it into BX. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'LDS SI, SPTR',
    category: 'Data Transfer',
    desc: 'Loads a 32-bit far pointer from memory: 16-bit offset into SI, 16-bit segment into DS.',
    setupDesc: 'Initializes memory double-word SPTR with [4326H:2340H].',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x0000, DI: 0x2000, CS: 0x1000, DS: 0x0000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, SI: 0x2340, DS: 0x4326, IP: regs.IP + 4 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'LDS loads SI with offset 2340H, and DS with segment 4326H from SPTR memory. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'PUSH AX',
    category: 'Data Transfer',
    desc: 'Decrements SP by 2, and pushes the contents of register AX onto the Stack.',
    setupDesc: 'Initializes AX = 1234H, SP = FFFEH.',
    initialRegs: { AX: 0x1234, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, SP: regs.SP - 2, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'SP is decremented from FFFEH to FFFCH. AX value 1234H is written to stack SS:FFFCH. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'POP DX',
    category: 'Data Transfer',
    desc: 'Pops a 16-bit word from stack into DX register, then increments SP by 2.',
    setupDesc: 'Initializes SP = FFFCH. Stack memory holds 5678H.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFC, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newRegs = { ...regs, DX: 0x5678, SP: regs.SP + 2, IP: regs.IP + 1 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'POP reads 16-bit word (5678H) from stack at SS:FFFCH into DX, then increments SP to FFFEH. Flags are unaffected.'
      };
    }
  },

  // ================= CATEGORY: ARITHMETIC =================
  {
    opcode: 'ADD AL, 01H',
    category: 'Arithmetic',
    desc: 'Adds immediate byte 01H to register AL, updating AL and setting status flags.',
    setupDesc: 'Initializes AL = FFH to demonstrate a standard carry overflow (wrapping).',
    initialRegs: { AX: 0x00FF, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const al = regs.AX & 0xFF;
      const sum = al + 1;
      const result = sum & 0xFF;
      const newAX = (regs.AX & 0xFF00) | result;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: sum > 0xFF ? 1 : 0,
        SF: (result & 0x80) ? 1 : 0,
        OF: al === 0x7F ? 1 : 0,
        AF: (al & 0x0F) === 0x0F ? 1 : 0,
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0;
      return {
        newRegs,
        newFlags,
        mathExplanation: 'AL (FFH = 255) + 01H = 100H. AL takes low byte 00H, CF becomes 1 (carry active). ZF is set to 1 since AL = 00H.'
      };
    }
  },
  {
    opcode: 'ADC AX, BX',
    category: 'Arithmetic',
    desc: 'Adds BX and Carry Flag (CF) to AX register, updating AX and setting status flags.',
    setupDesc: 'Initializes AX = 00FFH, BX = 0001H, and CF = 1 to show multi-word precision carry propagation.',
    initialRegs: { AX: 0x00FF, BX: 0x0001, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const sum = regs.AX + regs.BX + 1;
      const result = sum & 0xFFFF;
      const newRegs = { ...regs, AX: result, IP: regs.IP + 2 };
      const newFlags = {
        ZF: result === 0 ? 1 : 0,
        CF: sum > 0xFFFF ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 1, 
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0;
      return {
        newRegs,
        newFlags,
        mathExplanation: 'ADC adds AX + BX + Carry. AX (00FFH) + BX (0001H) + CF (1) = 0101H (257 decimal). Zero flag ZF = 0, Carry CF = 0 because result fits inside 16-bit word.'
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
        CF: regs.AX < regs.BX ? 1 : 0,
        SF: (result & 0x8000) ? 1 : 0,
        OF: 0,
        AF: 0,
        PF: 1
      };
      newFlags.PF = (result & 0xFF).toString(2).split('1').length % 2 === 1 ? 1 : 0;
      return {
        newRegs,
        newFlags,
        mathExplanation: '1000H - 0200H = 0E00H (3584 decimal). Result is non-zero (ZF=0). No borrow required (CF=0). SF=0.'
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
        mathExplanation: 'SBB computes AX - BX - CF. AX (0010H) - BX (0005H) - CF (1) = 000AH (10 decimal). Borrow CF is updated to 0, ZF = 0.'
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
        mathExplanation: 'AL (05H = 5) * BH (10H = 16) = 0050H (80 decimal) loaded into AX. Upper byte AH is 00H, so CF and OF are cleared.'
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
        newFlags: { ...flags },
        mathExplanation: 'DIV BL divides AX (25) by BL (5). Quotient = 5 in AL, Remainder = 0 in AH. AX becomes 0005H. Status flags are technically undefined after execution.'
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
      return {
        newRegs,
        newFlags,
        mathExplanation: 'CX (FFFFH) is incremented by 1, wrapping around to 0000H. ZF is set to 1. Crucially, the Carry Flag (CF) is NOT affected by INC.'
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
        newRegs: { ...regs, IP: regs.IP + 2 },
        newFlags,
        mathExplanation: 'CMP subtracts internally: AX (0500H) - BX (0500H) = 0000H. ZF becomes 1 (exact match). The registers themselves remain completely unchanged.'
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
        mathExplanation: 'DAA inspects AL (8EH). The lower nibble (EH) is > 9, so DAA adds 06H: 8EH + 06H = 94H. The final packed BCD sum is 94H. AF is set to 1.'
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
        mathExplanation: 'DAS inspects AL (D7H). Upper nibble (DH) is > 9, so DAS subtracts 60H: D7H - 60H = 77H, setting Carry Flag (CF = 1) for BCD borrow. Result is 77H.'
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
        mathExplanation: 'AAM divides AL (45) by 10. Quotient (4) in AH, Remainder (5) in AL. AX becomes 0405H, representing unpacked BCD for 45.'
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
      const newAX = binary & 0xFF; 
      const newFlags = {
        ...flags,
        ZF: newAX === 0 ? 1 : 0,
        SF: (newAX & 0x80) ? 1 : 0
      };
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags,
        mathExplanation: 'AAD multiplies AH (2) by 10 and adds AL (5), clearing AH to 00H. The AL register gets 25 (19H), preparing for division.'
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
        ZF: 1,
        CF: 0,
        SF: 0,
        OF: 0,
        AF: 0,
        PF: 1
      };
      return {
        newRegs,
        newFlags,
        mathExplanation: 'XORing AX with itself clears it to 0000H. Logical operations force CF=0 and OF=0. ZF is set to 1.'
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
        mathExplanation: 'A5H (10100101B) AND 0FH (00001111B) = 05H. Isolates the lower nibble. CF and OF are forced to 0.'
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
        mathExplanation: 'ORs AH (50H) with CL (0FH) yielding 5FH in AH. CF and OF are cleared. ZF = 0.'
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
        mathExplanation: 'NOT complements all bits of BX from 0000H to FFFFH. Note that in 8086, NOT does not affect any status flags.'
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
        mathExplanation: 'NEG BL computes 2\'s complement of 02H, yielding FEH (-2 in decimal). CF is set to 1 because input is non-zero. SF=1.'
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
        mathExplanation: 'Shifts CX (4000H) left by 1, yielding 8000H. Sign bit changes, so Overflow OF=1. CF is 0.'
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
        mathExplanation: 'STC forces the Carry Flag (CF) to 1 directly, without affecting any other state.'
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
      const flagByte = 0x53; // SF:ZF:0:AF:0:PF:1:CF
      const newAX = (regs.AX & 0x00FF) | (flagByte << 8);
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: 'LAHF copies flags (SF, ZF, AF, PF, CF) into bit positions of AH register, creating byte 53H.'
      };
    }
  },
  {
    opcode: 'IN AL, 0C8H',
    category: 'Control, Flag & IO',
    desc: 'Reads an 8-bit byte from physical fixed I/O port 0C8H into AL.',
    setupDesc: 'Initializes AL = 00H. Fixed port 0C8H holds byte 39H.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newAX = (regs.AX & 0xFF00) | 0x39;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: 'IN AL, 0C8H copies the peripheral hardware data byte (39H) from port 0C8H into AL.'
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
        mathExplanation: 'OUT copies AL byte (A5H) directly to port address DX (0FFF8H). No flags are modified.'
      };
    }
  },
  {
    opcode: 'LOCK XCHG [SI], AL',
    category: 'Control, Flag & IO',
    desc: 'Asserts the bus LOCK prefix before performing an exchange with shared memory.',
    setupDesc: 'Initializes AL = 01H (semaphore token). SI holds resource offset.',
    initialRegs: { AX: 0x0001, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newAX = (regs.AX & 0xFF00) | 0x00; 
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 3 },
        newFlags: { ...flags },
        mathExplanation: 'LOCK prefix asserts bus LOCK signal, ensuring atomic execution of XCHG. AL becomes 00H, successfully acquiring semaphore.'
      };
    }
  }
];

export interface ByteBreakdown {
  label: string;
  bits: string;
  hex: string;
  desc: string;
}

export interface InstructionFormatInfo {
  syntax: string;
  addressing: string;
  format: string;
  machineCode: string;
  bytesBreakdown: ByteBreakdown[];
}

export function getInstructionFormat(opcode: string): InstructionFormatInfo {
  const op = opcode.trim();
  
  if (op === 'MOV CX, 037AH') {
    return {
      syntax: 'MOV CX, imm16',
      addressing: 'Immediate Addressing',
      format: '1011 w reg [Immediate Low] [Immediate High]',
      machineCode: 'B9 7A 03',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '10111001', hex: 'B9H', desc: 'MOV to 16-bit CX (w=1, reg=001)' },
        { label: 'Imm Low', bits: '01111010', hex: '7AH', desc: 'Low byte of immediate 037AH' },
        { label: 'Imm High', bits: '00000011', hex: '03H', desc: 'High byte of immediate 037AH' }
      ]
    };
  }
  if (op === 'XCHG AX, BX') {
    return {
      syntax: 'XCHG AX, BX',
      addressing: 'Register Addressing',
      format: '10010 reg',
      machineCode: '93',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '10010011', hex: '93H', desc: 'Exchange AX with BX (reg=011)' }
      ]
    };
  }
  if (op === 'XLAT') {
    return {
      syntax: 'XLAT',
      addressing: 'Implied / Register Indirect Addressing (via DS:BX)',
      format: '11010111',
      machineCode: 'D7',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11010111', hex: 'D7H', desc: 'Translate byte in AL using table DS:[BX]' }
      ]
    };
  }
  if (op === 'LEA BX, PRICES') {
    return {
      syntax: 'LEA BX, memory',
      addressing: 'Direct Memory Addressing',
      format: '10001101 [mod reg r/m] [Disp Low] [Disp High]',
      machineCode: '8D 1E A0 20',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10001101', hex: '8DH', desc: 'LEA instruction' },
        { label: 'ModR/M', bits: '00011110', hex: '1EH', desc: 'mod=00, reg=011 (BX), r/m=110 (direct addr)' },
        { label: 'Disp Low', bits: '10100000', hex: 'A0H', desc: 'Low byte of offset PRICES (20A0H)' },
        { label: 'Disp High', bits: '00100000', hex: '20H', desc: 'High byte of offset PRICES (20A0H)' }
      ]
    };
  }
  if (op === 'LDS SI, SPTR') {
    return {
      syntax: 'LDS SI, memory',
      addressing: 'Direct Memory Addressing',
      format: '11000101 [mod reg r/m] [Disp Low] [Disp High]',
      machineCode: 'C5 36 26 43',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11000101', hex: 'C5H', desc: 'LDS instruction' },
        { label: 'ModR/M', bits: '00110110', hex: '36H', desc: 'mod=00, reg=110 (SI), r/m=110 (direct addr)' },
        { label: 'Disp Low', bits: '00100110', hex: '26H', desc: 'Low byte of address SPTR' },
        { label: 'Disp High', bits: '01000011', hex: '43H', desc: 'High byte of address SPTR' }
      ]
    };
  }
  if (op === 'PUSH AX') {
    return {
      syntax: 'PUSH AX',
      addressing: 'Register Addressing / Stack Indirect (via SS:SP)',
      format: '01010 reg',
      machineCode: '50',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '01010000', hex: '50H', desc: 'PUSH AX (reg=000)' }
      ]
    };
  }
  if (op === 'POP DX') {
    return {
      syntax: 'POP DX',
      addressing: 'Register Addressing / Stack Indirect (via SS:SP)',
      format: '01011 reg',
      machineCode: '5A',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '01011010', hex: '5AH', desc: 'POP DX (reg=010)' }
      ]
    };
  }
  if (op === 'ADD AL, 01H') {
    return {
      syntax: 'ADD AL, imm8',
      addressing: 'Immediate Addressing',
      format: '0000010 w [Immediate]',
      machineCode: '04 01',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00000100', hex: '04H', desc: 'ADD AL shortcut (w=0)' },
        { label: 'Immediate', bits: '00000001', hex: '01H', desc: 'Byte value 1' }
      ]
    };
  }
  if (op === 'ADC AX, BX') {
    return {
      syntax: 'ADC AX, BX',
      addressing: 'Register Addressing',
      format: '0001000 w [mod reg r/m]',
      machineCode: '11 D8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00010001', hex: '11H', desc: 'ADC reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11011000', hex: 'D8H', desc: 'mod=11, reg=011 (BX), r/m=000 (AX)' }
      ]
    };
  }
  if (op === 'SUB AX, BX') {
    return {
      syntax: 'SUB AX, BX',
      addressing: 'Register Addressing',
      format: '0010100 w [mod reg r/m]',
      machineCode: '29 D8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00101001', hex: '29H', desc: 'SUB reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11011000', hex: 'D8H', desc: 'mod=11, reg=011 (BX), r/m=000 (AX)' }
      ]
    };
  }
  if (op === 'SBB AX, BX') {
    return {
      syntax: 'SBB AX, BX',
      addressing: 'Register Addressing',
      format: '0001100 w [mod reg r/m]',
      machineCode: '19 D8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00011001', hex: '19H', desc: 'SBB reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11011000', hex: 'D8H', desc: 'mod=11, reg=011 (BX), r/m=000 (AX)' }
      ]
    };
  }
  if (op === 'MUL BH') {
    return {
      syntax: 'MUL BH',
      addressing: 'Register Addressing (implied AL/AX product)',
      format: '1111011 w [mod 100 r/m]',
      machineCode: 'F6 E7',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'MUL 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11100111', hex: 'E7H', desc: 'mod=11, ext=100 (MUL), r/m=111 (BH)' }
      ]
    };
  }
  if (op === 'DIV BL') {
    return {
      syntax: 'DIV BL',
      addressing: 'Register Addressing (implied AL/AH quotient/remainder)',
      format: '1111011 w [mod 110 r/m]',
      machineCode: 'F6 F3',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'DIV 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11110011', hex: 'F3H', desc: 'mod=11, ext=110 (DIV), r/m=011 (BL)' }
      ]
    };
  }
  if (op === 'INC CX') {
    return {
      syntax: 'INC CX',
      addressing: 'Register Addressing',
      format: '01000 reg',
      machineCode: '41',
      bytesBreakdown: [
        { label: 'Opcode + Reg', bits: '01000001', hex: '41H', desc: 'INC CX (reg=001)' }
      ]
    };
  }
  if (op === 'CMP AX, BX') {
    return {
      syntax: 'CMP AX, BX',
      addressing: 'Register Addressing',
      format: '0011100 w [mod reg r/m]',
      machineCode: '39 D8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00111001', hex: '39H', desc: 'CMP reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11011000', hex: 'D8H', desc: 'mod=11, reg=011 (BX), r/m=000 (AX)' }
      ]
    };
  }
  if (op === 'DAA') {
    return {
      syntax: 'DAA',
      addressing: 'Implied Addressing',
      format: '00100111',
      machineCode: '27',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00100111', hex: '27H', desc: 'Decimal Adjust after Addition' }
      ]
    };
  }
  if (op === 'DAS') {
    return {
      syntax: 'DAS',
      addressing: 'Implied Addressing',
      format: '00101111',
      machineCode: '2F',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00101111', hex: '2FH', desc: 'Decimal Adjust after Subtraction' }
      ]
    };
  }
  if (op === 'AAM') {
    return {
      syntax: 'AAM',
      addressing: 'Implied / Immediate',
      format: '11010100 00001010',
      machineCode: 'D4 0A',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11010100', hex: 'D4H', desc: 'ASCII Adjust after Multiplication' },
        { label: 'Base Divisor', bits: '00001010', hex: '0AH', desc: 'Divisor value 10' }
      ]
    };
  }
  if (op === 'AAD') {
    return {
      syntax: 'AAD',
      addressing: 'Implied / Immediate',
      format: '11010101 00001010',
      machineCode: 'D5 0A',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11010101', hex: 'D5H', desc: 'ASCII Adjust before Division' },
        { label: 'Base Multiplier', bits: '00001010', hex: '0AH', desc: 'Multiplier value 10' }
      ]
    };
  }
  if (op === 'XOR AX, AX') {
    return {
      syntax: 'XOR AX, AX',
      addressing: 'Register Addressing',
      format: '0011000 w [mod reg r/m]',
      machineCode: '31 C0',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00110001', hex: '31H', desc: 'XOR reg16, reg16 (w=1)' },
        { label: 'ModR/M', bits: '11000000', hex: 'C0H', desc: 'mod=11, reg=000 (AX), r/m=000 (AX)' }
      ]
    };
  }
  if (op === 'AND AL, 0FH') {
    return {
      syntax: 'AND AL, imm8',
      addressing: 'Immediate Addressing',
      format: '0010010 w [Immediate]',
      machineCode: '24 0F',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00100100', hex: '24H', desc: 'AND AL shortcut (w=0)' },
        { label: 'Immediate', bits: '00001111', hex: '0FH', desc: 'Immediate value 0FH' }
      ]
    };
  }
  if (op === 'OR AH, CL') {
    return {
      syntax: 'OR AH, CL',
      addressing: 'Register Addressing',
      format: '0000100 w [mod reg r/m]',
      machineCode: '0A E1',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00001010', hex: '0AH', desc: 'OR reg8 with reg/mem8 (w=0)' },
        { label: 'ModR/M', bits: '11100001', hex: 'E1H', desc: 'mod=11, reg=100 (AH), r/m=001 (CL)' }
      ]
    };
  }
  if (op === 'NOT BX') {
    return {
      syntax: 'NOT BX',
      addressing: 'Register Addressing',
      format: '1111011 w [mod 010 r/m]',
      machineCode: 'F7 D3',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110111', hex: 'F7H', desc: 'NOT 16-bit register (w=1)' },
        { label: 'ModR/M', bits: '11010011', hex: 'D3H', desc: 'mod=11, ext=010 (NOT), r/m=011 (BX)' }
      ]
    };
  }
  if (op === 'NEG BL') {
    return {
      syntax: 'NEG BL',
      addressing: 'Register Addressing',
      format: '1111011 w [mod 011 r/m]',
      machineCode: 'F6 DB',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'NEG 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11011011', hex: 'DBH', desc: 'mod=11, ext=011 (NEG), r/m=011 (BL)' }
      ]
    };
  }
  if (op === 'SHL CX, 1') {
    return {
      syntax: 'SHL CX, 1',
      addressing: 'Register Addressing',
      format: '1101000 w [mod 100 r/m]',
      machineCode: 'D1 D1',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11010001', hex: 'D1H', desc: 'Shift Left 16-bit by 1 (w=1)' },
        { label: 'ModR/M', bits: '11100001', hex: 'E1H', desc: 'mod=11, ext=100, r/m=001 (CX)' }
      ]
    };
  }
  if (op === 'STC') {
    return {
      syntax: 'STC',
      addressing: 'Implied Addressing',
      format: '11111001',
      machineCode: 'F9',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11111001', hex: 'F9H', desc: 'Set Carry Flag (CF = 1)' }
      ]
    };
  }
  if (op === 'LAHF') {
    return {
      syntax: 'LAHF',
      addressing: 'Implied Addressing',
      format: '10011111',
      machineCode: '9F',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10011111', hex: '9FH', desc: 'Load AH with low byte of Flags' }
      ]
    };
  }
  if (op === 'IN AL, 0C8H') {
    return {
      syntax: 'IN AL, port8',
      addressing: 'Fixed Port I/O Addressing',
      format: '1110010 w [Port]',
      machineCode: 'E4 C8',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11100100', hex: 'E4H', desc: 'IN byte data (w=0)' },
        { label: 'Port', bits: '11001000', hex: 'C8H', desc: 'Fixed physical port address 0C8H' }
      ]
    };
  }
  if (op === 'OUT DX, AL') {
    return {
      syntax: 'OUT DX, AL',
      addressing: 'Variable Port I/O Addressing',
      format: '1110111 w',
      machineCode: 'EE',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11101110', hex: 'EEH', desc: 'OUT byte in AL to variable port DX' }
      ]
    };
  }
  if (op === 'LOCK XCHG [SI], AL') {
    return {
      syntax: 'LOCK XCHG [SI], AL',
      addressing: 'Register Indirect Addressing (via SI)',
      format: 'F0H [Opcode] [mod reg r/m]',
      machineCode: 'F0 86 04',
      bytesBreakdown: [
        { label: 'LOCK Prefix', bits: '11110000', hex: 'F0H', desc: 'Assert lock signal to lock system memory bus' },
        { label: 'Opcode', bits: '10000110', hex: '86H', desc: 'XCHG reg8 with reg/mem8 (w=0)' },
        { label: 'ModR/M', bits: '00000100', hex: '04H', desc: 'mod=00, reg=000 (AL), r/m=100 ([SI])' }
      ]
    };
  }
  
  return {
    syntax: op,
    addressing: 'Standard Register Addressing',
    format: 'Variable Instruction Encoding format',
    machineCode: 'XX',
    bytesBreakdown: [
      { label: 'Opcode', bits: 'XXXXXXXX', hex: 'XXH', desc: 'Instruction opcode byte' }
    ]
  };
}

export interface EceSlide {
  title: string;
  subtitle?: string;
  category?: string;
  professor?: string;
  institution?: string;
  points: string[];
  notes?: string[];
  codeExample?: string;
  diagramTitle?: string;
  diagramData?: {
    source: string;
    sourceVal: string;
    dest: string;
    destValBefore: string;
    destValAfter: string;
    arrowLabel: string;
    notes?: string;
  };
}

export const eceSlides: EceSlide[] = [
  {
    title: "Instruction Set of 8086",
    subtitle: "M LAKSHMIPATHY, ASST PROFESSOR",
    professor: "M LAKSHMIPATHY",
    institution: "KUPPAM ENGG COLLEGE",
    category: "Introduction",
    points: [
      "Welcome to ECE Microprocessors Course Lecture Series.",
      "Topic: 8086 Microprocessor Instruction Set.",
      "Department of Electronics & Communication Engineering (ECE).",
      "This slide companion is fully synchronized with the interactive emulator above! Select any instruction to see its slide and execution effects live."
    ]
  },
  {
    title: "Definition & Terminology",
    category: "Introduction",
    points: [
      "**Instruction**: A sequence of bits in a specific format to instruct the computer to perform a specific Operation.",
      "**Instruction Set**: The entire group of instructions that a microprocessor supports is called instruction set.",
      "A machine language instruction format has one or more fields associated with it:",
      "• **Opcode Field**: Indicates the operation to be performed by the CPU.",
      "• **Operand Field**: Contains the source data, target registers, or memory addresses."
    ],
    notes: [
      "The CPU executes the instruction using the information residing in the operand field.",
      "The length of the instruction may vary from one byte to six bytes.",
      "8086 supports more than 20,000 instructions."
    ]
  },
  {
    title: "Classification of 8086 Instruction Set",
    category: "Introduction",
    points: [
      "The 8086/8088 instructions are categorized into the following main types:",
      "1. **Data Copy / Transfer Instructions** (MOV, XCHG, XLAT, LEA, PUSH, POP, etc.)",
      "2. **Arithmetic Instructions** (ADD, SUB, MUL, DIV, INC, DEC, etc.)",
      "3. **Logical Instructions** (AND, OR, NOT, NEG, XOR, TEST)",
      "4. **Branch Instructions** (Jumps, JXX, JMP)",
      "5. **Loop Instructions** (LOOP, LOOPE, LOOPNE)",
      "6. **Machine Control Instructions** (HLT, LOCK, NOP)",
      "7. **Flag Manipulation Instructions** (STC, CLC, CMC, etc.)",
      "8. **Shift & Rotate Instructions** (SHL, SHR, ROL, ROR, etc.)",
      "9. **String Manipulation Instructions** (MOVS, LODS, STOS, etc.)"
    ]
  },
  {
    title: "1. MOV - Move / Copy Instruction",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `MOV Destination, Source`",
      "**Operation**: `Destination = Source`",
      "**Source**: Immediate Data, Register, or Memory location",
      "**Destination**: Register or Memory location"
    ],
    notes: [
      "1. Both the source and destination should be of the same type (bytes or words).",
      "2. Both the operands cannot be the memory (Memory-to-Memory MOV is illegal!).",
      "3. Does not affect any flag."
    ],
    diagramTitle: "MOV Operation Block Diagram",
    diagramData: {
      source: "Source (Immediate / Reg)",
      sourceVal: "037AH",
      dest: "Destination (CX Register)",
      destValBefore: "0000H",
      destValAfter: "037AH",
      arrowLabel: "MOV Copy Flow",
      notes: "CX is updated directly with 037AH. No flags are affected."
    }
  },
  {
    title: "MOV Instruction Examples",
    category: "Data Copy/Transfer",
    points: [
      "• `MOV CX, 037AH` - Put immediate number 037AH to CX.",
      "• `MOV BL, [437AH]` - Copy byte in DS at offset 437AH to BL.",
      "• `MOV AX, BX` - Copy content of register BX to AX.",
      "• `MOV DL, [BX]` - Copy byte from memory at [BX] to DL.",
      "• `MOV DS, BX` - Copy word from BX to DS segment register."
    ],
    notes: [
      "Both operands must be the same size (e.g. 16-bit to 16-bit, or 8-bit to 8-bit).",
      "Segment override prefixes (like CS, ES) can be used to redirect source segment offsets."
    ],
    codeExample: "MOV CX, 037AH ; Load CX with 16-bit immediate value\nMOV AL, [BX]   ; Load AL with byte from address pointed by BX"
  },
  {
    title: "2. XCHG - Exchange Instruction",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `XCHG Destination, Source`",
      "Exchanges the contents of a register with another register or memory location.",
      "**Source**: Register or Memory location",
      "**Destination**: Register or Memory location"
    ],
    notes: [
      "1. Both source and destination must be of the same type (bytes or words).",
      "2. Segment registers cannot be used in this instruction.",
      "3. Both the operands cannot be the memory.",
      "4. Does not affect any flag."
    ],
    diagramTitle: "XCHG Swapping Block Diagram",
    diagramData: {
      source: "AX Register",
      sourceVal: "1234H",
      dest: "BX Register",
      destValBefore: "ABCDH",
      destValAfter: "1234H",
      arrowLabel: "Swap Swapping Flow",
      notes: "AX ends with ABCDH, and BX ends with 1234H. Flags remain unaffected."
    }
  },
  {
    title: "3. XLAT - Translate Instruction",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `XLAT`",
      "This instruction is useful for translating characters from one code (e.g. ASCII) to another (e.g. EBCDIC).",
      "Implied addressing mode: takes no operands.",
      "Loads AL with the contents of memory at `DS:[BX + AL]` offset."
    ],
    notes: [
      "Formula: AL <- [(AL) + (BX) + (DS)]",
      "The starting address of the lookup table is preloaded into BX, and the element index is preloaded into AL.",
      "Does not affect any flag."
    ],
    codeExample: "MOV BX, 0300H ; BX points to Gray Code table\nMOV AL, 03H   ; AL holds the lookup index\nXLAT          ; AL is now loaded with translated Gray Code"
  },
  {
    title: "4. LEA - Load Effective Address",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `LEA Register, Source`",
      "This instruction determines the **offset (effective address)** of the source memory operand and copies it into the 16-bit register.",
      "**Source**: Memory Location or Variable",
      "**Destination**: 16-bit General Purpose Register"
    ],
    notes: [
      "Does not affect any flag.",
      "Crucial difference from MOV: `LEA BX, PRICES` loads the address/offset of PRICES. `MOV BX, [PRICES]` loads the value stored inside PRICES!"
    ],
    codeExample: "LEA BX, PRICES ; Load BX with offset address of PRICES\nLEA CX, [BX][DI] ; Load CX with effective offset of BX + DI"
  },
  {
    title: "5. LDS & LES - Load segment pointer",
    category: "Data Copy/Transfer",
    points: [
      "**Format**: `LDS Register, Memory_Address`",
      "Loads a 32-bit far pointer (segment:offset) from 4 sequential memory locations:",
      "• First 16-bit word loaded into target register.",
      "• Second 16-bit word loaded into segment register."
    ],
    notes: [
      "Does not affect any flag.",
      "Commonly used to initialize pointer registers SI/DI along with their segments DS/ES before string copy loops."
    ],
    codeExample: "LDS SI, SPTR ; SI = Offset, DS = Segment loaded from SPTR address"
  },
  {
    title: "6. PUSH & POP - Stack Instructions",
    category: "Data Copy/Transfer",
    points: [
      "**PUSH Format**: `PUSH Source`",
      "Decrements Stack Pointer (SP) by 2 and copies a 16-bit word onto stack memory pointed by SS:SP.",
      "**POP Format**: `POP Destination`",
      "Copies a 16-bit word from SS:SP stack memory to destination, then increments SP by 2."
    ],
    notes: [
      "1. Source/Destination can be general-purpose registers, segment registers, or memory.",
      "2. Stack grows downwards in memory (high address FFFFH to low address).",
      "3. Does not affect any status flags."
    ],
    codeExample: "PUSH AX ; Save AX onto stack\nPOP DX  ; Restore saved value into DX"
  },
  {
    title: "7. ADD & ADC - Addition Instructions",
    category: "Arithmetic",
    points: [
      "**ADD Format**: `ADD Destination, Source` -> `Dest = Dest + Source`",
      "**ADC Format**: `ADC Destination, Source` -> `Dest = Dest + Source + CarryFlag`",
      "Used for multi-word precision additions where carry from lower word must propagate."
    ],
    notes: [
      "1. Register cannot be segment register.",
      "2. Both operands cannot be memory.",
      "3. All conditional status flags (ZF, CF, SF, OF, AF, PF) are affected based on result."
    ],
    codeExample: "ADD AX, 0100H ; Add immediate value 0100H to AX\nADC DX, BX    ; Add BX to DX with previous Carry flag"
  },
  {
    title: "8. SUB & SBB - Subtraction Instructions",
    category: "Arithmetic",
    points: [
      "**SUB Format**: `SUB Destination, Source` -> `Dest = Dest - Source`",
      "**SBB Format**: `SBB Destination, Source` -> `Dest = Dest - Source - CarryFlag (Borrow)`",
      "Performs subtraction of source from destination, and propagates borrow flags."
    ],
    notes: [
      "1. Registers cannot be segment registers.",
      "2. Both operands cannot be memory.",
      "3. All conditional flags are updated."
    ],
    codeExample: "SUB AX, BX ; Subtract BX from AX\nSBB DX, CX ; Subtract CX from DX with Borrow flag"
  },
  {
    title: "9. MUL - Unsigned Multiplication",
    category: "Arithmetic",
    points: [
      "**Format**: `MUL Source` (Multiply AL or AX with Source)",
      "**Byte multiplication**: `AX = AL * Source (8-bit)`",
      "**Word multiplication**: `DX:AX = AX * Source (16-bit)`",
      "Result is double-width: fits into AX (8-bit) or DX:AX pair (16-bit)."
    ],
    notes: [
      "1. Register can be any general-purpose register.",
      "2. CF and OF are set to 1 if upper half of product (AH or DX) is non-zero; else cleared.",
      "3. Source operand cannot be immediate data."
    ],
    codeExample: "MUL BH ; Multiply AL with BH, 16-bit product saved in AX\nMUL CX ; Multiply AX with CX, 32-bit product in DX:AX"
  },
  {
    title: "10. DIV - Unsigned Division",
    category: "Arithmetic",
    points: [
      "**Format**: `DIV Source` (Divide AX or DX:AX by Source)",
      "**Byte division**: `AL = AX / Source` (Quotient), `AH = AX % Source` (Remainder)",
      "**Word division**: `AX = DX:AX / Source` (Quotient), `DX = DX:AX % Source` (Remainder)"
    ],
    notes: [
      "1. Register can be any general purpose register.",
      "2. All status flags are affected.",
      "3. Divide error (Interrupt 0) triggers if division by zero occurs."
    ],
    codeExample: "DIV BL ; Divide AX by BL. Quotient in AL, Remainder in AH\nDIV CX ; Divide DX:AX by CX. Quotient in AX, Remainder in DX"
  },
  {
    title: "11. Flag Manipulation Instructions",
    category: "Control, Flag & IO",
    points: [
      "Directly modifies or queries the 8086 Status Flags.",
      "• `STC` - Set Carry Flag (CF = 1)",
      "• `CLC` - Clear Carry Flag (CF = 0)",
      "• `CMC` - Complement Carry Flag (CF = ~CF)",
      "• `STD` - Set Direction Flag (DF = 1, strings auto-decrement)",
      "• `CLD` - Clear Direction Flag (DF = 0, strings auto-increment)",
      "• `LAHF` - Copy Low Byte of Flag register directly into AH",
      "• `SAHF` - Copy AH register byte directly into low byte of Flags"
    ],
    notes: [
      "These instructions do not take any operands (implied addressing).",
      "Crucial for controlling string loop behavior (CLD/STD) and preparing carry additions (CLC/STC)."
    ],
    codeExample: "STC  ; Set Carry Flag before ADC\nCLD  ; Clear Direction Flag so string moves advance forward"
  },
  {
    title: "12. Input & Output (IN / OUT) Instructions",
    category: "Control, Flag & IO",
    points: [
      "Transfers data between the accumulator (AL/AX) and peripheral hardware I/O ports.",
      "**Fixed Port (8-bit port)**: `IN AL, 0C8H` / `OUT 3BH, AL`",
      "Allows accessing ports in range 00H to FFH directly.",
      "**Variable Port (16-bit port)**: `IN AL, DX` / `OUT DX, AX`",
      "Uses register DX to hold the port address (0000H to FFFFH)."
    ],
    notes: [
      "1. Transfers always go through accumulator registers AL (8-bit) or AX (16-bit).",
      "2. Does not modify any status flags.",
      "3. Crucial for hardware interface controllers, keyboard input, and LED drivers."
    ],
    codeExample: "MOV DX, 0FF78H ; Preload 16-bit port address into DX\nIN AL, DX      ; Input data byte from port into AL"
  }
];

export function getSlideIndexForOpcode(opcode: string): number {
  const op = opcode.trim();
  if (op.startsWith('MOV CX')) return 3; 
  if (op.startsWith('XCHG')) return 5;   
  if (op.startsWith('XLAT')) return 6;   
  if (op.startsWith('LEA')) return 7;    
  if (op.startsWith('LDS')) return 8;    
  if (op.startsWith('PUSH')) return 9;   
  if (op.startsWith('POP')) return 9;    
  if (op.startsWith('ADD') || op.startsWith('ADC')) return 10; 
  if (op.startsWith('SUB') || op.startsWith('SBB')) return 11; 
  if (op.startsWith('MUL')) return 12;   
  if (op.startsWith('DIV')) return 13;   
  if (op.startsWith('STC')) return 14;   
  if (op.startsWith('LAHF')) return 14;  
  if (op.startsWith('IN AL')) return 15; 
  if (op.startsWith('OUT DX')) return 15; 
  if (op.startsWith('LOCK')) return 14;  
  return 0; 
}
