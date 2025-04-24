import { PropertyType } from "@/lib/property/constants";
import {
  IDAppliedFilter,
  IDFilterConstructorPanel,
  MinersAppliedFilter,
  MinersFilterConstructorPanel,
  MultiSelectAppliedFilter,
  MultiSelectFilterConstructorPanel,
  RichTextAppliedFilter,
  SelectAppliedFilter,
  SelectFilterConstructorPanel,
  TextAppliedFilter,
  TextFilterConstructorPanel,
  UserAppliedFilter,
  UserFilterConstructorPanel,
} from "./filter";
import {
  DatetimePropertyCell,
  MinersPropertyCell,
  MultiSelectPropertyCell,
  SelectPropertyCell,
  TextPropertyCell,
  UserPropertyCell,
} from "./issue-table-cell";
import {
  registerAppliedFilterComponents,
  registerFilterConstructorComponents,
  registerPropertyTableCellComponents,
} from "./registry-utils";

export default function init() {
  registerAppliedFilterComponents({
    [PropertyType.ID]: IDAppliedFilter,
    [PropertyType.TEXT]: TextAppliedFilter,
    [PropertyType.SELECT]: SelectAppliedFilter,
    [PropertyType.MULTI_SELECT]: MultiSelectAppliedFilter,
    [PropertyType.MINERS]: MinersAppliedFilter,
    [PropertyType.USER]: UserAppliedFilter,
    [PropertyType.RICH_TEXT]: RichTextAppliedFilter,
  });

  registerFilterConstructorComponents({
    [PropertyType.ID]: IDFilterConstructorPanel,
    [PropertyType.TEXT]: TextFilterConstructorPanel,
    [PropertyType.SELECT]: SelectFilterConstructorPanel,
    [PropertyType.MULTI_SELECT]: MultiSelectFilterConstructorPanel,
    [PropertyType.MINERS]: MinersFilterConstructorPanel,
    [PropertyType.USER]: UserFilterConstructorPanel,
  });

  registerPropertyTableCellComponents({
    [PropertyType.ID]: TextPropertyCell,
    [PropertyType.TEXT]: TextPropertyCell,
    [PropertyType.SELECT]: SelectPropertyCell,
    [PropertyType.MULTI_SELECT]: MultiSelectPropertyCell,
    [PropertyType.MINERS]: MinersPropertyCell,
    [PropertyType.DATETIME]: DatetimePropertyCell,
    [PropertyType.USER]: UserPropertyCell,
  });
}
