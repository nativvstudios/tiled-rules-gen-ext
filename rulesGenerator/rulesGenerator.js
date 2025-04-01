// Global state for the rules generator
var generateRulesState = {
    dialogOpen: false,
    folderPaths: [], // paths to scan
    wildcardPatterns: [], // map wildcards to apply to each folder
    currentDialog: null,
    outputPath: "" // Where to save the rules.txt file
}

// Shows a notification dialog with a title and message
// type can be "info", "success", "error", or "warning"
generateRulesState.showNotification = function(title, message, type) {
    let notificationDialog = new Dialog(title);
    
    // Create an icon based on the type
    let iconText = "";
    switch(type) {
        case "success":
            iconText = "✓"; // Checkmark
            break;
        case "error":
            iconText = "✗"; // X mark
            break;
        case "warning":
            iconText = "⚠"; // Warning
            break;
        case "info":
        default:
            iconText = "ℹ"; // Info
            break;
    }
    
    notificationDialog.addNewRow();
    let iconLabel = notificationDialog.addLabel(iconText);
    iconLabel.styleSheet = "font-size: 24px; margin-right: 10px;";
    
    // Add color based on the type
    switch(type) {
        case "success":
            iconLabel.styleSheet += " color: green;";
            break;
        case "error":
            iconLabel.styleSheet += " color: red;";
            break;
        case "warning":
            iconLabel.styleSheet += " color: orange;";
            break;
        case "info":
            iconLabel.styleSheet += " color: blue;";
            break;
    }
    
    let messageLabel = notificationDialog.addLabel(message);
    messageLabel.styleSheet = "font-size: 14px;";
    notificationDialog.addNewRow();
    
    let okButton = notificationDialog.addButton("OK");
    okButton.clicked.connect(function() {
        notificationDialog.done(Dialog.Accepted);
    });
    
    notificationDialog.minimumWidth = 300;
    
    // Center on screen if possible
    try {
        // This might not work in all versions of Tiled
        notificationDialog.setGeometry(
            (tiled.activeAsset.width - 300) / 2,
            (tiled.activeAsset.height - 100) / 2,
            300, 100
        );
    } catch(e) {
        // Ignore positioning errors
    }
    
    notificationDialog.show();
    
    return notificationDialog;
};

// Register the action with Tiled
generateRulesState.generateRulesDialog = tiled.registerAction("GenerateRulesDialog", function(action) {
    // Don't open multiple dialogs
    if(generateRulesState.dialogOpen) return;
    
    // Make sure we have at least one folder path
    if(generateRulesState.folderPaths.length === 0) {
        generateRulesState.folderPaths.push("");
        generateRulesState.wildcardPatterns.push("[*]"); // Default to applying to all maps
    }
    
    // Create dialog
    generateRulesState.currentDialog = new Dialog("Generate Rules.txt");
    generateRulesState.dialogOpen = true;
    
    // Fill it with content
    generateRulesState.refreshDialogContent();
    
    // Clean up when dialog is closed
    generateRulesState.currentDialog.finished.connect(function() {
        generateRulesState.dialogOpen = false;
        generateRulesState.currentDialog = null;
    });
    
    generateRulesState.currentDialog.show();
});

