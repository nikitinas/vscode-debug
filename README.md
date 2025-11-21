# Semantic Tokens Tester

This VS Code extension exercises the `vscode.provideDocumentSemanticTokens` command by loading Java source files from a bundled sample project, requesting the semantic tokens that the active VS Code session can provide, and logging the decoded output.

## Features

- Relies on your installed Java tooling (e.g., Red Hat Java) to provide semantic tokens for the sample project.
- Includes a command palette entry `Run Semantic Tokens Sample` (`semanticTokensTester.run`) that:
  1. Opens both Java files (`Sample.java` and `SampleTwo.java`) under `sample-java/`.
  2. Issues semantic token requests for them in parallel (twice each).
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

- `src/extension.ts` – entry point that wires the command and output channel.
- `src/SayHelloCommand.ts` – command implementation that drives sample requests.
- `sample-java/` – a minimal Maven project with `Sample.java` and `SampleTwo.java` used for token testing.

## Packaging

Use `npm run compile` to emit JavaScript to `out/`, then `vsce package` (after installing `vsce`) to build a `.vsix` for distribution.

