import { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import { Bar, Doughnut, Scatter } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

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

// Premium color palette
const COLORS = {
    cyan: { bg: "rgba(99, 179, 237, 0.25)", border: "rgba(99, 179, 237, 1)" },
    purple: {
        bg: "rgba(159, 122, 234, 0.25)",
        border: "rgba(159, 122, 234, 1)",
    },
    pink: { bg: "rgba(237, 100, 166, 0.25)", border: "rgba(237, 100, 166, 1)" },
    teal: { bg: "rgba(79, 209, 197, 0.25)", border: "rgba(79, 209, 197, 1)" },
    amber: {
        bg: "rgba(246, 173, 85, 0.25)",
        border: "rgba(246, 173, 85, 1)",
    },
    green: {
        bg: "rgba(72, 187, 120, 0.25)",
        border: "rgba(72, 187, 120, 1)",
    },
};

const PALETTE = [
    COLORS.cyan,
    COLORS.purple,
    COLORS.pink,
    COLORS.teal,
    COLORS.amber,
    COLORS.green,
];

const DOUGHNUT_PALETTE = [
    { bg: "rgba(99, 179, 237, 0.6)", border: "rgba(99, 179, 237, 1)" },
    { bg: "rgba(237, 100, 166, 0.6)", border: "rgba(237, 100, 166, 1)" },
    { bg: "rgba(159, 122, 234, 0.6)", border: "rgba(159, 122, 234, 1)" },
];

// Shared chart options
const darkOptions = (title: string): any => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
        tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            titleColor: "rgba(255, 255, 255, 0.9)",
            bodyColor: "rgba(255, 255, 255, 0.7)",
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: "Quicksand", weight: "bold" as const, size: 13 },
            bodyFont: { family: "Quicksand", size: 12 },
        },
    },
    scales: {
        x: {
            ticks: {
                color: "rgba(255,255,255,0.45)",
                font: { family: "Quicksand", size: 11 },
            },
            grid: { color: "rgba(255,255,255,0.04)" },
            border: { color: "rgba(255,255,255,0.08)" },
        },
        y: {
            ticks: {
                color: "rgba(255,255,255,0.45)",
                font: { family: "Quicksand", size: 11 },
            },
            grid: { color: "rgba(255,255,255,0.04)" },
            border: { color: "rgba(255,255,255,0.08)" },
        },
    },
});

