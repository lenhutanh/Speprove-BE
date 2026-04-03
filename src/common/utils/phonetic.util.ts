const ARPABET_TO_IPA: Record<string, string> = {
  aa: 'ɑ',
  ae: 'æ',
  ah: 'ʌ',
  ao: 'ɔ',
  aw: 'aʊ',
  ax: 'ə',
  ay: 'aɪ',
  eh: 'ɛ',
  er: 'ɝ',
  ey: 'eɪ',
  ih: 'ɪ',
  iy: 'i',
  ow: 'oʊ',
  oy: 'ɔɪ',
  uh: 'ʊ',
  uw: 'u',
  b: 'b',
  ch: 'tʃ',
  d: 'd',
  dh: 'ð',
  f: 'f',
  g: 'ɡ',
  hh: 'h',
  jh: 'dʒ',
  k: 'k',
  l: 'l',
  m: 'm',
  n: 'n',
  ng: 'ŋ',
  p: 'p',
  r: 'r',
  s: 's',
  sh: 'ʃ',
  t: 't',
  th: 'θ',
  v: 'v',
  w: 'w',
  y: 'j',
  z: 'z',
  zh: 'ʒ'
}

export const toIpa = (arpabetStr: string): string => {
  return arpabetStr
    .split(' ')
    .map((symbol) => ARPABET_TO_IPA[symbol.toLowerCase()] || symbol)
    .join('')
}
