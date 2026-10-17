# Plano: Sketch UI — helm "wireframe" para Spartan (Angular)

> Objetivo: criar uma camada de estilos própria (um **helm alternativo**) sobre o `@spartan-ng/brain`, onde todos os componentes têm aparência consistente de wireframe/sketch (traço à mão). Inclui um **playground** para ver todos os componentes renderizando com o estilo.

---

## 1. Decisões de base

| Tema | Decisão | Motivo |
|---|---|---|
| Fork do Spartan? | **Não.** Usar `@spartan-ng/brain` como dependência npm | Continuamos recebendo correções de comportamento/acessibilidade. Fork só se precisarmos alterar o brain. |
| Onde mora o estilo | Lib própria `sketch-ui` com os helms reescritos | O helm já é código copiado para o projeto; ele é nosso. |
| Técnica de traço | **Híbrida, em camadas** (ver seção 3) | CSS puro como padrão (barato, funciona em `<input>`); Rough.js opcional para containers. |
| Linhas internas (tabela, separators, tabs) | SVG "manuscrito" via `border-image`/`background` | Barato, funciona com virtualização, combina com o contorno. |
| Licença | Manter aviso MIT do Spartan nos arquivos derivados de helm | Exigência da licença MIT. |
| Temas | **Sistema de temas próprio, N temas** (mínimo 1 claro + 1 escuro, cores a definir). Não usar o light/dark padrão do Spartan como produto final | Cores ainda não decididas; trocar paleta não pode exigir mexer em componentes (ver seção 3.6). |

---

## 2. Setup do projeto

### 2.1 Pré-requisitos
- Node.js LTS atual
- Angular CLI na versão estável mais recente (`npm i -g @angular/cli`)
- pnpm (recomendado) ou npm

### 2.2 Criar o workspace

Opção A — **Angular CLI** (mais simples, recomendado para começar):

```bash
ng new sketch-ui-workspace --create-application=false
cd sketch-ui-workspace
ng generate application playground --style=css --routing --ssr=false
ng generate library sketch-ui
```

Opção B — **Nx** (o próprio Spartan é Nx-nativo; melhor se a lib for crescer/publicar):

```bash
npx create-nx-workspace@latest sketch-ui-workspace --preset=angular-monorepo --appName=playground
```

### 2.3 Tailwind + Spartan
Seguir o guia de instalação atual em https://www.spartan.ng (as versões mudam; conferir antes):

```bash
pnpm add @spartan-ng/brain
pnpm add -D @spartan-ng/cli
ng g @spartan-ng/cli:init          # configura tema/Tailwind
ng g @spartan-ng/cli:ui            # gera os helms (selecionar todos)
```

- Configurar o **diretório de saída dos helms** para dentro da lib (`libs/sketch-ui/src/lib/...` ou `projects/sketch-ui/...`).
- Commitar os helms **originais** antes de qualquer mudança (commit `chore: helm original do spartan`). Isso vira nossa referência de diff para futuras atualizações.

### 2.4 Dependências extras

```bash
pnpm add roughjs
```

Fontes manuscritas (Google Fonts ou self-host): **Architects Daughter**, **Patrick Hand** ou **Caveat** (escolher uma para texto e opcionalmente outra para títulos).

### 2.5 Estrutura de pastas alvo

```
sketch-ui-workspace/
├─ apps/ (ou projects/)
│  └─ playground/
│     └─ src/app/
│        ├─ pages/playground.page.ts
│        └─ sections/        # uma seção por grupo de componentes
└─ libs/ (ou projects/)
   └─ sketch-ui/
      └─ src/
         ├─ styles/
         │  ├─ tokens.css        # cores, fontes, espessura, roughness
         │  ├─ sketch.css        # @utility sketch, sketch-line, etc.
         │  └─ index.css         # entrada única importada pelo app
         ├─ core/
         │  ├─ sketch-border.directive.ts   # Rough.js (opt-in)
         │  ├─ sketch-filter.component.ts   # <svg> com filtros, montado 1x
         │  └─ sketch-config.ts             # provider de config global
         └─ components/          # helms reescritos (button, input, card...)
```

