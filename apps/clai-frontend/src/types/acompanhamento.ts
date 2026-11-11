export type StatusAcompanhamento =
  | 'EM_ANDAMENTO'
  | 'PAUSADO'
  | 'ALTA'
  | 'CONCLUIDO'
  | 'EVASAO';

export interface AcompanhamentoRequest {
  matriculaAluno: string;
  dataInicio: string;
  status: StatusAcompanhamento | string;
  frequenciaMonitoramento: string;
  profissionaisResponsaveis: string;
  objetivosGerais: string;
  observacoesEvolucao?: string | null;
}

export interface AcompanhamentoResponse extends AcompanhamentoRequest {
  id: number;
  nomeAluno: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AtendimentoRequest {
  matriculaAluno: string;
  dataAtendimento: string;
  horarioInicio: string;
  horarioFim: string;
  modalidadeLocal: string;
  tipo: string;
  profissionais: string;
  participantes: string;
  demanda: string;
  descricao: string;
  resultado: string;
  encaminhamentos: string;
  observacoes?: string | null;
  proximoAtendimento?: string | null;
}

export interface AtendimentoResponse extends AtendimentoRequest {
  id: number;
  acompanhamentoId: number;
  nomeAluno: string;
  criadoEm: string;
}
