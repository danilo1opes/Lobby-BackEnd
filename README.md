# 🎮 Lobby Backend

## 📝 Descrição

Este backend foi desenvolvido como uma API RESTful para suportar uma rede social voltada para **jogadores**, onde eles podem:

- Compartilhar fotos de personagens de jogos favoritos.
- Incluir detalhes como skins, nomes, jogos e épocas.
- Interagir com outros jogadores, exibindo suas criações e conquistas.

> Este projeto foi gerado com o auxílio de inteligência artificial, uma vez que o foco principal está no desenvolvimento **frontend**. O backend foi criado para dar suporte total às funcionalidades do frontend, garantindo uma integração fluida.

---

## 📌 Para Que Serve

O backend serve como a **camada de dados e lógica** de uma rede social, permitindo que os usuários:

- **Postem fotos**: imagens de seus personagens principais, com skins e personalizações.
- **Adicionem detalhes**: nome do personagem, nome do jogo e época.
- **Interajam**: visualizar posts, comentar e ver o número de acessos.
- **Gerenciem conteúdo**: deletar suas próprias postagens com controle de permissões.

Essa estrutura promove uma comunidade engajada para jogadores exibirem suas histórias com orgulho.

---

## 🧰 Tecnologias Utilizadas

- **Node.js** – Ambiente de execução do JavaScript no servidor.
- **Express** – Framework para criação da API RESTful.
- **Mongoose** – ODM para MongoDB, define os modelos de dados.
- **MongoDB** – Banco de dados NoSQL.
- **Multer** – Middleware para upload de arquivos (imagens).
- **jsonwebtoken (JWT)** – Autenticação com tokens.
- **TypeScript** – Tipagem estática para maior robustez.
- **fs** e **path** – Módulos nativos do Node.js para manipulação de arquivos.

---

## 🚀 Funcionalidades Implementadas

- `POST /photo` – Criação de post com imagem, nome, personagem, época e autor.
- `GET /photo` – Listagem com paginação e filtro por autor.
- `GET /photo/:id` – Detalhes de uma foto, com comentários e contagem de acessos.
- `DELETE /photo/:id` – Remove foto e comentários, com verificação de permissão.
- **Autenticação** – JWT protege as rotas e valida usuários.
- **Upload de Imagens** – JPEG, JPG e PNG com limite de 5MB.


