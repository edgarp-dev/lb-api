import { Router } from "https://deno.land/x/oak@v17.1.1/mod.ts";
import {
    createExercise,
    createRoutine,
    createRoutineExercise,
    deleteRoutine,
    getExercises,
    getRoutineExercises,
    getRoutines,
    updateRoutine,
} from "./RoutinesController.ts";
import validateAuthToken from "../middleware/AuthTokenMiddleware.ts";

const router = new Router();
router.use(validateAuthToken);

router.post("/routines/:userId", createRoutine);
router.get("/routines/:userId", getRoutines);
router.put("/routines/:userId/:routineId", updateRoutine);
router.delete("/routines/:userId/:id", deleteRoutine);

router.post("/routines/:routineId/exercises", createExercise);
router.get("/routines/:routineId/details", getExercises);

router.post(
    "/routines/:routineId/exercises/:exerciseId/routine-exercises",
    createRoutineExercise,
);
router.get(
    "/routines/:routineId/exercises/:exerciseId/details",
    getRoutineExercises,
);

export default router;
