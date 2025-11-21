import { window } from 'vscode';
import * as vscode from 'vscode';
import { executeSequential } from './PrevenParallelAsync';

const file1 = '../data/CodeElement.java';
const file2 = '../data/CodeElement2.java';

function describe(doc: vscode.TextDocument, tokens: vscode.SemanticTokens) {
  console.log('got tokens id', tokens.resultId, 'len', tokens.data.length, 'file', doc.uri.fsPath);
  const array = tokens.data;
  const lineCount = doc.lineCount;
  let prevLine = 0;
  let prevChar = 0;
  for (let i = 0; i < array.length; i += 5) {
    const deltaLine = tokens.data[i];
    const deltaStart = tokens.data[i + 1];
    const length = tokens.data[i + 2];
    const currentLine = prevLine + deltaLine;
    const currentChar = prevLine === currentLine ? prevChar + deltaStart : deltaStart;
    if (currentLine >= lineCount) {
      console.log(
        'buildTokens: currentLine >= lineCount, currentLine=' + currentLine
        + ', docLineCount=' + lineCount
        + ', currentChar=' + currentChar + ', length=' + length
      );
    }
    prevLine = currentLine;
    prevChar = currentChar;
  }
}

async function provideDocumentSemanticTokens(path: string) {
  const vsUri = vscode.Uri.file(path);
  console.log('uri', vsUri);
  const doc = await vscode.workspace.openTextDocument(vsUri);
  const result = await vscode.commands.executeCommand(
    'vscode.provideDocumentSemanticTokens',
    doc.uri
  ) as vscode.SemanticTokens;
  if (result) describe(doc, result);
  console.log('doc', doc.uri.fsPath, 'result', result, 'len', result.data.length);
}

export class SayHelloCommand  {
  id = 'sayHello';

  async execute(): Promise<void> {
    window.showInformationMessage('Hello World 4');

    if (false) {
      executeSequential(() => provideDocumentSemanticTokens(file1));
      executeSequential(() => provideDocumentSemanticTokens(file2));
      executeSequential(() => provideDocumentSemanticTokens(file1));
      executeSequential(() => provideDocumentSemanticTokens(file2));
    } else {
      console.log('using 4x await....');
      await provideDocumentSemanticTokens(file1);
      await provideDocumentSemanticTokens(file2);
      await provideDocumentSemanticTokens(file1);
      await provideDocumentSemanticTokens(file2);
    }
  }
}
