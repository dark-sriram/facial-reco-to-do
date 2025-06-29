import ratelimit from "../config/upstash.js"

const rateLimiter = async(req,res,next) => {
    try {
        const {success} = await ratelimit.limit("my-limit-key")

        if(!success) {
            return res.success(429)
            .json({message:"too many resposes"})
        }

        next()
    } catch (error) {
        console.error("rateLimiter error",error)
        next(error)
    }
}

export default rateLimiter