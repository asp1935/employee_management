import { Log } from "../models/Log.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { User } from "../models/User.js";
import { errorRes, successRes } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { verifyRefreshToken } from "../utils/jwtTokens.js";

//this method for genrating refresh token and access token
const genrateAccessAndRefreshToken = async (userId) => {
    try {
        //find user 

        const user = await User.findById(userId);

        //genrate tokens
        const accessToken = user.genrateAccessToken();
        const refreshToken = user.genrateRefreshToken();

        //store tokens to db 
        user.refreshToken = refreshToken;
        //save method update db and validateBeforeSave:false is given because we are updating only single value thats why it calls mongoose moduls like require like 
        //so we give validateBeforeSave:false it save/update  data without validation  
        await user.save({ validateBeforeSave: false })
        return { refreshToken, accessToken }

    } catch (error) {
        const errors = new Error('Something Went Wrong While Genrating Tokens')
        errors.statusCode = 401;
        throw errors
    }
};

const signup = asyncHandler(async (req, res) => { 
    const { name, email, password, role, adminAccessKey } = req.body;

    if ([name, email, password, role].some(field => String(field || '').trim() === '')) {
        return errorRes(res, 'All Fields Are Required',{}, 400);
    }

    const profilePhotoUrl = req.file ? req.file.path : null;
    const ADMIN_ACCESS_KEY = process.env.ADMIN_ACCESS_KEY;

    if (role === 'admin' && adminAccessKey !== ADMIN_ACCESS_KEY) {
        return errorRes(res, "Invalid admin access key",{}, 400);
    }
    if (role === "manager" && email.endsWith("@company.com") === false) {
        return errorRes(res, "Manager email must be a company email",{}, 400);
    }
    if (role === "employee" && !profilePhotoUrl) {
        return errorRes(res, "Employee must upload a profile photo",{}, 400);
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return errorRes(res, "Email is already registered",{}, 400);
    }
    const user = await User.create({ name, email, password, role, profilePhotoUrl });
    const createdUser = await User.findById(user._id).select("name email role profilePhotoUrl status createdAt updatedAt");

    if (!createdUser) {
        return errorRes(res, 'Something went wrong while Creating User',{}, 500);
    }

    return successRes(res, "User registered successfully", createdUser);
});


const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    const ip = req.ip;
    if ([email, password].some(field => String(field || '').trim() === '')) {
        return errorRes(res, 'Email and Password are required',{}, 400);
    }
    const user = await User.findOne({ email });
    if (!user) {
        await Log.create({ type: 'auth', message: 'Login failed: no user', ip, route: req.originalUrl, meta: { email } });
        return errorRes(res, 'Invalid email or password',{}, 401);
    }

    // user.status !== 'active'
    if (user.isDeleted  ) {
        return errorRes(res, 'User not Active', {}, 403);
    }

    if (user.isLocked()) {
        const msRemaining = user.lockUntil - Date.now();
        return errorRes(res, `Account locked. Try again in ${Math.ceil(msRemaining / 1000)}s`, { lockSeconds: Math.ceil(msRemaining / 1000) }, 423);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {

        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;    
        if (user.failedLoginAttempts >= 3) {
            user.lockUntil = new Date(Date.now() + 30 * 1000);
            user.failedLoginAttempts = 0;
        }
        await user.save();
        await Log.create({ type: 'auth', message: 'Login failed: wrong password', ip, route: req.originalUrl, user: user._id });
        const lockSeconds = user.lockUntil ? Math.ceil((user.lockUntil - Date.now()) / 1000) : 0;
        return errorRes(res, 'Invalid credentials', { lockSeconds }, 401);
    }
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { refreshToken, accessToken } = await genrateAccessAndRefreshToken(user._id);
    await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successRes(res, 'Login successful', {
        accessToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePhotoUrl: user.profilePhotoUrl,
            status: user.status,
        },
        expiresIn: 2 * 60 * 1000
    });
});

const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return errorRes(res, 'Missing refresh token', {}, 401);


    const rToken = await RefreshToken.findOne({ token, revoked: false }).populate('user');
    if (!rToken) return errorRes(res, 'Invalid refresh token', {}, 401);
    if (rToken.expiresAt < new Date()) return errorRes(res, 'Refresh token expired', {}, 401);


    try {
        verifyRefreshToken(token);
    } catch (e) {
        return errorRes(res, 'Invalid refresh token signature', {}, 401);
    }


    const user = rToken.user;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (!user || user.isDeleted || user.status !== 'active') return errorRes(res, 'User not allowed', {}, 403);

    rToken.revoked = true;
    await rToken.save();

    const { refreshToken, accessToken } = await genrateAccessAndRefreshToken(user._id);
    await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        
    });

    return successRes(res, 'Token refreshed', { accessToken, expiresIn: 2 * 60 * 1000 });
});

const logout = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        await RefreshToken.findOneAndUpdate({ token }, { revoked: true }).catch(() => { });
        res.clearCookie('refreshToken');
    }
    return successRes(res, 'Logged out Successfully', {});
});

export {
    signup,
    login,
    refreshToken,
    logout
};