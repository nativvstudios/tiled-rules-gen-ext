var generateRulesState = {
    dialogOpen: false,
    folderPaths: [], // Store the actual paths instead of input references
    currentDialog: null // Reference to the current dialog
}

generateRulesState.generateRulesDialog = tiled.registerAction("GenerateRulesDialog", function(action) {
    if(generateRulesState.dialogOpen) return;
    
    // Initialize with one empty path for the main folder if needed
    if(generateRulesState.folderPaths.length === 0) {
        generateRulesState.folderPaths.push("");
    }
    
    // Create the dialog only once
    generateRulesState.currentDialog = new Dialog("Generate Rules");
    generateRulesState.dialogOpen = true;
    
    // Initial population of the dialog
    generateRulesState.refreshDialogContent();
    
    // Set up the finished handler only once
    generateRulesState.currentDialog.finished.connect(function() {
        generateRulesState.dialogOpen = false;
        generateRulesState.currentDialog = null;
    });
    
    // Show the dialog
    generateRulesState.currentDialog.show();
});

// Function to refresh the dialog content
generateRulesState.refreshDialogContent = function() {
    let dialog = generateRulesState.currentDialog;
    let folderInputs = []; // Temporary array for this refresh
    
    // Clear the current content
    dialog.clear();
    
    dialog.addLabel("Please select your main project folder");
    dialog.addSeparator();
    
    // Add the main folder input
    dialog.addNewRow();
    let mainFolderInput = dialog.addTextInput("Main project folder");
    mainFolderInput.text = generateRulesState.folderPaths[0];
    folderInputs.push(mainFolderInput);
    
    // Add all the additional folder inputs
    for(let i = 1; i < generateRulesState.folderPaths.length; i++) {
        dialog.addNewRow();
        let folderInput = dialog.addTextInput("Folder to scan:");
        folderInput.text = generateRulesState.folderPaths[i];
        folderInputs.push(folderInput);
    }
    
    dialog.addNewRow();
    
    // Add buttons row with + and - buttons
    let addButton = dialog.addButton("+");
    let removeButton = dialog.addButton("-");
    
    addButton.clicked.connect(function() {
        // Save current input values
        for(let i = 0; i < folderInputs.length; i++) {
            generateRulesState.folderPaths[i] = folderInputs[i].text;
        }
        
        // Add a new empty path
        generateRulesState.folderPaths.push("");
        
        // Refresh the dialog
        generateRulesState.refreshDialogContent();
    });
    
    removeButton.clicked.connect(function() {
        // Only remove if we have additional folder inputs beyond the main one
        if(generateRulesState.folderPaths.length > 1) {
            // Save current input values except the last one
            for(let i = 0; i < folderInputs.length - 1; i++) {
                generateRulesState.folderPaths[i] = folderInputs[i].text;
            }
            
            // Remove the last path
            generateRulesState.folderPaths.pop();
            
            // Refresh the dialog
            generateRulesState.refreshDialogContent();
        } else {
            tiled.log("Cannot remove main folder input");
        }
    });
    
    let scanButton = dialog.addButton("Scan");
    scanButton.clicked.connect(function() {
        // Update folderPaths with current values
        for(let i = 0; i < folderInputs.length; i++) {
            generateRulesState.folderPaths[i] = folderInputs[i].text;
        }
        
        tiled.log("Scanning folders:");
        
        // Print the values of all folder inputs except folder 0 as that is the main folder
        for(let i = 1; i < generateRulesState.folderPaths.length; i++) {
            let pathValue = String(generateRulesState.folderPaths[i]);

            tiled.log(File.directoryEntries(pathValue));
            tiled.log("Folder " + (i-1) + ": " + pathValue);
        }
    });
    
    let closeButton = dialog.addButton("Close");
    closeButton.clicked.connect(function() {
        dialog.done(Dialog.Rejected);
    });
    dialog.addNewRow();
    
    let generateButton = dialog.addButton("Generate");
    generateButton.clicked.connect(function() {
        // Update folderPaths with current values
        for(let i = 0; i < folderInputs.length; i++) {
            generateRulesState.folderPaths[i] = folderInputs[i].text;
        }
        
        tiled.log("*** Generated *** ");
        let mainFolder = generateRulesState.folderPaths[0];
        tiled.log("rules.txt has been placed in: " + mainFolder);
    });
    
    // Ensure the dialog is properly sized after clearing and adding content
};

generateRulesState.generateRulesDialog.text = "Generate Rules.txt";

tiled.extendMenu("Map", [
    { action: "GenerateRulesDialog", before: "MapProperties" },
    { separator: true }
]);