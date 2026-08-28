import express, { Request, Response, NextFunction } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import passport from "passport"
import analyticsRouter from "./routes/analytics.routes"
import userRouter from "./routes/user.routes"
import chatRouter from "./routes/chat.routes"
import monitoringRouter from "./routes/monitoring.routes"
import evalRouter from "./routes/eval.routes"
import datasetRouter from "./routes/dataset.routes"
import apiError from "./utils/apiError.js"



const app=express();

app.use(cors({
    origin: process.env.CORS_ORIGIN, //👉 “Allow this frontend to access my backend and allow cookies.”
    credentials: true,
}))

// app.use("/auth",googleAuthRoutes)
app.use(passport.initialize());
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser());


app.use("/api/v1/users", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/monitoring", monitoringRouter);
app.use("/api/v1/eval", evalRouter);
app.use("/api/v1/datasets", datasetRouter);

// Central error handler: catches whatever asyncHandler forwards via next(err)
// so a thrown apiError (or anything else) becomes a JSON response instead of
// hanging/crashing the request.
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof apiError) {
        res.status(err.statusCode).json(err);
        return;
    }

    console.error(err);
    res.status(500).json(new apiError(500, "Internal server error"));
})

export {app}