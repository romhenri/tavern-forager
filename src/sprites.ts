// Pixel art no formato do cliente dwarf-fortress-api: cada sprite é uma grade 16x16 de chaves de paleta.
// '.' é transparente. Linhas de 8 caracteres são espelhadas em 16 (sprites simétricos).
// Camadas se empilham: as últimas pintam por cima; '.' mantém o que está embaixo, '_' apaga.

export type Grid = (string | null)[][]
type Pal = Record<string, string>
type Layer = string[]

const OUT = '#1b1410'
const BASE: Pal = { k: OUT, w: '#f4ecd8', e: '#ff3b2f', E: '#ffe14a', y: '#e8d8a8', x: '#0d0a08' }

function expand(rows: Layer): string[] {
  return rows.map((r) => (r.length === 8 ? r + [...r].reverse().join('') : r.padEnd(16, '.')))
}

export function compose(layers: Layer[], pal: Pal): Grid {
  const p = { ...BASE, ...pal }
  const grid: Grid = Array.from({ length: 16 }, () => Array(16).fill(null))
  for (const layer of layers) {
    expand(layer).forEach((row, y) => {
      for (let x = 0; x < 16; x++) {
        const ch = row[x]
        if (ch === '.' || ch === undefined) continue
        grid[y][x] = ch === '_' ? null : (p[ch] ?? null)
      }
    })
  }
  return grid
}

const top = (rows: Layer): Layer => [...rows, ...Array(16 - rows.length).fill('........')]

/** SVG nítido, um rect por trecho horizontal de mesma cor. */
export function svg(grid: Grid, size: number, cls = '') {
  let rects = ''
  grid.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const c = row[x]
      let w = 1
      while (c && row[x + w] === c) w++
      if (c) rects += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`
      x += w
    }
  })
  return `<svg class="sprite ${cls}" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`
}

function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)))
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`
}

