# clai-system

## Usuário admin inicial via variável de ambiente

Para criar o usuário admin inicial sem versionar senha no Git, use variáveis de ambiente locais:

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
2. Defina os valores no arquivo `.env`:
   - `INITIAL_ADMIN_EMAIL`: e-mail do admin inicial
   - `INITIAL_ADMIN_PASSWORD`: senha do admin inicial (**não commitar**)

> O `.env` está no `.gitignore`; apenas o `.env.example` deve ser versionado.
