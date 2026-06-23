import AppError from "../utils/AppErrors.js";


const authorizeRoles = (...roles) => {

    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(
        new AppError(
          "Access denied",
          403
        )
      );
        }
        next();
    }
}


export default authorizeRoles;