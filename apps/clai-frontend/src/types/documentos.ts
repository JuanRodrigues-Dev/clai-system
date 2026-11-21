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