const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "65%",
    plugins: {
        legend: {
            position: "bottom" as const,
            labels: {
                color: "rgba(255,255,255,0.65)",
                font: { family: "Quicksand", size: 12 },
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 8,
            },
        },
        tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            titleColor: "rgba(255, 255, 255, 0.9)",
            bodyColor: "rgba(255, 255, 255, 0.7)",
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: "Quicksand", weight: "bold" as const, size: 13 },
            bodyFont: { family: "Quicksand", size: 12 },
        },
    },
};

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

    // Helpers
    const countCategories = (category: keyof IRow) => {
        return data.reduce((acc: { [key: string]: number }, row: IRow) => {
            acc[row[category]] = (acc[row[category]] || 0) + 1;
            return acc;
        }, {});
    };

    const createBarData = (
        counts: { [key: string]: number },
        labels: string[],
        displayLabels: string[]
    ) => ({
        labels: displayLabels,
        datasets: [
            {
                data: labels.map((l) => counts[l] || 0),
                backgroundColor: PALETTE.slice(0, labels.length).map(
                    (c) => c.bg
                ),
                borderColor: PALETTE.slice(0, labels.length).map(
                    (c) => c.border
                ),
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false as const,
            },
        ],
    });

    const createDoughnutData = (
        counts: { [key: string]: number },
        labels: string[],
        displayLabels: string[]
    ) => ({
        labels: displayLabels,
        datasets: [
            {
                data: labels.map((l) => counts[l] || 0),
                backgroundColor: DOUGHNUT_PALETTE.slice(
                    0,
                    labels.length
                ).map((c) => c.bg),
                borderColor: DOUGHNUT_PALETTE.slice(0, labels.length).map(
                    (c) => c.border
                ),
                borderWidth: 2,
                hoverOffset: 8,
            },
        ],
    });

    const createHistogramData = (
        values: number[],
        bins: number,
        color: (typeof PALETTE)[0]
    ) => {
        const filtered = values.filter((v) => !isNaN(v));
        if (filtered.length === 0) return null;
        const min = Math.min(...filtered);
        const max = Math.max(...filtered);
        const binWidth = (max - min) / bins;
        const binCounts = Array(bins).fill(0);

        filtered.forEach((value) => {
            const idx = Math.min(
                Math.floor((value - min) / binWidth),
                bins - 1
            );
            binCounts[idx]++;
        });

        const labels = Array.from(
            { length: bins },
            (_, i) =>
                `${Math.round(min + i * binWidth)}–${Math.round(min + (i + 1) * binWidth)}`
        );

        return {
            labels,
            datasets: [
                {
                    data: binCounts,
                    backgroundColor: color.bg,
                    borderColor: color.border,
                    borderWidth: 1.5,
                    borderRadius: 4,
                    borderSkipped: false as const,
                },
            ],
        };
    };

    // Compute chart data
    const genderCounts = countCategories("gender");
    const cholesterolCounts = countCategories("cholesterol");
    const glucCounts = countCategories("gluc");
    const smokeCounts = countCategories("smoke");
    const alcoCounts = countCategories("alco");
    const activeCounts = countCategories("active");
    const cardioCounts = countCategories("cardio");

    const genderChart = createBarData(
        genderCounts,
        ["1", "2"],
        ["Female", "Male"]
    );
    const cholesterolChart = createBarData(
        cholesterolCounts,
        ["1", "2", "3"],
        ["Normal", "Above Normal", "Well Above"]
    );
    const glucChart = createBarData(
        glucCounts,
        ["1", "2", "3"],
        ["Normal", "Above Normal", "Well Above"]
    );

    const smokeChart = createDoughnutData(
        smokeCounts,
        ["0", "1"],
        ["Non-Smoker", "Smoker"]
    );
    const alcoChart = createDoughnutData(
        alcoCounts,
        ["0", "1"],
        ["Non-Drinker", "Drinker"]
    );
    const activeChart = createDoughnutData(
        activeCounts,
        ["0", "1"],
        ["Inactive", "Active"]
    );
    const cardioChart = createDoughnutData(
        cardioCounts,
        ["0", "1"],
        ["No CVD", "Has CVD"]
    );

    const ageValues = data.map((row) => parseInt(row.age) / 365.25);
    const heightValues = data.map((row) => parseInt(row.height));
    const weightValues = data.map((row) => parseInt(row.weight));
    const apHiValues = data.map((row) => parseInt(row.ap_hi));
    const apLoValues = data.map((row) => parseInt(row.ap_lo));

    const ageHist = createHistogramData(ageValues, 12, COLORS.cyan);
    const heightHist = createHistogramData(heightValues, 12, COLORS.purple);
    const weightHist = createHistogramData(weightValues, 12, COLORS.pink);
    const apHiHist = createHistogramData(apHiValues, 12, COLORS.teal);
    const apLoHist = createHistogramData(apLoValues, 12, COLORS.amber);

    // Scatter: Weight vs Height colored by cardio
    const scatterData = useMemo(() => {
        if (data.length === 0) return null;
        const sample = data.filter((_, i) => i % 5 === 0); // sample every 5th for performance
        const noCardio = sample.filter((r) => r.cardio === "0");
        const hasCardio = sample.filter((r) => r.cardio === "1");

        return {
            datasets: [
                {
                    label: "No CVD",
                    data: noCardio.map((r) => ({
                        x: parseFloat(r.weight),
                        y: parseFloat(r.height),
                    })),
                    backgroundColor: "rgba(72, 187, 120, 0.3)",
                    borderColor: "rgba(72, 187, 120, 0.6)",
                    pointRadius: 2.5,
                    pointHoverRadius: 5,
                },
                {
                    label: "Has CVD",
                    data: hasCardio.map((r) => ({
                        x: parseFloat(r.weight),
                        y: parseFloat(r.height),
                    })),
                    backgroundColor: "rgba(237, 100, 166, 0.3)",
                    borderColor: "rgba(237, 100, 166, 0.6)",
                    pointRadius: 2.5,
                    pointHoverRadius: 5,
                },
            ],
        };
    }, [data]);

    // Dataset insights
    const insights = useMemo(() => {
        if (data.length === 0) return null;
        const total = data.length;
        const cvdCount = data.filter((r) => r.cardio === "1").length;
        const avgAge = (
            data.reduce((s, r) => s + parseInt(r.age) / 365.25, 0) / total
        ).toFixed(1);
        const maleCount = data.filter((r) => r.gender === "2").length;
        return {
            total: total.toLocaleString(),
            cvdRate: ((cvdCount / total) * 100).toFixed(1),
            avgAge,
            malePercent: ((maleCount / total) * 100).toFixed(1),
        };
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white/40 text-lg">Loading dataset...</div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            {/* Dataset Insights */}
            {insights && (
                <div className="mb-12">
                    <h2 className="text-3xl font-bold gradient-text mb-2">
                        Dataset Overview
                    </h2>
                    <p className="text-white/40 mb-6 text-sm">
                        Key statistics from the cardiovascular disease dataset
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <span className="insight-badge">
                            📊 {insights.total} patients
                        </span>
                        <span className="insight-badge">
                            ❤️ {insights.cvdRate}% CVD positive
                        </span>
                        <span className="insight-badge">
                            🎂 Avg age: {insights.avgAge} years
                        </span>
                        <span className="insight-badge">
                            👤 {insights.malePercent}% male
                        </span>
                    </div>
                </div>
            )}

            {/* Target Variable */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold gradient-text-warm mb-2">
                    Target Variable Distribution
                </h2>
                <p className="text-white/40 mb-6 text-sm">
                    Balance between cardiovascular disease positive and negative
                    cases
                </p>
                <div className="chart-card w-full max-w-sm mx-auto">
                    <h3 className="text-white/70 font-semibold text-sm mb-4 text-center">
                        Cardiovascular Disease
                    </h3>
                    <Doughnut data={cardioChart} options={doughnutOptions} />
                </div>
            </div>

            <div className="section-divider" />

            {/* Categorical Features */}
            <h2 className="text-2xl font-bold gradient-text mb-2">
                Categorical Features
            </h2>
            <p className="text-white/40 mb-8 text-sm">
                Distribution of discrete patient attributes
            </p>

            <div className="grid grid-cols-3 gap-6 lg:grid-cols-2 sm:!grid-cols-1">
                <div className="chart-card" style={{ animationDelay: "0ms" }}>
                    <h3 className="text-white/70 font-semibold text-sm mb-4">
                        Gender
                    </h3>
                    <Bar
                        data={genderChart}
                        options={darkOptions("Gender")}
                    />
                </div>
                <div className="chart-card" style={{ animationDelay: "60ms" }}>
                    <h3 className="text-white/70 font-semibold text-sm mb-4">
                        Cholesterol Level
                    </h3>
                    <Bar
                        data={cholesterolChart}
                        options={darkOptions("Cholesterol")}
                    />
                </div>
                <div
                    className="chart-card"
                    style={{ animationDelay: "120ms" }}
                >
                    <h3 className="text-white/70 font-semibold text-sm mb-4">
                        Glucose Level
                    </h3>
                    <Bar
                        data={glucChart}
                        options={darkOptions("Glucose")}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6 lg:grid-cols-2 sm:!grid-cols-1">
                <div
                    className="chart-card"
                    style={{ animationDelay: "180ms" }}
                >
                    <h3 className="text-white/70 font-semibold text-sm mb-4 text-center">
                        Smoking Status
                    </h3>
                    <Doughnut data={smokeChart} options={doughnutOptions} />
                </div>
                <div
                    className="chart-card"
                    style={{ animationDelay: "240ms" }}
                >
                    <h3 className="text-white/70 font-semibold text-sm mb-4 text-center">
                        Alcohol Intake
                    </h3>
                    <Doughnut data={alcoChart} options={doughnutOptions} />
                </div>
                <div
                    className="chart-card"
                    style={{ animationDelay: "300ms" }}
                >
                    <h3 className="text-white/70 font-semibold text-sm mb-4 text-center">
                        Physical Activity
                    </h3>
                    <Doughnut data={activeChart} options={doughnutOptions} />
                </div>
            </div>

            <div className="section-divider" />

            {/* Numerical Features */}
            <h2 className="text-2xl font-bold gradient-text-cool mb-2">
                Numerical Features
            </h2>
            <p className="text-white/40 mb-8 text-sm">
                Distribution histograms for continuous patient measurements
            </p>

            <div className="grid grid-cols-3 gap-6 lg:grid-cols-2 sm:!grid-cols-1">
                {ageHist && (
                    <div className="chart-card">
                        <h3 className="text-white/70 font-semibold text-sm mb-4">
                            Age (years)
                        </h3>
                        <Bar
                            data={ageHist}
                            options={darkOptions("Age")}
                        />
                    </div>
                )}
                {heightHist && (
                    <div className="chart-card">
                        <h3 className="text-white/70 font-semibold text-sm mb-4">
                            Height (cm)
                        </h3>
                        <Bar
                            data={heightHist}
                            options={darkOptions("Height")}
                        />
                    </div>
                )}
                {weightHist && (
                    <div className="chart-card">
                        <h3 className="text-white/70 font-semibold text-sm mb-4">
                            Weight (kg)
                        </h3>
                        <Bar
                            data={weightHist}
                            options={darkOptions("Weight")}
                        />
                    </div>
                )}
                {apHiHist && (
                    <div className="chart-card">
                        <h3 className="text-white/70 font-semibold text-sm mb-4">
                            Systolic Blood Pressure
                        </h3>
                        <Bar
                            data={apHiHist}
                            options={darkOptions("Systolic BP")}
                        />
                    </div>
                )}
                {apLoHist && (
                    <div className="chart-card">
                        <h3 className="text-white/70 font-semibold text-sm mb-4">
                            Diastolic Blood Pressure
                        </h3>
                        <Bar
                            data={apLoHist}
                            options={darkOptions("Diastolic BP")}
                        />
                    </div>
                )}
            </div>

            <div className="section-divider" />

            {/* Scatter Plot */}
            <h2 className="text-2xl font-bold gradient-text mb-2">
                Weight vs Height
            </h2>
            <p className="text-white/40 mb-8 text-sm">
                Scatter plot colored by cardiovascular disease status (sampled
                for performance)
            </p>

            {scatterData && (
                <div className="chart-card max-w-2xl mx-auto">
                    <Scatter
                        data={scatterData}
                        options={{
                            ...darkOptions("Weight vs Height"),
                            plugins: {
                                ...darkOptions("Weight vs Height").plugins,
                                legend: {
                                    display: true,
                                    position: "top" as const,
                                    labels: {
                                        color: "rgba(255,255,255,0.6)",
                                        font: {
                                            family: "Quicksand",
                                            size: 12,
                                        },
                                        usePointStyle: true,
                                        pointStyleWidth: 8,
                                        padding: 20,
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    ...darkOptions("").scales.x,
                                    title: {
                                        display: true,
                                        text: "Weight (kg)",
                                        color: "rgba(255,255,255,0.5)",
                                        font: {
                                            family: "Quicksand",
                                            size: 12,
                                        },
                                    },
                                },
                                y: {
                                    ...darkOptions("").scales.y,
                                    title: {
                                        display: true,
                                        text: "Height (cm)",
                                        color: "rgba(255,255,255,0.5)",
                                        font: {
                                            family: "Quicksand",
                                            size: 12,
                                        },
                                    },
                                },
                            },
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default Exploration;
