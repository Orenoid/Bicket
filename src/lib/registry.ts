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

// /**
//  * 注册组件的辅助函数
//  * 
//  * @param registryName 注册表名称
//  * @param type 类型标识
//  * @param implementation 对应的实现
//  * @deprecated 建议直接使用特定Registry子类的getInstance().register方法
//  */
// export function registerComponent<T>(
//     registryName: string,
//     type: string,
//     implementation: T
// ): void {
//     const registry = Registry.getRegistry<T>(registryName);
//     registry.register(type, implementation);
// }

// /**
//  * 批量注册组件的辅助函数
//  * 
//  * @param registryName 注册表名称
//  * @param implementations 类型与实现的映射对象
//  * @deprecated 建议直接使用特定Registry子类的getInstance().registerAll方法
//  */
// export function registerComponents<T>(
//     registryName: string,
//     implementations: Record<string, T>
// ): void {
//     const registry = Registry.getRegistry<T>(registryName);
//     if (registry) {
//         registry.registerAll(implementations);
//     } else {
//         console.warn(`No registry found with name: ${registryName}`);
//     }
// }

// /**
//  * 获取组件的辅助函数
//  *
//  * @param registryName 注册表名称
//  * @param type 类型标识
//  * @param fallback 可选的回退组件
//  * @returns 对应的组件
//  * @deprecated 建议直接使用特定Registry子类的getInstance().get方法
//  */
// export function getComponent<T>(
//     registryName: string,
//     type: string,
//     fallback?: T
// ): T | null {
//     const registry = Registry.getRegistry<T>(registryName);
//     if (registry) {
//         return registry.get(type, fallback);
//     } else {
//         console.warn(`No registry found with name: ${registryName}`);
//         return fallback || null;
//     }
// }
