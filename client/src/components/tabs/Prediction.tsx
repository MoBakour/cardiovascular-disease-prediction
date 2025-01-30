import Settings from "@/components/sections/Settings";
import Inputs from "@/components/sections/Inputs";
import Result from "@/components/sections/Result";
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
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const getPrediction = async () => {
        try {
            // validate
            const schema = z.object({
                age: z
                    .string()
                    .nonempty()
                    .regex(/^\d+$/)
                    .min(1, { message: "Age is required" }),
                height: z
                    .string()
                    .nonempty()
                    .regex(/^\d+$/)
                    .min(1, { message: "Height is required" }),
                weight: z
                    .string()
                    .nonempty()

                    .regex(/^\d+$/)
                    .min(1, { message: "Weight is required" }),
                systolic: z
                    .string()
                    .nonempty()
                    .regex(/^\d+$/)
                    .min(1, { message: "Systolic is required" }),
                diastolic: z
                    .string()
                    .nonempty()
                    .regex(/^\d+$/)
                    .min(1, { message: "Diastolic is required" }),
            });

            schema.parse(inputs);
            setError(false);
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

            const data = await fetch("http://localhost:5000/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    input,
                    model: settings.model,
                    tuning: settings.tuning,
                }),
            });

            const response = await data.json();

            setPrediction(response.prediction[0].toString());
        } catch (error) {
            console.error(error);
            setError(true);
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
