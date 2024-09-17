import { sortByDate } from "@reactive-resume/utils";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { useSmartTables } from "@/client/services/smart-table";

import { CreateSmartTableCard } from "./_components/smart-create-card";
import { BaseCard } from "./_components/smart-base-card";
import { SmartTableCard } from "./_components/smart-table-card";

export const GridView = () => {
  const { smartTables, loading } = useSmartTables();

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
        <CreateSmartTableCard />
      </motion.div>

      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="duration-300 animate-in fade-in"
            style={{ animationFillMode: "backwards", animationDelay: `${i * 300}ms` }}
          >
            <BaseCard className="bg-secondary/40" />
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
                <SmartTableCard smartTable={smartTable} />
              </motion.div>
            ))}
        </AnimatePresence>
      )}
    </div>
  );
};
