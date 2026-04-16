#!/usr/bin/env python3
"""
Script para atualizar cores hardcoded dos componentes para tokens CSS da CONTH
Substitu cores antigas pela paleta CONTH oficial
"""

import re
from pathlib import Path

# Mapeamento de cores antigas para tokens CSS
REPLACEMENTS = {
    # Cores de fundo e card
    '#0a1628': 'var(--background)',
    '#0d1e36': 'var(--card)',
    
    # Cores de borda
    '#1e4976': 'var(--border)',
    
    # Cores de texto secundário
    '#8ca8c4': 'var(--muted-foreground)',
    
    # Cores de acento (verde)
    '#00d4aa': 'var(--conth-green)',
    '#00a88a': 'var(--conth-green-dark)',
}

def atualizar_arquivo(arquivo_path):
    """Atualiza um arquivo com os tokens CSS"""
    try:
        conteudo = arquivo_path.read_text(encoding='utf-8')
        conteudo_original = conteudo
        
        for cor_antiga, token_novo in REPLACEMENTS.items():
            # Substituir apenas valores entre aspas ou sem contexto específico
            conteudo = re.sub(
                f'["\']?{re.escape(cor_antiga)}["\']?(?=[\\s,\\)])',
                f'"{token_novo}"',
                conteudo
            )
        
        # Se houve mudanças, salvar arquivo
        if conteudo != conteudo_original:
            arquivo_path.write_text(conteudo, encoding='utf-8')
            return True
        return False
    except Exception as e:
        print(f"Erro ao processar {arquivo_path}: {e}")
        return False

# Encontrar todos os arquivos TSX
pasta_dashboard = Path('/vercel/share/v0-project/components/dashboard')
app_folder = Path('/vercel/share/v0-project/app')

arquivos_atualizados = 0

# Atualizar componentes do dashboard
for arquivo in pasta_dashboard.glob('*.tsx'):
    if atualizar_arquivo(arquivo):
        print(f"✓ Atualizado: {arquivo.name}")
        arquivos_atualizados += 1

# Atualizar arquivos na pasta app
for arquivo in app_folder.glob('*.tsx'):
    if atualizar_arquivo(arquivo):
        print(f"✓ Atualizado: {arquivo.name}")
        arquivos_atualizados += 1

print(f"\nTotal de arquivos atualizados: {arquivos_atualizados}")
print("✓ Paleta CONTH sincronizada com sucesso!")
