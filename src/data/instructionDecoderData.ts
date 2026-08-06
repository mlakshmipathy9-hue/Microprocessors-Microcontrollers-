export interface SimulatorInstruction {
  opcode: string;
  category: 'Data Transfer' | 'Arithmetic' | 'BCD & ASCII Adjust' | 'Logical' | 'Bitwise' | 'Control' | 'Flag' | 'I/O' | 'String Operations';
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
    desc: 'Performs 8-bit unsigned multiplication: AX = AL * BH.',
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
    opcode: 'IMUL BL',
    category: 'Arithmetic',
    desc: 'Performs 8-bit signed (2\'s complement) multiplication: AX = AL * BL.',
    setupDesc: 'Initializes AL = FFH (-1 in 2\'s complement) and BL = 05H (+5 decimal) to demonstrate signed multiplication.',
    initialRegs: { AX: 0x00FF, BX: 0x0005, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // Treat AL (FFH) as -1 and BL (05H) as +5
      const alSigned = (regs.AX & 0xFF) > 127 ? (regs.AX & 0xFF) - 256 : (regs.AX & 0xFF);
      const blSigned = (regs.BX & 0xFF) > 127 ? (regs.BX & 0xFF) - 256 : (regs.BX & 0xFF);
      const prodSigned = alSigned * blSigned; // -1 * 5 = -5 -> 0xFFFB in 16-bit
      const prod16 = prodSigned & 0xFFFF;
      const newRegs = { ...regs, AX: prod16, IP: regs.IP + 2 };
      const ah = (prod16 & 0xFF00) >> 8;
      const signExtAh = (prod16 & 0x80) ? 0xFF : 0x00;
      const cf_of = ah !== signExtAh ? 1 : 0;
      return {
        newRegs,
        newFlags: { ...flags, CF: cf_of, OF: cf_of, SF: (prod16 & 0x8000) ? 1 : 0, ZF: prod16 === 0 ? 1 : 0 },
        mathExplanation: 'IMUL BL multiplies signed AL (FFH = -1) by signed BL (05H = +5) = FFFBH (-5 decimal) in AX. Sign is preserved algebraically (-1 × +5 = -5).'
      };
    }
  },
  {
    opcode: 'DIV BL',
    category: 'Arithmetic',
    desc: 'Performs 8-bit unsigned division: AX divided by BL. Quotient in AL, Remainder in AH.',
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
    opcode: 'IDIV BL',
    category: 'Arithmetic',
    desc: 'Performs 8-bit signed (2\'s complement) division: AX divided by BL. Quotient in AL, Remainder in AH.',
    setupDesc: 'Initializes AX = FFFBH (-5 decimal) and BL = 02H (+2 decimal) to demonstrate signed division.',
    initialRegs: { AX: 0xFFFB, BX: 0x0002, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // AX = -5, BL = 2 -> Quotient = -2 (FEH), Remainder = -1 (FFH)
      const axSigned = regs.AX > 32767 ? regs.AX - 65536 : regs.AX;
      const blSigned = (regs.BX & 0xFF) > 127 ? (regs.BX & 0xFF) - 256 : (regs.BX & 0xFF);
      const qSigned = Math.trunc(axSigned / blSigned);
      const rSigned = axSigned % blSigned;
      const qByte = qSigned & 0xFF;
      const rByte = rSigned & 0xFF;
      const newAX = (rByte << 8) | qByte;
      const newRegs = { ...regs, AX: newAX, IP: regs.IP + 2 };
      return {
        newRegs,
        newFlags: { ...flags },
        mathExplanation: 'IDIV BL divides signed AX (FFFBH = -5) by BL (02H = +2). Quotient = -2 (FEH in AL), Remainder = -1 (FFH in AH). Result AX = FFFEH.'
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
    opcode: 'AAA',
    category: 'BCD & ASCII Adjust',
    desc: 'ASCII Adjust after Addition. Adjusts AL after adding ASCII digits (\'5\' + \'9\' = 6EH) into unpacked decimal digits in AH:AL.',
    setupDesc: 'Initializes AX = 006EH (from ADD AL, 39H where AL was 35H \'5\' + 39H \'9\' = 6EH). Lower nibble EH > 9.',
    initialRegs: { AX: 0x006E, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // AL = 6EH. Lower nibble = 0x0E > 9.
      // AAA adds 6 to AL (6EH + 06H = 74H -> lower nibble 04H), increments AH by 1 (AH=01H), clears upper nibble of AL. AX becomes 0104H.
      const newAX = 0x0104;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags: { ...flags, AF: 1, CF: 1 },
        mathExplanation: 'AAA inspects AL (6EH). Lower nibble (0EH) > 9. AAA adds 6 to AL, increments AH by 1 (00H → 01H), and clears upper nibble of AL to 0. AX becomes 0104H (decimal 14), with AF=1 and CF=1.'
      };
    }
  },
  {
    opcode: 'AAS',
    category: 'BCD & ASCII Adjust',
    desc: 'ASCII Adjust after Subtraction. Adjusts AL after subtracting ASCII digits (\'3\' - \'8\' = FBH) into unpacked decimal digit with borrow in AH.',
    setupDesc: 'Initializes AX = 00FBH (from SUB AL, 38H where AL was 33H \'3\' - 38H \'8\' = FBH). Lower nibble BH > 9.',
    initialRegs: { AX: 0x00FB, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      // AL = FBH. Lower nibble = 0x0B > 9.
      // AAS subtracts 6 from AL (FBH - 06H = F5H -> lower nibble 05H), decrements AH by 1 (AH becomes FFH), clears upper nibble of AL. AX becomes FF05H.
      const newAX = 0xFF05;
      return {
        newRegs: { ...regs, AX: newAX, IP: regs.IP + 1 },
        newFlags: { ...flags, AF: 1, CF: 1 },
        mathExplanation: 'AAS inspects AL (FBH). Lower nibble (0BH) > 9. AAS subtracts 6 from AL, decrements AH by 1 (00H → FFH borrow), and masks upper nibble of AL to 0. AX becomes FF05H (-1 in AH, digit 5 in AL), with AF=1 and CF=1.'
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

  // ================= CATEGORY: LOGICAL =================
  {
    opcode: 'XOR AX, AX',
    category: 'Logical',
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
    category: 'Logical',
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
    category: 'Logical',
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
    category: 'Logical',
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

  // ================= CATEGORY: BITWISE =================
  {
    opcode: 'NEG BL',
    category: 'Bitwise',
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
    category: 'Bitwise',
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

  // ================= CATEGORY: CONTROL =================
  {
    opcode: 'JMP 0150H',
    category: 'Control',
    desc: 'Unconditional Jump: Loads Instruction Pointer (IP) directly with target address 0150H.',
    setupDesc: 'Initializes IP = 0100H. Unconditional branching bypasses sequential execution.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: 0x0150 },
        newFlags: { ...flags },
        mathExplanation: 'JMP 0150H sets IP directly to target address 0150H. Flags are unaffected.'
      };
    }
  },
  {
    opcode: 'LOOP 0100H',
    category: 'Control',
    desc: 'Loop according to CX: Decrements CX by 1; if CX ≠ 0, jumps to target address 0100H.',
    setupDesc: 'Initializes CX = 0005H and IP = 010CH.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x010C },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      const newCX = regs.CX - 1;
      const targetIP = newCX !== 0 ? 0x0100 : regs.IP + 2;
      return {
        newRegs: { ...regs, CX: newCX, IP: targetIP },
        newFlags: { ...flags },
        mathExplanation: `LOOP decrements CX (${regs.CX.toString(16).toUpperCase().padStart(4, '0')}H → ${newCX.toString(16).toUpperCase().padStart(4, '0')}H). Since CX ≠ 0, jumps to 0100H.`
      };
    }
  },
  {
    opcode: 'CALL 0200H',
    category: 'Control',
    desc: 'Call Procedure: Pushes current IP onto stack and transfers control to target address 0200H.',
    setupDesc: 'Initializes SP = FFFE3H, IP = 0100H. Pushes return address (0103H) onto stack.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, SP: regs.SP - 2, IP: 0x0200 },
        newFlags: { ...flags },
        mathExplanation: 'CALL 0200H pushes return IP (0103H) onto stack (SP: FFFEH → FFFCH) and sets IP = 0200H.'
      };
    }
  },
  {
    opcode: 'RET',
    category: 'Control',
    desc: 'Return from Procedure: Pops return address from stack into IP to resume caller flow.',
    setupDesc: 'Initializes SP = FFFCH (pointing to top of stack containing return address 0103H).',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFC, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0208 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, SP: regs.SP + 2, IP: 0x0103 },
        newFlags: { ...flags },
        mathExplanation: 'RET pops return IP (0103H) from stack (SP: FFFCH → FFFEH) and jumps to 0103H.'
      };
    }
  },
  {
    opcode: 'LOCK XCHG [SI], AL',
    category: 'Control',
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
  },

  // ================= CATEGORY: FLAG =================
  {
    opcode: 'STC',
    category: 'Flag',
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
    opcode: 'CLC',
    category: 'Flag',
    desc: 'Clears the Carry Flag (CF) to 0.',
    setupDesc: 'Initializes CF = 1.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 1, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, CF: 0 },
        mathExplanation: 'CLC clears the Carry Flag (CF = 0) directly.'
      };
    }
  },
  {
    opcode: 'LAHF',
    category: 'Flag',
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
    opcode: 'SAHF',
    category: 'Flag',
    desc: 'Stores bits 7, 6, 4, 2, 0 of register AH into flags SF, ZF, AF, PF, CF.',
    setupDesc: 'Initializes AH = 0D5H (11010101B). Copies bits directly into flags.',
    initialRegs: { AX: 0xD500, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, SF: 1, ZF: 1, AF: 1, PF: 1, CF: 1 },
        mathExplanation: 'SAHF copies bit settings from AH (D5H) directly into status flags: SF=1, ZF=1, AF=1, PF=1, CF=1.'
      };
    }
  },

  // ================= CATEGORY: I/O =================
  {
    opcode: 'IN AL, 0C8H',
    category: 'I/O',
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
    category: 'I/O',
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

  // ================= CATEGORY: STRING OPERATIONS =================
  {
    opcode: 'MOVSB',
    category: 'String Operations',
    desc: 'Move String Byte: Copies byte from DS:SI to ES:DI, then auto-adjusts SI and DI.',
    setupDesc: 'Initializes DS:SI = 1000:1000H (Source byte = 5AH) and ES:DI = 4000:2000H. Direction Flag DF = 0.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0001, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newSI = (regs.SI + step) & 0xFFFF;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, SI: newSI, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: `[MOVSB EXECUTION]: Moved 1 byte from source DS:${regs.SI.toString(16).toUpperCase().padStart(4, '0')}H to destination ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H. Since DF = ${flags.DF}, SI and DI were ${flags.DF === 1 ? 'decremented' : 'incremented'} by 1 (SI → ${newSI.toString(16).toUpperCase().padStart(4, '0')}H, DI → ${newDI.toString(16).toUpperCase().padStart(4, '0')}H). Status flags are unaffected.`
      };
    }
  },
  {
    opcode: 'MOVSW',
    category: 'String Operations',
    desc: 'Move String Word: Copies 16-bit word from DS:SI to ES:DI, then auto-adjusts SI and DI by 2.',
    setupDesc: 'Initializes DS:SI = 1000:1000H (Word = 1234H) and ES:DI = 4000:2000H. DF = 0.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0001, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -2 : 2;
      const newSI = (regs.SI + step) & 0xFFFF;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, SI: newSI, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: `[MOVSW EXECUTION]: Transferred 16-bit word (2 bytes) from DS:${regs.SI.toString(16).toUpperCase().padStart(4, '0')}H to ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H. Since DF = ${flags.DF}, SI and DI were ${flags.DF === 1 ? 'decremented' : 'incremented'} by 2 (SI → ${newSI.toString(16).toUpperCase().padStart(4, '0')}H, DI → ${newDI.toString(16).toUpperCase().padStart(4, '0')}H). Status flags are unaffected.`
      };
    }
  },
  {
    opcode: 'CMPSB',
    category: 'String Operations',
    desc: 'Compare String Byte: Subtracts byte at ES:DI from byte at DS:SI and updates flags (ZF, CF, SF).',
    setupDesc: 'Initializes DS:SI = 45H and ES:DI = 45H (Matching bytes). Adjusts SI and DI by 1.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0001, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newSI = (regs.SI + step) & 0xFFFF;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, SI: newSI, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags, ZF: 1, CF: 0, SF: 0 },
        mathExplanation: `[CMPSB EXECUTION]: Compared DS:${regs.SI.toString(16).toUpperCase().padStart(4, '0')}H (45H) with ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H (45H). Result = 0 (Match!). ZF set to 1, CF = 0. SI and DI ${flags.DF === 1 ? 'decremented' : 'incremented'} to ${newSI.toString(16).toUpperCase().padStart(4, '0')}H and ${newDI.toString(16).toUpperCase().padStart(4, '0')}H.`
      };
    }
  },
  {
    opcode: 'SCASB',
    category: 'String Operations',
    desc: 'Scan String Byte: Compares AL with byte at ES:DI, sets flags, and updates DI.',
    setupDesc: 'Initializes AL = 20H (\' \') and ES:DI = 20H. Searches for target character.',
    initialRegs: { AX: 0x0020, BX: 0x0000, CX: 0x000A, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags, ZF: 1, CF: 0 },
        mathExplanation: `[SCASB EXECUTION]: Scanned memory ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H (20H) against AL (${(regs.AX & 0xFF).toString(16).toUpperCase().padStart(2, '0')}H). Match found! Zero Flag ZF = 1. DI updated to ${newDI.toString(16).toUpperCase().padStart(4, '0')}H.`
      };
    }
  },
  {
    opcode: 'LODSB',
    category: 'String Operations',
    desc: 'Load String Byte: Loads byte from DS:SI into AL, then auto-adjusts SI.',
    setupDesc: 'Initializes DS:SI = 1000:1000H containing character \'A\' (41H). AL is cleared.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0001, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newSI = (regs.SI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, AX: (regs.AX & 0xFF00) | 0x41, SI: newSI, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: `[LODSB EXECUTION]: Loaded byte 41H (\'A\') from DS:${regs.SI.toString(16).toUpperCase().padStart(4, '0')}H into AL. SI ${flags.DF === 1 ? 'decremented' : 'incremented'} to ${newSI.toString(16).toUpperCase().padStart(4, '0')}H. Flags unaffected.`
      };
    }
  },
  {
    opcode: 'STOSB',
    category: 'String Operations',
    desc: 'Store String Byte: Stores byte from AL into ES:DI memory, then auto-adjusts DI.',
    setupDesc: 'Initializes AL = 24H (\'$\') to fill buffer starting at ES:DI = 4000:2000H.',
    initialRegs: { AX: 0x0024, BX: 0x0000, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      const step = flags.DF === 1 ? -1 : 1;
      const newDI = (regs.DI + step) & 0xFFFF;
      return {
        newRegs: { ...regs, DI: newDI, IP: regs.IP + 1 },
        newFlags: { ...flags },
        mathExplanation: `[STOSB EXECUTION]: Stored AL byte 24H (\'$\') into ES:${regs.DI.toString(16).toUpperCase().padStart(4, '0')}H. DI ${flags.DF === 1 ? 'decremented' : 'incremented'} to ${newDI.toString(16).toUpperCase().padStart(4, '0')}H. Flags unaffected.`
      };
    }
  },
  {
    opcode: 'REP MOVSB',
    category: 'String Operations',
    desc: 'Repeat Move String Byte: Repeats MOVSB until CX reaches 0.',
    setupDesc: 'Initializes CX = 0005H (5 bytes to copy) from DS:SI to ES:DI.',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0005, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, CX: 0x0000, SI: 0x1005, DI: 0x2005, IP: regs.IP + 2 },
        newFlags: { ...flags },
        mathExplanation: `[REP MOVSB EXECUTION]: Executed 5 consecutive byte copies from DS:1000H to ES:2000H. CX decremented from 0005H to 0000H. SI → 1005H, DI → 2005H.`
      };
    }
  },
  {
    opcode: 'CLD',
    category: 'String Operations',
    desc: 'Clear Direction Flag: Clears DF = 0 so string instructions auto-increment pointers.',
    setupDesc: 'Initializes DF = 1. Execution clears DF = 0 (Auto-increment mode).',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 1 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, DF: 0 },
        mathExplanation: `[CLD EXECUTION]: Cleared Direction Flag (DF = 0). Subsequent string operations (MOVS, CMPS, etc.) will automatically increment SI and DI pointers forward.`
      };
    }
  },
  {
    opcode: 'STD',
    category: 'String Operations',
    desc: 'Set Direction Flag: Sets DF = 1 so string instructions auto-decrement pointers.',
    setupDesc: 'Initializes DF = 0. Execution sets DF = 1 (Auto-decrement mode).',
    initialRegs: { AX: 0x0000, BX: 0x0000, CX: 0x0000, DX: 0x0000, SP: 0xFFFE, BP: 0x0000, SI: 0x1000, DI: 0x2000, CS: 0x1000, DS: 0x1000, SS: 0x3000, ES: 0x4000, IP: 0x0100 },
    initialFlags: { ZF: 0, CF: 0, SF: 0, OF: 0, AF: 0, PF: 0, DF: 0 },
    execute: (regs, flags) => {
      return {
        newRegs: { ...regs, IP: regs.IP + 1 },
        newFlags: { ...flags, DF: 1 },
        mathExplanation: `[STD EXECUTION]: Set Direction Flag (DF = 1). Subsequent string operations will automatically decrement SI and DI pointers backward.`
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
  if (op === 'IMUL BL') {
    return {
      syntax: 'IMUL BL',
      addressing: 'Register Addressing (implied AL/AX signed product)',
      format: '1111011 w [mod 101 r/m]',
      machineCode: 'F6 ED',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'IMUL 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11101101', hex: 'EDH', desc: 'mod=11, ext=101 (IMUL), r/m=101 (BL)' }
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
  if (op === 'IDIV BL') {
    return {
      syntax: 'IDIV BL',
      addressing: 'Register Addressing (implied AL/AH signed quotient/remainder)',
      format: '1111011 w [mod 111 r/m]',
      machineCode: 'F6 FB',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11110110', hex: 'F6H', desc: 'IDIV 8-bit register (w=0)' },
        { label: 'ModR/M', bits: '11111011', hex: 'FBH', desc: 'mod=11, ext=111 (IDIV), r/m=011 (BL)' }
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
  if (op === 'AAA') {
    return {
      syntax: 'AAA',
      addressing: 'Implied Addressing',
      format: '00110111',
      machineCode: '37',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00110111', hex: '37H', desc: 'ASCII Adjust after Addition' }
      ]
    };
  }
  if (op === 'AAS') {
    return {
      syntax: 'AAS',
      addressing: 'Implied Addressing',
      format: '00111111',
      machineCode: '3F',
      bytesBreakdown: [
        { label: 'Opcode', bits: '00111111', hex: '3FH', desc: 'ASCII Adjust after Subtraction' }
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
  if (op === 'MOVSB') {
    return {
      syntax: 'MOVSB',
      addressing: 'String Addressing (DS:SI to ES:DI)',
      format: '10100100',
      machineCode: 'A4',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10100100', hex: 'A4H', desc: 'Move byte from DS:SI to ES:DI' }
      ]
    };
  }
  if (op === 'MOVSW') {
    return {
      syntax: 'MOVSW',
      addressing: 'String Addressing (DS:SI to ES:DI)',
      format: '10100101',
      machineCode: 'A5',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10100101', hex: 'A5H', desc: 'Move 16-bit word from DS:SI to ES:DI' }
      ]
    };
  }
  if (op === 'CMPSB') {
    return {
      syntax: 'CMPSB',
      addressing: 'String Addressing (DS:SI vs ES:DI)',
      format: '10100110',
      machineCode: 'A6',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10100110', hex: 'A6H', desc: 'Compare byte at DS:SI with byte at ES:DI' }
      ]
    };
  }
  if (op === 'SCASB') {
    return {
      syntax: 'SCASB',
      addressing: 'String Addressing (AL vs ES:DI)',
      format: '10101110',
      machineCode: 'AE',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10101110', hex: 'AEH', desc: 'Scan byte in AL against memory ES:DI' }
      ]
    };
  }
  if (op === 'LODSB') {
    return {
      syntax: 'LODSB',
      addressing: 'String Addressing (DS:SI to AL)',
      format: '10101100',
      machineCode: 'AC',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10101100', hex: 'ACH', desc: 'Load byte from DS:SI into AL' }
      ]
    };
  }
  if (op === 'STOSB') {
    return {
      syntax: 'STOSB',
      addressing: 'String Addressing (AL to ES:DI)',
      format: '10101010',
      machineCode: 'AA',
      bytesBreakdown: [
        { label: 'Opcode', bits: '10101010', hex: 'AAH', desc: 'Store byte from AL into ES:DI' }
      ]
    };
  }
  if (op === 'REP MOVSB') {
    return {
      syntax: 'REP MOVSB',
      addressing: 'String Repeat Addressing (CX times)',
      format: '11110011 10100100',
      machineCode: 'F3 A4',
      bytesBreakdown: [
        { label: 'REP Prefix', bits: '11110011', hex: 'F3H', desc: 'Repeat prefix (while CX != 0)' },
        { label: 'Opcode', bits: '10100100', hex: 'A4H', desc: 'Move byte from DS:SI to ES:DI' }
      ]
    };
  }
  if (op === 'CLD') {
    return {
      syntax: 'CLD',
      addressing: 'Implied Addressing',
      format: '11111100',
      machineCode: 'FC',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11111100', hex: 'FCH', desc: 'Clear Direction Flag (DF = 0)' }
      ]
    };
  }
  if (op === 'STD') {
    return {
      syntax: 'STD',
      addressing: 'Implied Addressing',
      format: '11111101',
      machineCode: 'FD',
      bytesBreakdown: [
        { label: 'Opcode', bits: '11111101', hex: 'FDH', desc: 'Set Direction Flag (DF = 1)' }
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
    title: "9. MUL & IMUL - Unsigned & Signed Multiplication",
    category: "Arithmetic",
    points: [
      "**MUL (Unsigned)**: `MUL Source` multiplies unsigned operands (AL * Src -> AX or AX * Src -> DX:AX).",
      "**IMUL (Signed)**: `IMUL Source` multiplies 2's complement signed operands, preserving algebraic sign (+ * + = +, + * - = -).",
      "**Byte multiplication (8-bit)**: `AX = AL * Source` (16-bit double-width result).",
      "**Word multiplication (16-bit)**: `DX:AX = AX * Source` (32-bit double-width result in DX:AX register pair)."
    ],
    notes: [
      "1. Source operand can be any general register or memory location, but NOT an immediate constant.",
      "2. For MUL: CF and OF are set to 1 if upper half of product (AH or DX) is non-zero.",
      "3. For IMUL: CF and OF are set to 1 if upper half is NOT a sign extension of lower half."
    ],
    codeExample: "MUL BL   ; Unsigned AL * BL -> Product in AX\nIMUL BL  ; Signed 2's complement AL * BL -> Product in AX\nMUL CX   ; Unsigned AX * CX -> 32-bit product in DX:AX"
  },
  {
    title: "10. DIV & IDIV - Unsigned & Signed Division",
    category: "Arithmetic",
    points: [
      "**DIV (Unsigned)**: `DIV Source` divides unsigned dividend (AX or DX:AX) by divisor.",
      "**IDIV (Signed)**: `IDIV Source` divides 2's complement signed dividend by signed divisor.",
      "**Byte division (8-bit divisor)**: `AL = AX / Source` (Quotient), `AH = AX % Source` (Remainder).",
      "**Word division (16-bit divisor)**: `AX = DX:AX / Source` (Quotient), `DX = DX:AX % Source` (Remainder).",
      "**Sign Extension Requirement**: For IDIV, 16-bit dividend in AX must be sign-extended into DX using `CWD` prior to 16-bit division."
    ],
    notes: [
      "1. Source operand can be a register or memory location, but NOT immediate data.",
      "2. Divide Error Interrupt (Type 0) is generated if divisor is 0 or if quotient overflows destination register (AL > 255 or AX > 65535).",
      "3. All status flags are undefined after DIV/IDIV execution."
    ],
    codeExample: "DIV BL   ; Unsigned AX / BL -> Quotient AL, Remainder AH\nIDIV BL  ; Signed AX / BL -> Signed Quotient AL, Remainder AH\nCWD      ; Sign extend AX into DX prior to 16-bit IDIV\nIDIV CX  ; Signed DX:AX / CX -> Quotient AX, Remainder DX"
  },
  {
    title: "11. Flag Manipulation Instructions",
    category: "Flag",
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
    category: "I/O",
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
  },
  {
    title: "13. String Manipulation Instructions",
    category: "String Operations",
    points: [
      "**MOVSB / MOVSW**: Move string byte/word from DS:SI to ES:DI.",
      "**CMPSB / CMPSW**: Compare string byte/word at DS:SI with ES:DI.",
      "**SCASB / SCASW**: Scan string byte/word in AL/AX against ES:DI.",
      "**LODSB / LODSW**: Load string byte/word from DS:SI into AL/AX.",
      "**STOSB / STOSW**: Store string byte/word from AL/AX into ES:DI."
    ],
    notes: [
      "1. Source index SI is always paired with Data Segment (DS).",
      "2. Destination index DI is strictly paired with Extra Segment (ES).",
      "3. SI and DI are automatically incremented (if DF = 0) or decremented (if DF = 1) after each step."
    ],
    codeExample: "LEA SI, SRC_BUF ; Load source offset into SI\nLEA DI, DST_BUF ; Load dest offset into DI\nMOVSB           ; Transfer 1 byte and auto-adjust SI & DI"
  },
  {
    title: "14. String Repeat Prefixes & Direction Control",
    category: "String Operations",
    points: [
      "**REP**: Repeat string operation while CX != 0.",
      "**REPE / REPZ**: Repeat while Equal / Zero (CX != 0 and ZF = 1).",
      "**REPNE / REPNZ**: Repeat while Not Equal / Not Zero (CX != 0 and ZF = 0).",
      "**CLD**: Clear Direction Flag (DF = 0) for forward processing (SI++, DI++).",
      "**STD**: Set Direction Flag (DF = 1) for backward processing (SI--, DI--)."
    ],
    notes: [
      "1. CX is automatically decremented by 1 after each iteration.",
      "2. REP is used with MOVS and STOS for hardware-accelerated memory block copies.",
      "3. REPE/REPNE are used with CMPS and SCAS for string searching and comparisons."
    ],
    codeExample: "CLD             ; Auto-increment SI and DI\nMOV CX, 0005H   ; Set string length to 5 bytes\nREP MOVSB       ; Copy 5 bytes from DS:SI to ES:DI in hardware loop"
  }
];

export interface OperandAnalysis {
  dstOperand: string;
  dstType: string;
  srcOperand: string;
  srcType: string;
  transferType: string;
  description: string;
}

export function getOperandAnalysis(opcode: string): OperandAnalysis {
  const op = opcode.trim();

  if (op.startsWith('MOV CX, 037AH')) {
    return {
      dstOperand: 'CX',
      dstType: '16-bit General Register',
      srcOperand: '037AH',
      srcType: '16-bit Immediate Constant Data',
      transferType: 'Immediate-to-Register Transfer',
      description: 'Loads raw 16-bit constant 037AH directly into CX register.'
    };
  }
  if (op.startsWith('XCHG AX, BX')) {
    return {
      dstOperand: 'AX',
      dstType: '16-bit Accumulator Register',
      srcOperand: 'BX',
      srcType: '16-bit Base Register',
      transferType: 'Atomic Register Swap',
      description: 'Exchanges the 16-bit values stored in AX and BX simultaneously.'
    };
  }
  if (op === 'XLAT') {
    return {
      dstOperand: 'AL',
      dstType: '8-bit Low Accumulator Register',
      srcOperand: 'DS:[BX + AL]',
      srcType: 'Indirect Table Lookup Memory Address',
      transferType: 'Table Lookup Translation',
      description: 'Uses BX as base table address and AL as offset index; writes byte entry back into AL.'
    };
  }
  if (op.startsWith('PUSH')) {
    return {
      dstOperand: 'SS:SP (Stack Top)',
      dstType: 'Stack Segment Memory Pointer',
      srcOperand: op.split(' ')[1] || 'AX',
      srcType: '16-bit Register',
      transferType: 'Register to Stack Allocation',
      description: 'Decrements SP by 2 and writes 16-bit word from register into stack memory.'
    };
  }
  if (op.startsWith('POP')) {
    return {
      dstOperand: op.split(' ')[1] || 'DX',
      dstType: '16-bit Register',
      srcOperand: 'SS:SP (Stack Top)',
      srcType: 'Stack Segment Memory Pointer',
      transferType: 'Stack Memory Deallocation',
      description: 'Reads 16-bit word from top of stack into register and increments SP by 2.'
    };
  }
  if (op.startsWith('LEA')) {
    return {
      dstOperand: 'BX',
      dstType: '16-bit General Register',
      srcOperand: '[SI + 0004H]',
      srcType: 'Effective Memory Address Offset Calculation',
      transferType: 'Address Calculation (No Memory Read)',
      description: 'Calculates offset address (SI + 0004H) and stores the offset value directly in BX.'
    };
  }
  if (op.startsWith('LDS') || op.startsWith('LES')) {
    const isLds = op.startsWith('LDS');
    return {
      dstOperand: `${isLds ? 'DS' : 'ES'} & ${op.split(' ')[1]}`,
      dstType: 'Segment Register & Index Register Pair',
      srcOperand: '[2000H]',
      srcType: '32-bit Far Pointer in Data Segment Memory',
      transferType: 'Far Pointer Memory Load',
      description: `Loads 16-bit offset into ${op.split(' ')[1]} and 16-bit segment selector into ${isLds ? 'DS' : 'ES'}.`
    };
  }
  if (op.startsWith('MOVSB')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Memory Pointer (DI)',
      srcOperand: 'DS:SI',
      srcType: 'Data Segment Memory Pointer (SI)',
      transferType: 'String Memory Byte Copy',
      description: 'Transfers 1 byte from DS:SI memory to ES:DI memory, auto-adjusting SI and DI.'
    };
  }
  if (op.startsWith('MOVSW')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Memory Pointer (DI)',
      srcOperand: 'DS:SI',
      srcType: 'Data Segment Memory Pointer (SI)',
      transferType: 'String Memory Word Copy (16-bit)',
      description: 'Transfers 2 bytes (word) from DS:SI to ES:DI, auto-adjusting SI and DI by 2.'
    };
  }
  if (op.startsWith('CMPSB')) {
    return {
      dstOperand: 'DS:SI',
      dstType: 'Data Segment Source String Pointer',
      srcOperand: 'ES:DI',
      srcType: 'Extra Segment Dest String Pointer',
      transferType: 'String Memory Byte Comparison',
      description: 'Compares byte at DS:SI with byte at ES:DI without modifying operands, updating flags.'
    };
  }
  if (op.startsWith('SCASB')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Destination Memory Pointer',
      srcOperand: 'AL',
      srcType: '8-bit Low Accumulator Register',
      transferType: 'Accumulator vs String Memory Scan',
      description: 'Compares byte in AL against memory byte at ES:DI and updates status flags.'
    };
  }
  if (op.startsWith('LODSB')) {
    return {
      dstOperand: 'AL',
      dstType: '8-bit Low Accumulator Register',
      srcOperand: 'DS:SI',
      srcType: 'Data Segment Source Memory Pointer',
      transferType: 'String Memory Load to Accumulator',
      description: 'Loads byte from memory at DS:SI into AL and auto-adjusts SI.'
    };
  }
  if (op.startsWith('STOSB')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Destination Memory Pointer',
      srcOperand: 'AL',
      srcType: '8-bit Low Accumulator Register',
      transferType: 'Accumulator Store to String Memory',
      description: 'Stores byte from AL into memory at ES:DI and auto-adjusts DI.'
    };
  }
  if (op.startsWith('REP MOVSB')) {
    return {
      dstOperand: 'ES:DI',
      dstType: 'Extra Segment Memory Pointer (DI)',
      srcOperand: 'DS:SI',
      srcType: 'Data Segment Memory Pointer (SI)',
      transferType: 'Hardware Repeated String Copy (CX times)',
      description: 'Repeats MOVSB instruction in hardware loop while CX != 0, auto-decrementing CX.'
    };
  }
  if (op === 'CLD' || op === 'STD') {
    return {
      dstOperand: 'DF Flag',
      dstType: 'Processor Status Direction Flag',
      srcOperand: op === 'CLD' ? '0 (Clear)' : '1 (Set)',
      srcType: 'Immediate Flag Status Bit',
      transferType: 'Processor Control Flag Modification',
      description: op === 'CLD' ? 'Clears DF (0) for forward string pointer auto-increment.' : 'Sets DF (1) for backward string pointer auto-decrement.'
    };
  }
  if (op === 'DAA' || op === 'DAS' || op === 'AAA' || op === 'AAS') {
    return {
      dstOperand: op.startsWith('AA') ? 'AX (AH:AL)' : 'AL',
      dstType: op.startsWith('AA') ? '16-bit Unpacked BCD Accumulator Pair' : '8-bit Packed BCD Accumulator',
      srcOperand: 'Implicit AL & AF/CF Flags',
      srcType: 'Internal Status Flags & Lower Nibble',
      transferType: 'Decimal / BCD Arithmetic Adjust',
      description: 'Adjusts the result in AL/AX after binary arithmetic to form valid BCD/ASCII digits.'
    };
  }
  if (op === 'AAM' || op === 'AAD') {
    return {
      dstOperand: 'AX (AH & AL)',
      dstType: '16-bit Unpacked BCD Register Pair',
      srcOperand: op === 'AAM' ? 'AL & Immediate 10 (0AH)' : 'AX & Immediate 10 (0AH)',
      srcType: 'Accumulator & Base 10 Constant',
      transferType: 'Unpacked BCD Multiply / Divide Adjust',
      description: op === 'AAM' ? 'Converts binary product in AL into AH=Quotient (tens) and AL=Remainder (units).' : 'Combines AH and AL unpacked BCD digits into binary in AL prior to division.'
    };
  }
  if (op.startsWith('IN AL')) {
    return {
      dstOperand: 'AL',
      dstType: '8-bit Low Accumulator Register',
      srcOperand: 'DX',
      srcType: '16-bit I/O Port Address Register',
      transferType: 'I/O Bus Input Read',
      description: 'Reads an 8-bit byte from peripheral I/O port address in DX into AL.'
    };
  }
  if (op.startsWith('OUT DX')) {
    return {
      dstOperand: 'DX',
      dstType: '16-bit I/O Port Address Register',
      srcOperand: 'AL',
      srcType: '8-bit Low Accumulator Register',
      transferType: 'I/O Bus Output Write',
      description: 'Sends an 8-bit byte from AL out to the peripheral I/O port address in DX.'
    };
  }

  // Fallback parser for general binary arithmetic / logical instructions
  const parts = op.split(' ');
  const mnemonic = parts[0];
  const operands = parts.slice(1).join(' ').split(',').map(s => s.trim());
  const dst = operands[0] || 'AL/AX';
  const src = operands[1] || 'Implied';

  let dstType = 'Register / Memory Operand';
  if (dst.startsWith('AX') || dst.startsWith('BX') || dst.startsWith('CX') || dst.startsWith('DX')) dstType = '16-bit General Register';
  else if (dst.startsWith('AL') || dst.startsWith('BL') || dst.startsWith('CL') || dst.startsWith('DL') || dst.startsWith('AH') || dst.startsWith('BH') || dst.startsWith('CH') || dst.startsWith('DH')) dstType = '8-bit Byte Register';
  else if (dst.startsWith('[')) dstType = 'Memory Offset Address';

  let srcType = 'Register / Constant / Memory Operand';
  if (src.endsWith('H') || !isNaN(Number(src))) srcType = 'Immediate Constant Value';
  else if (src.startsWith('AX') || src.startsWith('BX') || src.startsWith('CX') || src.startsWith('DX')) srcType = '16-bit General Register';
  else if (src.startsWith('AL') || src.startsWith('BL') || src.startsWith('CL') || src.startsWith('DL')) srcType = '8-bit Byte Register';
  else if (src.startsWith('[')) srcType = 'Memory Offset Address';

  return {
    dstOperand: dst,
    dstType,
    srcOperand: src,
    srcType,
    transferType: `${mnemonic} Operation`,
    description: `Performs ${mnemonic} using ${dst} as destination and ${src} as source.`
  };
}

