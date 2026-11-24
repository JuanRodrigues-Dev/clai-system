export type StatusPlanoAcao = 'RASCUNHO' | 'ATIVO' | 'REVISADO';

export interface PlanoAcaoRequest {
  matriculaAluno: string;
  acompanhamentoId?: number;
  semestreVigencia: string;
  diretrizesObjetivos: string;
  acoesPrevistas?: string | null;
  responsaveisSetor?: string | null;
  status: StatusPlanoAcao | string;
}

export interface PlanoAcaoUpdateRequest {
  matriculaAluno?: string;
  acompanhamentoId?: number;
  semestreVigencia: string;
  diretrizesObjetivos: string;
  acoesPrevistas?: string | null;
  responsaveisSetor?: string | null;
  status: StatusPlanoAcao | string;
}

export interface PlanoAcaoResponse {
  id: number;
  acompanhamentoId?: number;
  matriculaAluno: string;
  nomeAluno?: string;
  semestreVigencia: string;
  diretrizesObjetivos: string;
  acoesPrevistas?: string | null;
  responsaveisSetor?: string | null;
  status: StatusPlanoAcao | string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type StatusPei =
  | 'EM_ELABORACAO'
  | 'AGUARDANDO_ASSINATURAS'
  | 'HOMOLOGADO';

export interface PeiRequest {
  matriculaAluno: string;
  acompanhamentoId?: number;
  diagnosticoPedagogico: string;
  recursosTecnologiaAssistiva?: string | null;
  status: StatusPei | string;
}

export interface PeiUpdateRequest {
  matriculaAluno?: string;
  acompanhamentoId?: number;
  diagnosticoPedagogico: string;
  recursosTecnologiaAssistiva?: string | null;
  status: StatusPei | string;
}

export interface PeaRequest {
  disciplinaId: number;
  nomeProfessor: string;
  adaptacoesMetodologicas: string;
  criteriosAvaliacao: string;
  observacoes?: string | null;
}

export interface PeaResponse {
  id: number;
  peiId: number;
  disciplinaId: number;
  disciplinaNome?: string;
  disciplinaCodigo?: string;
  nomeProfessor: string;
  adaptacoesMetodologicas: string;
  criteriosAvaliacao: string;
  observacoes?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface PeiResponse {
  id: number;
  acompanhamentoId?: number;
  matriculaAluno: string;
  nomeAluno?: string;
  diagnosticoPedagogico: string;
  recursosTecnologiaAssistiva?: string | null;
  status: StatusPei | string;
  peas?: PeaResponse[];
  criadoEm?: string;
  atualizadoEm?: string;
}
