import { PropertyType } from '@/lib/property/constants';
import { registerAppliedFilterComponents, IDAppliedFilter, TextAppliedFilter, SelectAppliedFilter, MultiSelectAppliedFilter, MinersAppliedFilter, UserAppliedFilter, RichTextAppliedFilter, registerFilterConstructorComponents, IDFilterConstructorPanel, UserFilterConstructorPanel, MinersFilterConstructorPanel, MultiSelectFilterConstructorPanel, SelectFilterConstructorPanel, TextFilterConstructorPanel } from './filter';

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

    registerFilterConstructorComponents(
        {
            [PropertyType.ID]: IDFilterConstructorPanel,
            [PropertyType.TEXT]: TextFilterConstructorPanel,
            [PropertyType.SELECT]: SelectFilterConstructorPanel,
            [PropertyType.MULTI_SELECT]: MultiSelectFilterConstructorPanel,
            [PropertyType.MINERS]: MinersFilterConstructorPanel,
            [PropertyType.USER]: UserFilterConstructorPanel,
        }
    )
}