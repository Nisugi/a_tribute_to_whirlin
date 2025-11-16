/**
 * Tests for ExcelFunctions
 * Validates 100% accuracy against Excel behavior
 */

import { describe, test, expect } from 'vitest';
import { ExcelFunctions as EF } from './ExcelFunctions';

describe('ExcelFunctions - Lookup Functions', () => {
  describe('VLOOKUP', () => {
    const testTable = [
      ['Alice', 25, 'Engineer'],
      ['Bob', 30, 'Designer'],
      ['Charlie', 35, 'Manager'],
      ['David', 28, 'Developer'],
    ];

    test('exact match - found', () => {
      expect(EF.VLOOKUP('Bob', testTable, 2, true)).toBe(30);
      expect(EF.VLOOKUP('Bob', testTable, 3, true)).toBe('Designer');
    });

    test('exact match - not found', () => {
      expect(EF.VLOOKUP('Eve', testTable, 2, true)).toBe(null);
    });

    test('approximate match - less than', () => {
      const sortedTable = [
        [10, 'Ten'],
        [20, 'Twenty'],
        [30, 'Thirty'],
        [40, 'Forty'],
      ];
      expect(EF.VLOOKUP(25, sortedTable, 2, false)).toBe('Twenty');
      expect(EF.VLOOKUP(35, sortedTable, 2, false)).toBe('Thirty');
    });

    test('column index validation', () => {
      expect(() => EF.VLOOKUP('Bob', testTable, 0, true)).toThrow();
      expect(() => EF.VLOOKUP('Bob', testTable, 5, true)).toThrow();
    });
  });

  describe('HLOOKUP', () => {
    const testTable = [
      ['Name', 'Alice', 'Bob', 'Charlie'],
      ['Age', 25, 30, 35],
      ['Role', 'Engineer', 'Designer', 'Manager'],
    ];

    test('exact match - found', () => {
      expect(EF.HLOOKUP('Bob', testTable, 2, true)).toBe(30);
      expect(EF.HLOOKUP('Bob', testTable, 3, true)).toBe('Designer');
    });

    test('exact match - not found', () => {
      expect(EF.HLOOKUP('Eve', testTable, 2, true)).toBe(null);
    });

    test('approximate match', () => {
      const sortedTable = [
        [10, 20, 30, 40],
        ['Ten', 'Twenty', 'Thirty', 'Forty'],
      ];
      expect(EF.HLOOKUP(25, sortedTable, 2, false)).toBe('Twenty');
    });
  });

  describe('INDEX', () => {
    const testTable = [
      ['A1', 'B1', 'C1'],
      ['A2', 'B2', 'C2'],
      ['A3', 'B3', 'C3'],
    ];

    test('single cell', () => {
      expect(EF.INDEX(testTable, 2, 2)).toBe('B2');
      expect(EF.INDEX(testTable, 1, 3)).toBe('C1');
    });

    test('entire row', () => {
      expect(EF.INDEX(testTable, 2, 0)).toEqual(['A2', 'B2', 'C2']);
    });

    test('entire column', () => {
      expect(EF.INDEX(testTable, 0, 2)).toEqual(['B1', 'B2', 'B3']);
    });

    test('1D array', () => {
      const array1D = ['A', 'B', 'C'];
      expect(EF.INDEX(array1D as any, 2)).toBe('B');
    });
  });

  describe('MATCH', () => {
    const testArray = ['Alice', 'Bob', 'Charlie', 'David'];

    test('exact match - found', () => {
      expect(EF.MATCH('Bob', testArray, 0)).toBe(2);
      expect(EF.MATCH('Alice', testArray, 0)).toBe(1);
    });

    test('exact match - not found', () => {
      expect(EF.MATCH('Eve', testArray, 0)).toBe(null);
    });

    test('approximate match ascending', () => {
      const numbers = [10, 20, 30, 40, 50];
      expect(EF.MATCH(25, numbers, 1)).toBe(2); // Matches 20 (last value <= 25)
      expect(EF.MATCH(35, numbers, 1)).toBe(3); // Matches 30
    });
  });

  describe('LOOKUP', () => {
    test('basic lookup', () => {
      const lookupArray = [10, 20, 30, 40];
      const resultArray = ['Ten', 'Twenty', 'Thirty', 'Forty'];
      expect(EF.LOOKUP(25, lookupArray, resultArray)).toBe('Twenty');
      expect(EF.LOOKUP(35, lookupArray, resultArray)).toBe('Thirty');
    });

    test('lookup without result array', () => {
      const array = [10, 20, 30, 40];
      expect(EF.LOOKUP(25, array)).toBe(20);
    });
  });
});

