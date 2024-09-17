import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SmartTableDto } from "@reactive-resume/dto";

export const SmartTable = createParamDecorator(
  (data: keyof SmartTableDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const smartTable = request.payload?.smartTable as SmartTableDto;

    return data ? smartTable[data] : smartTable;
  },
);