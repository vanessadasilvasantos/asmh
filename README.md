# ASMH

ASMH é um aplicativo pessoal de produtividade para transformar tarefas diárias em pontos e pontos em recompensas. Ele foi pensado para uso individual, sem autenticação ou backend.

## Funcionalidades

- Saldo diário de pontos, reiniciado automaticamente a cada novo dia.
- Cadastro de tarefas com nome, dificuldade, cor e valor em pontos.
- Conclusão de tarefas pelo checkbox, com confetes na tela.
- Tarefas concluídas organizadas no fim da lista.
- Mensagem motivacional quando todas as tarefas do dia são concluídas.
- Cadastro de produtos/recompensas com custo em pontos.
- Resgate de produtos com confirmação e validação de saldo.
- Exclusão confirmada de tarefas e produtos.
- Persistência local de tarefas, produtos, saldo e histórico de movimentações.

## Tecnologias

- [Expo SDK 58](https://docs.expo.dev/)
- React Native e TypeScript
- Expo Router
- NativeWind (Tailwind CSS para React Native)
- AsyncStorage

## Como executar

Pré-requisito: Node.js 22.13 ou superior.

```bash
npm install
npx expo start
```

Para limpar o cache do Metro, especialmente após mudanças no NativeWind:

```bash
npx expo start --clear
```

No terminal do Expo, use `a` para Android, `i` para iOS (no macOS) ou `w` para abrir no navegador.

## Estrutura principal

```text
src/
├── app/
│   ├── _layout.tsx              # Provider global e configuração das rotas
│   └── index.tsx                # Alternância entre as seções principais
├── components/
│   └── ConfettiBurst.tsx        # Efeito visual ao concluir uma tarefa
├── providers/
│   └── ProductivityProvider.tsx # Estado, regras de negócio e persistência
├── sections/
│   ├── MeusPontos.tsx           # Saldo e tarefas diárias
│   └── Produtos.tsx             # Produtos e resgates
└── types/
    └── productivity.ts          # Tipos de tarefas, produtos e movimentações
```

## Regras de pontuação

- Cada tarefa concluída adiciona seus pontos ao saldo do dia.
- Ao desmarcar uma tarefa, seus pontos são removidos, sem permitir saldo negativo.
- Produtos só podem ser resgatados quando há saldo suficiente.
- O saldo é zerado no início de cada dia; tarefas, produtos e histórico permanecem armazenados.

## Persistência

Os dados são guardados localmente com `@react-native-async-storage/async-storage`, na chave `@asmh/productivity-data`. Nenhum dado é enviado para servidores externos.

## Verificações

```bash
npx expo lint
npx tsc --noEmit
```
