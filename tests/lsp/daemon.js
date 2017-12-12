"use strict";

const { spawn } = require('child_process');
const rpc = require('vscode-jsonrpc');
const vscodeUri = require('vscode-uri').default;
var path = require('path');

var assert = require('assert');
var request = require('./request');
var file = require('../util/fileExtension')
var state = {}

async function startGaugeDaemon(projectPath,responseHandler) {
    state.projectPath = file.getFullPath(projectPath);
    state.gaugeDaemon = spawn('gauge', ['daemon', '--lsp', '--dir=' + state.projectPath, "-l", "debug"],{cwd:state.projectPath});
    state.reader = new rpc.StreamMessageReader(state.gaugeDaemon.stdout);
    state.writer = new rpc.StreamMessageWriter(state.gaugeDaemon.stdin);

    let connection = rpc.createMessageConnection(state.reader, state.writer);

    connection.listen();
    await connection.sendRequest(new rpc.RequestType("initialize"), { "processId": process.pid, "rootPath": state.projectPath, "rootUri": vscodeUri.file(state.projectPath).toString(), "capabilities": { "workspace": { "applyEdit": true, "didChangeConfiguration": { "dynamicRegistration": true }, "didChangeWatchedFiles": { "dynamicRegistration": true }, "symbol": { "dynamicRegistration": true }, "executeCommand": { "dynamicRegistration": true } }, "textDocument": { "synchronization": { "dynamicRegistration": true, "willSave": true, "willSaveWaitUntil": true, "didSave": true }, "completion": { "dynamicRegistration": true, "completionItem": { "snippetSupport": true, "commitCharactersSupport": true } }, "hover": { "dynamicRegistration": true }, "signatureHelp": { "dynamicRegistration": true }, "definition": { "dynamicRegistration": true }, "references": { "dynamicRegistration": true }, "documentHighlight": { "dynamicRegistration": true }, "documentSymbol": { "dynamicRegistration": true }, "codeAction": { "dynamicRegistration": true }, "codeLens": { "dynamicRegistration": true }, "formatting": { "dynamicRegistration": true }, "rangeFormatting": { "dynamicRegistration": true }, "onTypeFormatting": { "dynamicRegistration": true }, "rename": { "dynamicRegistration": true }, "documentLink": { "dynamicRegistration": true } } }, "trace": "off" }, null);
    connection.onRequest(new rpc.RequestType("client/registerCapability"), () => {});
    await connection.sendNotification(new rpc.NotificationType("initialized"), {});
    state.connection = connection;
};

function connection() {
    if (!state.gaugeDaemon)
        throw ("Gauge Daemon not initialized");
    if (!state.connection)
        throw ("Gauge Daemon connection not available")
    return state.connection;
}

function projectPath() {
    if (!state.gaugeDaemon)
        throw ("Gauge Daemon not initialized");
    return state.projectPath;
}

function handle(handler, done) {
    if (!state.gaugeDaemon)
        throw ("Gauge Daemon not initialized");
    if (!state.reader)
        throw ("Gauge Daemon Stream reader not available")
    state.reader.listen(async (data) => await responseHandler(handler,data,done));
}

async function responseHandler(handler,data,done){
    await handler(data).catch((e) => { done(e) })
    done();
}

module.exports = {
    startGaugeDaemon: startGaugeDaemon,
    connection: connection,
    projectPath: projectPath,
    handle:handle
};
