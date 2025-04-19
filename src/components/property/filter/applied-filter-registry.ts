import { AppliedFilterComponent } from '../type';
import { DefaultAppliedFilter } from './applied-filter/DefaultAppliedFilter';

/**
 * AppliedFilterComponent 注册管理
 */
export class AppliedFilterRegistry {
  private static instance: AppliedFilterRegistry;
  private readonly registry: Map<string, AppliedFilterComponent> = new Map();
  private defaultComponent: AppliedFilterComponent | null = null;
  
  /**
   * 私有构造函数，防止直接实例化
   */
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): AppliedFilterRegistry {
    if (!AppliedFilterRegistry.instance) {
      AppliedFilterRegistry.instance = new AppliedFilterRegistry();
    }
    return AppliedFilterRegistry.instance;
  }

  /**
   * 注册属性类型对应的已应用筛选组件
   * 
   * @param propertyType 属性类型
   * @param component 对应的组件
   */
  public register(propertyType: string, component: AppliedFilterComponent): void {
    this.registry.set(propertyType, component);
  }

  /**
   * 批量注册多个属性类型对应的已应用筛选组件
   * 
   * @param components 属性类型与组件的映射对象
   */
  public registerAll(components: Record<string, AppliedFilterComponent>): void {
    Object.entries(components).forEach(([type, component]) => {
      this.register(type, component);
    });
  }

  /**
   * 设置默认组件
   * 
   * @param component 默认组件
   */
  public setDefaultComponent(component: AppliedFilterComponent): void {
    this.defaultComponent = component;
  }
  
  /**
   * 获取属性类型对应的已应用筛选组件
   * 
   * @param propertyType 属性类型
   * @returns 对应的组件，如果找不到则返回默认组件
   */
  public getComponent(propertyType: string): AppliedFilterComponent | null {
    return this.registry.get(propertyType) || this.defaultComponent;
  }
}

/**
 * 注册已应用筛选组件的辅助函数
 * 
 * @param propertyType 属性类型
 * @param component 对应的组件
 */
export function registerAppliedFilterComponent(
  propertyType: string, 
  component: AppliedFilterComponent
): void {
  AppliedFilterRegistry.getInstance().register(propertyType, component);
}

/**
 * 批量注册已应用筛选组件的辅助函数
 * 
 * @param components 属性类型与组件的映射对象
 */
export function registerAppliedFilterComponents(
  components: Record<string, AppliedFilterComponent>
): void {
  AppliedFilterRegistry.getInstance().registerAll(components);
}

/**
 * 获取属性类型对应的已应用筛选组件
 *
 * 使用工厂方法获取组件
 * 如果没有找到对应的组件，将使用默认组件
 *
 * @param propertyType 属性类型
 * @returns 对应的组件
 */
export function getAppliedFilterComponent(propertyType: string): AppliedFilterComponent {
    return AppliedFilterRegistry.getInstance().getComponent(propertyType) || DefaultAppliedFilter;
}
