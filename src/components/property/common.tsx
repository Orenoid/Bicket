import { PropertyType } from "@/lib/property/constants";
import { BiSelectMultiple } from "react-icons/bi";
import { HiOutlineServer } from "react-icons/hi";
import { MdNumbers, MdTextFields, MdSubject, MdDateRange, MdCheckBox, MdPerson, MdLink } from "react-icons/md";
import { TbCheckbox } from "react-icons/tb";


export const PROPERTY_TYPE_ICONS: Record<string, React.ReactNode> = {
    [PropertyType.ID]: <MdNumbers size={16} className="mr-1 text-gray-500" />,
    [PropertyType.TEXT]: <MdTextFields size={16} className="mr-1 text-gray-500" />,
    [PropertyType.RICH_TEXT]: <MdSubject size={16} className="mr-1 text-gray-500" />,
    [PropertyType.NUMBER]: <MdNumbers size={16} className="mr-1 text-gray-500" />,
    [PropertyType.SELECT]: <TbCheckbox size={16} className="mr-1 text-gray-500" />,
    [PropertyType.MULTI_SELECT]: <BiSelectMultiple size={16} className="mr-1 text-gray-500" />,
    [PropertyType.DATETIME]: <MdDateRange size={16} className="mr-1 text-gray-500" />,
    [PropertyType.BOOLEAN]: <MdCheckBox size={16} className="mr-1 text-gray-500" />,
    [PropertyType.USER]: <MdPerson size={16} className="mr-1 text-gray-500" />,
    [PropertyType.RELATIONSHIP]: <MdLink size={16} className="mr-1 text-gray-500" />,
    [PropertyType.MINERS]: <HiOutlineServer size={16} className="mr-1 text-gray-500" />
};

export const getPropertyTypeIcon = (propertyType: string): React.ReactNode => {
    return PROPERTY_TYPE_ICONS[propertyType] || PROPERTY_TYPE_ICONS[PropertyType.TEXT]; // 默认使用文本类型图标
};

