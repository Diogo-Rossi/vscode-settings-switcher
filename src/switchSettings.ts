// The module 'vscode' contains the VS Code extensibility API
// Import only some of the modules from vscode
import { ConfigurationTarget, ExtensionContext, QuickPickItem, window, workspace } from "vscode";
import { CommandArgs, RichQuickPickItem, Setting, ToggleConfig } from "./types";

const CONFIG_SECTION = "settingsSwitcher.lists";
const JSON_INFO = "settingsSwitcher.showFileInfo";
const SCOPE_INFO = "settingsSwitcher.showScopeInfo";
const CYCLER_INFO = "settingsSwitcher.showCyclerInfo";

export async function switchSettings(context: ExtensionContext, args: CommandArgs | undefined) {
    const config = workspace.getConfiguration();
    const toggleConfig = config.get(CONFIG_SECTION) as ToggleConfig | undefined;

    if (!toggleConfig) {
        window.showErrorMessage("No Toggle configuration found.");
        return;
    }

    if (args === undefined) args = {};

    var group = args.group;

    if (!group) {
        const majorItems = getMajorQuickPickItems(context, toggleConfig);
        const majorSelection = await window.showQuickPick(majorItems);
        if (!majorSelection) return;
        group = majorSelection.label;
    }

    if (!toggleConfig.hasOwnProperty(group)) {
        window.showErrorMessage(`Group of settings "${group}" does not exist in setting "settingsSwitcher.lists" !`);
        return;
    }

    let scope = toggleConfig[group]["_scope"] as unknown as string;
    const isCycler = toggleConfig[group]["_cycler"] as unknown as boolean;

    const name = group;
    const items = getQuickPickItems(context, toggleConfig[group], group);

    var definition = args.definition;
    var selection = getItemFromLabel(items, definition);
    if (!selection) {
        if (args.cycler || isCycler) {
            selection = getNextItem(context, group, items);
        } else {
            selection = await window.showQuickPick(items);
        }
    }
    if (!selection) return;

    selection.newState = selection.name;

    const { newState, store, configTarget } = selection;
    const settings = toggleConfig[group][newState];

    for (const key in settings) {
        if (key === "description") continue;

        let scopeTarget = configTarget;
        if (scope === "select") scope = (await window.showQuickPick(["global", "local"])) as string;
        if (scope === "global" || scope === "user") scopeTarget = ConfigurationTarget.Global;
        if (scope === "local" || scope === "workspace") scopeTarget = ConfigurationTarget.Workspace;

        const val = settings[key];
        const currentConfig = configValueForTarget(key, scopeTarget);
        let newConfig;

        // Merge objects, overwrite other types
        if (val && typeof val === "object" && !Array.isArray(val)) {
            if (!currentConfig || typeof currentConfig === "object") {
                if (currentConfig === undefined) {
                    newConfig = { ...val };
                } else {
                    const newVal = unProxify(val);
                    newConfig = { ...currentConfig, ...newVal };
                }
            } else {
                window.showErrorMessage(
                    "Settings Switcher error! Toggle configuration specified is a different type than the existing one."
                );
                return;
            }
        } else {
            newConfig = val;
        }
        config.update(key, newConfig, scopeTarget);
        store.update(name, newState);
    }

    window.showInformationMessage("Updated selected settings");

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
    const data = workspace.getConfiguration().inspect(configSection);
    if (!data) return;

    return target === ConfigurationTarget.Global
        ? data.globalValue
        : target === ConfigurationTarget.Workspace
        ? data.workspaceValue
        : data.workspaceFolderValue;
}

function getConfigTargetForSection(configSection: string) {
    const data = workspace.getConfiguration().inspect(configSection);
    if (!data) return;

    return data.workspaceValue !== undefined ? ConfigurationTarget.Workspace : ConfigurationTarget.Global;
}

function getQuickPickItems(context: ExtensionContext, setting: Setting, parent: string) {
    const items: RichQuickPickItem[] = [];

    for (const name in setting) {
        if (name === "_scope") continue;
        if (name === "_cycler") continue;
        const configTarget = getConfigTargetForSection(`${CONFIG_SECTION}.${parent}`) as ConfigurationTarget;

        const store = configTarget === ConfigurationTarget.Workspace ? context.workspaceState : context.globalState;

        const newState = "temp";
        const description = setting[name].description || "";

        items.push({
            label: name,
            description,
            name,
            newState,
            configTarget,
            store,
        });
    }

    return items;
}

function getMajorQuickPickItems(context: ExtensionContext, toggleConfig: ToggleConfig) {
    const items: QuickPickItem[] = [];
    const config = workspace.getConfiguration();
    const jsonInfo = config.get(JSON_INFO);
    const scopeInfo = config.get(SCOPE_INFO);
    const cyclerInfo = config.get(CYCLER_INFO);

    for (const name in toggleConfig) {
        const infos: string[] = [];
        const configTarget = getConfigTargetForSection(`${CONFIG_SECTION}.${name}`) as ConfigurationTarget;
        const isInWorkspace = configTarget === ConfigurationTarget.Workspace;

        const store = isInWorkspace ? context.workspaceState : context.globalState;

        const currentState: string = store.get(name) || "";
        if (jsonInfo) {
            infos.push(isInWorkspace ? "file = workspace" : "file = user");
        }
        if (scopeInfo && toggleConfig[name]["_scope"]) {
            infos.push(
                String(toggleConfig[name]["_scope"]) === "workspace" || String(toggleConfig[name]["_scope"]) === "local"
                    ? "scope = local"
                    : String(toggleConfig[name]["_scope"]) === "select"
                    ? "scope = select"
                    : "scope = global"
            );
        }
        if (cyclerInfo && toggleConfig[name]["_cycler"]) {
            infos.push("cycler");
        }

        infos.unshift(currentState);

        const description = infos.join(" | ");

        items.push({
            label: name,
            description,
        });
    }

    return items;
}

function getItemFromLabel(items: RichQuickPickItem[], label: string | undefined) {
    for (const item in items) {
        if (items[item].name === label) return items[item];
    }
}

function getNextItem(context: ExtensionContext, name: string, items: RichQuickPickItem[]) {
    const configTarget = getConfigTargetForSection(`${CONFIG_SECTION}.${name}`) as ConfigurationTarget;
    const store = configTarget === ConfigurationTarget.Workspace ? context.workspaceState : context.globalState;
    const currentState: string = store.get(name) || "";

    for (const item in items) {
        if (items[item].name === currentState && parseInt(item) < items.length - 1) return items[parseInt(item) + 1];
    }
    return items[0];
}

/**
 * Deep clone an object with ES6 Proxy objects
 * @param val The object to un-proxy
 * @returns The object recursively cloned
 * @see https://stackoverflow.com/a/69827802/9761768
 */
function unProxify(val: Object): Object {
    if (val instanceof Array) return val.map(unProxify);
    if (val instanceof Object)
        return Object.fromEntries(Object.entries(Object.assign({}, val)).map(([k, v]) => [k, unProxify(v)]));
    return val;
}

// this method is called when your extension is deactivated
export function deactivate() {}
