import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { Request } from "express";

import { SmartTableService } from "../smart-table.service";

@Injectable()
export class SmartTableGuard implements CanActivate {
  constructor(private readonly smartTableService: SmartTableService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserWithSecrets | false;

    try {
      const smartTable = await this.smartTableService.findOne(
        request.params.id,
        user ? user.id : undefined,
      );

      (request as any).payload = { smartTable };

      return true;
    } catch {
      throw new NotFoundException(ErrorMessage.SmartTableNotFound);
    }
  }
}