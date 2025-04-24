import { useEffect, useRef, useState, useTransition } from "react";

// 让 server action 支持 pending 状态的一个 workaround
// https://github.com/vercel/next.js/discussions/51371

export const useServerAction = <P, R>(
  action: (_: P) => Promise<R>,
  onFinished?: (_: R | undefined) => void,
): [(_: P) => Promise<R | undefined>, boolean] => {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<R>();
  const [finished, setFinished] = useState(false);
  const resolver = useRef<(value?: R | PromiseLike<R>) => void>(null);

  useEffect(() => {
    if (!finished) return;

    if (onFinished) onFinished(result);
    resolver.current?.(result);
  }, [result, finished, onFinished]);

  const runAction = async (args: P): Promise<R | undefined> => {
    startTransition(() => {
      action(args).then((data) => {
        setResult(data);
        setFinished(true);
      });
    });

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  return [runAction, isPending];
};
