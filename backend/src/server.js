import app from "./app.js";
import connectDB from "./db/connection.js";

// Handle application-level errors
app.on('error', (error) => {
    console.log('Application not able to talk to DB', error);
    process.exit(1);
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is runign at Port : ${process.env.PORT || 8000}`);
        });

    }).catch((error) => {
        console.log('Failed to connect to DB', error);
    });


