# 📋 Padrões e Diretrizes do Projeto: TalkMotion

## 🌎 Linguagem
- Sempre entregar respostas em português do Brasil.

## 📁 Estrutura de Arquivos
- Manter todos os arquivos, sempre que possível, no mesmo nível de diretório.
- Evitar estruturas complexas desnecessárias.
- **Dica de Nomenclatura:** Use prefixos para organização visual:
  - `api_` para arquivos de backend.
  - `ui_` para componentes de interface.
  - `lib_` para bibliotecas ou utilitários.
  - `style_` para CSS.

## 🗄 Banco de Dados
- Utilizar banco de dados local (SQLite) sempre que necessário.
- Exemplo padrão: `dados.db`.

## 💾 Armazenamento no Navegador
- Salvar no navegador apenas dados de uso temporário (`localStorage`/`sessionStorage`).
- Para grandes volumes de dados ou histórico, utilize **IndexedDB**.
- Não armazenar dados sensíveis no client-side.

## 🔐 Segurança e Configuração
- Nunca deixar API Keys públicas.
- Utilizar arquivo `.env` para credenciais sensíveis (Mercado Pago, OpenAI, etc.).
- Proteger acesso direto a arquivos sensíveis via `.htaccess`:
  ```apache
  <Files .env>
      Order allow,deny
      Deny from all
  </Files>
  
  <Files "*.db">
      Order allow,deny
      Deny from all
  </Files>
  ```

## 📌 Processo Inicial
- Sempre perguntar o nome do projeto antes de iniciar.

## 🎨 Identidade Visual e PWA
- **Gerar Sempre:**
  - **Favicon:** Linkar sempre um `favicon.ico` ou usar um emoji via Data URI como ícone inicial.
  - **PWA:** Gerar `manifest.json`, ícones (`192x192`, `512x512`) e `sw.js` (Service Worker).
- **Estética:** Utilizar emojis temporários; imagens definitivas serão substituídas sob demanda.
- **Importante:** PWAs requerem HTTPS em produção para funcionarem plenamente.

---

# 🛠 Guia Técnico: Pagamentos e Anti-Bula

## 1. Integração Mercado Pago (PIX)
Utilizar o padrão **API Bridge** para proteger o `Access Token`.

### Fluxo de Pagamento:
1. **Frontend:** Usa apenas a `Public Key`. Faz polling a cada 5s chamando a API local.
2. **Bridge de Criação (`api_mp_create.php`):** Cria a preferência usando o `Access Token` do `.env`.
3. **Bridge de Status (`api_mp_check.php`):** Consulta o status real no Mercado Pago.
4. **Padronização:** As APIs devem sempre retornar JSON: `{"success": true, "data": {...}}`.
5. **Redundância:** Implementar `api_mp_webhook.php` para garantir o recebimento mesmo se o usuário fechar o browser.

## 2. Sistema Anti-Cheat (IP + Fingerprint)
Assinatura digital para bônus iniciais sem necessidade de login.

### Protocolo de Validação (`api_check_bonus.php`):
1. **Frontend:** Gera hash de hardware/software (UserAgent, Resolution, Timezone, RAM, etc.).
2. **Servidor:** Recebe o hash, detecta o IP e combina com a chave `FINGERPRINT_SALT` do `.env`.
3. **Super Hash:** O servidor salva apenas o hash final em `used_bonuses.json`.
4. **Privacidade:** Nunca salvar dados puros de IP ou Fingerprint.

---

# 🎨 Padrões de UX, Interface e Estilo Azul Premium
- **Estilo Visual:** Utilizar sempre **Glassmorphism Azul Premium**.
  - **Fundo:** Gradientes radiais profundos em tons de **Slate 950** e **Sky Blue**.
  - **Cartões:** Efeito `glass` com `backdrop-filter: blur(16px)`, bordas em **Sky/Blue** translucido e sombras profundas.
  - **Tipografia:** Cores de texto contrastantes (`#f1f5f9`) e realces em **Sky 400/500**.
- **Feedback Visual:** Sempre exibir Toasts ou Spinners em chamadas de API ou processos demorados.
- **Estado Global:** Centralizar dados mutáveis (saldo, créditos, tema) em um objeto global (ex: `window.appState`) para atualização em tempo real sem recarregamento.

# 🛠 Recurso de Desenvolvedor (Backdoor)
- **Protocolo de Créditos:** Implementar sempre um comando secreto para bypass de pagamento em ambiente de homologação/dev.
- **Atalho Físico:** 5 cliques rápidos no logo do sistema devem abrir um prompt de segurança.
- **Comando de Console:** Expor objeto global (ex: `talkmotion.addCredit`) para inserção via terminal.
- **Segurança:** Utilizar uma chave simples (ex: `admin123`) para validação do comando.

# ⚡ Sistema Anti-Cache e Performance
- **Versionamento Automático:** Utilizar `index.php` como entrada principal.
- **Anti-Cache de Assets:** Para evitar problemas de cache no navegador do cliente, sempre anexar a data de modificação aos arquivos CSS e JS:
  ```php
  <link rel="stylesheet" href="style.css?v=<?php echo filemtime('style.css'); ?>">
  <script src="script.js?v=<?php echo filemtime('script.js'); ?>"></script>
  ```
- **PWA:** O `manifest.json` e `sw.js` devem estar configurados para permitir instalação e funcionamento offline básico.

# 🤖 Integração de I.A. (OpenAI)
Para recursos que utilizam inteligência artificial:
- Utilizar a `OPENAI_API_KEY` do arquivo `.env`.
- Todas as chamadas devem ser processadas via **Bridge no Servidor** para evitar exposição da chave e permitir controle de custos/limites.

---
*Documento de referência para o Agente Antigravity (Google DeepMind).*
