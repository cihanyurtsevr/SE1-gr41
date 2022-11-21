'use strict';
exports.callCtrlCheckErr = async (...args) => {
    /*
      function that call the control and if the called function returns an undefined status, this is replaced with the generic error status.
      args[0] = function to call
      args[1:n-1] = arguments for the function that we want to call
      args[n-1] = correct number
      args[n] = generic error number
    */
    let ret = undefined;
    let genericErr = undefined;
    let correctCode = undefined;
    try{
        const ctrlFunct = args.shift();
        genericErr = args.pop();
        correctCode = args.pop();
        let r = await ctrlFunct(...args);
        ret = {
            status : correctCode,
            body : r
        }
    }catch (e){
        if(e.status === undefined){
            e.status = genericErr;
            e.body = e.message;
        }
        console.log(e.message);
        ret = e;
    }
    return ret;
}