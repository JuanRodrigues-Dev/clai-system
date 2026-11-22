import { http } from '../../api/http';
import type {
  PlanoAcaoRequest,
  PlanoAcaoResponse,
  PlanoAcaoUpdateRequest,
} from '../../types/documentos';

export const planoAcaoService = {
  async buscarPlanoPorMatricula(matricula: string): Promise<PlanoAcaoResponse | null> {
    try {
      const response = await http.get<PlanoAcaoResponse | PlanoAcaoResponse[]>(
        `/planos-acao/aluno/${encodeURIComponent(matricula)}`,
      );
      if (Array.isArray(response.data)) {
        return response.data[0] ?? null;
      }
      return response.data ?? null;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return null;
      }
      throw err;
    }
  },

  async criarPlanoAcao(dados: PlanoAcaoRequest): Promise<PlanoAcaoResponse> {
    const response = await http.post<PlanoAcaoResponse>('/planos-acao', dados);
    return response.data;
  },

  async atualizarPlanoAcao(
    id: number,
    dados: PlanoAcaoUpdateRequest,
  ): Promise<PlanoAcaoResponse> {
    const response = await http.put<PlanoAcaoResponse>(`/planos-acao/${id}`, dados);
    return response.data;
  },
};
