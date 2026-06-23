import redisClient from "../config/redis.js";

export const clearCourseCache = async () => {
    const keys = await redisClient.keys("courses:*");

    if(keys.length>0){
        await redisClient.del(keys);
        console.log("Course cache cleared");

    }
}