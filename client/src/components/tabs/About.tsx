const About = () => {
    return (
        <div className="flex flex-col gap-10">
            <article className="flex flex-col gap-5">
                <h2 className="font-bold text-2xl">About The Project</h2>
                <p>
                    This is a simple web application that predicts the presence
                    of cardiovascular disease in patients. The prediction is
                    based on various features including general patient features
                    such as age, weight, height, and gender. And also medical
                    features such as cholesterol levels, glucose levels, and
                    blood pressure. The prediction is made using machine
                    learning models trained a cardiovascular disease detection
                    dataset.
                </p>
                <p>
                    The project consists of 9 different models trained on three
                    different classification algorithms and three different
                    hyperparameter tuning techniques. The models are evaluated
                    using various metrics such as accuracy, precision, recall,
                    f1-score, and cross-validation score. The evaluation results
                    are displayed in the Evaluation tab.
                </p>
            </article>

            <article className="flex flex-col gap-5">
                <h2 className="font-bold text-2xl">Credits</h2>
                <p>
                    Source code is available on GitHub. This project was
                    completed by MoBakour, find me on GitHub and LinkedIn.
                </p>
                <ul className="flex gap-4">
                    <li>
                        <a
                            href="https://github.com/MoBakour"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.835 2.805 1.305 3.49.998.108-.775.42-1.305.76-1.605-2.665-.305-5.466-1.335-5.466-5.93 0-1.31.47-2.38 1.235-3.22-.125-.305-.535-1.535.115-3.195 0 0 1.005-.32 3.3 1.23.96-.265 1.98-.4 3-.405 1.02.005 2.04.14 3 .405 2.28-1.55 3.285-1.23 3.285-1.23.655 1.66.245 2.89.12 3.195.77.84 1.235 1.91 1.235 3.22 0 4.61-2.805 5.62-5.475 5.92.43.37.81 1.1.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .32.215.695.825.575C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.linkedin.com/in/mobakour"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.25h-3v-5.5c0-1.38-.02-3.16-1.93-3.16-1.93 0-2.23 1.5-2.23 3.05v5.61h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" />
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://github.com/MoBakour/cardiovascular-disease-prediction"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.24 1.84 1.24 1.07 1.835 2.805 1.305 3.49.998.108-.775.42-1.305.76-1.605-2.665-.305-5.466-1.335-5.466-5.93 0-1.31.47-2.38 1.235-3.22-.125-.305-.535-1.535.115-3.195 0 0 1.005-.32 3.3 1.23.96-.265 1.98-.4 3-.405 1.02.005 2.04.14 3 .405 2.28-1.55 3.285-1.23 3.285-1.23.655 1.66.245 2.89.12 3.195.77.84 1.235 1.91 1.235 3.22 0 4.61-2.805 5.62-5.475 5.92.43.37.81 1.1.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .32.215.695.825.575C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                        </a>
                    </li>
                </ul>
            </article>
        </div>
    );
};

export default About;
