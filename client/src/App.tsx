import { useState } from "react";
import clsx from "clsx";
import Evaluation from "./components/tabs/Evaluation";
import Prediction from "./components/tabs/Prediction";
import About from "./components/tabs/About";
import Exploration from "./components/tabs/Exploration";

const App = () => {
    const tabs = ["Prediction", "Evaluation", "Exploration", "About"]; // exploration tab is not included
    const [activeTab, setActiveTab] = useState("Prediction");

    return (
        <div className="w-[80%] sm:w-[90%] max-w-[1100px] mx-auto mt-20">
            <nav className="flex justify-between items-center lg:flex-col">
                <h1 className="text-4xl font-bold pr-4 lg:pr-0 lg:pb-2 lg:text-center sm:text-3xl">
                    Cardiovascular Disease Prediction
                </h1>
                <div className="flex gap-6 sm:gap-3 sm:text-sm">
                    {tabs.map((tab) => (
                        <p
                            key={tab}
                            className={clsx(
                                "cursor-pointer transition",
                                activeTab === tab
                                    ? "text-white"
                                    : "text-white/60 hover:text-white"
                            )}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </p>
                    ))}
                </div>
            </nav>

            <div className="my-10">
                {
                    {
                        Prediction: <Prediction />,
                        Evaluation: <Evaluation />,
                        Exploration: <Exploration />,
                        About: <About />,
                    }[activeTab]
                }
            </div>
        </div>
    );
};

export default App;
