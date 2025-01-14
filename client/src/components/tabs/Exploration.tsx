import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

interface IRow {
    id: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    ap_hi: string;
    ap_lo: string;
    cholesterol: string;
    gluc: string;
    smoke: string;
    alco: string;
    active: string;
    cardio: string;
}

function Exploration() {
    const [data, setData] = useState<IRow[]>([]);

    useEffect(() => {
        fetch("/cvd_dataset.csv")
            .then((response) => response.text())
            .then((text) => {
                Papa.parse(text, {
                    delimiter: ";",
                    header: true,
                    skipEmptyLines: true,
                    complete: (result: any) => {
                        const cleanedData = result.data.map((row: any) =>
                            Object.fromEntries(
                                Object.entries(row).map(([key, value]) => [
                                    key,
                                    typeof value === "string"
                                        ? value.replace(/_\d+$/, "")
                                        : value,
                                ])
                            )
                        );
                        setData(cleanedData);
                    },
                });
            });
    }, []);

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );

    const countCategories = (category: keyof IRow) => {
        return data.reduce((acc: { [key: string]: number }, row: IRow) => {
            acc[row[category]] = (acc[row[category]] || 0) + 1;
            return acc;
        }, {});
    };

    const createChartData = (
        categoryCounts: { [key: string]: number },
        labels: string[],
        label: string
    ) => {
        const backgroundColors = [
            "rgba(75, 192, 192, 0.2)",
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
        ];
        const borderColors = [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
        ];

        return {
            labels,
            datasets: [
                {
                    label,
                    data: labels.map((label) => categoryCounts[label] || 0),
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 1,
                },
            ],
        };
    };

    const createHistogramData = (
        values: number[],
        bins: number,
        label: string
    ) => {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binWidth = (max - min) / bins;
        const binCounts = Array(bins).fill(0);

        values.forEach((value) => {
            const binIndex = Math.min(
                Math.floor((value - min) / binWidth),
                bins - 1
            );
            binCounts[binIndex]++;
        });

        const labels = Array.from(
            { length: bins },
            (_, i) =>
                `${(min + i * binWidth).toFixed(1)} - ${(
                    min +
                    (i + 1) * binWidth
                ).toFixed(1)}`
        );

        return createChartData(
            Object.fromEntries(labels.map((label, i) => [label, binCounts[i]])),
            labels,
            label
        );
    };

    const genderCounts = countCategories("gender");
    const cholesterolCounts = countCategories("cholesterol");
    const glucCounts = countCategories("gluc");
    const smokeCounts = countCategories("smoke");
    const alcoCounts = countCategories("alco");
    const activeCounts = countCategories("active");
    const cardioCounts = countCategories("cardio");

    const genderChartData = createChartData(
        genderCounts,
        ["1", "2"],
        "Gender Count"
    );
    const cholesterolChartData = createChartData(
        cholesterolCounts,
        ["1", "2", "3"],
        "Cholesterol Count"
    );
    const glucChartData = createChartData(
        glucCounts,
        ["1", "2", "3"],
        "Glucose Count"
    );
    const smokeChartData = createChartData(
        smokeCounts,
        ["0", "1"],
        "Smoke Count"
    );
    const alcoChartData = createChartData(
        alcoCounts,
        ["0", "1"],
        "Alcohol Intake Count"
    );
    const activeChartData = createChartData(
        activeCounts,
        ["0", "1"],
        "Physical Activity Count"
    );
    const cardioChartData = createChartData(
        cardioCounts,
        ["0", "1"],
        "Cardiovascular Disease Count"
    );

    const ageValues = data.map((row) => parseInt(row.age));
    const heightValues = data.map((row) => parseInt(row.height));
    const weightValues = data.map((row) => parseInt(row.weight));
    const apHiValues = data.map((row) => parseInt(row.ap_hi));
    const apLoValues = data.map((row) => parseInt(row.ap_lo));

    const ageHistogramData = createHistogramData(
        ageValues,
        10,
        "Age Distribution"
    );
    const heightHistogramData = createHistogramData(
        heightValues,
        10,
        "Height Distribution"
    );
    const weightHistogramData = createHistogramData(
        weightValues,
        10,
        "Weight Distribution"
    );
    const apHiHistogramData = createHistogramData(
        apHiValues,
        10,
        "Systolic Blood Pressure Distribution"
    );
    const apLoHistogramData = createHistogramData(
        apLoValues,
        10,
        "Diastolic Blood Pressure Distribution"
    );

    return (
        <div className="mt-20">
            <h2 className="text-2xl font-bold">
                Categorical Features Distribution
            </h2>

            <div className="grid grid-cols-2 gap-10 mt-10">
                <div className="">
                    <Bar data={genderChartData} />
                </div>
                <div className="">
                    <Bar data={activeChartData} />
                </div>
                <div className="">
                    <Bar data={cholesterolChartData} />
                </div>
                <div className="">
                    <Bar data={glucChartData} />
                </div>
                <div className="">
                    <Bar data={smokeChartData} />
                </div>
                <div className="">
                    <Bar data={alcoChartData} />
                </div>
            </div>

            <h2 className="text-2xl font-bold mt-20">
                Numerical Features Distribution
            </h2>

            <div className="grid grid-cols-2 gap-10 mt-10">
                <div className="">
                    <Bar data={ageHistogramData} />
                </div>
                <div className="">
                    <Bar data={heightHistogramData} />
                </div>
                <div className="">
                    <Bar data={weightHistogramData} />
                </div>
                <div className="">
                    <Bar data={apHiHistogramData} />
                </div>
                <div className="">
                    <Bar data={apLoHistogramData} />
                </div>
            </div>

            <h2 className="text-2xl font-bold mt-20">
                Distribution of Target Variable (Cardiovascular Disease)
            </h2>

            <div className="mt-10 w-8/12 mx-auto">
                <Bar data={cardioChartData} />
            </div>
        </div>
    );
}

export default Exploration;
