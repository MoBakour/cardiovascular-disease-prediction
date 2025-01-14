import { getColor } from "@/lib/utils";
import { Report } from "@/types";
import clsx from "clsx";

interface IReport {
    model: string;
    report: Report;
}

const displayNames: { [key: string]: string } = {
    accuracy: "Accuracy",
    precision: "Precision",
    recall: "Recall",
    f1_score: "F1 Score",
    cross_val_score: "CV Score",
};

const ReportDisplay = ({ model, report }: IReport) => {
    return (
        <div>
            <h2 className="font-bold text-2xl">{model}</h2>

            {Object.entries(report).map(([key, value]: [string, number]) => (
                <div key={key} className="mt-5 flex items-end">
                    <p className="mr-4 w-[80px]">{displayNames[key]}</p>
                    <p
                        className={clsx(
                            getColor(value),
                            key === "accuracy" ? "text-4xl" : "text-xl",
                            "font-bold"
                        )}
                    >
                        {Number(value).toFixed(2)}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ReportDisplay;
