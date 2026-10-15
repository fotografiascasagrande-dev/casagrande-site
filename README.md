# Casagrande Fotografia – como usar

Estrutura:
- `galerias/`  → uma pasta por galeria (fotos dentro). É aqui que você trabalha.
- `site.config.json` → nome, textos, WhatsApp, Instagram e e-mail.
- `assets/` → estilo e visualizador de fotos.
- `scripts/build.mjs` → gera o site sozinho a cada publicação (não precisa mexer).

Adicionar galeria: crie `galerias/nome-da-galeria/` e envie as fotos (JPG, PNG, WebP).
Apagar galeria: apague a pasta. Adicionar/apagar foto: envie ou apague o arquivo na pasta.
Opcional, para personalizar: arquivo `info.json` dentro da pasta da galeria:
{ "titulo": "Ana e Pedro", "data": "Março 2026", "descricao": "Casamento na serra", "capa": "foto-05.jpg", "ordem": 1 }
Fotos: até ~2000 px no lado maior e 300–600 KB cada. Nomes sem acento e sem espaço.
