import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

import { AuthModule } from "@/server/auth/auth.module";
import { StorageModule } from "@/server/storage/storage.module";

import { SmartTableController } from "./smart-table.controller";
import { SmartTableService } from "./smart-table.service";

@Module({
  imports: [
    AuthModule,
    StorageModule,
    MulterModule.register({
      dest: "./uploads",
    }),
  ],
  controllers: [SmartTableController],
  providers: [SmartTableService],
  exports: [SmartTableService],
})
export class SmartTableModule {}
