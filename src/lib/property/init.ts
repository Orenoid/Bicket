import { PropertyType } from './constants';
import { registerPropertyUpdateProcessors, registerIssueCreationPropertyProcessors } from './registry-utils';
import {
    MinersPropertyUpdateProcessor,
    RichTextPropertyUpdateProcessor,
    SelectPropertyUpdateProcessor,
    TextPropertyUpdateProcessor,
    UserPropertyUpdateProcessor
} from './update-issue-processor';
import {
    TextPropertyProcessor,
    SelectPropertyProcessor,
    RichTextPropertyProcessor,
    MultiSelectPropertyProcessor,
    MinersPropertyProcessor,
    UserPropertyProcessor
} from './create-issue-processor';

export default function init() {

    registerPropertyUpdateProcessors(
        {
            [PropertyType.TEXT]: new TextPropertyUpdateProcessor(),
            [PropertyType.SELECT]: new SelectPropertyUpdateProcessor(),
            [PropertyType.RICH_TEXT]: new RichTextPropertyUpdateProcessor(),
            [PropertyType.USER]: new UserPropertyUpdateProcessor(),
            [PropertyType.MINERS]: new MinersPropertyUpdateProcessor(),
        }
    );

    registerIssueCreationPropertyProcessors(
        {
            [PropertyType.TEXT]: new TextPropertyProcessor(),
            [PropertyType.SELECT]: new SelectPropertyProcessor(),
            [PropertyType.RICH_TEXT]: new RichTextPropertyProcessor(),
            [PropertyType.MULTI_SELECT]: new MultiSelectPropertyProcessor(),
            [PropertyType.MINERS]: new MinersPropertyProcessor(),
            [PropertyType.USER]: new UserPropertyProcessor(),
        }
    );
}
