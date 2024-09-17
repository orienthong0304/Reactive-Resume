import { t, Trans } from "@lingui/macro";
import { cn } from "@reactive-resume/utils";

type Props = {
  className?: string;
};

export const Copyright = ({ className }: Props) => (
  <div
    className={cn(
      "prose prose-sm prose-zinc flex max-w-none flex-col gap-y-1 text-xs opacity-40 dark:prose-invert",
      className,
    )}
  >
    <span>
      <Trans>
        A passion project by <a href="https://www.orienthong.cn/">Orient Hong</a>
      </Trans>
    </span>

    <span className="mt-4">
      {t`Reactive Resume`} {"v" + appVersion}
    </span>
  </div>
);
