import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { errorRes, successRes } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

// @desc Create and assign a task
// @route POST /api/tasks
// @access Private (Manager/Admin only)
const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo } = req.body;

    if ([title, description, assignedTo].some(field => String(field || "").trim() === "")) {
        return errorRes(res, "Title, description, and assignedTo fields are required", {}, 400);
    }

    // Check if assignee exists and is an employee
    const assignee = await User.findById(assignedTo);
    if (!assignee || assignee.isDeleted) {
        return errorRes(res, "Assigned user not found", {}, 404);
    }

    if (assignee.role !== "employee") {
        return errorRes(res, "Tasks can only be assigned to users with the 'employee' role", {}, 400);
    }

    const task = await Task.create({
        title: title.trim(),
        description: description.trim(),
        assignedTo,
        assignedBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
        .populate("assignedTo", "name email role profilePhotoUrl status")
        .populate("assignedBy", "name email role");

    return successRes(res, "Task created and assigned successfully", populatedTask);
});

// @desc Get tasks with filters
// @route GET /api/tasks
// @access Private (Any logged-in user)
const getTasks = asyncHandler(async (req, res) => {
    const { status, assignedTo } = req.query;
    const query = {};

    // Filter by role
    if (req.user.role === "employee") {
        // Employees can only view tasks assigned to them
        query.assignedTo = req.user._id;
    } else {
        // Managers and Admins can view all tasks or filter by assigned employee
        if (assignedTo) {
            query.assignedTo = assignedTo;
        }
    }

    // Apply status filter if provided
    if (status) {
        if (["PENDING", "INPROGRESS", "TESTING", "DONE"].includes(status)) {
            query.status = status;
        } else {
            return errorRes(res, "Invalid status filter", {}, 400);
        }
    }

    const tasks = await Task.find(query)
        .populate("assignedTo", "name email role profilePhotoUrl status")
        .populate("assignedBy", "name email role")
        .populate("comments.author", "name email role profilePhotoUrl")
        .sort({ createdAt: -1 });

    return successRes(res, "Tasks fetched successfully", { tasks });
});

const getTaskById= asyncHandler(async(req,res)=>{
    const taskId=req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return errorRes(res, "Invalid Task ID", {}, 400);
    }

    const task = await Task.findById(taskId)
        .populate("assignedTo", "name email role profilePhotoUrl status")
        .populate("assignedBy", "name email role")
        .populate("comments.author", "name email role profilePhotoUrl");

    if(!task){
        return errorRes(res,"Task Not Found",{},404);
    }
    

    return successRes(res, "Task Fetched Successfully", task);

})

// @desc Update task status
// @route PATCH /api/tasks/:id/status
// @access Private (Assigned employee or Manager/Admin)
const updateTaskStatus = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status || !["PENDING", "INPROGRESS", "TESTING", "DONE"].includes(status)) {
        return errorRes(res, "Valid status (PENDING, INPROGRESS, TESTING, DONE) is required", {}, 400);
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return errorRes(res, "Task not found", {}, 404);
    }

    // Authorization: Only the assigned employee or manager/admin can change status
    if (req.user.role === "employee" && !task.assignedTo.equals(req.user._id)) {
        return errorRes(res, "You are not authorized to update this task status", {}, 403);
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
        .populate("assignedTo", "name email role profilePhotoUrl status")
        .populate("assignedBy", "name email role")
        .populate("comments.author", "name email role profilePhotoUrl");

    return successRes(res, "Task status updated successfully", updatedTask);
});

// @desc Add comment to task
// @route POST /api/tasks/:id/comments
// @access Private (Assigned employee or Manager/Admin)
const addTaskComment = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { text } = req.body;

    if (!text || String(text).trim() === "") {
        return errorRes(res, "Comment text is required", {}, 400);
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return errorRes(res, "Task not found", {}, 404);
    }

    // Authorization: Must be admin, manager, or the assigned employee
    if (req.user.role === "employee" && !task.assignedTo.equals(req.user._id)) {
        return errorRes(res, "You are not authorized to comment on this task", {}, 403);
    }

    task.comments.push({
        author: req.user._id,
        text: text.trim()
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
        .populate("assignedTo", "name email role profilePhotoUrl status")
        .populate("assignedBy", "name email role")
        .populate("comments.author", "name email role profilePhotoUrl");

    return successRes(res, "Comment added successfully", updatedTask);
});

// @desc Delete a task (Manager/Admin only)
// @route DELETE /api/tasks/:id
// @access Private (Manager/Admin)
const deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return errorRes(res, "Invalid Task ID", {}, 400);
    }
    const task = await Task.findById(taskId);
    if (!task) {
        return errorRes(res, "Task not found", {}, 404);
    }
    // Authorization: Only manager or admin can delete
    if (!["manager", "admin"].includes(req.user.role)) {
        return errorRes(res, "You are not authorized to delete this task", {}, 403);
    }
    await Task.deleteOne({ _id: taskId });
    return successRes(res, "Task deleted successfully", { deletedTaskId: taskId });
});

// @desc Update task details (title, description, assignedTo) (Manager/Admin only)
// @route PATCH /api/tasks/:id
// @access Private (Manager/Admin)
const updateTaskDetails = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { title, description, assignedTo } = req.body;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return errorRes(res, "Invalid Task ID", {}, 400);
    }
    const task = await Task.findById(taskId);
    if (!task) {
        return errorRes(res, "Task not found", {}, 404);
    }
    // Authorization: Only manager or admin can update details
    if (!["manager", "admin"].includes(req.user.role)) {
        return errorRes(res, "You are not authorized to update this task", {}, 403);
    }
    const updates = {};
    if (title && String(title).trim()) {
        updates.title = title.trim();
    }
    if (description && String(description).trim()) {
        updates.description = description.trim();
    }
    if (assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
            return errorRes(res, "Invalid assignedTo user ID", {}, 400);
        }
        const assignee = await User.findById(assignedTo);
        if (!assignee || assignee.isDeleted) {
            return errorRes(res, "Assigned user not found", {}, 404);
        }
        if (assignee.role !== "employee") {
            return errorRes(res, "Tasks can only be assigned to users with the 'employee' role", {}, 400);
        }
        updates.assignedTo = assignedTo;
    }
    if (Object.keys(updates).length === 0) {
        return errorRes(res, "No valid fields provided for update", {}, 400);
    }
    Object.assign(task, updates);
    await task.save();
    const updatedTask = await Task.findById(task._id)
        .populate("assignedTo", "name email role profilePhotoUrl status")
        .populate("assignedBy", "name email role")
        .populate("comments.author", "name email role profilePhotoUrl");
    return successRes(res, "Task details updated successfully", updatedTask);
});

export {
    createTask,
    getTasks,
    updateTaskStatus,
    addTaskComment,
    getTaskById,
    deleteTask,
    updateTaskDetails
};
