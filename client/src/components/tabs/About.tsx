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
                <h2 className="font-bold text-2xl">About The Team</h2>
                <p>
                    This project was completed by a team of Machine Learning
                    course taken by three junior Software Engineering students
                    at Istinye University in Istanbul, Turkey.
                </p>
                <ul>
                    {[
                        { name: "Mohamed Bakour", id: "220911218" },
                        { name: "Sama Basim Hasan", id: "229913067" },
                        { name: "Hasan Hussam Sarmini", id: "220911229" },
                    ].map((member, index) => (
                        <li key={index} className="flex list-disc">
                            <p className="w-[200px] text-orange-500">
                                {member.name}
                            </p>
                            <p className="text-yellow-500 font-mono tracking-widest">
                                {member.id}
                            </p>
                        </li>
                    ))}
                </ul>
            </article>
        </div>
    );
};

export default About;
