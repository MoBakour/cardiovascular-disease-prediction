interface IResult {
    prediction: string;
}

const Result = ({ prediction }: IResult) => {
    return (
        <div>
            {prediction ? (
                <div className="text-3xl font-bold">
                    <p className="mb-2 text-base">
                        Given the prediction inputs
                    </p>

                    {prediction === "0" ? (
                        <p className="text-green-500 lg:text-center">
                            This person probably does not have a cardiovascular
                            disease
                        </p>
                    ) : (
                        <p className="text-orange-500 lg:text-center">
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
