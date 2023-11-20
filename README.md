<p align="center">
    <img height="150px" src="images/icon.png"/>
</p>

# VSCode Settings Switcher

Define groups of settings to be easily switched and managed. These may be
defined in either global `User Settings` or your current `Workspace settings`.

This extension was largely based on the
[ericbiewener](https://github.com/ericbiewener)'s extension [VScode Settings on
Fire](https://github.com/ericbiewener/vscode-settings-on-fire).

## Command

Provides a `Switch Settings` command that can be used to switch between groups
of settings.

## Configuration Example

The following example shows 2 groups of settings to switch:

```jsonc
"settingsSwitcher.lists": {
    "Vertical rulers": {
        "Ruler 80": {
            "description": "Cyan ruler line at column 80",
            "editor.rulers": [{"column": 79, "color": "#4f717a" }]
        },
        "Ruler 85": {
            "description": "Yellow ruler line at column 85",
            "editor.rulers": [ { "column": 84, "color": "#615f44" }]
        },
        "Ruler 95": {
            "description": "Blue ruler line at column 95",
            "editor.rulers": [ { "column": 94, "color": "#00028a" }]
        },
    },
    "Fonts and theme": {
        "Big font dark":{
            "editor.fontSize": 18,
            "workbench.colorTheme": "Default Dark+"
        },
        "Small font light":{
            "editor.fontSize": 10,
            "workbench.colorTheme": "Default Light+"
        },
        "Big font light":{
            "editor.fontSize": 18,
            "workbench.colorTheme": "Default Light+"
        },
        "Medium font dark":{
            "editor.fontSize": 12,
            "workbench.colorTheme": "Default Dark+"
        },
    }
},
```

By running the command `Switch Settings`, the two groups of settings `"Vertical
rulers"` and `"Fonts and theme"` will appear as a list in your command palette.
So, first you select which group of settings you want to switch.

![](images/list1.png)

If already set, the current configuration will appear with small font,
indicating the current state. The `"Ruler 85"` and `"Big font dark"` that you
see in the screenshot above indicates the current state of the setting. Before
ever choosing a setting, the current state will be empty.

Next, a second list will appear indicating the available settings to switch in
the chosen group. A small `"description"` property may be provided in each
configured setting and, if so, the description will appear with small font in
this second list.

![](images/list2.png)

You can specify any amount of settings inside each group definitions. These
settings will simply be written to your top-level settings object. For instance:
the showed example has a group of settings `"Fonts and theme"` and each
definition inside it changes the `fontSize` and the `colorTheme` together at the
same time.

![](images/example.gif)

## Descriptions

You may include the `"description"` key property in each setting definition to
provide more clarity around what switching the setting will do. The following
example uses a setting from the [Python extension for Visual Studio
Code](https://github.com/Microsoft/vscode-python)

```jsonc
"settingsSwitcher.lists": {
    "Arguments to run python in terminal": {
        "Normal mode": {
            "description": "No args, just run `python script.py`",
            "python.terminal.launchArgs": [""]
        },
        "Interactive mode": {
            "description": "Keep the opened terminal, run `python -i script.py`",
            "python.terminal.launchArgs": [ "-i" ]
        },
        "IPython interactive mode": {
            "description": "Run `python -m IPython -i script.py`",
            "python.terminal.launchArgs": [ "-m", "IPython", "-i" ]
        },
    },
},
```

![](images/python.png)

If no `"description"` is provided, it will appear as empty, like in the first
example, with the group of settings `"Fonts and theme"`.

## User Settings vs Workspace settings

You can switch between groups of settings in either global `User Settings` or
your current `Workspace settings`. To do so, the setting
`"settingsSwitcher.lists"` with the groups of settings to switch must be defined
in the corresponding `settings.json` file (either global or local)

You can also change which file (global or workspace) is modified by
including a `_scope` key in defined group of settings. This key accept the
values `"global"` and `"workspace"`.

## Extension Settings

This extension adds VS Code setting `"settingsSwitcher.lists"`, which may have
any amount of _groups_ of settings, each group may have a _scope_ property and
any amount of _definitions_ and each definition may have a _description_ and any
amount of _settings_. So, there are 3 levels of keys:

```jsonc
"settingsSwitcher.lists": {
    "First group of settings": {
        "_scope": "workspace",  // optional: "workspace" or "global"
        "First definition": {
            "description": "...", // optional
            [vscode settings ...] // Any amount of VSCode settings
        },
        "Second definition": {
            "description": "...", // optional
            [vscode settings ...] // Any amount of VSCode settings
        },
        "Third definition": {
            "description": "...", // optional
            [vscode settings ...] // Any amount of VSCode settings
        },
    "Second group of settings": {
        "_scope": "workspace",  // optional: "workspace" or "global"
        "First definition": {
            "description": "...", // optional
            [vscode settings ...] // Any amount of VSCode settings
        },
        "Second definition": {
            "description": "...", // optional
            [vscode settings ...] // Any amount of VSCode settings
        },
        ...
    },
    ...
},
```

## Merging vs Overwriting Settings

Settings that are objects will be merged into existing settings, while any other
type of value will simply overwrite the previous setting. For example, the
`Tests` settings below will merge the values in `files.exclude` with whatever
the current setting is for that key.

```json
"settingsSwitcher.lists": {
    "Tests": {
        "Include tests": {
            "files.exclude": {
                "**/__tests__": false,
                "**/__mocks__": false,
                "**/__fixtures__": false,
                "**/*.spec.js": false,
            }
        },
        "Exclude tests": {
            "files.exclude": {
                "**/__tests__": true,
                "**/__mocks__": true,
                "**/__fixtures__": true,
                "**/*.spec.js": true,
            }
        }
    }
}
```

## Credits

The code of this extension was largely based on the
[ericbiewener](https://github.com/ericbiewener)'s extension [VScode Settings on
Fire](https://github.com/ericbiewener/vscode-settings-on-fire).
