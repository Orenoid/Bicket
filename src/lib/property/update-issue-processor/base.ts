import { property } from "@prisma/client";
import {
  PropertyUpdateProcessor,
  ValidationResult,
  DbOperationResult,
} from "../types";

export abstract class BasePropertyUpdateProcessor
  implements PropertyUpdateProcessor
{
  abstract validateFormat(
    property: property,
    operationType: string,
    payload: Record<string, unknown>,
  ): ValidationResult;
  abstract validateBusinessRules(
    property: property,
    operationType: string,
    payload: Record<string, unknown>,
  ): ValidationResult;
  abstract transformToDbOperations(
    property: property,
    operationType: string,
    payload: Record<string, unknown>,
    issueId: string,
  ): DbOperationResult;
}
