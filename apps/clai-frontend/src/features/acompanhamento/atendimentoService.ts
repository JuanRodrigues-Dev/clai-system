import { http } from '../../api/http';
import type {
  AtendimentoRequest,
  AtendimentoResponse,
} from '../../types/acompanhamento';

interface BackendAtendimentoResponse {
  id: number;
  acompanhamentoId: number;
  matriculaAluno: string;
  nomeAluno: string;
  dataAtendimento: string;
  horaInicio?: string;
  horarioInicio?: string;
  horaFim?: string;
  horarioFim?: string;
  modalidadeLocal?: string;
  tipo?: string;
  profissionais?: string;
  participantes?: string;
  demanda?: string;
  descricao?: string;
  resultado?: string;
  encaminhamentos?: string;
  observacoes?: string | null;
  proximoAtendimento?: string | null;
  criadoEm: string;
}

function normalizarAtendimento(raw: BackendAtendimentoResponse): AtendimentoResponse {
  return {
    id: raw.id,
    acompanhamentoId: raw.acompanhamentoId,
    matriculaAluno: raw.matriculaAluno,
    nomeAluno: raw.nomeAluno,
    dataAtendimento: raw.dataAtendimento,
    horarioInicio: (raw.horarioInicio ?? raw.horaInicio ?? '').slice(0, 5),
    horarioFim: (raw.horarioFim ?? raw.horaFim ?? '').slice(0, 5),
    modalidadeLocal: raw.modalidadeLocal ?? '',
    tipo: raw.tipo ?? '',
    profissionais: raw.profissionais ?? '',
    participantes: raw.participantes ?? '',
    demanda: raw.demanda ?? '',
    descricao: raw.descricao ?? '',
    resultado: raw.resultado ?? '',
    encaminhamentos: raw.encaminhamentos ?? '',
    observacoes: raw.observacoes ?? '',
    proximoAtendimento: raw.proximoAtendimento ?? '',
    criadoEm: raw.criadoEm,
  };
}

function paraPayloadBackend(dados: AtendimentoRequest) {
  return {
    matriculaAluno: dados.matriculaAluno,
    dataAtendimento: dados.dataAtendimento,
    horaInicio: dados.horarioInicio,
    horarioInicio: dados.horarioInicio,
    horaFim: dados.horarioFim,
    horarioFim: dados.horarioFim,
    modalidadeLocal: dados.modalidadeLocal,
    tipo: dados.tipo,
    profissionais: dados.profissionais,
    participantes: dados.participantes,
    demanda: dados.demanda,
    descricao: dados.descricao,
    resultado: dados.resultado,
    encaminhamentos: dados.encaminhamentos,
    observacoes: dados.observacoes?.trim() || null,
    proximoAtendimento: dados.proximoAtendimento?.trim() || null,
  };
}

export const atendimentoService = {
  async listarPorMatricula(matricula: string): Promise<AtendimentoResponse[]> {
    try {
      const response = await http.get<BackendAtendimentoResponse[]>(
        `/atendimentos/aluno/${encodeURIComponent(matricula)}`,
      );
      return (response.data ?? []).map(normalizarAtendimento);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return [];
      }
      throw err;
    }
  },

  async registrar(dados: AtendimentoRequest): Promise<AtendimentoResponse> {
    const response = await http.post<BackendAtendimentoResponse>(
      '/atendimentos',
      paraPayloadBackend(dados),
    );
    return normalizarAtendimento(response.data);
  },

  async atualizar(
    id: number,
    dados: AtendimentoRequest,
  ): Promise<AtendimentoResponse> {
    const response = await http.put<BackendAtendimentoResponse>(
      `/atendimentos/${id}`,
      paraPayloadBackend(dados),
    );
    return normalizarAtendimento(response.data);
  },
};
