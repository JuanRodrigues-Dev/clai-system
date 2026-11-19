import { http } from '../../api/http';
import type {
  AtendimentoRequest,
  AtendimentoResponse,
} from '../../types/acompanhamento';

export const atendimentoService = {
  async listarPorMatricula(matricula: string): Promise<AtendimentoResponse[]> {
    const response = await http.get<AtendimentoResponse[]>(
      `/atendimentos/aluno/${encodeURIComponent(matricula)}`,
    );
    return response.data;
  },

  async registrar(dados: AtendimentoRequest): Promise<AtendimentoResponse> {
    const response = await http.post<AtendimentoResponse>('/atendimentos', dados);
    return response.data;
  },

  async atualizar(
    id: number,
    dados: AtendimentoRequest,
  ): Promise<AtendimentoResponse> {
    const response = await http.put<AtendimentoResponse>(
      `/atendimentos/${id}`,
      dados,
    );
    return response.data;
  },
};
