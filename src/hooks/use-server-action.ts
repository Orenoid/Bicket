import { useEffect, useRef, useState, useTransition } from "react";

// a workaround from community to implement pending state of server action
// https://github.com/vercel/next.js/discussions/51371

export const useServerAction = <P, R>(
    action: ((_: P) => Promise<R>),
    onFinished?: ((_: R | undefined) => void)
): [(_: P) => Promise<R | undefined>, boolean] => {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<R>();
    const [finished, setFinished] = useState(false);
    const resolver = useRef<((value?: (R | PromiseLike<R>)) => void)>(null);


    useEffect(() => {
        if (!finished) return;

        if (onFinished) onFinished(result);
        resolver.current?.(result);

    }, [result, finished, onFinished]);

    const runAction = async (args: P): Promise<R | undefined> => {
        startTransition(() => {
            action(args).then(data => {
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