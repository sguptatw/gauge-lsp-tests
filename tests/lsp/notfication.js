function handlerForNotifcation(res,registeredHandlers){
    for(var i=0;i<registeredHandlers.length;i++){
        if(registeredHandlers[i].unRegister)
            continue
        registeredHandlers[i].listener(res,registeredHandlers[i].expectedDiagnostics)
        if(registeredHandlers[i].verifyIfDone())
        {
            registeredHandlers[i].done()
            registeredHandlers[i].unRegister = true
        }
    }
}

async function OnNotification(notificationType,connection,registeredHandlers){
    try{
        connection.onNotification(notificationType, (res) => {
          try {
            handlerForNotifcation(res,registeredHandlers)
          } catch(e) {
            console.log(e);
          }
        });
    }
    catch(err){
        throw new Error("unable to handle notification "+notificationType+ ": Error"+err)
    }
}

module.exports = {OnNotification:OnNotification}