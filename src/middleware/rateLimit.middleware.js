import redisClient from "../config/redis.js";

const rateLimit = async(req, res, next) => {
    try {
         const ip = req.ip;
    const key = `rate-limit:${ip}`;
    const requests = await redisClient.get(key);
    if(!requests){
        await redisClient.set(key, 1, "EX", 60);
        return next();
    }

    if(parseInt(requests) >= 100){
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later."
        });
    }

    await redisClient.incr(key);
    next();
    } catch (error) {
        
        console.error("Rate limit error:", error);
      next();
    }
   
}

export default rateLimit;