import { FilterCondition } from '@/lib/property/types';


// TODO tech dept AI 生成的一些代码不太合理，需要优化
// 1. 有些查询应该能并行
// 2. 有/无筛选条件的查询逻辑应该能合并
// 3. URL 参数解析应该有现成的方案可以用，待替换
// 反序列化筛选条件

export function deserializeFilters(filtersStr: string): FilterCondition[] {
    if (!filtersStr) return [];

    try {
        return filtersStr.split(';').map(filterStr => {
            const [propertyId, propertyType, operator, valueStr] = filterStr.split(':');
            const decodedValueStr = decodeURIComponent(valueStr);

            // 根据操作符和值类型进行适当的转换
            let value: unknown;
            if (decodedValueStr === 'null') {
                value = null;
            } else if (operator === 'in') {
                // in 操作符值通常是数组
                const valueArray = decodedValueStr.split(',');

                // 如果是ID类型，尝试将值转换为数字
                if (propertyType === 'id') {
                    value = valueArray.map(v => isNaN(Number(v)) ? v : Number(v));
                } else {
                    value = valueArray;
                }
            } else if (propertyType === 'id' && !isNaN(Number(decodedValueStr))) {
                // ID类型且是数字，转换为数字
                value = Number(decodedValueStr);
            } else {
                // 其他情况保持字符串
                value = decodedValueStr;
            }

            return {
                propertyId,
                propertyType,
                operator,
                value
            } as FilterCondition;
        });
    } catch (error) {
        console.error('筛选条件解析错误:', error);
        return [];
    }
}
