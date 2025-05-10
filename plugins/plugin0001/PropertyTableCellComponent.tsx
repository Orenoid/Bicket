import { PropertyTableCellComponent } from "../../src/components/property/type";

export const PluginPropertyCell: PropertyTableCellComponent = ({ propertyID, value }) => {
    return (
        <div className="text-blue-500 font-medium">
            插件 ID: {propertyID}, 值: {String(value ?? '-')}
        </div>
    );
};
