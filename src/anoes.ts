import { dwarfSprite, type Visual } from './sprites.ts'

export type Anao = {
  id: string
  nome: string
  /** Ofício do anão no cliente dwarf-fortress-api: define roupa e ferramenta do sprite. */
  oficio: string
  /** Aparência fixa; sem ela o sprite sai do hash do nome. */
  visual?: Visual
}

/** O jogador: anão novo na fortaleza, ninguém o conhece ainda. */
export const HENRIDO: Anao = { id: 'henrido', nome: 'Henrido the Rookie', oficio: 'Forager', visual: { cabelo: '#4a2a14', pele: '#f0c8a0', barba: 'curta', roupa: '#3a6a8a' } }

/** Os anões da Taverna do Autômato, agora só moradores da fortaleza. */
export const ANOES: Anao[] = [
  { id: 'hidromel', nome: 'Borin Ironbeard', oficio: 'Miner' },
  { id: 'cerveja', nome: 'Dagna Redhammer', oficio: 'Hammerdwarf' },
  { id: 'grogue', nome: 'Thrain the Grumpy', oficio: 'Metalsmith' },
  { id: 'licor', nome: 'Gimra Stonefoot', oficio: 'Farmer' },
  { id: 'furia', nome: 'Urist Forgelove', oficio: 'Brewer' },
  { id: 'contra', nome: 'Nali the Contrarian', oficio: 'Axedwarf' },
  { id: 'teclados', nome: 'Gabi of the Keys', oficio: 'Mechanic', visual: { cabelo: '#f0d060', barba: 'nenhuma', longo: true, roupa: '#6a3a9a' } },
  { id: 'nobre', nome: 'Lari the Noble', oficio: 'Noble', visual: { cabelo: '#5a3a1a', pele: '#fbe6d4', barba: 'nenhuma', longo: true, franja: true, roupa: '#b0242a' } },
  { id: 'trapacas', nome: 'Arthur the Trickster', oficio: 'Trapaceiro', visual: { cabelo: '#3a3030', barba: 'cheia', oculos: true, roupa: '#2a4a3a' } },
  { id: 'lampadas', nome: 'Rita of the Lamps', oficio: 'Lamplighter', visual: { cabelo: '#3a3030', pele: '#fbe6d4', barba: 'nenhuma', longo: true, roupa: '#b07a1a' } },
  { id: 'moderado', nome: 'Barios', oficio: 'Trapaceiro', visual: { cabelo: '#3a3030', barba: 'cheia', oculos: true, roupa: '#6a2a4a' } },
  { id: 'comprido', nome: 'Rômulo the Tall', oficio: 'Farmer', visual: { cabelo: '#6a4224', barba: 'bigode' } },
  { id: 'mari', nome: 'Mari the Seamstress', oficio: 'Gardener', visual: { cabelo: '#c8501a', pele: '#a8704a', barba: 'nenhuma', longo: true, cachos: true, roupa: '#3a8a6a' } },
  { id: 'aquecido', nome: 'Sergio Whiterat', oficio: 'Doctor', visual: { pele: '#fbe6d4', barba: 'nenhuma', roupa: '#e8e8e0' } },
  { id: 'pontes', nome: 'Mariana the Bridgebuilder', oficio: 'Engineer', visual: { cabelo: '#a87040', pele: '#fbe6d4', barba: 'nenhuma', longo: true, roupa: '#2a5a9a' } },
  { id: 'papagaios', nome: 'Gui of the Parrots', oficio: 'Animal Trainer', visual: { cabelo: '#2a2020', pele: '#5a3420', barba: 'nenhuma', roupa: '#2a9a4a' } },
  { id: 'scarlett', nome: 'Scarlett', oficio: 'Dancer', visual: { cabelo: '#d8281a', pele: '#f2d0b0', barba: 'nenhuma', longo: true, roupa: '#8a1424' } },
  { id: 'formigas', nome: 'The Ant Master', oficio: 'Mestre', visual: { cabelo: '#f0f0e8', pele: '#f0c8a0', barba: 'curta', roupa: '#7a6a5a' } },
]

export const retrato = (a: Anao) => dwarfSprite(a.nome, a.oficio, 'neutro', a.visual)
