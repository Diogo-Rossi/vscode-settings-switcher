import { ConfigurationTarget, QuickPickItem, Memento } from 'vscode'

export type OnOff = 'on' | 'off'

type Config = {
    _label: string
    [setting: string]: any
}

export type Setting = {
    [scenario: string]: Config
}

export type ToggleConfig = {
    [name: string] : Setting
}

export type RichQuickPickItem = QuickPickItem & {
    name: string
    newState: string
    configTarget: ConfigurationTarget
    store: Memento
}
