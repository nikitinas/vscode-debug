import * as path from 'path';
import * as vscode from 'vscode';
import { executeSequential, setSequentialLogger } from './PrevenParallelAsync';

export class SayHelloCommand {
  readonly id = 'semanticTokensTester.run';

  private readonly sampleFiles = [
    'data/src1/CodeElement.java',
    'data/src2/CodeElement.java'
  ];

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly output: vscode.OutputChannel
  ) {
    setSequentialLogger(output);
  }

  async execute(): Promise<void> {
    const samples = this.sampleFiles.map((file) => this.buildSamplePath(file));
    console.log('samples', samples);
    const runOrder = [
      samples[0],
      samples[1],
      samples[0],
      samples[1],
      samples[0],
      samples[1],
      samples[0],
      samples[1]
    ];

    vscode.window.showInformationMessage('Running semantic tokens sample...');
    this.output.clear();
    this.output.show(true);
    this.output.appendLine(`Executing semantic tokens run for ${runOrder.length} requests:`);
    runOrder.forEach((sample, index) => {
      this.output.appendLine(`  [${index + 1}] ${sample}`);
    });

    const useQueue = false;

    if (useQueue) {
      runOrder.forEach((sample) => executeSequential(() => this.provideDocumentSemanticTokens(sample)));
    } else {
      const requests = runOrder.map((sample) => this.provideDocumentSemanticTokens(sample));
      await Promise.all(requests);
    }

    vscode.window.showInformationMessage('Semantic tokens run completed. See the Semantic Tokens Tester output.');
  }

  private buildSamplePath(sample: string): string {
    return path.join(this.extensionUri.fsPath, sample);
  }

  private async provideDocumentSemanticTokens(samplePath: string): Promise<void> {
    const vsUri = vscode.Uri.file(samplePath);
    const doc = await vscode.workspace.openTextDocument(vsUri);
    const tokens = await vscode.commands.executeCommand<vscode.SemanticTokens>(
      'vscode.provideDocumentSemanticTokens',
      doc.uri
    );

    if (!tokens) {
      this.output.appendLine(`No semantic tokens returned for ${doc.uri.fsPath}`);
      return;
    }

    this.describe(doc, tokens);
    this.output.appendLine(
       `doc=${doc.uri.fsPath} resultId=${tokens.resultId ?? 'n/a'} tokens=${tokens.data.length / 5}`
    );
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
        this.output.appendLine(
          `Token outside document bounds line=${currentLine} max=${lineCount} col=${currentChar} len=${length}`
        );
      }

      // this.output.appendLine(
      //   `token line=${currentLine} col=${currentChar} len=${length} typeIndex=${tokenTypeIndex} mods=${tokenModifiers}`
      // );

      prevLine = currentLine;
      prevChar = currentChar;
    }
  }
}
