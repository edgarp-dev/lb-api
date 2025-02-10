import SupabaseClient from "../supabase/SupabaseClient.ts";

// deno-lint-ignore no-explicit-any
type Context = { params: any; request: any; response: any };

const supabase = SupabaseClient.getClient();

const createRoutine = async ({ params, request, response }: Context) => {
    try {
        const { userId } = params;
        const { description, isCompleted } = await request.body
            .json();

        const { data, error } = await supabase.from("routines").insert({
            user_id: userId,
            date: new Date().toISOString(),
            description: description,
            is_completed: isCompleted ?? false,
        }).select("routine_id");

        if (error) {
            response.status = 400;
            response.body = { error: error.message };

            return;
        } else {
            response.status = 201;
            const routineId = data[0].routine_id;
            response.body = { routineId: routineId };

            return;
        }
    } catch (error) {
        console.error(error);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

const getRoutines = async ({ params, request, response }: Context) => {
    try {
        const userId = params.userId;

        if (!userId) {
            response.status = 400;
            response.body = { error: "Missing userId parameter" };

            return;
        }

        const page = parseInt(request.url.searchParams.get("page") ?? "1");
        const pageSize = parseInt(
            request.url.searchParams.get("pageSize") ?? "10",
        );
        const offset = (page - 1) * pageSize;

        const { data, error } = await supabase
            .from("routines")
            .select("*")
            .eq("user_id", userId)
            .order("is_completed", { ascending: true })
            .order("date", { ascending: false })
            .range(offset, offset + pageSize - 1);

        const { count } = await supabase.from(
            "routines",
        ).select("*", { count: "exact" });
        const totalResults = count ?? 0;

        if (error) {
            response.status = 400;
            response.body = { error: error.message };

            return;
        } else {
            response.status = 200;
            response.body = {
                routines: data,
                currentPage: page,
                totalPages: Math.ceil(totalResults / pageSize),
                totalResults,
            };

            return;
        }
    } catch (error) {
        console.error(error);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

const updateRoutine = async ({ params, request, response }: Context) => {
    try {
        const { routineId, userId } = params;
        const { isCompleted } = await request.body.json();

        const { data, error } = await supabase.from("routines")
            .update({
                is_completed: isCompleted,
            })
            .eq("routine_id", routineId)
            .eq("user_id", userId)
            .select("routine_id");

        if (error) {
            response.status = 400;
            response.body = { error: error.message };
            return;
        }

        if (data.length === 0) {
            response.status = 404;
            response.body = { error: "Routine not found" };

            return;
        } else {
            const updatedRoutineId = data[0].routine_id;
            response.status = 200;
            response.body = { id: updatedRoutineId };

            return;
        }
    } catch (error) {
        console.error(error);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

const deleteRoutine = async ({ params, response }: Context) => {
    try {
        const userId = params.userId;
        const routineId = params.id;

        const { data: userRoutines, error: errorUserRoutines } = await supabase
            .from("routines").select("routine_id").eq("user_id", userId);

        if (errorUserRoutines) {
            response.status = 400;
            response.body = { error: errorUserRoutines.message };
            return;
        }

        if (userRoutines.length === 0) {
            response.status = 404;
            response.body = { error: "Routine not found" };

            return;
        }

        const { data: exercises, error: exercisesError } = await supabase
            .from("exercises")
            .select("exercise_id")
            .eq("routine_id", routineId);

        if (exercisesError) {
            response.status = 400;
            response.body = { error: exercisesError.message };
            return;
        }

        if (exercises.length > 0) {
            const exerciseIds = exercises.map((exercise) =>
                exercise.exercise_id
            );

            const { error: deleteRoutineExercisesError } = await supabase
                .from("routineexercises")
                .delete()
                .in("exercise_id", exerciseIds);

            if (deleteRoutineExercisesError) {
                response.status = 400;
                response.body = {
                    error: deleteRoutineExercisesError.message,
                };
                return;
            }

            const { error: deleteExercisesError } = await supabase
                .from("exercises")
                .delete()
                .eq("routine_id", routineId);

            if (deleteExercisesError) {
                response.status = 400;
                response.body = { error: deleteExercisesError.message };
                return;
            }
        }

        const { data: deletedRoutine, error: deleteRoutineError } =
            await supabase
                .from("routines")
                .delete()
                .eq("routine_id", routineId)
                .select("routine_id");

        if (deleteRoutineError) {
            response.status = 400;
            response.body = { error: deleteRoutineError.message };
            return;
        }

        if (!deletedRoutine) {
            response.status = 404;
            response.body = { error: "Routine not found" };
        } else {
            response.status = 200;
            response.body = {
                id: routineId,
            };
        }
    } catch (error) {
        console.error(error);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

const createExercise = async ({ params, request, response }: Context) => {
    try {
        const routineId = params.routineId;
        const { name, muscle } = await request.body.json();

        const { data, error } = await supabase.from("exercises").insert({
            routine_id: routineId,
            name: name,
            muscle: muscle,
        }).select("exercise_id");

        if (error) {
            response.status = 400;
            response.body = { error: error.message };
        } else {
            response.status = 201;

            const exerciseId = data[0].exercise_id;
            response.body = { exerciseId: exerciseId };
        }
    } catch (error) {
        console.error(error);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

const getExercises = async ({ params, response }: Context) => {
    try {
        const { routineId } = params;

        const { data: exercises, error: exercisesError } = await supabase
            .from("exercises")
            .select(`
            exercise_id,
            name,
            muscle
            `)
            .eq("routine_id", routineId);

        const { data: routine, error: routineError } = await supabase
            .from("routines")
            .select(`description,is_completed`)
            .eq("routine_id", routineId)
            .single();

        if (exercisesError || routineError) {
            const errorMessage = exercisesError?.message ||
                routineError?.message;
            response.status = 400;
            response.body = { error: errorMessage };

            return;
        } else {
            response.status = 200;

            const { description, is_completed } = routine;
            response.body = {
                description,
                isCompleted: is_completed,
                exercises,
            };

            return;
        }
    } catch (error) {
        console.error(error);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

const createRoutineExercise = async (
    { params, request, response }: Context,
) => {
    try {
        const { exerciseId } = params;
        const { repetitions, weight, weightMeasure } = await request
            .body
            .json();

        const { data, error } = await supabase.from("routineexercises").insert({
            exercise_id: exerciseId,
            repetitions: repetitions,
            weight: weight,
            weight_measure: weightMeasure,
        }).select("routine_exercise_id");

        if (error) {
            response.status = 400;
            response.body = { error: error.message };

            return;
        } else {
            response.status = 201;

            const routineExerciseId = data[0].routine_exercise_id;
            response.body = { routineExerciseId: routineExerciseId };

            return;
        }
    } catch (error) {
        console.error(error);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

const getRoutineExercises = async ({ params, response }: Context) => {
    try {
        const { exerciseId } = params;

        const { data: excerciseDetailsData, error: exerciseDetailsError } =
            await supabase
                .from("exercises")
                .select("name,muscle")
                .eq("exercise_id", exerciseId)
                .single();

        const { data: routineExercises, error: routineExercisesError } =
            await supabase.from("routineexercises")
                .select(`
                    routine_exercise_id,
                    repetitions,
                    weight,
                    weight_measure
                `)
                .eq("exercise_id", exerciseId);

        if (routineExercisesError || exerciseDetailsError) {
            const errorMessage = routineExercisesError?.message ||
                exerciseDetailsError?.message;

            response.status = 400;
            response.body = { error: errorMessage };

            return;
        } else {
            response.status = 200;

            const { name, muscle } = excerciseDetailsData;
            response.body = {
                name,
                muscle,
                routineExercises,
            };

            return;
        }
    } catch (error) {
        console.error(error);

        response.status = 500;
        response.body = { error: "Internal Server Error" };
    }
};

export {
    createExercise,
    createRoutine,
    createRoutineExercise,
    deleteRoutine,
    getExercises,
    getRoutineExercises,
    getRoutines,
    updateRoutine,
};
