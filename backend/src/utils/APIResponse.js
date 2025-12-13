const successRes = (res, message = "Request successful", data = {}) => {
    return res.json({
        status: "success",
        message,
        data
    });
}

const errorRes = (res, message = "An error occurred",data={}, code = 400) => {
    return res.status(code).json({
        status: "error",
        message,
        data
    });
}

export { successRes, errorRes };