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
exports.registerJavaSemanticTokensProvider = registerJavaSemanticTokensProvider;
const vscode = __importStar(require("vscode"));
const tokenTypes = ['class', 'method', 'property', 'type', 'keyword', 'comment'];
const tokenModifiers = ['declaration', 'static'];
const legend = new vscode.SemanticTokensLegend([...tokenTypes], [...tokenModifiers]);
function registerJavaSemanticTokensProvider(context) {
    const selector = [{ language: 'java', scheme: 'file' }];
    const provider = new JavaSemanticTokensProvider();
    context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider(selector, provider, legend));
}
class JavaSemanticTokensProvider {
    async provideDocumentSemanticTokens(document) {
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
    highlightKeywords(builder, lineNumber, line) {
        const keywords = /\b(package|import|class|public|private|protected|void|final|static|return|new|extends|implements)\b/g;
        this.pushMatches(builder, lineNumber, line, keywords, 'keyword');
    }
    highlightClassDeclarations(builder, lineNumber, line) {
        const classDecl = /\bclass\s+([A-Z][\w]*)/g;
        this.pushMatches(builder, lineNumber, line, classDecl, 'keyword');
        let match;
        const namePattern = /\bclass\s+([A-Z][\w]*)/g;
        while ((match = namePattern.exec(line))) {
            const [, name] = match;
            const start = match.index + match[0].indexOf(name);
            this.pushToken(builder, lineNumber, start, name.length, 'class', ['declaration']);
        }
    }
    highlightMethodDeclarations(builder, lineNumber, line) {
        const methodPattern = /\b([a-z]\w*)\s*\(/g;
        let match;
        while ((match = methodPattern.exec(line))) {
            const name = match[1];
            this.pushToken(builder, lineNumber, match.index, name.length, 'method');
        }
    }
    highlightLineComments(builder, lineNumber, line) {
        const index = line.indexOf('//');
        if (index >= 0) {
            this.pushToken(builder, lineNumber, index, line.length - index, 'comment');
        }
    }
    pushMatches(builder, lineNumber, line, regex, tokenType, modifiers = []) {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(line))) {
            this.pushToken(builder, lineNumber, match.index, match[0].length, tokenType, modifiers);
        }
    }
    pushToken(builder, line, startChar, length, tokenType, modifiers = []) {
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
//# sourceMappingURL=SemanticTokenProvider.js.map