import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ISettings {
    settings: {
        model: string;
        tuning: string;
    };
    setSettings: (settings: { model: string; tuning: string }) => void;
}

const Settings = ({ settings, setSettings }: ISettings) => {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <p className="font-bold">Model</p>
                <Select
                    value={settings.model}
                    onValueChange={(value) =>
                        setSettings({ ...settings, model: value })
                    }
                >
                    <SelectTrigger className="w-[220px] mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Random Forest">
                            Random Forest
                        </SelectItem>
                        <SelectItem value="Decision Tree">
                            Decision Tree
                        </SelectItem>
                        <SelectItem value="Support Vector Machine">
                            Support Vector Machine
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <p className="font-bold">Hyperparameter Tuning</p>
                <Select
                    value={settings.tuning}
                    onValueChange={(value) =>
                        setSettings({ ...settings, tuning: value })
                    }
                >
                    <SelectTrigger className="w-[220px] mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Grid Search">Grid Search</SelectItem>
                        <SelectItem value="Randomized Search">
                            Randomized Search
                        </SelectItem>
                        <SelectItem value="Untuned">Untuned</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default Settings;
