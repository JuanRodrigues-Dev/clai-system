export interface EstudoDeCasoRequest {
  matriculaAluno: string;
  dataRealizacao: string;
  periodoLetivo: string;
  periodoIngresso: string;
  participantes: string;
  nomeResponsavel?: string | null;
  parentescoResponsavel?: string | null;
  telefoneResponsavel?: string | null;
  emailResponsavel?: string | null;
  possuiComorbidade: boolean;
  quaisComorbidades?: string | null;
  usaMedicacaoContinua: boolean;
  quaisMedicacoes?: string | null;
  frequentaServicosApoio: boolean;
  quaisServicosApoio?: string | null;
  apresentouDocumentosComprobatorios: boolean;
  quaisDocumentosComprobatorios?: string | null;
  identificacaoNecessidadesEspecificas: string;
  avancosDificuldadesPotencialidades: string;
  principaisDemandasIdentificadas: string;
  propostasIniciaisIntervencao: string;
  necessitaAcompanhamentoContinuo: boolean;
  necessitaAdaptacaoCurricular: boolean;
}

export interface EstudoDeCasoResponse extends EstudoDeCasoRequest {
  id: number;
  nomeAluno: string;
  cursoAluno: string;
  criadoEm: string;
  atualizadoEm: string;
}
