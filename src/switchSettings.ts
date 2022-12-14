// The module 'vscode' contains the VS Code extensibility API
// Import only some of the modules from vscode
import { ConfigurationTarget, ExtensionContext, window, workspace, commands, QuickPickItem } from 'vscode'
import { RichQuickPickItem, ToggleConfig, Setting } from './types'

const CONFIG_SECTION = 'settingsSwitcher.lists'

export async function switchSettings(context: ExtensionContext) {
    
    const config = workspace.getConfiguration()
    const toggleConfig = config.get(CONFIG_SECTION) as ToggleConfig | undefined
    
    if (!toggleConfig) {
        window.showErrorMessage('No Toggle configuration found.')
        return
    }
    
    const majorItems = getMajorQuickPickItems(context, toggleConfig)
    const majorSelection = await window.showQuickPick(majorItems)
    if (!majorSelection) return
    
    const name = majorSelection.label
    const items = getQuickPickItems(context, toggleConfig[majorSelection.label], majorSelection.label)
    
    const selection = await window.showQuickPick(items)
    if (!selection) return
    
    selection.newState = selection.name
    
    const { newState, store, configTarget } = selection
    const settings = toggleConfig[majorSelection.label][newState]
    
    for (const key in settings) {
        if (key === 'description') continue
        
        const val = settings[key]
        const currentConfig = configValueForTarget(key, configTarget)
        let newConfig
        
        // Merge objects, overwrite other types
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            if (!currentConfig || typeof currentConfig === 'object') {
                newConfig = val
            } else {
                window.showErrorMessage(
                    'Settings Switcher error! Toggle configuration specified is a different type than the existing one.',
                )
                return
            }
        } else {
            newConfig = val
        }
        config.update(key, newConfig, configTarget)
        store.update(name, newState)
    }
    
    window.showInformationMessage('Updated selected settings')
    
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-settings-switcher" is now active!');
    
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = commands.registerCommand('vscode-settings-switcher.helloWorld', () => {
    //     // The code you place here will be executed every time your command is executed
    //     // Display a message box to the user
    //     window.showInformationMessage('Hello World from VSCode Settings Switcher!');
    // });
    
    // context.subscriptions.push(disposable);
}

function configValueForTarget(configSection: string, target: ConfigurationTarget) {
    const data = workspace.getConfiguration().inspect(configSection)
    if (!data) return
    
    return target === ConfigurationTarget.Global
        ? data.globalValue
        : target === ConfigurationTarget.Workspace
            ? data.workspaceValue
            : data.workspaceFolderValue
}

function getConfigTargetForSection(configSection: string) {
    const data = workspace.getConfiguration().inspect(configSection)
    if (!data) return
    
    return data.workspaceValue !== undefined
        ? ConfigurationTarget.Workspace
        : ConfigurationTarget.Global
}

function getQuickPickItems(context: ExtensionContext, setting: Setting, parent: string) {
    const items: RichQuickPickItem[] = []
    
    for (const name in setting) {
        const configTarget = getConfigTargetForSection(
            `${CONFIG_SECTION}.${parent}`,
        ) as ConfigurationTarget
        
        const store =
            configTarget === ConfigurationTarget.Workspace ? context.workspaceState : context.globalState
            
        const newState = 'temp'
        const description = setting[name].description || ""
        
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

function getMajorQuickPickItems(context: ExtensionContext, toggleConfig: ToggleConfig) {
    const items: QuickPickItem[] = []
    
    for (const name in toggleConfig) {
        const configTarget = getConfigTargetForSection(
            `${CONFIG_SECTION}.${name}`,
        ) as ConfigurationTarget
        
        const store =
            configTarget === ConfigurationTarget.Workspace ? context.workspaceState : context.globalState
            
        const currentState: string = store.get(name) || ""
        const description = currentState
        
        items.push({
            label: name,
            description,
        })
    }
    
    return items
}

// this method is called when your extension is deactivated
export function deactivate() {}