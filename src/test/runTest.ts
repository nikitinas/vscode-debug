import * as path from 'path';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import {
  downloadAndUnzipVSCode,
  resolveCliArgsFromVSCodeExecutablePath,
  runTests
} from '@vscode/test-electron';

async function main(): Promise<void> {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    const vscodeExecutablePath = await downloadAndUnzipVSCode('stable');
    const [cli, ...cliArgs] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
    const workspaceRoot = path.resolve(extensionDevelopmentPath);
    const userDataDir = path.join(workspaceRoot, '.vscode-test', 'user-data');
    const extensionsDir = path.join(workspaceRoot, '.vscode-test', 'extensions');

    await ensureDir(userDataDir);
    await ensureDir(extensionsDir);

    await installExtension(cli, [
      ...cliArgs,
      '--install-extension',
      'redhat.java',
      '--force',
      '--user-data-dir',
      userDataDir,
      '--extensions-dir',
      extensionsDir
    ]);

    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ['--disable-workspace-trust'],
      reuseMachineInstall: false
    });
  } catch (err) {
    console.error('Failed to run tests');
    if (err) {
      console.error(err);
    }
    process.exit(1);
  }
}

main();

async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

async function installExtension(cli: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(cli, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Failed to install extension (exit code ${code}).`));
      }
    });
  });
}

