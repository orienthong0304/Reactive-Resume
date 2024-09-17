import { SmartTableDto } from "@reactive-resume/dto";
import React from "react";

type TableDataAreaProps = {
  smartTable: SmartTableDto;
};

export const TableDataArea: React.FC<TableDataAreaProps> = ({ smartTable }) => {
  const tableData = smartTable.data ?? [];

  if (tableData.length === 0) {
    return <div className="p-4 text-center text-gray-500">没有可用的表格数据</div>;
  }

  // 确保 tableData[0] 是一个对象
  const firstRow = tableData[0] as Record<string, unknown>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Object.keys(firstRow).map((header, index) => (
              <th
                key={index}
                className="border-r px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 last:border-r-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {Object.values(row as Record<string, unknown>).map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="whitespace-nowrap border-r px-6 py-4 text-sm text-gray-500 last:border-r-0"
                >
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
