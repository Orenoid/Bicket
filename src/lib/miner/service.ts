// 从页面组件中提取矿机数据类型
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
  pools?: string[]; // 矿池信息
  fans?: string[]; // 风扇信息
  temps?: string[]; // 温度信息

  // 固件信息
  firmware?: {
    version: string; // 固件版本
    type: string; // 固件类型
  };

  // 其他信息
  location?: string; // 机架位置
  notes?: string; // 备注
  createdAt?: Date; // 添加时间
  updatedAt?: Date; // 更新时间
}

// 简化的矿机信息，用于列表显示等场景
export interface SimpleMinerInfo {
  id: string; // 矿机 ID
  model: string; // 矿机型号
  status: string; // 矿机状态
  ipAddress: string; // IP 地址
}

/**
 * 生成模拟矿机数据
 *
 * @returns 矿机数据数组
 */
export function generateMockMiners(): Miner[] {
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

/**
 * 获取所有矿机列表
 *
 * @returns 矿机数据数组
 */
export function getAllMiners(): Miner[] {
  return generateMockMiners();
}

/**
 * 获取简化的矿机信息列表
 *
 * @returns 简化矿机信息数组
 */
export function getSimpleMinersList(): SimpleMinerInfo[] {
  return generateMockMiners().map((miner) => ({
    id: miner.id,
    model: miner.model,
    status: miner.status,
    ipAddress: miner.ipAddress,
  }));
}

/**
 * 根据ID获取矿机信息
 *
 * @param id 矿机ID
 * @returns 矿机信息或undefined（未找到）
 */
export function getMinerById(id: string): Miner | undefined {
  return generateMockMiners().find((miner) => miner.id === id);
}

/**
 * 获取矿机状态样式
 *
 * @param status 矿机状态
 * @returns 对应的样式类名
 */
export function getMinerStatusStyle(status: string): string {
  switch (status) {
    case "在线":
      return "bg-green-100 text-green-800";
    case "离线":
      return "bg-red-100 text-red-800";
    case "过热警告":
    case "过载警告":
    case "功率警告":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
