import { normalize } from '../normalize';

describe('normalize', () => {
  it('should convert text to lowercase', () => {
    expect(normalize('SPORTS')).toBe('sports');
    expect(normalize('Food & Drink')).toBe('food and drink');
  });

  it('should replace & with "and"', () => {
    expect(normalize('Food & Drink')).toBe('food and drink');
    expect(normalize('Arts & Entertainment')).toBe('arts and entertainment');
  });

  it('should replace hyphens with spaces', () => {
    expect(normalize('real-time')).toBe('real time');
    expect(normalize('self-help')).toBe('self help');
  });

  it('should remove punctuation', () => {
    expect(normalize('Hello, world!')).toBe('hello world');
    expect(normalize('What?')).toBe('what');
  });

  it('should normalize whitespace', () => {
    expect(normalize('too   many    spaces')).toBe('too many spaces');
    expect(normalize('  trim  me  ')).toBe('trim me');
  });

  it('should handle empty strings', () => {
    expect(normalize('')).toBe('');
    expect(normalize('   ')).toBe('');
  });

  it('should handle unicode normalization', () => {
    expect(normalize('café')).toBe('cafe');
  });

  it('should preserve allowed characters', () => {
    expect(normalize('web/mobile')).toBe('web/mobile');
    expect(normalize('C++')).toBe('c++');
  });
});

