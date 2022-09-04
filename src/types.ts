import { ConfigurationTarget, QuickPickItem, Memento } from 'vscode'

export type OnOff = 'on' | 'off'

type Config = {
    _label: string
    [setting: string]: any
}

type ConfigList = {
    [name: string]: {
        [setting: string]: Config
    }
}

type ConfigOnOff = {
    [name: string]: {
        on: Config
        off: Config
    }
}

// export type ToggleConfig = {
//     [namelist: ConfigList | ConfigOnOff]
// }

export type ToggleConfig = {
    [name: string]: {
        [setting: string]: Config
    }
}

export type RichQuickPickItem = QuickPickItem & {
    name: string
    newState: OnOff
    configTarget: ConfigurationTarget
    store: Memento
}
