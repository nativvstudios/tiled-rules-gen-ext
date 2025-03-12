# Tiled Rules Generator

## Overview
Tiled Rules Generator is an extension for the Tiled Map Editor that helps you manage and generate rules.txt files. It enables you to consolidate rules from multiple folders into a single rules.txt file for use in your maps, with support for Tiled's wildcard patterns to control which maps specific rules apply to.

![Tiled Rules Generator UI (currently)](screenshot.png)

## Current Status
This extension is now functional and ready for use.

### Features:
- Scan multiple folders for .tmx rule files
- Apply wildcard patterns to control which maps rules apply to (e.g., [town*], [dungeon*])
- Automatic generation of properly formatted rules.txt files
- Dynamic UI for adding/removing folders to scan
- Detailed logging of scanned files
- Built-in help documentation
- Smart handling of file paths

## Purpose
The purpose of this extension is to simplify the management of rule files in Tiled projects. Rather than manually creating and maintaining rules.txt files, this tool:

1. Scans selected folders for .tmx rule files
2. Allows you to specify which maps each folder's rules should apply to
3. Consolidates all found rules into a single rules.txt file
4. Places this file in your specified location

This eliminates the need to manually edit rules.txt files every time you add or modify rule maps, making the automapping workflow more efficient, especially for larger projects with many different tilesets and rules spread across multiple folders.

## Installation

1. Download the extension files
2. Place them in your Tiled extensions folder:
   - Windows: `%APPDATA%\Tiled\extensions\`
   - macOS: `~/Library/Preferences/Tiled/extensions/`
   - Linux: `~/.config/tiled/extensions/`
3. Restart Tiled
4. Access the tool from the Map menu: `Map > Generate Rules.txt`

## Usage

1. Open the dialog from the Map menu
2. Specify the output path for your rules.txt file
   - You can specify either a full file path or just a directory (rules.txt will be added automatically)
3. Add folders to scan containing your .tmx rule files
4. For each folder, specify a wildcard pattern to control which maps these rules apply to:
   - `[*]` - Apply to all maps (default)
   - `[town*]` - Apply only to maps starting with "town"
   - `[dungeon*]` - Apply only to maps starting with "dungeon"
5. Add additional folders using the "+" button or remove them with the "-" button
6. Click "Scan" to preview which .tmx files will be included (logs to the Tiled console)
7. Click "Generate" to create the consolidated rules.txt file
8. Click the "?" button for additional help and information

## Understanding Tiled Wildcards

This extension supports Tiled's wildcard system for rules.txt files. Each folder's rules can be set to apply only to specific maps:

- A pattern like `[town*]` means "apply these rules only to maps whose filenames start with 'town'"
- The pattern `[*]` means "apply these rules to all maps"
- You can organize your rules by category (buildings, terrain, etc.) and control where each category applies

## Future Enhancements

- Rule validation and conflict detection
- Rule merging and prioritization options
- Custom rule inclusion/exclusion
- Preview of generated rules.txt content in the dialog

## Contributing

This extension is open for contributions. If you'd like to help develop this tool, feel free to:

1. Fork the repository
2. Make your changes
3. Submit a pull request

### Development Focus Areas:
- Improving the UI/UX of the extension
- Adding support for rule filtering or categorization
- Creating better documentation and examples
- Adding a visual preview of the rules.txt structure

## License

[MIT License](LICENSE)

## Acknowledgements

- The [Tiled Map Editor](https://www.mapeditor.org/) team for their excellent map editor and extension API
- All contributors and testers of this extension