"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SayHelloCommand = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const PrevenParallelAsync_1 = require("./PrevenParallelAsync");
class SayHelloCommand {
    extensionUri;
    output;
    id = 'semanticTokensTester.run';
    sampleFiles = ['CodeElement.java', 'CodeElement2.java'];
    constructor(extensionUri, output) {
        this.extensionUri = extensionUri;
        this.output = output;
        (0, PrevenParallelAsync_1.setSequentialLogger)(output);
    }
    async execute() {
        const samples = this.sampleFiles.map((file) => this.buildSamplePath(file));
        const runOrder = [samples[0], samples[1], samples[0], samples[1]];
        vscode.window.showInformationMessage('Running semantic tokens sample...');
        this.output.clear();
        this.output.show(true);
        this.output.appendLine(`Executing semantic tokens run for: ${runOrder.join(', ')}`);
        const useQueue = false;
        if (useQueue) {
            runOrder.forEach((sample) => (0, PrevenParallelAsync_1.executeSequential)(() => this.provideDocumentSemanticTokens(sample)));
        }
        else {
            for (const sample of runOrder) {
                await this.provideDocumentSemanticTokens(sample);
            }
        }
        vscode.window.showInformationMessage('Semantic tokens run completed. See the Semantic Tokens Tester output.');
    }
    buildSamplePath(sample) {
        return path.join(this.extensionUri.fsPath, 'data', sample);
    }
    async provideDocumentSemanticTokens(samplePath) {
        const vsUri = vscode.Uri.file(samplePath);
        const doc = await vscode.workspace.openTextDocument(vsUri);
        const tokens = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', doc.uri);
        if (!tokens) {
            this.output.appendLine(`No semantic tokens returned for ${doc.uri.fsPath}`);
            return;
        }
        this.describe(doc, tokens);
        this.output.appendLine(`doc=${doc.uri.fsPath} resultId=${tokens.resultId ?? 'n/a'} tokens=${tokens.data.length / 5}`);
    }
    describe(doc, tokens) {
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
                this.output.appendLine(`Token outside document bounds line=${currentLine} max=${lineCount} col=${currentChar} len=${length}`);
            }
            // this.output.appendLine(
            //   `token line=${currentLine} col=${currentChar} len=${length} typeIndex=${tokenTypeIndex} mods=${tokenModifiers}`
            // );
            prevLine = currentLine;
            prevChar = currentChar;
        }
    }
}
exports.SayHelloCommand = SayHelloCommand;
//# sourceMappingURL=SayHelloCommand.js.map