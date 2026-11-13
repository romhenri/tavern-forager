import { expect, it } from 'vitest'
import { ANOES } from './anoes.ts'
import { EXTRAS, FALAS, FERRAMENTAS, INGREDIENTES, INICIO, LOCAL, MAPA, andavel, naTaverna, venceu } from './livre.ts'

const lugares = [
  ...ANOES.map((a) => LOCAL[a.id]),
  ...EXTRAS.filter((e) => !('preso' in e) && !('dorme' in e)).flatMap((e) => Array.from({ length: e.s * e.s }, (_, k): [number, number] => [e.x + (k % e.s), e.y + Math.floor(k / e.s)])),
]
// BFS desviando dos outros anões, como no jogo
const ocupado = new Set(lugares.map(String))
const visto = new Set([String(INICIO)])
const fila = [INICIO]
for (const [x, y] of fila)
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const p: [number, number] = [x + dx, y + dy]
    if (andavel(...p) && !ocupado.has(String(p)) && !visto.has(String(p))) visto.add(String(p)), fila.push(p)
  }
const alcanca = ([x, y]: number[], vistos = visto) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => vistos.has(String([x + dx, y + dy])))
// a mesma busca, abrindo o que dá para abrir no jogo: parede cavada (pá), grades (chave) e porteiras
const abrindo = new Set([String(INICIO)])
const fila2 = [INICIO]
for (const [x, y] of fila2)
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const p: [number, number] = [x + dx, y + dy]
    if ((andavel(...p) || 'çíìã'.includes(MAPA[p[1]][p[0]])) && !ocupado.has(String(p)) && !abrindo.has(String(p))) abrindo.add(String(p)), fila2.push(p)
  }

it('todo anão está num piso livre, alcançável a partir da taverna', () => {
  expect(MAPA.every((l) => l.length === MAPA[0].length)).toBe(true)
  lugares.forEach(([x, y]) => expect(andavel(x, y)).toBe(true))
  // bichos (P, G) ficam presos nos cercados: a taverna não chega neles
  MAPA.forEach((l, y) => [...l].forEach((ch, x) => 'PGh'.includes(ch) && expect(visto.has(String([x, y]))).toBe(false)))
  lugares.forEach((p) => expect(alcanca(p)).toBe(true))
  for (const a of ANOES) expect(FALAS[a.id], a.id).toBeTruthy()
})

it('cada ingrediente dá para pegar, e fora da taverna', () => {
  for (const g of INGREDIENTES) {
    expect(alcanca([g.x, g.y], abrindo), g.nome).toBe(true)
    expect(naTaverna(g.x, g.y), g.nome).toBe(false)
    if (g.colmeia) expect(MAPA[g.y][g.x]).toBe('i')
    else if (g.arvore) expect(MAPA[g.y][g.x]).toBe('ä')
    else if (g.minerio) expect(MAPA[g.y][g.x]).toBe(g.minerio)
    else if (g.tile) expect(MAPA[g.y][g.x]).toBe(g.tile)
    else expect(andavel(g.x, g.y) && !ocupado.has(String([g.x, g.y])), g.nome).toBe(true)
  }
})

it('cada ferramenta está num piso livre e alcançável', () => {
  for (const f of FERRAMENTAS) expect(andavel(f.x, f.y) && !ocupado.has(String([f.x, f.y])) && alcanca([f.x, f.y]), f.nome).toBe(true)
})

it('só vence com todos os ingredientes, de volta na taverna', () => {
  const todos = new Set(INGREDIENTES.map((g) => g.s))
  expect(venceu(todos, ...INICIO)).toBe(true)
  expect(venceu(todos, 6, 44)).toBe(false)
  expect(venceu(new Set([...todos].slice(1)), ...INICIO)).toBe(false)
})
