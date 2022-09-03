// The module 'vscode' contains the VS Code extensibility API
// Import only some of the modules from vscode
import { ConfigurationTarget, ExtensionContext, window, workspace, commands } from 'vscode'
import { RichQuickPickItem, ToggleConfig, OnOff } from './types'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-settings-switcher" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = commands.registerCommand('vscode-settings-switcher.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        window.showInformationMessage('Hello World from VSCode Settings Switcher!');
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getConfigTargetForSection(configSection: string) {
    const data = workspace.getConfiguration().inspect(configSection)
    if (!data) return

    return data.workspaceValue !== undefined
        ? ConfigurationTarget.Workspace
        : ConfigurationTarget.Global
}

function getQuickPickItems(context: ExtensionContext, toggleConfig: ToggleConfig) {
    const items: RichQuickPickItem[] = []

    for (const name in toggleConfig) {
        const configTarget = getConfigTargetForSection(
            `${CONFIG_SECTION}.${name}`,
        ) as ConfigurationTarget

        const store =
            configTarget === ConfigurationTarget.Workspace ? context.workspaceState : context.globalState

        const currentState: OnOff = store.get(name) || 'off'
        const newState = currentState === 'on' ? 'off' : 'on'
        const newConfig = toggleConfig[name][newState]
        const description = newConfig._label || newState

        items.push({
            label: name,
            description,
            name,
            newState,
            configTarget,
            store,
        })
    }

    return items
}