import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { Log } from "../models/Log.js";
import { successRes } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

// @desc Get Admin system-wide analytics
// @route GET /api/analytics/admin
// @access Private (Admin only)
const getAdminAnalytics = asyncHandler(async (req, res) => {
    // 1. Total users grouped by role
    const usersByRole = await User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // 2. Total users grouped by status
    const usersByStatus = await User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 3. System tasks grouped by status
    const tasksByStatus = await Task.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 4. Count of forbidden security events
    const forbiddenLogCount = await Log.countDocuments({ type: "forbidden" });

    // 5. Total counts
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const totalTasks = await Task.countDocuments();

    return successRes(res, "Admin analytics fetched successfully", {
        totalUsers,
        totalTasks,
        usersByRole,
        usersByStatus,
        tasksByStatus,
        forbiddenLogCount
    });
});

// @desc Get Manager dashboard analytics
// @route GET /api/analytics/manager
// @access Private (Manager/Admin only)
const getManagerAnalytics = asyncHandler(async (req, res) => {
    const managerId = req.user._id;

    // 1. Total employees managed by this manager
    const totalEmployees = await User.countDocuments({
        role: "employee",
        manager: managerId,
        isDeleted: false
    });

    // 2. Tasks assigned by this manager grouped by status
    const tasksByStatus = await Task.aggregate([
        { $match: { assignedBy: managerId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 3. Total tasks assigned by this manager
    const totalTasksAssigned = await Task.countDocuments({ assignedBy: managerId });

    // 4. Workload distribution: tasks assigned per employee under this manager
    const workloadDistribution = await Task.aggregate([
        { $match: { assignedBy: managerId } },
        { $group: { _id: "$assignedTo", taskCount: { $sum: 1 } } },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "employee"
            }
        },
        { $unwind: "$employee" },
        {
            $project: {
                _id: 1,
                taskCount: 1,
                name: "$employee.name",
                email: "$employee.email",
                profilePhotoUrl: "$employee.profilePhotoUrl",
                status: "$employee.status"
            }
        }
    ]);

    return successRes(res, "Manager analytics fetched successfully", {
        totalEmployees,
        totalTasksAssigned,
        tasksByStatus,
        workloadDistribution
    });
});

// @desc Get Employee personal task analytics
// @route GET /api/analytics/employee
// @access Private (Any logged-in user)
const getEmployeeAnalytics = asyncHandler(async (req, res) => {
    const employeeId = req.user._id;

    // 1. Total tasks assigned to this employee
    const totalTasks = await Task.countDocuments({ assignedTo: employeeId });

    // 2. Tasks grouped by status
    const tasksByStatus = await Task.aggregate([
        { $match: { assignedTo: employeeId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 3. Task completion rate calculation
    const doneTasksCount = await Task.countDocuments({
        assignedTo: employeeId,
        status: "DONE"
    });
    const completionRate = totalTasks > 0 ? Math.round((doneTasksCount / totalTasks) * 100) : 0;

    // 4. Comment activity on employee's tasks
    const commentSummary = await Task.aggregate([
        { $match: { assignedTo: employeeId } },
        { $project: { commentsCount: { $size: "$comments" } } },
        { $group: { _id: null, totalComments: { $sum: "$commentsCount" } } }
    ]);
    const totalCommentsOnTasks = commentSummary[0]?.totalComments || 0;

    return successRes(res, "Employee analytics fetched successfully", {
        totalTasks,
        completionRate,
        tasksByStatus,
        totalCommentsOnTasks
    });
});

export {
    getAdminAnalytics,
    getManagerAnalytics,
    getEmployeeAnalytics
};
