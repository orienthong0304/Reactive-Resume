import { sortByDate } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { useSmartTables } from "@/client/services/smart-table";

import { CreateSmartTableListItem } from "./_components/smart-create-item";
import { BaseListItem } from "./_components/smart-base-item";
import { SmartTableListItem } from "./_components/smart-table-item";

export const ListView = () => {
  const { smartTables, loading } = useSmartTables();

  return (
    <div className="grid gap-y-2">
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}>
        <CreateSmartTableListItem />
      </motion.div>

      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="duration-300 animate-in fade-in"
            style={{ animationFillMode: "backwards", animationDelay: `${i * 300}ms` }}
          >
            <BaseListItem className="bg-secondary/40" />
          </div>
        ))}

      {smartTables && (
        <AnimatePresence>
          {smartTables
            .sort((a, b) => sortByDate(a, b, "updatedAt"))
            .map((smartTable, index) => (
              <motion.div
                key={smartTable.id}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0, transition: { delay: (index + 2) * 0.1 } }}
                exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.5 } }}
              >
                <SmartTableListItem smartTable={smartTable} />
              </motion.div>
            ))}
        </AnimatePresence>
      )}
    </div>
  );
};
