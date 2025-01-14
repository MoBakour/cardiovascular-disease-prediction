export type Report = {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    cross_val_score: number;
};

declare module "*.csv" {
    const content: string;
    export default content;
}
