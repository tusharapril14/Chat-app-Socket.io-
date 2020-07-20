const generateMsg = (displayName,msg)=>{
  return {
    displayName,
      msg,
      createdAt:new Date().getTime()
  }
}
const generateLocationMsg = (displayName,msg)=>{
  return {
      displayName,
      msg,
      createdAt:new Date().getTime()
  }
}
module.exports ={generateMsg,generateLocationMsg}