import {
  assemble,
  fillTemplate,
  indefiniteArticle,
  normalizePrompt,
  capitalizeFirst,
  oxfordJoin,
  templateSlots
} from '../assembly';

describe('indefiniteArticle', () => {
  it('uses "a" before consonant sounds', () => {
    expect(indefiniteArticle('dragon')).toBe('a');
    expect(indefiniteArticle('warrior')).toBe('a');
  });
  it('uses "an" before vowel sounds', () => {
    expect(indefiniteArticle('orange')).toBe('an');
    expect(indefiniteArticle('elf')).toBe('an');
  });
  it('handles sound/spelling exceptions', () => {
    expect(indefiniteArticle('hour')).toBe('an');
    expect(indefiniteArticle('unicorn')).toBe('a');
    expect(indefiniteArticle('user')).toBe('a');
  });
  it('is safe on empty input', () => {
    expect(indefiniteArticle('')).toBe('a');
  });
});

describe('normalizePrompt', () => {
  it('collapses whitespace', () => {
    expect(normalizePrompt('a   fierce    knight')).toBe('a fierce knight');
  });
  it('fixes spacing before punctuation', () => {
    expect(normalizePrompt('a knight , brave')).toBe('a knight, brave');
  });
  it('cleans up artifacts from an empty middle slot', () => {
    // "a fierce knight, , brave" — empty slot left a stray comma
    expect(normalizePrompt('a fierce knight, , brave')).toBe(
      'a fierce knight, brave'
    );
  });
  it('drops leading punctuation from an empty first slot', () => {
    expect(normalizePrompt(', brave knight')).toBe('brave knight');
  });
  it('ensures a space after a comma', () => {
    expect(normalizePrompt('red,green,blue')).toBe('red, green, blue');
  });
});

describe('capitalizeFirst', () => {
  it('capitalizes the first letter only', () => {
    expect(capitalizeFirst('a fierce knight')).toBe('A fierce knight');
  });
  it('skips leading non-letters', () => {
    expect(capitalizeFirst('"hello"')).toBe('"Hello"');
  });
});

describe('oxfordJoin', () => {
  it('handles 0, 1, 2, and 3+ items', () => {
    expect(oxfordJoin([])).toBe('');
    expect(oxfordJoin(['red'])).toBe('red');
    expect(oxfordJoin(['red', 'green'])).toBe('red and green');
    expect(oxfordJoin(['red', 'green', 'blue'])).toBe('red, green, and blue');
  });
});

describe('assemble', () => {
  it('defaults to space join', () => {
    expect(assemble(['a', 'fierce', 'knight'])).toBe('a fierce knight');
  });
  it('drops empty parts so prompts never read with gaps', () => {
    expect(assemble(['a', '', 'knight'])).toBe('a knight');
  });
  it('comma style', () => {
    expect(assemble(['red', 'green', 'blue'], { style: 'comma' })).toBe(
      'red, green, blue'
    );
  });
  it('and style produces a readable list', () => {
    expect(assemble(['red', 'green', 'blue'], { style: 'and' })).toBe(
      'red, green, and blue'
    );
  });
  it('sentence style capitalizes and terminates', () => {
    expect(
      assemble(['a', 'fierce', 'knight'], { style: 'sentence' })
    ).toBe('A fierce knight.');
  });
  it('sentence style does not double terminal punctuation', () => {
    expect(assemble(['hello world!'], { style: 'sentence' })).toBe(
      'Hello world!'
    );
  });
  it('preserves legacy separator behavior verbatim', () => {
    expect(
      assemble(['a', 'b'], { style: 'separator', separator: ' | ' })
    ).toBe('a | b');
  });
  it('dedupe removes case-insensitive duplicates', () => {
    expect(assemble(['Red', 'red', 'blue'], { dedupe: true })).toBe('Red blue');
  });
  it('returns empty string for all-empty input', () => {
    expect(assemble(['', '  ', null])).toBe('');
  });
});

describe('fillTemplate', () => {
  it('fills slots and reads as prose', () => {
    expect(
      fillTemplate('a {age} {profession} wearing {outfit}', {
        age: 'young',
        profession: 'warrior',
        outfit: 'leather armor'
      })
    ).toBe('A young warrior wearing leather armor');
  });
  it('gracefully handles a missing slot without leaving gaps', () => {
    expect(
      fillTemplate('a {age} {profession} wearing {outfit}', {
        age: '',
        profession: 'warrior',
        outfit: 'leather armor'
      })
    ).toBe('A warrior wearing leather armor');
  });
  it('cleans punctuation when a slot in a list is empty', () => {
    expect(
      fillTemplate('a knight, {mood}, ready', { mood: '' })
    ).toBe('A knight, ready');
  });
  it('can add terminal punctuation', () => {
    expect(
      fillTemplate('a {x} knight', { x: 'brave' }, { terminate: true })
    ).toBe('A brave knight.');
  });
  it('can skip capitalization', () => {
    expect(
      fillTemplate('{x} knight', { x: 'brave' }, { capitalize: false })
    ).toBe('brave knight');
  });
});

describe('templateSlots', () => {
  it('returns distinct slot names in order', () => {
    expect(templateSlots('a {age} {profession} with {age} eyes')).toEqual([
      'age',
      'profession'
    ]);
  });
  it('returns empty for no slots', () => {
    expect(templateSlots('a plain prompt')).toEqual([]);
  });
});
