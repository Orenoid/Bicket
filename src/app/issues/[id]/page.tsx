import DetailMoreMenu from "@/components/issue/DetailMenu";
import { UserField } from "@/components/property/issue-detail/UserField";
import { DescriptionField } from "@/components/property/issue-detail/DescriptionField";
import { DatetimeField } from "@/components/property/issue-detail/DatetimeField";
import { MinersField } from "@/components/property/issue-detail/MinersField";
import { SelectField } from "@/components/property/issue-detail/SelectField";
import { TitleField } from "@/components/property/issue-detail/TitleField";
import {
  getIssueById as getIssueByID,
  getPropertyDefinitions,
} from "@/lib/issue/services/query";
import { SystemPropertyId } from "@/lib/property/constants";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyDefinitions = await getPropertyDefinitions();
  const issue = await getIssueByID(id);

  const mustFindProperty = (propertyID: string) => {
    const property = propertyDefinitions.find(
      (property) => property.id === propertyID,
    );
    if (!property) {
      throw new Error(`未找到ID为 ${propertyID} 的属性`);
    }
    return property;
  };
  const getPropertyValue = (propertyID: string) => {
    const propertyValue = issue.property_values.find(
      (propertyValue) => propertyValue.property_id === propertyID,
    );
    if (!propertyValue) {
      return null;
    }
    return propertyValue.value;
  };

  return (
    <div className="flex flex-auto">
      {/* 左侧面板内容 */}
      <div className="flex flex-col h-full w-3/4 border-r border-gray-200 pt-4 px-8">
        <div className="flex flex-col flex-grow">
          <TitleField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.TITLE)}
            value={getPropertyValue(SystemPropertyId.TITLE)}
          />
          <DescriptionField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.DESCRIPTION)}
            value={getPropertyValue(SystemPropertyId.DESCRIPTION)}
          />
        </div>
      </div>
      {/* 右侧：属性列表 */}
      <div className="flex flex-col w-1/4 h-full pl-5 pt-5 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pr-4">
          <span className="text-sm text-gray-400 whitespace-nowrap font-sans">
            Properties
          </span>
          <DetailMoreMenu issueID={id} />
        </div>
        <div className="flex flex-col gap-3 pl-3 mb-8">
          {/* 属性布局目前是固定规划的，这里只是碰巧几个属性类型都一样，所以不能采用 map 的形式 */}
          <SelectField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.STATUS)}
            value={getPropertyValue(SystemPropertyId.STATUS)}
          />
          <SelectField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.PRIORITY)}
            value={getPropertyValue(SystemPropertyId.PRIORITY)}
          />
          <SelectField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.CATEGORY)}
            value={getPropertyValue(SystemPropertyId.CATEGORY)}
          />
          <SelectField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.DIAGNOSIS)}
            value={getPropertyValue(SystemPropertyId.DIAGNOSIS)}
          />
          <UserField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.ASIGNEE)}
            value={getPropertyValue(SystemPropertyId.ASIGNEE)}
          />
          <UserField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.REPORTER)}
            value={getPropertyValue(SystemPropertyId.REPORTER)}
          />
        </div>

        {/* 矿机相关属性区域 */}
        <span className="text-sm text-gray-400 whitespace-nowrap font-sans mb-2">
          Miners Related
        </span>
        <div className="flex flex-col gap-3 pl-3 mb-8">
          <MinersField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.MINERS)}
            value={getPropertyValue(SystemPropertyId.MINERS)}
          />
        </div>

        {/* Basic Info 区域 - 移到最底部 */}
        <span className="text-sm text-gray-400 whitespace-nowrap font-sans mb-2">
          Basic Info
        </span>
        <div className="flex flex-col gap-3 pl-3 mb-8">
          <DatetimeField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.CREATED_AT)}
            value={getPropertyValue(SystemPropertyId.CREATED_AT)}
          />
          <DatetimeField
            issueID={id}
            propertyDefinition={mustFindProperty(SystemPropertyId.UPDATED_AT)}
            value={getPropertyValue(SystemPropertyId.UPDATED_AT)}
          />
        </div>
      </div>
    </div>
  );
}