---

## 3. Fundação do estilo (fazer ANTES de migrar componentes)

### 3.1 Tokens (`tokens.css`)

Tokens de **forma** ficam aqui (iguais em todos os temas). Tokens de **cor** só referenciam variáveis semânticas do tema; nunca um valor fixo (ver 3.6).

```css
:root {
  --sketch-stroke: var(--foreground);
  --sketch-stroke-muted: color-mix(in oklab, var(--foreground) 35%, transparent);
  --sketch-paper: var(--background);
  --sketch-width: 2px;
  --sketch-width-inner: 1.5px;
  --sketch-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  --sketch-radius-sm: 15px 255px 15px 225px / 225px 15px 255px 15px;
  --sketch-font: "Architects Daughter", "Patrick Hand", cursive;
  --sketch-roughness: 1.2;   /* lido pela diretiva Rough.js */
  --sketch-bowing: 1;
}
```

- As cores concretas vivem nos arquivos de tema (seção 3.6), não aqui.

### 3.2 Camadas de traço

| Camada | Uso | Implementação |
|---|---|---|
| **L1 — CSS radius irregular** (padrão) | Botões, inputs, badges, checkbox, tudo que é pequeno | `@utility sketch` com `border` + `border-radius` irregular |
| **L2 — SVG filter** (opcional) | Containers médios quando L1 parecer "limpo demais" | `::before` com `filter: url(#sketch)`; nunca filtrar o elemento inteiro |
| **L3 — Rough.js** (opt-in) | Card, dialog, sheet, popover, contorno do datagrid | Diretiva `[sketchBorder]` com SVG absoluto + `ResizeObserver` |
| **Linhas internas** | Linhas de tabela, separators, divisores de tabs/accordion | `@utility sketch-line` com `border-image` de SVG ondulado (2–3 variações alternadas via `:nth-child`) |

### 3.3 Utilities (`sketch.css`)

```css
@utility sketch {
  border: var(--sketch-width) solid var(--sketch-stroke);
  border-radius: var(--sketch-radius);
}
@utility sketch-sm {
  border: var(--sketch-width) solid var(--sketch-stroke);
  border-radius: var(--sketch-radius-sm);
}
/* Linha interna: SVG usado como MÁSCARA, a cor vem do tema */
@utility sketch-line {
  position: relative;
  &::after {
    content: "";
    position: absolute; left: 0; right: 0; bottom: 0;
    height: 3px;
    background-color: var(--sketch-stroke-muted);
    mask: url("data:image/svg+xml,...") repeat-x center / 200px 3px;
    pointer-events: none;
  }
}
```

> Importante para temas: SVG em `data:` URI **não enxerga variáveis CSS nem `currentColor`**. Por isso a linha manuscrita usa `mask` (o SVG define só o formato) e a cor vem de `background-color: var(...)`. Evitar `border-image` com cor embutida no SVG.

### 3.4 Diretiva Rough.js (esqueleto)

```ts
@Directive({ selector: '[sketchBorder]', host: { style: 'position: relative' } })
export class SketchBorderDirective implements AfterViewInit, OnDestroy {
  seed = input<number>(1);
  private el = inject(ElementRef<HTMLElement>);
  private svg?: SVGSVGElement;
  private ro?: ResizeObserver;

  ngAfterViewInit() {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.assign(this.svg.style, { position: 'absolute', inset: '0', pointerEvents: 'none', overflow: 'visible' });
    this.el.nativeElement.prepend(this.svg);
    this.ro = new ResizeObserver(() => this.draw());
    this.ro.observe(this.el.nativeElement);
  }

  private draw() {
    const { width, height } = this.el.nativeElement.getBoundingClientRect();
    const rc = rough.svg(this.svg!);
    this.svg!.replaceChildren(
      rc.rectangle(1, 1, width - 2, height - 2, { seed: this.seed(), roughness: 1.2, stroke: 'currentColor' }),
    );
  }

  ngOnDestroy() { this.ro?.disconnect(); }
}
```

