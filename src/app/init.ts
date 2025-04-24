import initPropertyComponentsModule from "@/components/property/init";
import initPropertyLibModule from "@/lib/property/init";

export default function inittializeApp() {
  // 初始化属性模块，主要是触发一些抽象类实现的注册逻辑
  initPropertyComponentsModule();
  initPropertyLibModule();
}
