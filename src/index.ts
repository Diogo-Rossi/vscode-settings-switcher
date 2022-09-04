import { commands, ExtensionContext, window } from 'vscode'
import { toggleSettings } from './toggleSettings'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export const activate = async function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand('vscode-settings-switcher.toggleSettings', () => toggleSettings(context))
    )
}
