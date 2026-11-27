import { http } from '../../api/http';
import type {
  AcompanhamentoRequest,
  AcompanhamentoResponse,
} from '../../types/acompanhamento';

interface BackendAcompanhamentoResponse {
  id: number;
  matriculaAluno: string;
  nomeAluno: string;
  dataInicio: string;
  status: string;
  frequencia?: string;
  frequenciaMonitoramento?: string;
  profissionaisResponsaveis: string;
  objetivos?: string;
  objetivosGerais?: string;
  observacoes?: string | null;
  observacoesEvolucao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

function normalizarAcompanhamento(
  raw: BackendAcompanhamentoResponse,
): AcompanhamentoResponse {
  return {
    id: raw.id,
    matriculaAluno: raw.matriculaAluno,
    nomeAluno: raw.nomeAluno,
    dataInicio: raw.dataInicio,
    status: raw.status,
    frequenciaMonitoramento: raw.frequenciaMonitoramento ?? raw.frequencia ?? '',
    profissionaisResponsaveis: raw.profissionaisResponsaveis ?? '',
    objetivosGerais: raw.objetivosGerais ?? raw.objetivos ?? '',
    observacoesEvolucao: raw.observacoesEvolucao ?? raw.observacoes ?? '',
    criadoEm: raw.criadoEm,
    atualizadoEm: raw.atualizadoEm,
  };
}

function paraPayloadBackend(dados: AcompanhamentoRequest) {
  return {
    matriculaAluno: dados.matriculaAluno,
    dataInicio: dados.dataInicio,
    status: dados.status,
    frequencia: dados.frequenciaMonitoramento,
    frequenciaMonitoramento: dados.frequenciaMonitoramento,
    profissionaisResponsaveis: dados.profissionaisResponsaveis,
    objetivos: dados.objetivosGerais,
    objetivosGerais: dados.objetivosGerais,
    observacoes: dados.observacoesEvolucao?.trim() || null,
    observacoesEvolucao: dados.observacoesEvolucao?.trim() || null,
  };
}

export const acompanhamentoService = {
  async buscarPorMatricula(matricula: string): Promise<AcompanhamentoResponse | null> {
    try {
      const response = await http.get<BackendAcompanhamentoResponse>(
        `/acompanhamentos/aluno/${encodeURIComponent(matricula)}`,
      );
      return normalizarAcompanhamento(response.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return null;
      }
      throw err;
    }
  },

  async iniciar(dados: AcompanhamentoRequest): Promise<AcompanhamentoResponse> {
    const response = await http.post<BackendAcompanhamentoResponse>(
      '/acompanhamentos',
      paraPayloadBackend(dados),
    );
    return normalizarAcompanhamento(response.data);
  },

  async atualizar(
    id: number,
    dados: AcompanhamentoRequest,
  ): Promise<AcompanhamentoResponse> {
    const response = await http.put<BackendAcompanhamentoResponse>(
      `/acompanhamentos/${id}`,
      paraPayloadBackend(dados),
    );
    return normalizarAcompanhamento(response.data);
  },
};
