"use strict";

var assert = require('assert');
var daemon = require('./lsp/daemon');
var languageclient = require('./lsp/languageclient');

step("format file <filePath> and ensure formatted contents are <afterFormat>", async function(filePath, expected) {
    //const expected = afterFormat.join("\n")
    var response = await languageclient.formatFile(daemon.filePath(filePath), daemon.connection(), daemon.projectPath())
    await verifyFormattedDetails(response, expected)    
});

async function verifyFormattedDetails(actual,expected){        
    if(!String.prototype.replaceAll){
        String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        }
      }

    gauge.message("verify format details")
    assert.equal(actual[0].newText,expected.replaceAll("\r\n","\n"))
}