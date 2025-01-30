import { useEffect, useState } from "react";
import ReportDisplay from "../sections/ReportDisplay";
import { Report } from "@/types";
import { Loader2 } from "lucide-react";

const Evaluation = () => {
    const [reports, setReports] = useState<{ [key: string]: Report } | null>();

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch("http://localhost:5000/evaluate");
                const data = await response.json();
                setReports(data);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return (
        <div className="grid grid-cols-3 items-end gap-y-20 gap-x-10 lg:grid-cols-2 sm:!grid-cols-1 sm:!justify-items-center">
            {reports ? (
                Object.entries(reports).map(([key, report]) => (
                    <ReportDisplay key={key} model={key} report={report} />
                ))
            ) : (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Loader2 size={80} className="animate-spin opacity-60" />
                </div>
            )}
        </div>
    );
};

export default Evaluation;
