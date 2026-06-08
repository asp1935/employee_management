import { Log } from "../models/Log.js";
import { User } from "../models/User.js";
import { errorRes, successRes } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({isDeleted : false}).select('-password');
    return successRes(res, 'Users fetched', { users }); 
});

const updateRole = asyncHandler(async (req, res) => {
    const targetId = req.params.id;
    const { role } = req.body;


    if (req.user.role === 'admin' && req.user._id.equals(targetId) && role !== 'admin') {
        await Log.create({ type: 'forbidden', message: 'Admin attempted to change own role', user: req.user._id, ip: req.ip, route: req.originalUrl });
        return errorRes(res, 'Admins cannot change their own role', {}, 403);
    }


    const target = await User.findById(targetId);
    if (!target) return errorRes(res, 'User not found', {}, 404);


    target.role = role;
    await target.save();
    return successRes(res, 'Role updated', { user: { id: target._id, role: target.role } });
});

const updateStatus = asyncHandler(async (req, res) => {
    const targetId = req.params.id;
    const { status } = req.body;


    if (req.user._id.equals(targetId) && ['inactive', 'deleted'].includes(status)) {
        await Log.create({ type: 'forbidden', message: 'Admin attempted to deactivate/delete self', user: req.user._id, ip: req.ip, route: req.originalUrl });
        return errorRes(res, 'Admins cannot deactivate/delete themselves', {}, 403);
    }


    const user = await User.findById(targetId);
    if (!user) return errorRes(res, 'User not found', {}, 404);


    user.status = status;
    
    await user.save();
    return successRes(res, 'Status updated', { user: { id: user._id, status: user.status } });
});

 const softDeleteUser = asyncHandler(async (req, res) => {
    const targetId = req.params.id;


    if (req.user._id.equals(targetId)) {
        await Log.create({ type: 'forbidden', message: 'Admin attempted to delete self', user: req.user._id, ip: req.ip, route: req.originalUrl });
        return errorRes(res, 'Admins cannot delete themselves', {}, 403);
    }


    const user = await User.findById(targetId);
    if (!user) return errorRes(res, 'User not found', {}, 404);


    user.isDeleted = true;
    user.status = 'inactive';
    await user.save();
    return successRes(res, 'User soft-deleted', { user: { id: user._id } });
});

const currentUser = asyncHandler(async (req, res) => {
    return successRes(res, 'Current user fetched', { user: req.user });
});

const registerEmployee = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const profilePhotoUrl = req.file ? req.file.path : null;

    if ([name, email, password].some(field => String(field || '').trim() === '')) {
        return errorRes(res, 'Name, email, and password are required', {}, 400);
    }

    if (!profilePhotoUrl) {
        return errorRes(res, 'Employee must upload a profile photo', {}, 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return errorRes(res, 'Email is already registered', {}, 400);
    }

    const employee = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'employee',
        profilePhotoUrl,
        manager: req.user._id
    });

    const createdEmployee = await User.findById(employee._id).select(
        'name email role profilePhotoUrl status manager createdAt updatedAt'
    );

    if (!createdEmployee) {
        return errorRes(res, 'Something went wrong while registering employee', {}, 500);
    }

    return successRes(res, 'Employee registered successfully', createdEmployee);
});

const getMyEmployees = asyncHandler(async (req, res) => {
    const employees = await User.find({
        role: 'employee',
        manager: req.user._id,
        isDeleted: false
    }).select('-password');

    return successRes(res, 'Employees fetched successfully', { employees });
});


export {
    getAllUsers,
    updateRole,
    updateStatus,
    softDeleteUser,
    currentUser,
    registerEmployee,
    getMyEmployees
}