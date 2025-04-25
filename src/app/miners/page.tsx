"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { MdViewList, MdGridView } from "react-icons/md";

// 展示 mock 数据用的页面，因为是临时使用，用 AI 快速生成的

const FormattedDate = ({ date }: { date: Date }) => {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // 在客户端使用 toLocaleString
    setFormattedDate(date.toLocaleString());
  }, [date]);

  return <>{formattedDate}</>;
};

export default function MinersPage() {
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [miners, setMiners] = useState<Miner[]>([]);

  // 在客户端初始化模拟数据
  useEffect(() => {
    setMiners(generateMockMiners());
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Miners Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("table")}
            className={clsx("p-2 rounded-md cursor-pointer", {
              "bg-blue-100 text-blue-600": viewMode === "table",
              "bg-gray-100 text-gray-600 hover:bg-gray-200":
                viewMode !== "table",
            })}
            title="表格视图"
          >
            <MdViewList size={20} />
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={clsx("p-2 rounded-md cursor-pointer", {
              "bg-blue-100 text-blue-600": viewMode === "card",
              "bg-gray-100 text-gray-600 hover:bg-gray-200":
                viewMode !== "card",
            })}
            title="卡片视图"
          >
            <MdGridView size={20} />
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="bg-white rounded-lg shadow p-4 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP 地址
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  型号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  制造商
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最后在线
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {miners.map((miner) => (
                <tr key={miner.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {miner.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {miner.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {miner.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {miner.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        {
                          "bg-green-100 text-green-800":
                            miner.status === "在线",
                          "bg-red-100 text-red-800": miner.status === "离线",
                          "bg-yellow-100 text-yellow-800":
                            miner.status !== "在线" && miner.status !== "离线",
                        },
                      )}
                    >
                      {miner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <FormattedDate date={miner.lastSeen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {miners.map((miner) => (
            <div
              key={miner.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg font-medium">{miner.id}</span>
                <span
                  className={clsx(
                    "px-2 text-xs leading-5 font-semibold rounded-full",
                    {
                      "bg-green-100 text-green-800": miner.status === "在线",
                      "bg-red-100 text-red-800": miner.status === "离线",
                      "bg-yellow-100 text-yellow-800":
                        miner.status !== "在线" && miner.status !== "离线",
                    },
                  )}
                >
                  {miner.status}
                </span>
              </div>

              <div className="text-sm text-gray-500 mb-2">
                {miner.ipAddress}
              </div>

              <div className="mb-2">
                <div className="text-sm">
                  <span className="font-medium">型号:</span> {miner.model}
                </div>
                <div className="text-sm">
                  <span className="font-medium">制造商:</span>{" "}
                  {miner.manufacturer}
                </div>
              </div>

              <div className="flex space-x-2 mt-1">
                {miner.isMining ? (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                    挖矿中
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">
                    未挖矿
                  </span>
                )}
                {miner.temps && miner.temps.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">
                    {miner.temps[0]}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-400 mt-2">
                最后在线: <FormattedDate date={miner.lastSeen} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 生成模拟矿机数据的函数
function generateMockMiners(): Miner[] {
  const now = Date.now();

  return [
    {
      id: "M001",
      farmId: "F001",
      workspaceId: "WS001",
      ipAddress: "192.168.1.101",
      macAddress: "00:1A:2B:3C:4D:5E",
      hostname: "miner-01",
      model: "Antminer S19 Pro",
      manufacturer: "Bitmain",
      serialNumber: "BM1234567",
      status: "在线",
      isMining: true,
      lastSeen: new Date(now - 5 * 60 * 1000), // 5分钟前
      pools: ["antpool.com:3333", "f2pool.com:3333"],
      fans: ["3600 RPM", "3550 RPM"],
      temps: ["62°C", "65°C"],
      firmware: {
        version: "2.0.1",
        type: "官方",
      },
      location: "机架A-01-03",
      notes: "性能稳定",
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date("2023-06-20"),
    },
    {
      id: "M002",
      farmId: "F001",
      workspaceId: "WS001",
      ipAddress: "192.168.1.102",
      macAddress: "00:1A:2B:3C:4D:5F",
      hostname: "miner-02",
      model: "Whatsminer M30S++",
      manufacturer: "MicroBT",
      serialNumber: "MB9876543",
      status: "过热警告",
      isMining: true,
      lastSeen: new Date(now - 15 * 60 * 1000), // 15分钟前
      pools: ["btc.com:3333"],
      fans: ["4200 RPM", "4100 RPM"],
      temps: ["75°C", "78°C"],
      firmware: {
        version: "1.9.3",
        type: "官方",
      },
      location: "机架A-02-01",
      notes: "需要检查散热",
      createdAt: new Date("2023-02-10"),
      updatedAt: new Date("2023-06-18"),
    },
    {
      id: "M003",
      farmId: "F002",
      workspaceId: "WS001",
      ipAddress: "192.168.2.101",
      macAddress: "00:1A:2B:3C:4D:60",
      hostname: "miner-03",
      model: "Antminer S19j Pro",
      manufacturer: "Bitmain",
      serialNumber: "BM7654321",
      status: "离线",
      isMining: false,
      lastSeen: new Date(now - 24 * 60 * 60 * 1000), // 1天前
      pools: ["antpool.com:3333"],
      fans: ["0 RPM", "0 RPM"],
      temps: ["25°C", "25°C"],
      firmware: {
        version: "2.1.0",
        type: "官方",
      },
      location: "机架B-01-05",
      notes: "需要重启",
      createdAt: new Date("2023-03-05"),
      updatedAt: new Date("2023-06-15"),
    },
    {
      id: "M004",
      farmId: "F002",
      workspaceId: "WS001",
      ipAddress: "192.168.2.102",
      macAddress: "00:1A:2B:3C:4D:61",
      hostname: "miner-04",
      model: "Avalon 1246",
      manufacturer: "Canaan",
      serialNumber: "CA5544332",
      status: "在线",
      isMining: true,
      lastSeen: new Date(now - 2 * 60 * 1000), // 2分钟前
      pools: ["btc.com:3333", "f2pool.com:3333"],
      fans: ["3300 RPM", "3350 RPM"],
      temps: ["58°C", "59°C"],
      firmware: {
        version: "1.8.5",
        type: "定制",
      },
      location: "机架B-02-02",
      notes: "",
      createdAt: new Date("2023-03-20"),
      updatedAt: new Date("2023-06-22"),
    },
    {
      id: "M005",
      farmId: "F003",
      workspaceId: "WS002",
      ipAddress: "192.168.3.101",
      macAddress: "00:1A:2B:3C:4D:62",
      hostname: "miner-05",
      model: "Antminer S19 XP",
      manufacturer: "Bitmain",
      serialNumber: "BM1122334",
      status: "在线",
      isMining: true,
      lastSeen: new Date(now - 10 * 60 * 1000), // 10分钟前
      pools: ["antpool.com:3333"],
      fans: ["3400 RPM", "3450 RPM"],
      temps: ["61°C", "63°C"],
      firmware: {
        version: "2.2.1",
        type: "官方",
      },
      location: "机架C-01-01",
      notes: "新安装",
      createdAt: new Date("2023-05-15"),
      updatedAt: new Date("2023-06-23"),
    },
    {
      id: "M006",
      farmId: "F003",
      workspaceId: "WS002",
      ipAddress: "192.168.3.102",
      macAddress: "00:1A:2B:3C:4D:63",
      hostname: "miner-06",
      model: "Whatsminer M30S",
      manufacturer: "MicroBT",
      serialNumber: "MB1234567",
      status: "在线",
      isMining: true,
      lastSeen: new Date(now - 8 * 60 * 1000), // 8分钟前
      pools: ["f2pool.com:3333"],
      fans: ["3700 RPM", "3750 RPM"],
      temps: ["64°C", "66°C"],
      firmware: {
        version: "1.9.2",
        type: "官方",
      },
      location: "机架C-01-02",
      notes: "",
      createdAt: new Date("2023-05-16"),
      updatedAt: new Date("2023-06-22"),
    },
  ];
}

export interface Miner {
  id: string; // 矿机 ID
  farmId: string; // 所属场地 ID
  workspaceId: string; // 所属工作空间 ID

  // 基本信息
  ipAddress: string; // IP 地址
  macAddress?: string; // MAC 地址
  hostname?: string; // 主机名
  model: string; // 矿机型号
  manufacturer: string; // 制造商
  serialNumber?: string; // 序列号

  // 状态信息
  status: string; // 矿机状态
  isMining: boolean; // 是否挖矿中
  lastSeen: Date; // 最后在线时间

  // cgminer API 相关信息
  pools: string[]; // 矿池信息
  fans: string[]; // 风扇信息
  temps: string[]; // 温度信息

  // 固件信息
  firmware: {
    version: string; // 固件版本
    type: string; // 固件类型
  };

  // 其他信息
  location?: string; // 机架位置
  notes?: string; // 备注
  createdAt: Date; // 添加时间
  updatedAt: Date; // 更新时间
}
