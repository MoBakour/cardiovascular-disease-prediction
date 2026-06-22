import { Report } from "@/types";
import clsx from "clsx";

interface IReport {
    model: string;
    report: Report;
    isBest?: boolean;
}

const displayNames: { [key: string]: string } = {
    accuracy: "Accuracy",
    precision: "Precision",
    recall: "Recall",
    f1_score: "F1 Score",
    cross_val_score: "CV Score",
};

const getBarColor = (value: number) => {
    if (value >= 0.72) return "bg-emerald-400";
    if (value >= 0.65) return "bg-amber-400";
    return "bg-rose-400";
};

const getTextColor = (value: number) => {
    if (value >= 0.72) return "text-emerald-400";
    if (value >= 0.65) return "text-amber-400";
    return "text-rose-400";
};

const ReportDisplay = ({ model, report, isBest }: IReport) => {
    const accuracy = report.accuracy;

    return (
        <div className={clsx("metric-card", isBest && "best-model")}>
            {isBest && (
                <div className="absolute top-3 right-3 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                    ★ Best
                </div>
            )}

            <h3 className="font-bold text-lg text-white/90 mb-1 pr-16">
                {model}
            </h3>

            {/* Main accuracy display */}
            <div className="mt-4 mb-5">
                <div className="flex items-baseline gap-2">
                    <span
                        className={clsx(
                            "text-4xl font-bold tabular-nums",
                            getTextColor(accuracy)
                        )}
                    >
                        {(accuracy * 100).toFixed(1)}%
                    </span>
                    <span className="text-white/30 text-sm">accuracy</span>
                </div>
            </div>

            {/* Secondary metrics with bars */}
            <div className="space-y-3">
                {Object.entries(report).map(
                    ([key, value]: [string, number]) => {
                        if (key === "accuracy") return null;
                        return (
                            <div key={key}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white/40 text-xs">
                                        {displayNames[key]}
                                    </span>
                                    <span
                                        className={clsx(
                                            "text-xs font-semibold tabular-nums",
                                            getTextColor(value)
                                        )}
                                    >
                                        {(value * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="metric-bar-bg">
                                    <div
                                        className={clsx(
                                            "metric-bar-fill",
                                            getBarColor(value)
                                        )}
                                        style={{
                                            width: `${Math.min(value * 100, 100)}%`,
                                            opacity: 0.7,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
};

export default ReportDisplay;
