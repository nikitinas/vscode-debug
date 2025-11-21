import * as vscode from 'vscode';
import { registerJavaSemanticTokensProvider } from './SemanticTokenProvider';
import { SayHelloCommand } from './SayHelloCommand';

export function activate(context: vscode.ExtensionContext): void {
  console.log('Semantic Tokens Tester extension activating');

  registerJavaSemanticTokensProvider(context);

  const command = new SayHelloCommand(context.extensionUri);
  context.subscriptions.push(
    vscode.commands.registerCommand(command.id, () => command.execute())
  );
}

export function deactivate(): void {
  // nothing to clean up beyond the subscriptions
}

