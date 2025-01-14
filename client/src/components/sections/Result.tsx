interface IResult {
    prediction: string;
}

const Result = ({ prediction }: IResult) => {
    return (
        <div>
            {prediction ? (
                <div>
                    <p className="mb-2">Given the prediction inputs</p>

                    {prediction === "0" ? (
                        <p className="text-3xl font-bold text-green-500">
                            This person probably does not have a cardiovascular
                            disease
                        </p>
                    ) : (
                        <p className="text-3xl font-bold text-orange-500">
                            This person probably has a cardiovascular disease
                        </p>
                    )}
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
};

export default Result;