export function getInstNameInfo(opcode: string): { name: string; full: string } {
  const clean = opcode.replace(/^LOCK\s+/, '').replace(/^REP\s+/, '');
  const mnemonic = clean.split(' ')[0].toUpperCase();
  
  const map: Record<string, { name: string; full: string }> = {
    'ADD': { name: 'ADD', full: 'Addition' },
    'ADC': { name: 'ADC', full: 'Add with Carry' },
    'SUB': { name: 'SUB', full: 'Subtraction' },
    'SBB': { name: 'SBB', full: 'Subtract with Borrow' },
    'INC': { name: 'INC', full: 'Increment by 1' },
    'DEC': { name: 'DEC', full: 'Decrement by 1' },
    'MUL': { name: 'MUL', full: 'Unsigned Multiplication' },
    'IMUL': { name: 'IMUL', full: 'Signed Multiplication (2\'s Complement)' },
    'DIV': { name: 'DIV', full: 'Unsigned Division' },
    'IDIV': { name: 'IDIV', full: 'Signed Division (2\'s Complement)' },
    'CMP': { name: 'CMP', full: 'Compare Operands' },
    'MOV': { name: 'MOV', full: 'Move / Copy Data' },
    'XCHG': { name: 'XCHG', full: 'Exchange Operands' },
    'PUSH': { name: 'PUSH', full: 'Push onto Stack' },
    'POP': { name: 'POP', full: 'Pop from Stack' },
    'LEA': { name: 'LEA', full: 'Load Effective Address' },
    'LDS': { name: 'LDS', full: 'Load Pointer using DS' },
    'LES': { name: 'LES', full: 'Load Pointer using ES' },
    'XLAT': { name: 'XLAT', full: 'Translate Byte in AL' },
    'DAA': { name: 'DAA', full: 'Decimal Adjust AL after Addition' },
    'DAS': { name: 'DAS', full: 'Decimal Adjust AL after Subtraction' },
    'AAA': { name: 'AAA', full: 'ASCII Adjust AL after Addition' },
    'AAS': { name: 'AAS', full: 'ASCII Adjust AL after Subtraction' },
    'AAM': { name: 'AAM', full: 'ASCII Adjust AX after Multiply' },
    'AAD': { name: 'AAD', full: 'ASCII Adjust AX before Division' },
    'AND': { name: 'AND', full: 'Bitwise Logical AND' },
    'OR': { name: 'OR', full: 'Bitwise Logical OR' },
    'XOR': { name: 'XOR', full: 'Bitwise Logical XOR' },
    'NOT': { name: 'NOT', full: 'Bitwise Invert / One\'s Complement' },
    'NEG': { name: 'NEG', full: 'Two\'s Complement Negation' },
    'TEST': { name: 'TEST', full: 'Logical Compare (TEST)' },
    'SHL': { name: 'SHL', full: 'Shift Logical Left' },
    'SHR': { name: 'SHR', full: 'Shift Logical Right' },
    'SAR': { name: 'SAR', full: 'Shift Arithmetic Right' },
    'ROL': { name: 'ROL', full: 'Rotate Left' },
    'ROR': { name: 'ROR', full: 'Rotate Right' },
    'STC': { name: 'STC', full: 'Set Carry Flag' },
    'CLC': { name: 'CLC', full: 'Clear Carry Flag' },
    'STD': { name: 'STD', full: 'Set Direction Flag' },
    'CLD': { name: 'CLD', full: 'Clear Direction Flag' },
    'STI': { name: 'STI', full: 'Set Interrupt Enable Flag' },
    'CLI': { name: 'CLI', full: 'Clear Interrupt Enable Flag' },
    'LAHF': { name: 'LAHF', full: 'Load AH from Flags' },
    'SAHF': { name: 'SAHF', full: 'Store AH into Flags' },
    'IN': { name: 'IN', full: 'Input Byte/Word from Port' },
    'OUT': { name: 'OUT', full: 'Output Byte/Word to Port' },
    'JMP': { name: 'JMP', full: 'Unconditional Jump' },
    'LOOP': { name: 'LOOP', full: 'Loop According to CX Counter' },
    'CALL': { name: 'CALL', full: 'Call Subroutine / Procedure' },
    'RET': { name: 'RET', full: 'Return from Subroutine' },
    'MOVSB': { name: 'MOVSB', full: 'Move String Byte' },
    'MOVSW': { name: 'MOVSW', full: 'Move String Word' },
    'CMPSB': { name: 'CMPSB', full: 'Compare String Bytes' },
    'SCASB': { name: 'SCASB', full: 'Scan String Byte' },
    'LODSB': { name: 'LODSB', full: 'Load String Byte' },
    'STOSB': { name: 'STOSB', full: 'Store String Byte' },
  };

  if (opcode.startsWith('REP')) {
    const nextWord = clean.split(' ')[1]?.toUpperCase() || mnemonic;
    return { name: 'REP ' + nextWord, full: `Repeat ${map[nextWord]?.full || nextWord}` };
  }
  if (opcode.startsWith('LOCK')) {
    const nextWord = clean.split(' ')[1]?.toUpperCase() || mnemonic;
    return { name: 'LOCK ' + nextWord, full: `Bus Lock ${map[nextWord]?.full || nextWord}` };
  }

  return map[mnemonic] || { name: mnemonic, full: `${mnemonic} Operation` };
}

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
  if (op.startsWith('MUL') || op.startsWith('IMUL')) return 12;   
  if (op.startsWith('DIV') || op.startsWith('IDIV')) return 13;   
  if (op.startsWith('STC')) return 14;   
  if (op.startsWith('LAHF')) return 14;  
  if (op.startsWith('IN AL')) return 15; 
  if (op.startsWith('OUT DX')) return 15; 
  if (op.startsWith('LOCK')) return 14;  
  if (op.startsWith('MOVS') || op.startsWith('CMPS') || op.startsWith('SCAS') || op.startsWith('LODS') || op.startsWith('STOS')) return 16;
  if (op.startsWith('REP') || op.startsWith('CLD') || op.startsWith('STD')) return 17;
  return 0; 
}
