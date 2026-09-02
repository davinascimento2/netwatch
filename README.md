# NetWatch

> Simulador visual e interativo de redes para aprender topologias, conectividade e diagnósticos sem precisar de infraestrutura real.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite&logoColor=white)

## O que é

O NetWatch cria uma topologia de rede no navegador e simula o caminho de pacotes entre dispositivos. A aplicação abre com uma rede demonstrativa pronta — roteador, switch, servidor, computadores e impressora — para que seja possível experimentar desde o primeiro acesso.

> O projeto é educacional: não varre a sua rede e não transmite pacotes reais.

## Recursos

- Canvas interativo para visualizar e mover equipamentos.
- Criação de PCs, laptops, servidores, roteadores, switches, firewalls, pontos de acesso e impressoras.
- Conexões com latência, banda, perda de pacotes e estado de tráfego.
- Terminal simulado com `ping`, `traceroute`, `ipconfig`, `arp` e `nslookup`.
- Roteamento pelo menor caminho e indicadores visuais de tráfego.
- Serviços simulados de DHCP, DNS, VLAN, ARP e firewall.
- Dashboard, logs, inspetor do equipamento, salvar no navegador e desfazer/refazer.

## Demonstração rápida

1. Selecione **PC-01** no canvas ou na barra lateral.
2. Abra a aba **Terminal**.
3. Execute:

   ```text
   ping 192.168.1.10
   ```

4. Veja a rota, os pacotes e as conexões ganharem estado de tráfego.

## Executar localmente

Pré-requisito: Node.js 18 ou superior.

```bash
git clone https://github.com/Alishahryar1/NetWatch.git
cd NetWatch
npm install
npm run dev
```

Abra a URL exibida pelo Vite — normalmente `http://localhost:5173`.

### Qualidade

```bash
npm test       # testes das funções de rede
npm run build  # bundle de produção em dist/
```

## Arquitetura

```text
src/
├── components/  # Canvas, barra lateral e painéis da interface
├── network/     # Serviços de dispositivos, pacotes, DNS, DHCP e firewall
├── store/       # Estado compartilhado com Zustand
├── types/       # Tipos do domínio de rede
└── utils/       # Roteamento e utilitários de endereço IP
```

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| React + TypeScript | Interface e segurança de tipos |
| Vite | Ambiente de desenvolvimento e build |
| Zustand | Estado da topologia |
| React Flow | Canvas de nós e conexões |
| Lucide | Ícones da interface |

## Próximos passos

- Exportar e importar topologias em JSON.
- Configurar regras de firewall e VLAN pela interface.
- Animar o deslocamento dos pacotes no canvas.
- Adicionar testes de componentes e ponta a ponta.

## Licença

Uso educacional e de portfólio.
