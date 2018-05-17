"use strict";

var assert = require('assert');

var languageclient = require('./lsp/languageclient');
var _runner = require('./lsp/runner');

var file = require('./util/fileExtension');
var builder = require('./lsp/util/dataBuilder');

function addTempProjectPath(expectedDiagnostics,projectPath){
  for (var rowIndex = 0; rowIndex < expectedDiagnostics.length; rowIndex++) {
    var expectedDiagnostic = expectedDiagnostics[rowIndex];
    expectedDiagnostic.uri = file.getPath(projectPath,expectedDiagnostic.uri);
    expectedDiagnostic.message = expectedDiagnostic.message.replace('%project_path%%file_path%',expectedDiagnostic.uri);
  }
}

function addProjectPath(expectedDiagnostics,projectPath){
  for (var rowIndex = 0; rowIndex < expectedDiagnostics.length; rowIndex++) {
    var expectedDiagnostic = expectedDiagnostics[rowIndex];
    expectedDiagnostic.uri = file.getFullPath(projectPath,expectedDiagnostic.uri);
    expectedDiagnostic.message = expectedDiagnostic.message.replace('%project_path%%file_path%',expectedDiagnostic.uri);
  }
}

step("open the project <projectPath> and verify diagnostics <diagnosticsList>", async function (projectPath, diagnosticsList,done) {
  var expectedDiagnostics = builder.loadJSON(diagnosticsList);
  addProjectPath(expectedDiagnostics,projectPath)
  try{
    await invokeDiagnostics(projectPath,expectedDiagnostics,process.env.language,done)
  }
  catch(err){
    throw new Error('Unable to open project '+err)    
  }
});

step("ensure diagnostics verified", async function() {
  var errors =languageclient.verificationFailures() 
  assert.ok(errors==null || errors.length==0,errors)
});
step("get stubs for unimplemented steps project <projectPath> with details <details>", async function (projectPath,details,done) {
  var expectedDiagnostics = builder.loadJSON(details);
  var dataprojectPath = gauge.dataStore.scenarioStore.get('dataprojectPath');
  addTempProjectPath(expectedDiagnostics,dataprojectPath)

  try{
    await invokeDiagnostics_tempPath(dataprojectPath,expectedDiagnostics,process.env.language,done)
  }
  catch(err){
    throw new Error('Unable to generate steps '+err)
  }
});

async function invokeDiagnostics_tempPath(projectPath, expectedDiagnostics,runner,done){
  languageclient.registerForNotification(verifyDiagnosticsResponse,expectedDiagnostics,verifyAllDone,done)
  await languageclient.openProject_fullPath(projectPath)
}

async function invokeDiagnostics(projectPath, expectedDiagnostics,runner,done){
  languageclient.registerForNotification(verifyDiagnosticsResponse,expectedDiagnostics,verifyAllDone,done)
  _runner.copyManifest(projectPath,runner)
  _runner.bundleInstall(projectPath,runner)
  await languageclient.openProject(projectPath)
}

function verifyDiagnosticsResponse(responseMessage,expectedDiagnostics) {
  if(responseMessage==null)
    return expectedDiagnostics
  try{
    var responseUri = builder.getResponseUri(responseMessage.uri)

    var expectedDiagnosticsForFile = expectedDiagnostics.filter(function(elem, i, array) {
      return (file.getPath(responseUri)===file.getPath(elem.uri))
    });
    
    for (var rowIndex = 0; rowIndex < expectedDiagnosticsForFile.length; rowIndex++) {
      var expectedDiagnostic = expectedDiagnosticsForFile[rowIndex]
      
      gauge.message("verified "+expectedDiagnostic.uri)
      var allDiagnosticsForFile = responseMessage.diagnostics.filter(function(elem, i, array) {
        return (elem.message === expectedDiagnostic.message) && ((expectedDiagnostic.line==null || expectedDiagnostic.line=="NA") || (expectedDiagnostic.line == elem.range.start.line));
      });

      expectedDiagnostic.isValidated = true
      expectedDiagnostic.errors = []
      if(allDiagnosticsForFile.length==0)
      {        
        expectedDiagnostic.errors.push(expectedDiagnostic.message+" not found in "+JSON.stringify(responseMessage))
      }
      else{
        var diagnostic = allDiagnosticsForFile[0]
        if(diagnostic.code){
          expectedDiagnostic.code.replace(/\\\\/g,"\\")
          if(diagnostic.code!=expectedDiagnostic.code)
          {
            expectedDiagnostic.errors.push(JSON.stringify(diagnostic.code) + " not equal to " 
            + JSON.stringify(expectedDiagnostic.code));  
          }
        }
        if(expectedDiagnostic.severity)
        {
          if(diagnostic.severity!=expectedDiagnostic.severity)
            expectedDiagnostic.errors.push(JSON.stringify(diagnostic.severity) + " not equal to " 
            + JSON.stringify(expectedDiagnostic.severity));        
        }  
      }            
    }
  }
  catch(err){
    console.log("error"+err)
  }
  finally {
    return expectedDiagnostics
  }
}

function verifyAllDone(expectedDiagnostics){
  if(expectedDiagnostics==null)
    return {errors:null,isValidated:true}
  
  var validated = expectedDiagnostics.filter(function(elem, i, array) {
    return elem.isValidated;
  });

  if(validated.length == expectedDiagnostics.length)
  {
    var errors = expectedDiagnostics.filter(function(elem, i, array) {
      return (elem.errors && elem.errors.length>0);
    });

    return {errors:errors,isValidated:true}
  }

  return {isValidated:false}  
}