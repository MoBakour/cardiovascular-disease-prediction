import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface IInputs {
    inputs: any;
    setInputs: (inputs: any) => void;
    getPrediction: () => void;
    error: boolean;
    loading: boolean;
}

const Inputs = ({
    inputs,
    setInputs,
    getPrediction,
    error,
    loading,
}: IInputs) => {
    return (
        <div>
            <div className="flex items-center gap-12">
                <div className="flex flex-col gap-6">
                    <div className="flex items-end gap-6">
                        <div className="w-[120px]">
                            <p className="mb-2 font-bold">Gender</p>
                            <Select
                                value={inputs.gender}
                                onValueChange={(value) =>
                                    setInputs({ ...inputs, gender: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">Male</SelectItem>
                                    <SelectItem value="1">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[120px]">
                            <p className="mb-2 font-bold">Height (cm)</p>
                            <Input
                                type="number"
                                value={inputs.height}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        height: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="w-[120px]">
                            <p className="mb-2 font-bold">Weight (kg)</p>
                            <Input
                                type="number"
                                value={inputs.weight}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        weight: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-6">
                        <div className="w-[120px]">
                            <p className="mb-2 font-bold">Age</p>
                            <Input
                                type="number"
                                value={inputs.age}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        age: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="w-[120px]">
                            <p className="mb-2 font-bold">
                                Systolic blood pressure
                            </p>
                            <Input
                                type="number"
                                value={inputs.systolic}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        systolic: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="w-[120px]">
                            <p className="mb-2 font-bold">
                                Diastolic blood pressure
                            </p>
                            <Input
                                type="number"
                                value={inputs.diastolic}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        diastolic: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-6">
                <div>
                    <p className="font-bold">Cholesterol</p>
                    <Select
                        value={inputs.chol}
                        onValueChange={(value) =>
                            setInputs({ ...inputs, chol: value })
                        }
                    >
                        <SelectTrigger className="w-[180px] mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Normal</SelectItem>
                            <SelectItem value="2">Above Normal</SelectItem>
                            <SelectItem value="3">Well Above Normal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className="font-bold">Glucose</p>
                    <Select
                        value={inputs.gluc}
                        onValueChange={(value) =>
                            setInputs({ ...inputs, gluc: value })
                        }
                    >
                        <SelectTrigger className="w-[180px] mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Normal</SelectItem>
                            <SelectItem value="2">Above Normal</SelectItem>
                            <SelectItem value="3">Well Above Normal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="mt-6 flex items-end justify-between">
                <div className="w-[120px] flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-bold">Smokes</p>
                        <Switch
                            checked={inputs.smoke}
                            onCheckedChange={(checked) =>
                                setInputs({ ...inputs, smoke: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <p className="font-bold">Drinks</p>
                        <Switch
                            checked={inputs.alco}
                            onCheckedChange={(checked) =>
                                setInputs({ ...inputs, alco: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <p className="font-bold">Active</p>
                        <Switch
                            checked={inputs.active}
                            onCheckedChange={(checked) =>
                                setInputs({ ...inputs, active: checked })
                            }
                        />
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={getPrediction}
                    className="w-[170px] disabled:pointer-events-none"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        "Generate Prediction"
                    )}
                </Button>
            </div>

            {error && (
                <div className="mt-6">
                    <Label className="text-orange-500">
                        Please fill all the fields
                    </Label>
                </div>
            )}
        </div>
    );
};

export default Inputs;
