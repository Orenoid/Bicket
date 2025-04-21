// 目前自行封装一个简单的 Registry 实现已经可以满足项目需求，暂不引入依赖注入等外部库

/**
 * 通用注册表类
 * 
 * 用于管理各种类型与对应实现的映射关系
 * 
 * @template T 注册表中存储的实现类型
 */
export class Registry<T> {
    // 存储所有注册表实例的静态集合，按注册表名称索引
    private static readonly instances: Map<string, Registry<unknown>> = new Map();
    private readonly registry: Map<string, T> = new Map();

    private constructor() { }

    /**
     * 获取注册表实例
     * 
     * @param registryName 注册表名称
     * @returns 对应的注册表实例
     */
    public static getRegistry<T>(registryName: string): Registry<T> {
        const registry = Registry.instances.get(registryName) as Registry<T> | undefined;
        if (!registry) {
            Registry.instances.set(registryName, new Registry<T>());
            return Registry.instances.get(registryName) as Registry<T>;
        }
        return registry;
    }

    /**
     * 注册类型对应的实现
     * 
     * @param type 类型标识
     * @param implementation 对应的实现
     */
    public register(type: string, implementation: T): void {
        this.registry.set(type, implementation);
    }

    /**
     * 批量注册多个类型对应的实现
     * 
     * @param implementations 类型与实现的映射对象
     */
    public registerAll(implementations: Record<string, T>): void {
        Object.entries(implementations).forEach(([type, implementation]) => {
            this.register(type, implementation);
        });
    }

    /**
     * 获取类型对应的实现
     * 
     * @param type 类型标识
     * @param fallback 可选的回退实现，当找不到对应实现且没有默认实现时使用
     * @returns 对应的实现
     */
    public get(type: string, fallback: T): T {
        const impl = this.registry.get(type) as T | undefined;
        return impl !== undefined ? impl : fallback;
    }

}
