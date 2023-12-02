import { ConfigurationTarget, QuickPickItem, Memento } from "vscode";

export type OnOff = "on" | "off";

export type Config = {
    description: string;
    [setting: string]: any;
};

export type Setting = {
    [scenario: string]: Config;
};

export type ToggleConfig = {
    [name: string]: Setting;
};

export type RichQuickPickItem = QuickPickItem & {
    name: string;
    newState: string;
    configTarget: ConfigurationTarget;
    store: Memento;
};

export type CommandArgs = {
    group?: string;
    cycler?: boolean;
    definition?: string;
};
