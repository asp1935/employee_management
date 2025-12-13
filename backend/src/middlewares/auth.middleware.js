import { Log } from "../models/Log.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { verifyAccessToken } from "../utils/jwtTokens.js";
import { errorRes } from "../utils/APIResponse.js";
import { User } from "../models/User.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || '';

    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        await Log.create({
            type: 'forbidden',
            message: 'Missing access token',
            ip: req.ip,
            route: req.originalUrl
        });
        return errorRes(res, "Unauthorized: No token provided",{}, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedToken = verifyAccessToken(token);
        
        const user = await User.findById(decodedToken._id);
        if (!user || user.status !== 'active' || user.isDeleted) {
            await Log.create({ type: 'forbidden', message: 'Invalid access token - user not found / user not allowed', ip: req.ip, route: req.originalUrl });
            return errorRes(res, "Unauthorized: Invalid token",{}, 403);
        }
        req.user = user;
        next();

    } catch (error) {
        return errorRes(res, "Invalid or expired token",{}, 401);
    }
});

export const authRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) return errorRes(res, "Unauthorized",{}, 401);
        if (!allowedRoles.includes(req.user.role)) {
            Log.create({ type: 'forbidden', message: 'Role access denied', ip: req.ip, route: req.originalUrl, user: req.user._id }).catch(() => { });
            return errorRes(res, "Forbidden: You don't have permission",{}, 403);
        }
        next();
    };
};