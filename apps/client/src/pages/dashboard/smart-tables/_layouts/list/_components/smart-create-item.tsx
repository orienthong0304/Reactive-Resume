import { t } from "@lingui/macro";
import { Plus } from "@phosphor-icons/react";
import { KeyboardShortcut } from "@reactive-resume/ui";

import { useDialog } from "@/client/stores/dialog";

import { BaseListItem } from "./smart-base-item";

export const CreateSmartTableListItem = () => {
  const { open } = useDialog("smart-table");

  const handleClick = () => {
    open("create");
  };

  return (
    <BaseListItem
      start={<Plus size={18} />}
      title={
        <>
          <span>{t`Create a new Smart Table`}</span>
          <KeyboardShortcut className="ml-2">^N</KeyboardShortcut>
        </>
      }
      description={t`Start building from scratch`}
      onClick={handleClick}
    />
  );
};