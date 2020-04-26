// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { spawn } = require('child_process');
const { tmpdir } = require('os');
const fs = require('fs');
const path = require('path');
const packages = require('../package');
const { Coding } = require('coding-picbed');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    let config = getConfig();
    let coding = null;
    let notice = context.globalState.get('notice') !== false;
    let index = 1;

    if (config.token == '' || config.repository == '') {
        if(notice) noticeSetting(context);
    }
    else
        coding = new Coding({ token: config.token, repository: config.repository });

    console.log('Congratulations, your extension "coding-picture-bed" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('coding-picbed.paste', async function () {
        // The code you place here will be executed every time your command is executed
        let stop;
        try {
            if (!coding) {
                return noticeSetting(context);
            }

            let selections = getSelections();

            stop = showProgress('Coding 图床正在上传图片...');

            while (!coding.isInitialized()) await sleep(100);   

            config = getConfig();
            let editor = vscode.window.activeTextEditor;
            let savePath = path.join(tmpdir(), 'coding-picbed');
            if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);
            savePath = path.join(savePath, new Date().getTime() + '.png');
            let images = await getPasteImage(savePath);
            images = images.filter(img => ['.jpg', 'jpeg', '.gif', '.bmp', '.png'].find(ext => img.endsWith(ext)));
            
            let now = new Date();
            let saveDir = config.path;
            if (config.createDirectoryByDate) saveDir = path.join(saveDir, `${now.getFullYear()}${('0' + (now.getMonth() + 1)).slice(-2)}${('0' + now.getDay()).slice(-2)}`).replace(/\\/g, '/');
            
            let urls = [];
            for (let i = 0; i < images.length; i++) {
                let data = await coding.upload(images[i], saveDir);
                urls.push(data.urls[0]);
            }

            let insertCode = '';
            for (let i = 0; i < urls.length; i++) {
                let selection = selections[i] && editor.document.getText(selections[i]) ? editor.document.getText(selections[i]) : '图' + index++;
                let text = `![${selection}](${urls[i].replace('http:', 'https:')})`;
                if (selections[i]) editor.edit(editBuilder => {
                    editBuilder.replace(selections[i], text);
                });
                else insertCode += text + '\n';
            }

            if (insertCode) {
                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.activate, insertCode.trim());
                })
            }
            stop();
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
            if (stop) stop();
        }
    });

    vscode.workspace.onDidChangeConfiguration(function(event) {
        const configList = ['token', 'repository'];

        const affected = configList.some(item => event.affectsConfiguration(`coding-picbed.${item}`));
        if (!affected) return;
        config = getConfig();
        if (config.token == '' || config.repository == '') return;
        if (!coding) coding = new Coding();
        coding.config({ token: config.token, repository: config.repository })
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

function showProgress(message) {
    let show = true;
    function stopProgress() {
        show = false;
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: message,
        cancellable: false
    }, (progress, token) => {
        
        return new Promise(resolve => {
            let timer = setInterval(() => {
                if (show) return;
                clearInterval(timer);
                resolve();
            }, 100)
        });
    })

    return stopProgress;
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function noticeSetting(context) {
    vscode.window.showInformationMessage('你需要去设置一下 Coding 账号的相关信息', '去设置', '不再提醒').then(result => {
        if (result === '去设置') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'coding-picbed' );
        } else if (result === '不再提示') {
            context.globalState.update('notice', false);
        }
    });
}

function getSelections() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return ''; // No open text editor
    }

    let selections = editor.selections;
    return selections;
}


function getConfig() {
    let keys = Object.keys(packages.contributes.configuration.properties);
    let values = {};
    keys.forEach(k => values[k.split('.')[1]] = vscode.workspace.getConfiguration().get(k))
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
            let output = '';
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
                if (data.toString().indexOf('Active code page:') < 0) output += data.toString();
            });
            powershell.on('close', function (code) {
                resolve(output.trim().split('\n').map(i => i.trim()));
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