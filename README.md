# API RESTful - Teste Técnico para Loja de Brinquedos

## 1. Visão Geral do Projeto

Este projeto consiste em uma API RESTful desenvolvida com **NestJS** para gerenciar clientes e vendas de uma loja de brinquedos fictícia. A aplicação segue uma arquitetura modular, com foco em boas práticas, escalabilidade, segurança e testabilidade.

## 2. Arquitetura e Conceitos Chave

* **Arquitetura Modular**: Organização em módulos (Auth, Users, Clients, Sales), aproveitando o sistema de Injeção de Dependência do NestJS para manter o código desacoplado e testável.
* **Interação com o Banco de Dados**: Utilização do **Prisma** como ORM para garantir type-safety com PostgreSQL. Conexão gerenciada por um `PrismaService` global.
* **Autenticação e Segurança**: JSON Web Tokens (JWT) com **Passport.js**. Rotas protegidas por `JwtAuthGuard`. Senhas criptografadas com **bcrypt**.
* **Filosofia de Testes**:

  * **Testes de Unidade**: Validação isolada da lógica de negócio dos Services, usando mocks.
  * **Testes End-to-End (E2E)**: Validação do fluxo HTTP completo, incluindo interação com banco de dados de teste.

## 3. Tecnologias Utilizadas

* **Framework**: NestJS
* **Linguagem**: TypeScript
* **Banco de Dados**: PostgreSQL
* **ORM**: Prisma
* **Autenticação**: Passport.js (JWT)
* **Testes**: Jest & Supertest
* **Validação**: class-validator, class-transformer
* **Segurança**: bcrypt, helmet

## 4. Detalhamento dos Módulos

| Módulo      | Responsabilidade                                                           |
| ----------- | -------------------------------------------------------------------------- |
| **Users**   | Gerenciamento de usuários, criação com senha criptografada.                |
| **Auth**    | Orquestra autenticação: valida credenciais e gera JWT.                     |
| **Clients** | CRUD de clientes. GET `/clients` formata JSON conforme requisito.          |
| **Sales**   | Registro de vendas e estatísticas (groupBy, `$queryRaw` para performance). |

## 5. Configuração do Ambiente

### Pré-requisitos

* Node.js v18+
* npm ou yarn
* Instância PostgreSQL (local ou Docker)

### Passo a Passo

1.  Clone o repositório e acesse a pasta do projeto:

    ```bash
    git clone [https://github.com/GabrielPrediger/test-backend.git](https://github.com/GabrielPrediger/test-backend.git)
    cd test-backend
    ```

2.  Instale as dependências:

    ```bash
    npm install
    ```

3.  Configure as variáveis de ambiente:
    * Crie o arquivo `.env` na raiz do projeto, baseando-se no `.env.example`:

    ```env
    DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_BANCO?schema=public"
    JWT_SECRET="SEU_SEGREDO_SUPER_SECRETO"
    JWT_EXPIRES_IN=3600s
    ```

4.  Execute as migrações do banco de dados e popule com os dados iniciais (`seed`):

    ```bash
    # Aplica as migrações para criar as tabelas no banco
    npx prisma migrate dev

    # Executa o script para popular o banco com dados iniciais
    npx prisma db seed
    ```

    * **Usuário administrador criado pelo `seed`**:
        * **Email**: `admin@lojadebrinquedos.com`
        * **Senha**: `senha123`

## 6. Executando a Aplicação

Para iniciar o servidor em modo de desenvolvimento com hot-reload:

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

## 7. Executando os Testes

1. Configure o banco de teste:

   * Crie um banco (ex: `test_db`) e `.env.test` com `DATABASE_URL` correspondente.

2. Prepare o banco de teste:

# Migrações

   ```bash
npm run test\:migrate
```
# Seed

   ```bash
npm run test\:seed
```

3. Rodar os testes:

# Todos (Unit e E2E)
   ```bash
npm test
```
# Apenas E2E
   ```bash
npm run test:e2e
```

## 8. Endpoints

| Método | Endpoint                    | Descrição                                                            | Protegido? | Body Exemplo                                                               |
| ------ | --------------------------- | -------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| POST   | `/users`                    | Cria novo usuário administrador                                      | Não        | `{ "name": "Admin", "email": "a@a.com", "password": "123" }`               |
| POST   | `/auth/login`               | Autentica usuário e retorna JWT                                      | Não        | `{ "email": "a@a.com", "password": "123" }`                                |
| POST   | `/clients`                  | Cadastra novo cliente                                                | Sim        | `{ "name": "Ana", "email": "ana@cliente.com", "birthDate": "1990-01-01" }` |
| GET    | `/clients`                  | Lista clientes (aceita filtros `?name=Ana` `?email=ana@cliente.com`) | Sim        | -                                                                          |
| GET    | `/clients/:id`              | Busca cliente por ID                                                 | Sim        | -                                                                          |
| PATCH  | `/clients/:id`              | Atualiza dados do cliente                                            | Sim        | `{ "name": "Ana Silva" }`                                                  |
| DELETE | `/clients/:id`              | Deleta cliente                                                       | Sim        | -                                                                          |
| POST   | `/sales`                    | Registra venda                                                       | Sim        | `{ "value": 150.50, "clientId": 1, "saleDate": "2025-07-20" }`             |
| GET    | `/sales/stats/daily-totals` | Totais diários de vendas                                             | Sim        | -                                                                          |
| GET    | `/sales/stats/top-clients`  | Clientes com melhores estatísticas                                   | Sim        | -                                                                          |
