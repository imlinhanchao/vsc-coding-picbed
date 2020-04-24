// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { spawn } = require('child_process');
const { tmpdir } = require('os');
const fs = require('fs');
const path = require('path');
const package = require('../package');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "coding-picture-bed" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('coding-picbed.paste', async function () {
        // The code you place here will be executed every time your command is executed

        let savePath = path.join(tmpdir(), 'coding-picbed');
        if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);
        savePath = path.join(savePath, new Date().getTime() + '.png');
        let images = await getPasteImage(savePath);
        images = images.filter(img => ['.jpg', 'jpeg', '.gif', '.bmp', '.png'].find(ext => img.endsWith(ext)));
        let config = getConfig();


        // Display a message box to the user
        vscode.window.showInformationMessage(images.join('\n'));
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

function getConfig() {
    let keys = Object.keys(package.contributes.configuration.properties);
    let values = {};
    keys.forEach(k => values[k] = vscode.workspace.getConfiguration().get(k))
    return values;
}

function getPasteImage(imagePath) {
    return new Promise((resolve, reject) => {
        if (!imagePath) return;
    
        let platform = process.platform;
        if (platform === 'win32') {
            // Windows
            const scriptPath = path.join(__dirname, '../asserts/pc.ps1');
    
            let command = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
            let powershellExisted = fs.existsSync(command)
            if (!powershellExisted) {
                command = "powershell"
            }
    
            const powershell = spawn(command, [
                '-noprofile',
                '-noninteractive',
                '-nologo',
                '-sta',
                '-executionpolicy', 'unrestricted',
                '-windowstyle', 'hidden',
                '-file', scriptPath,
                imagePath
            ]);
            powershell.on('error', function (e) {
                if (e.code == "ENOENT") {
                    vscode.window.showErrorMessage(`The powershell command is not in you PATH environment variables. Please add it and retry.`);
                } else {
                    vscode.window.showErrorMessage(e);
                }
            });
            powershell.on('exit', function (code, signal) {
                // console.log('exit', code, signal);
            });
            powershell.stdout.on('data', function (data) {
                resolve(data.toString().trim().split('\n'));
            });
        }
        else if (platform === 'darwin') {
            // Mac
            let scriptPath = path.join(__dirname, '../asserts/mac.applescript');
    
            let ascript = spawn('osascript', [scriptPath, imagePath]);
            ascript.on('error', function (e) {
                vscode.window.showErrorMessage(e);
            });
            ascript.on('exit', function (code, signal) {
                // console.log('exit',code,signal);
            });
            ascript.stdout.on('data', function (data) {
                resolve(data.toString().trim().split('\n'));
            });
        } else {
            // Linux 
    
            let scriptPath = path.join(__dirname, '../asserts/linux.sh');
    
            let ascript = spawn('sh', [scriptPath, imagePath]);
            ascript.on('error', function (e) {
                vscode.window.showErrorMessage(e);
            });
            ascript.on('exit', function (code, signal) {
                // console.log('exit',code,signal);
            });
            ascript.stdout.on('data', function (data) {
                let result = data.toString().trim();
                if (result == "no xclip") {
                    vscode.window.showInformationMessage('You need to install xclip command first.');
                    return;
                }
                resolve(result.trim().split(' /').map(p => p.replace(/(^[^/])/, '/$1')));
            });
        }
    })
}
exports.deactivate = deactivate;