// Rebuilds the dialog UI whenever we add/remove folders
generateRulesState.refreshDialogContent = function() {
    let dialog = generateRulesState.currentDialog;
    let folderInputs = []; 
    let wildcardInputs = [];
    
    dialog.clear();
    
    // Header & explanation
    dialog.addHeading("Generate Rules.txt File", true);
    dialog.addLabel("This tool scans folders for rule files and generates a rules.txt file.");
    dialog.addNewRow();
    dialog.addLabel("Each folder can have a wildcard pattern that controls which maps the rules apply to.");
    dialog.addNewRow();
    dialog.addLabel("For example, [town*] would apply rules only to maps that start with 'town'.");
    dialog.addSeparator();
    
    // Output file path
    dialog.addNewRow();
    dialog.addHeading("Output rules.txt path:", true);
    let outputInput = dialog.addTextInput("");
    outputInput.text = generateRulesState.outputPath;
    dialog.addNewRow();
    dialog.addSeparator();
    
    // Folders and wildcards
    dialog.addNewRow();
    dialog.addHeading("Rule Folders and Map Wildcards", true);
    
    for(let i = 0; i < generateRulesState.folderPaths.length; i++) {
        dialog.addNewRow();
        
        // Folder path input
        dialog.addLabel("Folder to scan:");
        let folderInput = dialog.addTextInput("");
        folderInput.text = generateRulesState.folderPaths[i];
        folderInputs.push(folderInput);
        
        // Wildcard pattern input
        dialog.addLabel("Apply to maps:");
        let wildcardInput = dialog.addTextInput("");
        wildcardInput.text = generateRulesState.wildcardPatterns[i] || "[*]";
        wildcardInputs.push(wildcardInput);
    }

    dialog.addNewRow();
    dialog.addSeparator();
    
    // Add/Remove buttons
    dialog.addNewRow();
    let addButton = dialog.addButton("+");
    let removeButton = dialog.addButton("-");

    // Add button - adds a new folder input with wildcard
    addButton.clicked.connect(function() {
        // Save what we have first
        generateRulesState.outputPath = outputInput.text;
        for(let i = 0; i < folderInputs.length; i++) {
            generateRulesState.folderPaths[i] = folderInputs[i].text;
            generateRulesState.wildcardPatterns[i] = wildcardInputs[i].text;
        }
        
        generateRulesState.folderPaths.push("");
        generateRulesState.wildcardPatterns.push("[*]");
        generateRulesState.refreshDialogContent();
    });
    
    // Remove button - removes the last folder input
    removeButton.clicked.connect(function() {
        if(generateRulesState.folderPaths.length > 1) {
            // Copy current values before removing
            generateRulesState.outputPath = outputInput.text;
            for(let i = 0; i < folderInputs.length - 1; i++) {
                generateRulesState.folderPaths[i] = folderInputs[i].text;
                generateRulesState.wildcardPatterns[i] = wildcardInputs[i].text;
            }
            
            generateRulesState.folderPaths.pop();
            generateRulesState.wildcardPatterns.pop();
            generateRulesState.refreshDialogContent();
        } else {
            generateRulesState.showNotification("Error", "Can't remove the last folder!", "error");
            tiled.log("Can't remove the last folder!");
        }
    });
    
    // Scan button - logs folder contents to console
    let scanButton = dialog.addButton("Scan");
    scanButton.clicked.connect(function() {
        // Get latest values
        generateRulesState.outputPath = outputInput.text;
        for(let i = 0; i < folderInputs.length; i++) {
            generateRulesState.folderPaths[i] = folderInputs[i].text;
            generateRulesState.wildcardPatterns[i] = wildcardInputs[i].text;
        }
        
        tiled.log("Scanning folders for rule maps:");
        
        let totalTmxFiles = 0;
        let validFolders = 0;
        
        for(let i = 0; i < generateRulesState.folderPaths.length; i++) {
            let path = String(generateRulesState.folderPaths[i]);
            let wildcard = generateRulesState.wildcardPatterns[i];
            
            if (!path) {
                tiled.log(`Folder ${i+1}: [Empty path]`);
                continue;
            }
            
            tiled.log(`Folder ${i+1}: ${path} (${wildcard})`);
            
            try {
                let files = File.directoryEntries(path, File.Files);
                let tmxFiles = files.filter(file => file.endsWith('.tmx'));
                
                tiled.log(`  Found ${tmxFiles.length} TMX files:`);
                for (let file of tmxFiles) {
                    tiled.log(`  - ${file}`);
                }
                
                totalTmxFiles += tmxFiles.length;
                validFolders++;
                
            } catch(e) {
                tiled.log(`  Error scanning: ${e}`);
            }
        }
        
        // Show a notification with the scan results
        generateRulesState.showNotification(
            "Scan Results", 
            `Found ${totalTmxFiles} rule files across ${validFolders} folders.`, 
            "info"
        );
    });
    
    dialog.addNewRow();
    
    // Close button
    let closeButton = dialog.addButton("Close");
    closeButton.clicked.connect(function() {
        dialog.done(Dialog.Rejected);
    });
    
    // Generate button - creates the rules.txt file
    let generateButton = dialog.addButton("Generate");
    generateButton.clicked.connect(function() {
        // Get latest values
        generateRulesState.outputPath = outputInput.text;
        for(let i = 0; i < folderInputs.length; i++) {
            generateRulesState.folderPaths[i] = folderInputs[i].text;
            generateRulesState.wildcardPatterns[i] = wildcardInputs[i].text;
        }
        
        if(!generateRulesState.outputPath) {
            generateRulesState.showNotification("Error", "No output path specified", "error");
            return;
        }
        
        // Generate the rules.txt file
        try {
            generateRulesState.generateRulesFile();
            
            // Show success notification
            generateRulesState.showNotification(
                "Success", 
                `rules.txt has been generated and placed in:\n${generateRulesState.outputPath}`, 
                "success"
            );
            
            tiled.log("Rules.txt file successfully generated at: " + generateRulesState.outputPath);
        } catch(e) {
            // Show error notification
            generateRulesState.showNotification("Error", "Failed to generate rules.txt: " + e, "error");
            tiled.log("Error generating rules.txt: " + e);
        }
    });
    
    // Help button
    let helpButton = dialog.addButton("?");
    helpButton.clicked.connect(function() {
        let helpDialog = new Dialog("Rules.txt Generator Help");
        
        helpDialog.addHeading("Rules.txt Generator Help", true);
        helpDialog.addNewRow();
        helpDialog.addLabel("This tool creates a rules.txt file for Tiled's automapping feature.");
        helpDialog.addNewRow();
        helpDialog.addLabel("");
        helpDialog.addNewRow();
        helpDialog.addLabel("FOLDER TO SCAN:");
        helpDialog.addNewRow();
        helpDialog.addLabel("Enter the path to a folder containing .tmx rule files.");
        helpDialog.addNewRow();
        helpDialog.addLabel("");
        helpDialog.addNewRow();
        helpDialog.addLabel("APPLY TO MAPS:");
        helpDialog.addNewRow();
        helpDialog.addLabel("Enter a wildcard pattern to control which maps these rules apply to.");
        helpDialog.addNewRow();
        helpDialog.addLabel("Examples:");
        helpDialog.addNewRow();
        helpDialog.addLabel("[*] - Apply to all maps (default)");
        helpDialog.addNewRow();
        helpDialog.addLabel("[town*] - Apply only to maps starting with 'town'");
        helpDialog.addNewRow();
        helpDialog.addLabel("[dungeon*] - Apply only to maps starting with 'dungeon'");
        helpDialog.addNewRow();
        helpDialog.addLabel("");
        helpDialog.addNewRow();
        helpDialog.addLabel("MULTIPLE FOLDERS:");
        helpDialog.addNewRow();
        helpDialog.addLabel("You can add multiple folders with different wildcards.");
        helpDialog.addNewRow();
        helpDialog.addLabel("This lets you organize rule files by category and control where they apply.");
        
        let okButton = helpDialog.addButton("OK");
        okButton.clicked.connect(function() {
            helpDialog.done(Dialog.Accepted);
        });
        
        helpDialog.show();
    });
    
    // Make the dialog size adjust based on content
    let baseHeight = 350;  
    let heightPerInput = 60;
    dialog.minimumHeight = baseHeight + generateRulesState.folderPaths.length * heightPerInput;
    dialog.minimumWidth = 500;
};

