import { t } from "@lingui/macro";
import { CopySimple, FolderOpen, PencilSimple, TrashSimple } from "@phosphor-icons/react";
import { SmartTableDto } from "@reactive-resume/dto";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { useDialog } from "@/client/stores/dialog";

import { BaseCard } from "./smart-base-card";

type Props = {
  smartTable: SmartTableDto;
};

export const SmartTableCard = ({ smartTable }: Props) => {
  const navigate = useNavigate();
  const { open } = useDialog<SmartTableDto>("smart-table");

  const lastUpdated = dayjs().to(smartTable.updatedAt);

  const onOpen = () => {
    navigate(`/dashboard/smart-tables/${smartTable.id}`);
  };

  const onUpdate = () => {
    open("update", { id: "smart-table", item: smartTable });
  };

  const onDuplicate = () => {
    open("duplicate", { id: "smart-table", item: smartTable });
  };

  const onDelete = () => {
    open("delete", { id: "smart-table", item: smartTable });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <BaseCard className="space-y-0" onClick={onOpen}>
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end space-y-0.5 p-4 pt-12",
              "bg-gradient-to-t from-background/80 to-transparent",
            )}
          >
            <h4 className="line-clamp-2 font-medium">{smartTable.title}</h4>
            <p className="line-clamp-1 text-xs opacity-75">{t`Last updated ${lastUpdated}`}</p>
          </div>
        </BaseCard>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={onOpen}>
          <FolderOpen size={14} className="mr-2" />
          {t`Open`}
        </ContextMenuItem>
        <ContextMenuItem onClick={onUpdate}>
          <PencilSimple size={14} className="mr-2" />
          {t`Rename`}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          <CopySimple size={14} className="mr-2" />
          {t`Duplicate`}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-error" onClick={onDelete}>
          <TrashSimple size={14} className="mr-2" />
          {t`Delete`}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
