import axios from 'axios';

export function extractErrorMessage(err: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { detail?: string; message?: string; title?: string }
      | undefined;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallbackMessage;
}
