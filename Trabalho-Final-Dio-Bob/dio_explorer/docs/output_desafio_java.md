# ⚔️ Desafio DIO — Java | Nível: Intermediário

> **Categoria:** POO / API REST
> **Tempo estimado:** 45–90 minutos
> **XP recompensa:** 700 XP

---

## 📋 Descrição do Desafio

Implemente um **Sistema de Gerenciamento de Biblioteca** em Java usando Spring Boot.

O sistema deve permitir:
- Cadastrar livros com título, autor, ISBN e status de disponibilidade
- Buscar livros por título ou autor
- Controlar empréstimos e devoluções com validação de disponibilidade
- Expor funcionalidades via API REST

---

## ✅ Requisitos

1. Criar a entidade `Livro` com os campos: `id`, `titulo`, `autor`, `isbn`, `disponivel`
2. Criar a classe `Biblioteca` (ou serviço `BibliotecaService`) com os métodos: `adicionar`, `buscar`, `emprestar`, `devolver`
3. Tratar exceções: livro não encontrado (`LivroNaoEncontradoException`) e livro indisponível (`LivroIndisponivelException`)
4. Persistir os dados em memória usando `List` ou `Map` (sem banco de dados)
5. Expor pelo menos 4 endpoints REST: `POST /livros`, `GET /livros/{isbn}`, `POST /livros/{isbn}/emprestar`, `POST /livros/{isbn}/devolver`

---

## 💡 Dicas

- Use `Optional<Livro>` no retorno de buscas para evitar `NullPointerException`
- Valide o ISBN duplicado ao adicionar um novo livro
- Use `@RestController` e `@Service` para separar responsabilidades

---

## 📥 Entrada Esperada

```json
POST /livros
{
  "titulo": "Clean Code",
  "autor": "Robert C. Martin",
  "isbn": "978-0132350884"
}
```

## 📤 Saída Esperada

```json
POST /livros/{isbn}/emprestar
{
  "mensagem": "Empréstimo realizado com sucesso",
  "livro": "Clean Code",
  "disponivel": false
}
```

---

## 🧪 Casos de Teste

| # | Cenário | Entrada | Saída Esperada |
|---|---------|---------|----------------|
| 1 | Emprestar livro disponível | `POST /livros/978.../emprestar` | `"Empréstimo realizado com sucesso"` |
| 2 | Emprestar livro indisponível | `POST /livros/978.../emprestar` (2ª vez) | `HTTP 409` + `"Livro indisponível no momento"` |
| 3 | Buscar ISBN inexistente | `GET /livros/000-0000` | `HTTP 404` + `"Livro não encontrado"` |

---

## 🏆 Critérios de Avaliação

- [x] Funcionalidade correta dos endpoints
- [x] Código limpo e legível (nomenclatura, indentação)
- [x] Tratamento de casos extremos (ISBN duplicado, livro inexistente)
- [x] Boas práticas de OOP em Java (encapsulamento, separação de responsabilidades)

---

> 💬 Deseja receber a **solução comentada** ou prefere **tentar sozinho primeiro**?

---

*Gerado via `/desafio Java Intermediário` — DIO Explorer*
