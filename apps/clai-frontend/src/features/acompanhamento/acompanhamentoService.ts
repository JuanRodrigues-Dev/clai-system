import { http } from '../../api/http';
import type {
  AcompanhamentoRequest,
  AcompanhamentoResponse,
} from '../../types/acompanhamento';

export const acompanhamentoService = {
  async buscarPorMatricula(matricula: string): Promise<AcompanhamentoResponse | null> {
    try {
      const response = await http.get<AcompanhamentoResponse>(
        `/acompanhamentos/aluno/${encodeURIComponent(matricula)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return null;
      }
      throw err;
    }
  },

  async iniciar(dados: AcompanhamentoRequest): Promise<AcompanhamentoResponse> {
    const response = await http.post<AcompanhamentoResponse>('/acompanhamentos', dados);
    return response.data;
  },

  async atualizar(
    id: number,
    dados: AcompanhamentoRequest,
  ): Promise<AcompanhamentoResponse> {
    const response = await http.put<AcompanhamentoResponse>(
      `/acompanhamentos/${id}`,
      dados,
    );
    return response.data;
  },
};