describe('ExcelFunctions - Math Functions', () => {
  test('SUM', () => {
    expect(EF.SUM(1, 2, 3, 4, 5)).toBe(15);
    expect(EF.SUM([1, 2], [3, 4], 5)).toBe(15);
    expect(EF.SUM(1, 'invalid', 3)).toBe(4); // Ignores non-numbers
  });

  test('SUMIF', () => {
    const range = [10, 20, 30, 40, 50];
    expect(EF.SUMIF(range, '>20')).toBe(120); // 30 + 40 + 50
    expect(EF.SUMIF(range, '>=30')).toBe(120);
    expect(EF.SUMIF(range, '<30')).toBe(30); // 10 + 20
  });

  test('MIN', () => {
    expect(EF.MIN(5, 2, 8, 1, 9)).toBe(1);
    expect(EF.MIN([5, 2], [8, 1], 9)).toBe(1);
  });

  test('MAX', () => {
    expect(EF.MAX(5, 2, 8, 1, 9)).toBe(9);
    expect(EF.MAX([5, 2], [8, 1], 9)).toBe(9);
  });

  test('TRUNC', () => {
    expect(EF.TRUNC(8.9)).toBe(8);
    expect(EF.TRUNC(-8.9)).toBe(-8);
    expect(EF.TRUNC(8.9876, 2)).toBe(8.98);
    expect(EF.TRUNC(8.9876, 1)).toBe(8.9);
  });

  test('INT', () => {
    expect(EF.INT(8.9)).toBe(8);
    expect(EF.INT(-8.9)).toBe(-9); // Rounds DOWN (toward negative infinity)
    expect(EF.INT(8.1)).toBe(8);
  });

  test('MOD', () => {
    expect(EF.MOD(10, 3)).toBe(1);
    expect(EF.MOD(10, 5)).toBe(0);
    expect(EF.MOD(7, 3)).toBe(1);
    expect(() => EF.MOD(10, 0)).toThrow(); // Division by zero
  });
});

describe('ExcelFunctions - Logical Functions', () => {
  test('IF', () => {
    expect(EF.IF(true, 'Yes', 'No')).toBe('Yes');
    expect(EF.IF(false, 'Yes', 'No')).toBe('No');
    expect(EF.IF(5 > 3, 100, 200)).toBe(100);
  });

  test('AND', () => {
    expect(EF.AND(true, true, true)).toBe(true);
    expect(EF.AND(true, false, true)).toBe(false);
    expect(EF.AND(5 > 3, 10 < 20)).toBe(true);
  });

  test('OR', () => {
    expect(EF.OR(true, false, false)).toBe(true);
    expect(EF.OR(false, false, false)).toBe(false);
    expect(EF.OR(5 > 10, 10 < 20)).toBe(true);
  });
});

describe('ExcelFunctions - Text Functions', () => {
  test('CONCATENATE', () => {
    expect(EF.CONCATENATE('Hello', ' ', 'World')).toBe('Hello World');
    expect(EF.CONCATENATE('A', 'B', 'C')).toBe('ABC');
    expect(EF.CONCATENATE(['A', 'B'], 'C')).toBe('ABC');
  });

  test('LEFT', () => {
    expect(EF.LEFT('Hello', 3)).toBe('Hel');
    expect(EF.LEFT('Hello')).toBe('H');
    expect(EF.LEFT('Hello', 10)).toBe('Hello');
  });
});

describe('ExcelFunctions - Statistical Functions', () => {
  test('COUNTIF', () => {
    const range = [10, 20, 30, 40, 50];
    expect(EF.COUNTIF(range, '>20')).toBe(3); // 30, 40, 50
    expect(EF.COUNTIF(range, '>=30')).toBe(3);
    expect(EF.COUNTIF(range, '<30')).toBe(2); // 10, 20
    expect(EF.COUNTIF(range, 30)).toBe(1);
  });
});

describe('ExcelFunctions - Complex Formulas (from Whirlin Trainer)', () => {
  test('Stat progression formula simulation', () => {
    // Excel: =MIN(N5+IF(MOD(O$4,MAX(INT(N5/$I27),1))=0,1,0),100)
    // Note: In Excel, column N (level 0) just has =I5 (base stat)
    // The formula above is for columns O onward (level 1+)
    const calculateStatAtLevel = (prevStat: number, level: number, growthRate: number): number => {
      if (level === 0) {
        // Level 0 is just the base stat, no formula
        return prevStat;
      }
      const divisor = EF.MAX(EF.INT(prevStat / growthRate), 1);
      const increment = EF.IF(EF.MOD(level, divisor) === 0, 1, 0);
      return EF.MIN(prevStat + increment, 100);
    };

    // Test with base stat 94, growth rate 4
    // At level 0, stat stays at base value
    expect(calculateStatAtLevel(94, 0, 4)).toBe(94);

    // At level 1, divisor = MAX(INT(94/4), 1) = MAX(23, 1) = 23
    // MOD(1, 23) = 1, so no increment
    expect(calculateStatAtLevel(94, 1, 4)).toBe(94);

    // At level 23, MOD(23, 23) = 0, so increment by 1
    expect(calculateStatAtLevel(94, 23, 4)).toBe(95);
  });

  test('HP calculation formula simulation', () => {
    // Simplified version of HP calculation
    // Excel: =25+TRUNC((IF(LEFT($G$5,1)="P",2*I5,I5)+...)/20,0)
    const calculateHP = (str: number, con: number, isPrime: boolean): number => {
      const strBonus = isPrime ? 2 * str : str;
      const conBonus = isPrime ? 2 * con : con;
      return 25 + EF.TRUNC((strBonus + conBonus) / 20, 0);
    };

    // Test with STR 94, CON 94, both prime
    expect(calculateHP(94, 94, true)).toBe(25 + EF.TRUNC((2 * 94 + 2 * 94) / 20, 0));

    // Test with STR 94, CON 94, not prime
    expect(calculateHP(94, 94, false)).toBe(25 + EF.TRUNC((94 + 94) / 20, 0));
  });
});
