var languageclient = require('./lsp/languageclient');

step('open project <relativePath>', async function (relativePath) {
    try{        
        await languageclient.openProject(relativePath,process.env.language);        
    }
    catch(err){
        throw new Error("unable to start gauge daemon "+err)
    }    
});

step('open project with full path <fullPath>', async function (fullPath) {
    try{        
        await languageclient.openProject(fullPath,null);
    }
    catch(err){
        throw new Error("unable to start gauge daemon "+err)
    }    
});

step("stop gauge daemon", async function() {
	try{
        await languageclient.shutDown()
    }catch(err){
        throw new Error("trying to stop gauge daemon failed "+err)
    }
});