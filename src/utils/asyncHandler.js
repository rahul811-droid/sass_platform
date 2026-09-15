
const asyncHandler =(fn)=>{
    return async(req,res,next)=>{
      return  Promise.resolve(fn(req,res,next)).catch(next)
    }
}
export default asyncHandler;