import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

suite('Semantic tokens without workspace', function () {
  this.timeout(120000);

  const javaExtensionId = 'redhat.java';
  const sampleFiles = [
    'data/src1/CodeElement.java',
    'data/src2/CodeElement.java'
  ];

  test('parallel requests return different token counts', async () => {
    assert.ok(!vscode.workspace.workspaceFolders, 'Workspace should be empty for this test');

    await waitForJavaExtension(javaExtensionId, 60000);

    const [docA, docB] = await Promise.all(sampleFiles.map((relativePath) => openSample(relativePath)));

    await vscode.window.showTextDocument(docA, { preview: false });
    await vscode.window.showTextDocument(docB, { preview: false, viewColumn: vscode.ViewColumn.Beside });

    const [tokensA, tokensB] = await Promise.all([requestTokens(docA), requestTokens(docB)]);

    assert.ok(tokensA, 'Semantic tokens were not returned for the first file');
    assert.ok(tokensB, 'Semantic tokens were not returned for the second file');

    const tokenCountA = tokensA.data.length;
    const tokenCountB = tokensB.data.length;

    assert.notStrictEqual(
      tokenCountA,
      tokenCountB,
      'Expected token counts to differ for the two sample files'
    );
  });
});

async function waitForJavaExtension(extensionId: string, timeoutMs: number): Promise<void> {
  const extension = vscode.extensions.getExtension(extensionId);
  assert.ok(extension, `The ${extensionId} extension is required to run this test.`);

  if (!extension.isActive) {
    const activation = extension.activate();
    const timeout = new Promise((_resolve, reject) =>
      setTimeout(() => reject(new Error(`Timed out waiting for ${extensionId} activation.`)), timeoutMs)
    );
    await Promise.race([activation, timeout]);
  }

  // Allow the language server to finish initialization after activation.
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

async function openSample(relativePath: string): Promise<vscode.TextDocument> {
  const extensionRoot = path.resolve(__dirname, '../../..');
  const absolutePath = path.resolve(extensionRoot, relativePath);
  const uri = vscode.Uri.file(absolutePath);
  return vscode.workspace.openTextDocument(uri);
}

async function requestTokens(doc: vscode.TextDocument): Promise<vscode.SemanticTokens> {
  const attempts = 5;
  const delayMs = 2000;

  for (let i = 0; i < attempts; i += 1) {
    const tokens = await vscode.commands.executeCommand<vscode.SemanticTokens>(
      'vscode.provideDocumentSemanticTokens',
      doc.uri
    );

    if (tokens) {
      return tokens;
    }

    if (i < attempts - 1) {
      await delay(delayMs);
    }
  }

  assert.fail(`No semantic tokens returned for ${doc.uri.fsPath}`);
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

