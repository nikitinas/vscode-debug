import * as vscode from 'vscode';
import { registerJavaSemanticTokensProvider } from './SemanticTokenProvider';
import { SayHelloCommand } from './SayHelloCommand';

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('Semantic Tokens Tester');
  output.appendLine('Semantic Tokens Tester extension activating');

  registerJavaSemanticTokensProvider(context);

  const command = new SayHelloCommand(context.extensionUri, output);
  context.subscriptions.push(
    vscode.commands.registerCommand(command.id, () => command.execute())
  );
}

export function deactivate(): void {
  // nothing to clean up beyond the subscriptions
}

