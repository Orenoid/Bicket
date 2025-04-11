import { redirect } from 'next/navigation';

export default function Home() {
  // 直接重定向到 /issue 路径
  redirect('/issue');

  return null;
}