Cuidados:
- Rodar só no browser (`afterNextRender` / checar plataforma) se houver SSR.
- `seed` fixo por instância para o traço não "pular" a cada redesenho.
- Debounce do redesenho em resize.
- Ler espessura/roughness dos tokens CSS (`getComputedStyle`).
- Usar `stroke: 'currentColor'` (ou ler `--sketch-stroke`) e **redesenhar quando o tema mudar** (escutar o signal do `ThemeService`, seção 3.6). Com `currentColor` o SVG gerado já acompanha o tema sem redesenho; o redesenho só é necessário se o tema alterar tokens de forma (ex.: roughness por tema).

### 3.5 Foco e acessibilidade
- O focus ring precisa continuar **visível e com contraste** (WCAG 2.4.7). Sugestão: traço duplo/mais grosso ou cor de accent no `:focus-visible`.
- Não depender só da fonte manuscrita para legibilidade em textos longos; permitir fallback via token.

### 3.6 Sistema de temas

Requisito: suportar **N temas** (no mínimo um claro e um escuro, com cores ainda a definir), sem nunca alterar componentes para trocar paleta.

**Regra de ouro:** nenhum helm usa cor literal (`bg-white`, `text-zinc-900`, `#333`). Só classes semânticas (`bg-background`, `text-foreground`, `border-border`, `bg-primary`...) e tokens `--sketch-*`.

**Estrutura:**

```
libs/sketch-ui/src/styles/
├─ themes/
│  ├─ _contract.md        # lista das variáveis que TODO tema precisa definir
│  ├─ paper.css           # tema claro provisório (placeholder)
│  ├─ blueprint.css       # tema escuro provisório (placeholder)
│  └─ ...                 # novos temas entram aqui
```

**Cada tema** é um seletor por atributo e declara se é claro ou escuro:

```css
[data-theme="paper"] {
  color-scheme: light;
  --background: oklch(0.98 0.01 90);
  --foreground: oklch(0.25 0 0);
  --primary: ...;
  --primary-foreground: ...;
  --muted: ...;  --muted-foreground: ...;
  --accent: ...; --accent-foreground: ...;
  --destructive: ...;
  --border: ...; --input: ...; --ring: ...;
  --card: ...; --popover: ...;           /* + foregrounds */
  /* opcionais, específicos do sketch */
  --sketch-paper-pattern: none;          /* ex.: grade de caderno */
}

[data-theme="blueprint"] {
  color-scheme: dark;
  /* mesmas variáveis */
}
```

- O **contrato** é o conjunto de variáveis semânticas do Spartan + as `--sketch-*` de cor. Um tema novo = um arquivo novo que preenche o contrato.
- Variante Tailwind `dark:` deve seguir o **esquema** do tema, não um tema específico:
  ```css
  @custom-variant dark (&:where([data-scheme="dark"], [data-scheme="dark"] *));
  ```
  O `ThemeService` seta `data-theme` (qual tema) e `data-scheme` (light/dark) no `<html>`.
- Remover/ignorar o `:root`/`.dark` gerado pelo `spartan init` depois de portar as variáveis para o contrato.

**`ThemeService` (Angular):**
- Registro de temas: `{ id, label, scheme: 'light' | 'dark' }[]`.
- `theme` como signal; aplica atributos no `<html>`.
- Persiste a escolha (`localStorage`, com try/catch) e respeita `prefers-color-scheme` na primeira visita (escolhe o tema padrão daquele esquema).
- Script inline mínimo no `index.html` para aplicar o tema antes do bootstrap (evita flash).

