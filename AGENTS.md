# AGENTS.md — Guia de Arquitetura & Instruções para Agentes de IA

Este documento serve como a principal referência técnica e operacional para agentes de IA e desenvolvedores que trabalham no repositório **NetWatch** — o **Simulador Interativo de Redes & Telemetria Cyberpunk**.

---

## 1. Visão Geral do Projeto

O **NetWatch** é uma plataforma visual, interativa e educativa para modelagem de topologias de rede, simulação de tráfego de pacotes hop-by-hop e execução de diagnósticos de infraestrutura no navegador.

A aplicação combina engenharia de simulação de redes com estética cinematográfica/cyberpunk:
- **Canvas Interativo de Nós e Conexões**: Construído com `@xyflow/react` (React Flow), suportando arrastar e soltar (Drag-and-Drop) de equipamentos, conexões dinâmicas entre portas, e animação visual de pacotes em trânsito.
- **Simulador de Protocolos em Tempo Real**:
  - **Algoritmo de Roteamento de Menor Caminho (Dijkstra)**: Calcula caminhos ponderados por latência e estado de integridade do link.
  - **Firewall com Filtragem de Estado (SPI)**: Suporte a regras `ALLOW` e `DENY` por protocolo (HTTP, DNS, ICMP, TCP) e porta.
  - **Isolamento de VLANs (802.1Q)**: Tráfego isolado na Camada 2 que exige roteador para comutação Inter-VLAN.
  - **Serviços de DNS & ARP**: Tabela de resolução de nomes e cache de endereçamento de hardware.
  - **Cliente e Servidor DHCP**: Atribuição dinâmica de leases IP.
- **Terminal CLI Emulado**: Console interativo com histórico de comandos (`↑` / `↓`) suportando `ping`, `traceroute`, `ipconfig`, `arp -a`, `nslookup`, `route print`, `help` e `clear`.
- **Feedback Sensorial & Áudio Sintetizado**: Motor procedural de áudio construído com a Web Audio API nativa (bipes de telemetria, clacks mecânicos de teclado, chimes de entrega de pacote e tons de alerta de queda).
- **Filtro CRT Vintage / Scanlines**: Efeito opcional de tela retro-futurista de centro de comando.
- **Histórico Completo (Undo / Redo)**: Reversão e refação instantânea de ações na topologia (`Ctrl+Z`, `Ctrl+Y`).
- **Persistência & Portabilidade**: Salvamento local em `localStorage` e exportação/importação de topologias completas em formato JSON.

---

## 2. Stack Tecnológica

