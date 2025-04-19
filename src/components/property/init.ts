import { PropertyType } from '@/lib/property/constants';
import { registerAppliedFilterComponents, IDAppliedFilter, TextAppliedFilter, SelectAppliedFilter, MultiSelectAppliedFilter, MinersAppliedFilter, UserAppliedFilter, RichTextAppliedFilter } from './filter';

export default function init() {
    registerAppliedFilterComponents(
        {
            [PropertyType.ID]: IDAppliedFilter,
            [PropertyType.TEXT]: TextAppliedFilter,
            [PropertyType.SELECT]: SelectAppliedFilter,
            [PropertyType.MULTI_SELECT]: MultiSelectAppliedFilter,
            [PropertyType.MINERS]: MinersAppliedFilter,
            [PropertyType.USER]: UserAppliedFilter,
            [PropertyType.RICH_TEXT]: RichTextAppliedFilter,
        }
    )
}