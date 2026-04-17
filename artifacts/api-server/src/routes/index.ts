import { Router, type IRouter } from "express";
import healthRouter from "./health";
import visitorsRouter from "./visitors";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/visitors", visitorsRouter);
router.use("/admin", adminRouter);
router.use("/analytics", analyticsRouter);

export default router;
