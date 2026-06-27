import AppError from "../utils/AppErrors.js";
import asyncHandler from "../utils/asyncHandler.js";


export const refreshToken = asyncHandler(async(requestAnimationFrame,res,next)=>{
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return next(new AppError("Refresh token is required", 400));
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
    });
    if (!user || user.refreshToken !== refreshToken) {  
        return next(new AppError("Invalid refresh token", 401));
    }
    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    }); 
    res.status(200).json({
        success: true,
        accessToken: newAccessToken,
    });
});

export const logoutUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    }); 
    res.status(200).json({
        success: true,
        message: "Logout successful",
    });

})