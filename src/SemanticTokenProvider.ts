import * as vscode from 'vscode';

const tokenTypes = ['class', 'method', 'property', 'type', 'keyword', 'comment'] as const;
const tokenModifiers = ['declaration', 'static'] as const;

type TokenType = typeof tokenTypes[number];
type TokenModifier = typeof tokenModifiers[number];

const legend = new vscode.SemanticTokensLegend([...tokenTypes], [...tokenModifiers]);

export function registerJavaSemanticTokensProvider(context: vscode.ExtensionContext): void {
  const selector: vscode.DocumentSelector = [{ language: 'java', scheme: 'file' }];
  const provider = new JavaSemanticTokensProvider();
  context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider(selector, provider, legend));
}

class JavaSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
  async provideDocumentSemanticTokens(document: vscode.TextDocument): Promise<vscode.SemanticTokens> {
    const builder = new vscode.SemanticTokensBuilder(legend);

    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber += 1) {
      const line = document.lineAt(lineNumber).text;

      this.highlightKeywords(builder, lineNumber, line);
      this.highlightClassDeclarations(builder, lineNumber, line);
      this.highlightMethodDeclarations(builder, lineNumber, line);
      this.highlightLineComments(builder, lineNumber, line);
    }

    return builder.build();
  }

  private highlightKeywords(builder: vscode.SemanticTokensBuilder, lineNumber: number, line: string): void {
    const keywords = /\b(package|import|class|public|private|protected|void|final|static|return|new|extends|implements)\b/g;
    this.pushMatches(builder, lineNumber, line, keywords, 'keyword');
  }

  private highlightClassDeclarations(builder: vscode.SemanticTokensBuilder, lineNumber: number, line: string): void {
    const classDecl = /\bclass\s+([A-Z][\w]*)/g;
    this.pushMatches(builder, lineNumber, line, classDecl, 'keyword');

    let match: RegExpExecArray | null;
    const namePattern = /\bclass\s+([A-Z][\w]*)/g;
    while ((match = namePattern.exec(line))) {
      const [, name] = match;
      const start = match.index + match[0].indexOf(name);
      this.pushToken(builder, lineNumber, start, name.length, 'class', ['declaration']);
    }
  }

  private highlightMethodDeclarations(builder: vscode.SemanticTokensBuilder, lineNumber: number, line: string): void {
    const methodPattern = /\b([a-z]\w*)\s*\(/g;
    let match: RegExpExecArray | null;
    while ((match = methodPattern.exec(line))) {
      const name = match[1];
      this.pushToken(builder, lineNumber, match.index, name.length, 'method');
    }
  }

  private highlightLineComments(builder: vscode.SemanticTokensBuilder, lineNumber: number, line: string): void {
    const index = line.indexOf('//');
    if (index >= 0) {
      this.pushToken(builder, lineNumber, index, line.length - index, 'comment');
    }
  }

  private pushMatches(
    builder: vscode.SemanticTokensBuilder,
    lineNumber: number,
    line: string,
    regex: RegExp,
    tokenType: TokenType,
    modifiers: TokenModifier[] = []
  ): void {
    let match: RegExpExecArray | null;
    regex.lastIndex = 0;
    while ((match = regex.exec(line))) {
      this.pushToken(builder, lineNumber, match.index, match[0].length, tokenType, modifiers);
    }
  }

  private pushToken(
    builder: vscode.SemanticTokensBuilder,
    line: number,
    startChar: number,
    length: number,
    tokenType: TokenType,
    modifiers: TokenModifier[] = []
  ): void {
    const tokenTypeIndex = tokenTypes.indexOf(tokenType);
    if (tokenTypeIndex === -1) {
      return;
    }

    const modifierMask = modifiers.reduce((acc, modifier) => {
      const idx = tokenModifiers.indexOf(modifier);
      return idx === -1 ? acc : acc | (1 << idx);
    }, 0);

    builder.push(line, startChar, length, tokenTypeIndex, modifierMask);
  }
}

