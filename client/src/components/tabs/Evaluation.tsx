import { useEffect, useState, useMemo } from "react";
import ReportDisplay from "../sections/ReportDisplay";
import { Report } from "@/types";
import { fetchEvaluation, ApiError } from "@/lib/api";

const Evaluation = () => {
    const [reports, setReports] = useState<{ [key: string]: Report } | null>();
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadEval = async () => {
            try {
                const data = await fetchEvaluation();
                setReports(data);
                setError(false);
            } catch (err) {
                console.error(err);
                // 503 means models are still training — keep waiting quietly.
                // Any other failure is a real error.
                setError(!(err instanceof ApiError && err.status === 503));
                // Retry in 5s in either case
                setTimeout(loadEval, 5000);
            }
        };
        loadEval();
    }, []);

    // Find the best model by accuracy
    const bestModel = useMemo(() => {
        if (!reports) return null;
        let best = "";
        let bestAcc = 0;
        for (const [key, report] of Object.entries(reports)) {
            if (report.accuracy > bestAcc) {
                bestAcc = report.accuracy;
                best = key;
            }
        }
        return best;
    }, [reports]);

    return (
        <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
                Model Evaluation
            </h2>
            <p className="text-white/40 mb-8 text-sm">
                Performance comparison of 9 model variants across accuracy,
                precision, recall, F1, and cross-validation scores
            </p>

            {reports ? (
                <div className="grid grid-cols-3 gap-5 lg:grid-cols-2 sm:!grid-cols-1">
                    {Object.entries(reports).map(
                        ([key, report], index) => (
                            <div
                                key={key}
                                style={{
                                    animationDelay: `${index * 60}ms`,
                                }}
                            >
                                <ReportDisplay
                                    model={key}
                                    report={report}
                                    isBest={key === bestModel}
                                />
                            </div>
                        )
                    )}
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-3 gap-5 lg:grid-cols-2 sm:!grid-cols-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="skeleton h-56" />
                        ))}
                    </div>
                    <p className="text-center text-white/30 mt-6 text-sm">
                        {error
                            ? "Failed to load. Is the server running?"
                            : "Training models... This may take a minute."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Evaluation;