/** Hash determinístico, semente dos sprites procedurais. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------- anões (do cliente, + expressões)

const BEARD = ['#c43a1a', '#e8a83a', '#5a3a1a', '#2a1a0a', '#bfbfbf', '#f0f0e8', '#8a4a1a']
const SKIN = ['#f0c8a0', '#d8a07a', '#a8704a', '#7a4a2a']
const CLOTH: Record<string, string> = {
  Miner: '#7a6a5a', Brewer: '#b0302a', Farmer: '#5a8a2a', Metalsmith: '#4a4a52', Hammerdwarf: '#7a7f8a', Axedwarf: '#7a7f8a',
}
const MILITARY = new Set(['Hammerdwarf', 'Axedwarf'])
const TOOL: Record<string, Layer> = {
  pick: top(['', '', '', '', '', '', '...........kkk..', '..........kwwwk.', '.............nk.', '.............n..', '.............n..', '.............n..']),
  hammer: top(['', '', '', '', '', '', '', '............kkkk', '............kwwk', '.............nk.', '.............n..', '.............n..']),
  axe: top(['', '', '', '', '', '', '', '.............kk.', '............kwwk', '............kwnk', '.............n..', '.............n..']),
  mug: top(['', '', '', '', '', '', '', '', '', '.............kkk', '.............kyk', '.............kkk']),
}
const TOOL_OF: Record<string, string> = {
  Miner: 'pick', Metalsmith: 'hammer', Hammerdwarf: 'hammer', Axedwarf: 'axe', Brewer: 'mug',
}

const DWARF: Layer = [
  '........',
  '....kkkk',
  '...khhhh',
  '..khhhhh',
  '..khssss',
  '..kssess',
  '..kssssS',
  '..kBbbbb',
  '.kcBbbbb',
  'kscBbbbb',
  'ksckBbbb',
  'kskcBbbb',
  '.kklkBbb',
  '...kcckB',
  '...kddk.',
  '..kddkk.',
]
const HELMET: Layer = top(['....kkkk', '...kmmmm', '..kmMmmm', '..kmmmmm'])

export type Expressao = 'neutro' | 'feliz' | 'bravo' | 'dormindo'
const EXPRESSAO: Record<Expressao, Layer> = {
  neutro: [],
  // olhos fechados em ^
  feliz: top(['', '', '', '', '.....k....k.....', '....ksk..ksk....']),
  // sobrancelhas franzidas e olhos vermelhos
  bravo: top(['', '', '', '', '....kk....kk....', '.....e....e.....']),
  // olhos fechados, um traço
  dormindo: top(['', '', '', '', '', '....kkk..kkk....']),
}

// Partes opcionais para anões com aparência definida (fases bônus).
const SEM_BARBA: Layer = [
  '', '', '', '', '', '', '',
  '.._kssss', // queixo
  '.kccckss', // pescoço
  'kscccccc',
  'ksckcccc',
  'kskccccc',
  '.kklkccc',
  '...kccck',
  '', '',
]
const BARBA_CURTA: Layer = top(['', '', '', '', '', '', '', '..kBbbbb', '.kcckBbb', 'ksccckbb'])
const BIGODE: Layer = top(['', '', '', '', '', '', '', '.....bbb', '.......b', '.......B'])
const CABELO_LONGO: Layer = top(['', '', '', '.khhhhhh', 'khh.....', 'khh.....', 'khh.....', 'khh.....', 'kh......', 'kh......', 'kh......', '.k......'])
const CACHOS: Layer = top(['...k.k.k', '..khkhkh', '.khhhhhh'])
const FRANJA: Layer = top(['', '', '', '', '..khhhhh'])
const OCULOS: Layer = top(['', '', '', '', '....ooo.', '....o.oo', '....ooo.']) // armação prateada, aparece em cabelo escuro

export type Visual = {
  cabelo?: string
  pele?: string
  roupa?: string
  barba?: 'cheia' | 'curta' | 'bigode' | 'nenhuma'
  longo?: boolean
  cachos?: boolean
  franja?: boolean
  oculos?: boolean
}

/** Retrato de anão, sempre igual para o mesmo nome e ofício. `v` fixa partes da aparência. */
export function dwarfSprite(name: string, profession: string, expr: Expressao = 'neutro', v: Visual = {}): Grid {
  const r = rng(hash(name))
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]
  const beard = v.cabelo ?? pick(BEARD)
  const skin = v.pele ?? pick(SKIN)
  const pal: Pal = {
    h: shade(beard, 0.85), b: beard, B: shade(beard, 0.7), s: expr === 'bravo' ? '#d8604a' : skin, S: v.pele ? shade(v.pele, 0.8) : '#c08a6a',
    e: expr === 'bravo' ? '#ff3b2f' : '#1b1410', c: v.roupa ?? CLOTH[profession] ?? '#7a6a5a', l: '#3a2a18', d: '#3a2a18',
    m: '#9aa0aa', M: '#d8dce4',
  }
  const layers = [DWARF]
  if (v.barba && v.barba !== 'cheia') layers.push(SEM_BARBA)
  if (v.barba === 'curta') layers.push(BARBA_CURTA)
  if (v.barba === 'bigode') layers.push(BIGODE)
  if (v.longo) layers.push(CABELO_LONGO)
  if (v.cachos) layers.push(CACHOS)
  if (v.franja) layers.push(FRANJA)
  if (MILITARY.has(profession)) layers.push(HELMET)
  const tool = TOOL_OF[profession]
  if (tool) layers.push(TOOL[tool])
  layers.push(EXPRESSAO[expr])
  if (v.oculos) layers.push(OCULOS)
  return compose(layers, { ...pal, w: '#c8ccd4', y: '#f0d070', n: '#9c6a2f', o: '#d8dce4' })
}

// ---------------------------------------------------------------- balcão: ingredientes e ações

