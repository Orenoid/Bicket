'use client'

import { PropertyTableCellComponent } from "../type";
import { useEffect, useState } from "react";

export const PluginPropertyCell: PropertyTableCellComponent = ({ propertyID, ...rest }) => {
    console.log('propertyID', propertyID);
    const [Component, setComponent] = useState<PropertyTableCellComponent | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPluginComponent = async () => {
            try {
                // 动态导入插件组件
                const importedModule = await import(`@plugins/${propertyID}/PropertyTableCellComponent`);

                // 获取导出的 PluginPropertyCell 组件
                const PluginComponent = importedModule.PluginPropertyCell as PropertyTableCellComponent;
                if (!PluginComponent) {
                    throw new Error(`插件 ${propertyID} 未导出 PluginPropertyCell 组件`);
                }
                
                setComponent(() => PluginComponent);
                setError(null);
            } catch (err) {
                console.error(`加载插件组件失败: ${err instanceof Error ? err.message : String(err)}`);
                setError(`无法加载插件组件`);
            }
        };

        loadPluginComponent();
    }, [propertyID]);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!Component) {
        return <div className="text-gray-400">加载中...</div>;
    }

    // 传递所有属性给插件组件
    return <Component propertyID={propertyID} {...rest} />;
};
