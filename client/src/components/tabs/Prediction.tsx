import Settings from "@/components/sections/Settings";
import Inputs from "@/components/sections/Inputs";
import Result from "@/components/sections/Result";
import { fetchPrediction } from "@/lib/api";
import z from "zod";
import { useState } from "react";

const Prediction = () => {
    const [settings, setSettings] = useState({
        model: "Random Forest",
        tuning: "Grid Search",
    });

    const [inputs, setInputs] = useState({
        gender: "2",
        height: "",
        weight: "",
        age: "",
        systolic: "",
        diastolic: "",
        chol: "1",
        gluc: "1",
        smoke: false,
        alco: false,
        active: false,
    });

    const [prediction, setPrediction] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const getPrediction = async () => {
        // validate — a positive whole number is required for each numeric field
        const numericField = z
            .string()
            .regex(/^\d+$/)
            .refine((v) => +v > 0);
        const schema = z.object({
            age: numericField,
            height: numericField,
            weight: numericField,
            systolic: numericField,
            diastolic: numericField,
        });

        if (!schema.safeParse(inputs).success) {
            setError("Please fill all fields with valid positive numbers.");
            return;
        }

        try {
            setError("");
            setLoading(true);

            // form the inputs in a single array
            const input = [
                +inputs.age * 365,
                +inputs.gender,
                +inputs.height,
                +inputs.weight,
                +inputs.systolic,
                +inputs.diastolic,
                +inputs.chol,
                +inputs.gluc,
                +inputs.smoke,
                +inputs.alco,
                +inputs.active,
            ];

            const response = await fetchPrediction({
                input,
                model: settings.model,
                tuning: settings.tuning,
            });

            setPrediction(response.prediction[0].toString());
        } catch (error) {
            console.error(error);
            setError(
                "Could not get a prediction. Make sure the server is running and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-between gap-10 lg:flex-col">
            <div className="flex flex-col gap-20 lg:gap-10">
                <Settings settings={settings} setSettings={setSettings} />
                <Result prediction={prediction} />
            </div>
            <Inputs
                inputs={inputs}
                setInputs={setInputs}
                getPrediction={getPrediction}
                error={error}
                loading={loading}
            />
        </div>
    );
};

export default Prediction;
