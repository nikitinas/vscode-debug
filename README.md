# Semantic Tokens Tester

This VS Code extension exercises the `vscode.provideDocumentSemanticTokens` command by loading two bundled Java source files, requesting the semantic tokens that the active VS Code session can provide, and logging the decoded output.

## Features

- Registers a lightweight semantic token provider for Java files so the command always succeeds without additional extensions.
- Includes a command palette entry `Run Semantic Tokens Sample` (`semanticTokensTester.run`) that:
  1. Opens the Java fixtures under `data/`.
  2. Invokes `vscode.provideDocumentSemanticTokens` four times in sequence.
  3. Logs the decoded semantic token stream so you can inspect deltas, token types, and modifiers.
- Provides a helper utility to serialize async executions if you want to experiment with overlapping requests.

## Getting Started

1. Install dependencies: `npm install`.
2. Compile the extension: `npm run compile`.
3. Press `F5` in VS Code to launch the Extension Development Host.
4. In the command palette run **Run Semantic Tokens Sample**.
5. Inspect the **Extension Host** debug console to see each semantic token entry and the result identifiers returned by VS Code.

You can toggle the `useQueue` flag inside `SayHelloCommand` to experiment with sequential vs. queued calls.

## Project Structure

- `src/extension.ts` – entry point that wires commands and the Java semantic token provider.
- `src/SayHelloCommand.ts` – command implementation that drives sample requests.
- `src/SemanticTokenProvider.ts` – a simple semantic token provider for Java files.
- `data/CodeElement*.java` – fixtures that always produce tokens.

## Packaging

Use `npm run compile` to emit JavaScript to `out/`, then `vsce package` (after installing `vsce`) to build a `.vsix` for distribution.