**Validação:**
- Teste automatizado que carrega cada tema e verifica que todas as variáveis do contrato estão definidas.
- axe/contraste rodando **por tema** no playground.

**Impacto no escopo:** baixo se feito agora (≈ +1 a 1,5 dia). Fica caro só se for deixado para depois e os helms já tiverem cores literais.

---

## 4. Migração dos componentes

Ordem por grupos. Para cada componente: trocar classes de borda/radius pelos utilities, aplicar a fonte, ajustar estados (hover, focus, disabled, invalid), conferir dark mode e adicionar no playground.

> Conferir a lista atual de componentes em spartan.ng (o Spartan 1.0 tem 55+ componentes).

**Grupo 1 — Básicos (validam a fundação)**
- [ ] button / button-group
- [ ] badge
- [ ] card
- [ ] label
- [ ] separator
- [ ] kbd
- [ ] avatar
- [ ] skeleton / spinner

**Grupo 2 — Formulários (onde aparecem os casos de `<input>`)**
- [ ] input / input-group
- [ ] textarea
- [ ] select / native select
- [ ] checkbox
- [ ] radio-group
- [ ] switch
- [ ] slider
- [ ] toggle / toggle-group
- [ ] input-otp
- [ ] form-field / field
- [ ] autocomplete / combobox
- [ ] date-picker / calendar

**Grupo 3 — Overlays**
- [ ] dialog / alert-dialog
- [ ] sheet
- [ ] popover / hover-card
- [ ] tooltip
- [ ] dropdown-menu / context-menu / menubar
- [ ] command
- [ ] sonner (toast)

**Grupo 4 — Navegação e layout**
- [ ] tabs
- [ ] accordion / collapsible
- [ ] breadcrumb
- [ ] pagination
- [ ] navigation-menu
- [ ] sidebar
- [ ] resizable / scroll-area
- [ ] carousel / aspect-ratio

**Grupo 5 — Dados**
- [ ] table
- [ ] data-table / datagrid (contorno Rough.js + `sketch-line` interno; testar com virtualização)
- [ ] progress
- [ ] alert / empty / item

**Definição de pronto por componente**
- Todos os estados visuais cobertos (default, hover, focus-visible, active, disabled, invalid, aberto/fechado).
- Testado em todos os temas registrados; nenhuma cor literal no helm.
- Navegação por teclado intacta (comportamento vem do brain; não quebrar).
- Presente no playground.

---

## 5. Playground

Página limpa, uma rota única (`/`), só para ver tudo renderizando.

### 5.1 Layout
- **Topo fixo**: título + barra de controles.
- **Sidebar** com âncoras para cada seção (Básicos, Formulários, Overlays, Navegação, Dados).
- **Conteúdo**: uma seção por componente, com título, variantes lado a lado e estados.
- Fundo papel (off-white, opcionalmente grade pontilhada leve tipo caderno).

### 5.2 Controles globais (toolbar)
- **Seletor de tema** (lista todos os temas do registro, não só light/dark)
- Visualização "**todos os temas lado a lado**": renderiza a tela composta uma vez por tema, útil para decidir paletas
- Camada de traço: **CSS** / **SVG filter** / **Rough.js** (troca via classe no `<body>` ou provider)
- Roughness (slider) e espessura do traço (slider) → atualizam os tokens CSS em tempo real
- Fonte manuscrita on/off
- "Comparar com original": alterna entre helm sketch e helm Spartan padrão, lado a lado (útil para validar)

### 5.3 Conteúdo por seção (exemplos)
- **Button**: variantes (default, secondary, outline, ghost, destructive, link) × tamanhos × disabled.
- **Formulários**: um formulário real (nome, email, select, checkbox, switch, slider, date-picker, submit) com estado de erro.
- **Overlays**: botões que abrem cada overlay.
- **Dados**: tabela com ~50 linhas + datagrid com 1.000 linhas para testar performance.
- **Tela composta**: uma "tela de app" falsa (sidebar + header + cards + tabela) para julgar o efeito de wireframe no conjunto.