const ICONES: Record<string, Grid> = {
  // Bactris: fruto de palmeira, laranja e espinhoso
  t: compose([[
    '..g....g',
    '...g..gG',
    '....gGgG',
    '......gG',
    '.....kkk',
    '...kkooo',
    '..kooOoo',
    '.kkoOooo',
    '..kooooo',
    '.koooooo',
    '..kroooo',
    '.kkrrooo',
    '..krrroo',
    '...kkrrr',
    '.....kkk',
    '........',
  ]], { g: '#3a8a2a', G: '#6cdc4a', o: '#f08a2a', O: '#ffd08a', r: '#b84a1a' }),
  // Bagas: três frutinhas vermelhas
  b: compose([[
    '.......g',
    '......gg',
    '.....g..',
    '....g...',
    '..kkkk.g',
    '.krwrrkg',
    '.krrrrkg',
    '.kRrrrkk',
    '.kRRrkrw',
    '..kkkkrr',
    '....kRrr',
    '....kRRr',
    '.....kkk',
    '........',
    '........',
    '........',
  ]], { g: '#3a8a2a', r: '#e02a3a', R: '#8a1424' }),
  // Cogumelo luminoso
  g: compose([[
    '........',
    '........',
    '.....kkk',
    '...kkccc',
    '..kccCcc',
    '.kcCcccc',
    '.kcccccc',
    'kccccccc',
    'kkkkkkkk',
    '....kwww',
    '....kwww',
    '....kwww',
    '...kwwww',
    '...kkkkk',
    '........',
    '........',
  ]], { c: '#2fb8c8', C: '#aaffff' }),
  // Cevada negra: espiga escura
  c: compose([[
    '.......k',
    '......kn',
    '.....knN',
    '.....knk',
    '....knNk',
    '.....knk',
    '....knNk',
    '.....knk',
    '....knNk',
    '.....knk',
    '......kg',
    '.......g',
    '.......g',
    '.......g',
    '.......g',
    '........',
  ]], { n: '#5a3a2a', N: '#9a6a3a', g: '#8a7a3a' }),
  // Mel: pote com mel escorrendo
  m: compose([[
    '........',
    '........',
    '....kkkk',
    '...kyyyy',
    '..kkyykk',
    '..kbykbb',
    '.kbbybbb',
    '.kbBkbbb',
    'kbBbbbbb',
    'kbBbbbbb',
    'kbBbbbbb',
    'kbbbbbbb',
    '.kbbbbbb',
    '..kkkkkk',
    '........',
    '........',
  ]], { y: '#ffc23a', b: '#9c6a2f', B: '#d8a060' }),
  // Bater: caneca chacoalhando
  B: compose([[
    '................',
    '..w.........w...',
    '.w..kkkkkkk..w..',
    'w..kwwwwwwwk..w.',
    '...kiiiiiiik....',
    'w..knnNnnnnkkk..',
    '.w.knnNnnnnk.k..',
    '...kiiiiiiik.k..',
    '...knnNnnnnk.k..',
    '...knnNnnnnkkk..',
    '...kiiiiiiik....',
    '....kkkkkkk.....',
    '................',
    '.w..........w...',
    '..w........w....',
    '................',
  ]], { w: '#f4ecd8', n: '#9c6a2f', N: '#c88a4a', i: '#8a8f99' }),
  // Mexer: colher de ferro girando
  M: compose([[
    '............kk..',
    '...........kik..',
    '..........kik...',
    '.........kik....',
    '........kik.....',
    '.......kik......',
    '..w...kik...w...',
    '.w..kkkkk....w..',
    '.w.kIiiik....w..',
    '.w.kiiiik....w..',
    '..w.kkkk....w...',
    '...ww.....ww....',
    '.....wwwww......',
    '................',
    '................',
    '................',
  ]], { i: '#8a8f99', I: '#d8dce4', w: '#c8b890' }),
  // Aquecer: chama da forja
  A: compose([[
    '........',
    '.......k',
    '......kr',
    '.....krr',
    '.....kry',
    '....krry',
    '...krryy',
    '...kryyy',
    '..krryyw',
    '..kryyww',
    '..kryyww',
    '..krryyw',
    '...krryy',
    '....kkrr',
    '......kk',
    '........',
  ]], { r: '#e83a1a', y: '#ffb02a', w: '#fff0a0' }),
  // Fermentar: barril (14 px de largura)
  F: compose([[
    '........',
    '....kkkk',
    '...knnnn',
    '..kiiiii',
    '..knnNnn',
    '.knnnNnn',
    '.kiiiiii',
    '.knnnNnn',
    '.knnnNnn',
    '.kiiiiii',
    '.knnnNnn',
    '..knnNnn',
    '..kiiiii',
    '...knnnn',
    '....kkkk',
    '........',
  ]], { n: '#7a4a22', N: '#a86a32', i: '#5a5a62' }),
  // Violeta do cofre: flor roxa
  r: compose([[
    '................',
    '.......kk.......',
    '......kPPk......',
    '..kk..kpPk..kk..',
    '.kPPk.kppk.kPPk.',
    '.kpPPkkyykkPPpk.',
    '..kpppkyYkpppk..',
    '...kkkkyykkkk...',
    '.....kppppk.....',
    '....kpPppPpk....',
    '....kppkkppk....',
    '.....kkgkkk.....',
    '...kk..kgk.kk...',
    '..kgGk.kgkkGgk..',
    '...kggkkgkggk...',
    '....kkkgggkkk...',
  ]], { p: '#9a4ad8', P: '#d8a0ff', y: '#ffd23b', Y: '#fff6b0', g: '#2f7a3a', G: '#6cdc4a' }),
  // Noz: pequena, chapéu xadrez e casca marrom
  z: compose([[
    '................',
    '................',
    '................',
    '................',
    '................',
    '.......k........',
    '.....kkkkk......',
    '....kCcCcCk.....',
    '....kkkkkkk.....',
    '.....kNnnk......',
    '.....kNnBk......',
    '......knk.......',
    '.......k........',
    '................',
    '................',
    '................',
  ]], { c: '#7a5a2a', C: '#a8803a', n: '#a8682a', N: '#d8a060', B: '#7a4418' }),
  // Maçã: vermelha com folhinha
  a: compose([[
    '................',
    '........k.......',
    '.......kgk......',
    '....kkkkgkkk....',
    '...krrWrkrrrk...',
    '..krWWrrrrrrrk..',
    '..krWrrrrrrrrk..',
    '..krrrrrrrrrRk..',
    '..krrrrrrrrrRk..',
    '..krrrrrrrrRRk..',
    '...krrrrrrRRk...',
    '....krrkkrRk....',
    '.....kk..kk.....',
    '................',
    '................',
    '................',
  ]], { r: '#e02a3a', R: '#a01424', W: '#ffb0b8', g: '#6cdc4a' }),
  // Amanita: chapéu vermelho de pintas brancas
  e: compose([[
    '................',
    '................',
    '.....kkkkkk.....',
    '...kkrrwrrrkk...',
    '..krrrrrrrwrrk..',
    '.krwrrrrrrrrrrk.',
    '.krrrrwrrrrwrrk.',
    '.kkkkkkkkkkkkkk.',
    '.....kwwwwk.....',
    '.....kwwWwk.....',
    '....kkwwwwkk....',
    '.....kwwwwk.....',
    '.....kwwwwk.....',
    '....kwwwwwwk....',
    '....kkkkkkkk....',
    '................',
  ]], { r: '#d8281a', w: '#f4ecd8', W: '#ffffff' }),
  // Carvão: pedra preta do veio da mina
  k: compose([[
    '................',
    '................',
    '................',
    '.....kkkk.......',
    '...kkcCcckk.....',
    '..kcCccccckk....',
    '.kcccccCccck....',
    '.kcCcccccccckk..',
    '.kccccccCcccck..',
    '..kcccCcccccck..',
    '..kcccccccccck..',
    '...kkccccccck...',
    '.....kkkkkkk....',
    '................',
    '................',
    '................',
  ]], { c: '#2a2a2e', C: '#6a6a72' }),
  // Ovo das galinhas, pequeno
  o: compose([[
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.......kk.......',
    '......kwWk......',
    '.....kwWwwk.....',
    '.....kwwwwk.....',
    '.....kwwwek.....',
    '......kwek......',
    '.......kk.......',
    '................',
    '................',
    '................',
  ]], { w: '#f4ecd8', W: '#ffffff', e: '#c8b898' }),
  // Lírio-estrela: flor rara azul com brilhos
  R: compose([[
    '..s.........s...',
    '.......kk.......',
    '......kPPk...s..',
    '..kk..kpPk..kk..',
    '.kPPk.kppk.kPPk.',
    '.kpPPkkyykkPPpk.',
    '..kpppkyYkpppk..',
    's..kkkkyykkkk...',
    '.....kppppk...s.',
    '....kpPppPpk....',
    '....kppkkppk....',
    '.....kkgkkk.....',
    '...kk..kgk.kk...',
    '..kgGk.kgkkGgk..',
    '...kggkkgkggk...',
    '....kkkgggkkk...',
  ]], { p: '#3ac8e6', P: '#d8fbff', y: '#ffffff', Y: '#fff6b0', g: '#2f7a3a', G: '#6cdc4a', s: '#fff6b0' }),
  // Diamante: gema azul lapidada, escondida num barril
  d: compose([[
    '................',
    '................',
    '....kkkkkkkk....',
    '...kWWkAAkWWk...',
    '..kWAAkAAkAAWk..',
    '.kkkkkkkkkkkkkk.',
    '..kAAAcAAcAAAk..',
    '...kAAcAAcAAk...',
    '....kAcAAcAk....',
    '.....kcAAck.....',
    '......kcck......',
    '.......kk.......',
    '................',
    '................',
    '................',
    '................',
  ]], { A: '#5ce6e6', W: '#e8ffff', c: '#2a9ab0' }),
}
export const icone = (s: string) => ICONES[s]

export const BARRIL = ICONES.F

// ---------------------------------------------------------------- pepita de ouro (a moeda da taverna)

export const PEPITA = compose([[
  '................',
  '................',
  '................',
  '.....kkkk.......',
  '....kyYyyk......',
  '...kyYYyyykk....',
  '..kyyYyyyyyyk...',
  '..kyyyyyyyoyyk..',
  '.kyyyyyyyooyyk..',
  '.kyyoyyyyyyyyk..',
  '.kyooyyyyyyyk...',
  '..kyyyyyyoook...',
  '...kkooooookk...',
  '.....kkkkkk.....',
  '................',
  '................',
]], { y: '#f0c040', Y: '#fff0a0', o: '#a87418' })