| Camada / Ferramenta | Tecnologia | Versão | Função Principal |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | [React](https://react.dev/) | `^18.2.0` | UI reativa baseada em componentes funcionais |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) | `^4.9+ / ES2022` | Tipagem estática rigorosa do domínio de redes |
| **Visualização de Redes** | [@xyflow/react](https://reactflow.dev/) | `^12.0.0` | Motor de nós, arestas, pan/zoom e layout de canvas |
| **Gerenciamento de Estado** | [Zustand](https://zustand-demo.pmnd.rs/) | `^4.3.0` | Store central com histórico (undo/redo) |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) | `^3.1.8` | Design system cyberpunk utility-first |
| **Ícones** | [Lucide React](https://lucide.dev/) | `^0.263.0` | Ícones vetoriais de dispositivos e utilitários |
| **Áudio** | Web Audio API nativo | Nativo | Síntese de áudio procedural em tempo real |
| **Testes de Unidade** | [TSX](https://github.com/privatenumber/tsx) | `^4.23+` | Executor de testes ultrarrápido em TypeScript |
| **Build & Dev Tool** | [Vite](https://vite.dev/) | `^4.0+` | Empacotador de produção e servidor de desenvolvimento |

---

## 3. Estrutura do Diretório

```plaintext
netwatch/
├── .agents/                    # Configurações de agentes de desenvolvimento
├── .codex/                     # Regras e referências de codificação
├── .impeccable/                # Configurações de design e qualidade
├── skills/                     # Suíte de habilidades de desenvolvimento e arquitetura
├── src/
│   ├── components/
│   │   ├── bottomPanel/        # Painel inferior com abas de ferramentas
│   │   │   ├── BottomPanel.tsx # Container de abas com modo maximizado/recolhido
│   │   │   ├── Dashboard.tsx   # Métricas gerais, telemetria de nós e saúde da rede
│   │   │   ├── Inspector.tsx   # Inspetor de dispositivo e conexão (IP, VLAN, Firewall)
│   │   │   ├── Logs.tsx        # Stream de eventos com filtros por severidade e busca
│   │   │   ├── PacketSimulator.tsx # Construtor de pacotes e visualização de saltos
│   │   │   └── Terminal.tsx    # CLI interativo (ping, traceroute, ipconfig, arp)
│   │   ├── canvas/
│   │   │   ├── CustomEdge.tsx  # Conexão customizada com pílula de latência e banda
│   │   │   ├── DeviceNode.tsx  # Nós com ícone, status online/offline e 4 portas
│   │   │   └── NetworkCanvas.tsx # Canvas React Flow com drag-and-drop e mini mapa
│   │   ├── modals/
│   │   │   ├── ExportModal.tsx # Exportação e importação de topologia em JSON
│   │   │   ├── HelpModal.tsx   # Manual de operações, conceitos de rede e atalhos
│   │   │   └── PacketModal.tsx # Diálogo de envio rápido de pacotes
│   │   ├── sidebar/
│   │   │   └── Sidebar.tsx     # Paleta de equipamentos arrastáveis e presets rápidos
│   │   └── toolbar/
│   │       └── Toolbar.tsx     # Barra superior com ações, contadores e alternadores
│   ├── network/
│   │   └── networkService.ts   # Lógica pura de simulação (Dijkstra, Ping, Trace, Firewall)
│   ├── store/
│   │   └── networkStore.ts     # Estado global Zustand com persistência e histórico
│   ├── types/
│   │   └── index.ts            # Definições completas de tipos TypeScript
│   ├── utils/
│   │   ├── audio.ts            # Sintetizador procedural Web Audio API
│   │   ├── networkUtils.ts     # Algoritmos de rede, validações IP e MAC
│   │   └── networkUtils.test.ts# Bateria de testes unitários
│   ├── App.tsx                 # Componente raiz da aplicação
│   ├── index.css               # Estilos globais e customizações do React Flow
│   └── main.tsx                # Ponto de entrada React
├── index.html                  # HTML base com fontes Google (JetBrains Mono, Plus Jakarta)
├── package.json                # Configuração de scripts e dependências
├── postcss.config.js           # PostCSS para Tailwind
├── tailwind.config.js          # Configuração de paleta cyberpunk e animações
└── vite.config.ts              # Configurações do Vite
```

---

## 4. Diretrizes de Qualidade e Código

1. **Integridade da Simulação**:
   - Toda rota deve ser calculada determinísticamente via Dijkstra (`dijkstraShortestPath`).
   - Nós com status `offline` devem recusar tráfego e resultar em `timeout` no ping/traceroute.
   - Conexões `down` devem ser desconsideradas pelo grafo de adjacências.
2. **Design Imersivo**:
   - Manter contraste alto, legibilidade tipográfica e paleta neon sobre fundo escuro (`#06090e`).
   - Usar `JetBrains Mono` para todos os identificadores de rede (IPs, MACs, portas, comandos).
3. **Desempenho**:
   - Evitar re-renderizações desnecessárias utilizando seletores pontuais no Zustand e `React.memo` nos nós do React Flow.
4. **Verificação Pré-Commit**:
   - Sempre executar `npm test` e `npm run build` para garantir zero erros de compilação antes de concluir tarefas.
