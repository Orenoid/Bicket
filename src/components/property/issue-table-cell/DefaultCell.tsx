'use client';

import { PropertyTableCellComponent } from "../type";

export const DefaultPropertyCell: PropertyTableCellComponent = ({
    value
}) => {
    return <span>{String(value || "")}</span>;
}