// Generate the rules.txt file
generateRulesState.generateRulesFile = function() {
    let content = [];
    
    content.push("# Rules.txt generated by Tiled Rules Generator");
    content.push("# Generated on: " + new Date().toLocaleString());
    content.push("");
    
    for(let i = 0; i < generateRulesState.folderPaths.length; i++) {
        let path = generateRulesState.folderPaths[i];
        let wildcard = generateRulesState.wildcardPatterns[i];
        
        if(!path) continue;
        
        // Add comment
        content.push("# Rules from folder: " + path);
        content.push("");
        
        try {
            // Get all TMX files in the folder
            let files = File.directoryEntries(path, File.Files);
            let tmxFiles = files.filter(file => file.endsWith('.tmx'));
            
            // Sort alphabetically
            tmxFiles.sort();
            
            // Add the wildcard pattern once at the top if provided and valid
            if(wildcard && wildcard.trim() !== '') {
                content.push(wildcard);
            }
            
            // Add all rule files
            for(let file of tmxFiles) {
                // Format the path correctly
                let rulePath = path;
                if(!rulePath.endsWith('/') && !rulePath.endsWith('\\')) {
                    rulePath += '/';
                }
                rulePath += file;
                
                // Add the rule file path
                content.push(rulePath);
            }
            
            content.push("");
        } catch(e) {
            content.push("# Error scanning folder: " + e);
            content.push("");
        }
    }
    
    // Ensure output path is a file, not a directory
    let outputPath = generateRulesState.outputPath;
    
    // If the path doesn't end with .txt, assume it's a directory and append rules.txt
    if (!outputPath.toLowerCase().endsWith('.txt')) {
        // Make sure the path has a trailing slash
        if (!outputPath.endsWith('/') && !outputPath.endsWith('\\')) {
            outputPath += '/';
        }
        outputPath += 'rules.txt';
    }
    
    try {
        // Check if the output path's directory exists
        let lastSlashIndex = Math.max(outputPath.lastIndexOf('/'), outputPath.lastIndexOf('\\'));
        if (lastSlashIndex > 0) {
            let directory = outputPath.substring(0, lastSlashIndex);
            
            // Try to create the directory if it doesn't exist
            try {
                let fileInfo = new FileInfo(directory);
                if (!fileInfo.exists) {
                    tiled.log("Creating directory: " + directory);
                    new Dir(directory).mkpath(".");
                }
            } catch (dirError) {
                tiled.log("Warning: Could not verify directory exists: " + dirError);
                // Continue anyway, the file write will fail if there's a real problem
            }
        }
        
        // Write to file
        tiled.log("Writing rules to: " + outputPath);
        const file = new TextFile(outputPath, TextFile.WriteOnly);
        for(let line of content) {
            file.writeLine(line);
        }
        file.commit();
        
        // Update the stored path to match what we actually used
        generateRulesState.outputPath = outputPath;
        
    } catch (e) {
        throw new Error("Failed to write rules.txt: " + e);
    }
};

// Set the text that shows in the menu
generateRulesState.generateRulesDialog.text = "Generate Rules.txt";
generateRulesState.generateRulesDialog.icon = "rulesGenerator.png";

// Add to the Map menu
tiled.extendMenu("Map", [
    { action: "GenerateRulesDialog", before: "MapProperties" },
    { separator: true }
]);