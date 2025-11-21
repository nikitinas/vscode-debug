import * as path from 'path';
import * as vscode from 'vscode';
import { executeSequential } from './PrevenParallelAsync';

export class SayHelloCommand {
  readonly id = 'semanticTokensTester.run';

  private readonly sampleFiles = ['CodeElement.java', 'CodeElement2.java'];

  constructor(private readonly extensionUri: vscode.Uri) {}

  async execute(): Promise<void> {
    const samples = this.sampleFiles.map((file) => this.buildSamplePath(file));
    const runOrder = [samples[0], samples[1], samples[0], samples[1]];

    vscode.window.showInformationMessage('Running semantic tokens sample...');
    console.log('Executing semantic tokens run for:', runOrder.join(', '));

    const useQueue = false;

    if (useQueue) {
      runOrder.forEach((sample) => executeSequential(() => this.provideDocumentSemanticTokens(sample)));
    } else {
      for (const sample of runOrder) {
        await this.provideDocumentSemanticTokens(sample);
      }
    }

    vscode.window.showInformationMessage('Semantic tokens run completed. See console for details.');
  }

  private buildSamplePath(sample: string): string {
    return path.join(this.extensionUri.fsPath, 'data', sample);
  }

  private async provideDocumentSemanticTokens(samplePath: string): Promise<void> {
    const vsUri = vscode.Uri.file(samplePath);
    const doc = await vscode.workspace.openTextDocument(vsUri);
    const tokens = await vscode.commands.executeCommand<vscode.SemanticTokens>(
      'vscode.provideDocumentSemanticTokens',
      doc.uri
    );

    if (!tokens) {
      console.warn(`No semantic tokens returned for ${doc.uri.fsPath}`);
      return;
    }

    this.describe(doc, tokens);
    console.log('doc', doc.uri.fsPath, 'resultId', tokens.resultId, 'tokens', tokens.data.length / 5);
  }

  private describe(doc: vscode.TextDocument, tokens: vscode.SemanticTokens): void {
    const { data } = tokens;
    const lineCount = doc.lineCount;
    let prevLine = 0;
    let prevChar = 0;

    for (let i = 0; i < data.length; i += 5) {
      const deltaLine = data[i];
      const deltaStart = data[i + 1];
      const length = data[i + 2];
      const tokenTypeIndex = data[i + 3];
      const tokenModifiers = data[i + 4];

      const currentLine = prevLine + deltaLine;
      const currentChar = prevLine === currentLine ? prevChar + deltaStart : deltaStart;

      if (currentLine >= lineCount) {
        console.warn('Token outside document bounds', {
          currentLine,
          lineCount,
          currentChar,
          length
        });
      }

      console.log(
        `token line=${currentLine} col=${currentChar} len=${length} typeIndex=${tokenTypeIndex} mods=${tokenModifiers}`
      );

      prevLine = currentLine;
      prevChar = currentChar;
    }
  }
}
