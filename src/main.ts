import './style.css'
import { HENRIDU, retrato } from './anoes.ts'
import { INGREDIENTES, modoLivre } from './livre.ts'
import { enquadra } from './tela.ts'
import { BARRIL, icone, svg } from './sprites.ts'

const palco = document.querySelector<HTMLElement>('#palco')!

const toque = matchMedia('(pointer: coarse)')
function escala() {
  const { escala, giro } = enquadra(innerWidth, innerHeight, toque.matches)
  document.documentElement.style.setProperty('--escala', String(escala))
  document.documentElement.style.setProperty('--giro', giro ? '90deg' : '0deg')
}
addEventListener('resize', escala)
escala()

const ingredientes = () => INGREDIENTES.map((g) => svg(icone(g.s), 24)).join('')

function titulo() {
  palco.className = 'tela-titulo'
  palco.innerHTML = `
    <div class="titulo">
      <div class="logo">${svg(BARRIL, 48)}<h1>Tavern<br><b>Forager</b></h1>${svg(BARRIL, 48)}</div>
      ${svg(retrato(HENRIDU), 48)}
      <p class="muted">${HENRIDU.nome} must gather ${INGREDIENTES.length} ingredients around the fortress<br>and bring them back to the tavern.</p>
      <div class="linha">${ingredientes()}</div>
      <button class="btn btn-gold" data-ir="jogar">Play</button>
      <p class="muted small">Move: arrows or WASD · Interact: E or Space · Map: M</p>
    </div>`
}

function vitoria(segundos: number) {
  palco.className = 'tela-titulo'
  palco.innerHTML = `
    <div class="titulo">
      <h1>You found <b>everything!</b></h1>
      <div class="linha">${ingredientes()}</div>
      <p>Time: <b class="ouro">${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}</b></p>
      <button class="btn btn-gold" data-ir="jogar">Play again</button>
    </div>`
  palco.querySelector<HTMLElement>('button')!.focus()
}

const TELAS: Record<string, () => void> = { titulo, jogar: () => modoLivre(palco, vitoria) }

palco.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-ir]')
  if (el) TELAS[el.dataset.ir!]?.()
})

titulo()