### 5.4 Arquivos

```
playground/src/app/
├─ app.routes.ts              # { path: '', component: PlaygroundPage }
├─ pages/playground.page.ts
├─ controls/toolbar.component.ts
└─ sections/
   ├─ basics.section.ts
   ├─ forms.section.ts
   ├─ overlays.section.ts
   ├─ navigation.section.ts
   ├─ data.section.ts
   └─ composed-screen.section.ts
```

---

## 6. Qualidade

- **Regressão visual**: Playwright com screenshots do playground por seção × por tema. Usar `seed` fixo para o Rough.js ser determinístico.
- **Acessibilidade**: axe (via Playwright) no playground; conferir contraste dos traços e do focus.
- **Performance**: medir o datagrid de 1.000 linhas com Rough.js no contorno; meta de scroll sem jank. Se L2 (filter SVG) pesar com muitos elementos, restringir a containers.
- **Lint de estilo**: regra/grep no CI que acusa `rounded-*` e `border-input` remanescentes nos helms, e **cores literais** (`#hex`, `rgb(`, `oklch(` e classes como `bg-white`, `text-zinc-*`) fora de `styles/themes/`.

---

## 7. Atualizações do Spartan

1. Atualizar `@spartan-ng/brain` normalmente (mudanças de comportamento chegam sozinhas).
2. Para helms novos ou alterados upstream: gerar o helm original numa branch, comparar com o commit de referência (seção 2.3) e portar as mudanças estruturais para o nosso helm sketch.
3. Manter um `CHANGELOG.md` da lib.

---

## 8. Distribuição (fase posterior)

- Publicar `sketch-ui` como pacote npm interno, **ou**
- Expor como registry estilo shadcn (copy-paste), seguindo o modelo do próprio Spartan.
- README com: instalação, import do `index.css`, montagem do `<sketch-filters>` uma vez no app, lista de tokens.

---

## 9. Cronograma estimado

| Fase | Entrega | Estimativa |
|---|---|---|
| 0 | Setup do workspace, Spartan, Tailwind, helms originais commitados | 0,5 dia |
| 1 | Tokens, utilities, fontes, diretiva Rough.js, linhas internas | 1–2 dias |
| 1b | Sistema de temas: contrato, 2 temas placeholder, `ThemeService`, teste de contrato | 1–1,5 dia |
| 2 | Playground com toolbar + Grupo 1 | 1 dia |
| 3 | Grupo 2 (formulários) | 2 dias |
| 4 | Grupos 3 e 4 | 2–3 dias |
| 5 | Grupo 5 (dados/datagrid) + performance | 1–2 dias |
| 6 | Regressão visual, a11y, README | 1–2 dias |
| **Total** | | **~2,5 a 3 semanas** (1 pessoa) |

---

## 10. Riscos e pontos em aberto

- **`<input>`, `<textarea>`, `<select>` não aceitam `::before`**: usar L1 (CSS) direto neles ou wrapper para L2/L3.
- **SVG filter no elemento inteiro** distorce texto e quebra filhos `position: fixed` → sempre em pseudo-elemento.
- **Virtualização no datagrid**: nada de Rough.js por linha/célula.
- **Legibilidade da fonte manuscrita** em textos longos e tabelas densas → avaliar fonte mais sóbria para corpo de tabela.
- **SVG em `data:` URI não herda cor do tema** → usar `mask` + `background-color` (seção 3.3).
- **Decisão pendente**: paletas finais dos temas (os dois iniciais são placeholders; trocar só os arquivos em `themes/`).
- **Decisão pendente**: Angular CLI ou Nx (seção 2.2).
- **Decisão pendente**: qual camada (L1/L2/L3) é o padrão de cada componente — validar no playground com a opção "comparar" e fechar a tabela na Fase 2.
