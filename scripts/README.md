# 🛠️ Scripts do MercaFlow

Esta pasta contém scripts úteis para gerenciar e manter o projeto MercaFlow.

---

## 📜 Scripts Disponíveis

### 1. `cleanup.sh` - Limpeza de Arquivos Obsoletos

**Descrição**: Remove e organiza arquivos de debug e análise obsoletos do root do projeto.

**Uso**:
```bash
bash scripts/cleanup.sh
```

**O que faz**:
- Move arquivos SQL de debug para `scripts/debug/`
- Move arquivos TypeScript de debug para `scripts/debug/`
- Move documentos de análise para `scripts/debug/`
- Atualiza `.gitignore`
- Cria README em `scripts/debug/`

**Quando usar**: Após acumular muitos arquivos de debug no root.

---

### 2. `vercel-env.sh` - Gerenciador de Variáveis Vercel

**Descrição**: Interface interativa para gerenciar variáveis de ambiente no Vercel.

**Uso Interativo**:
```bash
bash scripts/vercel-env.sh
```

**Uso com Comandos**:
```bash
# Listar todas as variáveis
bash scripts/vercel-env.sh list

# Adicionar SUPER_ADMIN_EMAILS
bash scripts/vercel-env.sh add

# Atualizar variável específica
bash scripts/vercel-env.sh update

# Remover variável
bash scripts/vercel-env.sh remove

# Baixar variáveis do Vercel
bash scripts/vercel-env.sh pull

# Verificar variáveis obrigatórias
bash scripts/vercel-env.sh check
```

**Funcionalidades**:
- ✅ Listar todas as variáveis de ambiente
- ✅ Adicionar/atualizar `SUPER_ADMIN_EMAILS`
- ✅ Atualizar qualquer variável
- ✅ Remover variáveis
- ✅ Baixar variáveis para arquivo local
- ✅ Verificar se variáveis obrigatórias existem

**Variáveis Obrigatórias Verificadas**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ML_CLIENT_ID`
- `ML_CLIENT_SECRET`
- `ENCRYPTION_KEY`
- `SUPER_ADMIN_EMAILS`

---

## 🔐 Segurança

**IMPORTANTE**: Nunca commite arquivos `.env*` que contenham valores reais!

Arquivos ignorados pelo Git:
- `.env.local`
- `.env.production`
- `.env.development.local`
- `.env.preview`

---

## 📝 Como Adicionar Novos Scripts

1. Crie o arquivo na pasta `scripts/`
2. Adicione shebang: `#!/bin/bash`
3. Torne executável: `chmod +x scripts/seu-script.sh`
4. Documente aqui no README
5. Commit e push

### Template de Script

```bash
#!/bin/bash
# Descrição do que o script faz
# Uso: bash scripts/seu-script.sh [argumentos]

set -e  # Sair em caso de erro

echo "🚀 Nome do Script"
echo ""

# Seu código aqui

echo ""
echo "✅ Concluído!"
```

---

## 🐛 Troubleshooting

### Erro: Permission Denied
```bash
chmod +x scripts/nome-do-script.sh
```

### Erro: Command Not Found (vercel)
```bash
npm install -g vercel
```

### Erro: Script não executa no Windows
Use Git Bash ou WSL:
```bash
# Git Bash
bash scripts/script.sh

# WSL
wsl bash scripts/script.sh
```

---

## 📚 Referências

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)
- [MercaFlow Documentation](../README.md)

---

**Criado por**: Antonio V. Braz  
**Última atualização**: 09/10/2025
