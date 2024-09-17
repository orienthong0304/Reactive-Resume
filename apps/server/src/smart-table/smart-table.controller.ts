import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { User as UserEntity } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CreateChatDto, CreateSmartTableDto, SmartTableDto, UpdateSmartTableDto } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { diskStorage } from "multer";
import * as path from "path";
import * as fs from "fs";

import { User } from "@/server/user/decorators/user.decorator";

import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { SmartTable } from "./decorators/smart-table.decorator";
import { SmartTableGuard } from "./guards/smart-table.guard";
import { SmartTableService } from "./smart-table.service";

@ApiTags("Smart Table")
@Controller("smart-table")
export class SmartTableController {
  private readonly logger = new Logger(SmartTableController.name);

  constructor(private readonly smartTableService: SmartTableService) {}

  @Post()
  @UseGuards(TwoFactorGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
          const decodedFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
          cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(decodedFilename));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return cb(new Error("Only Excel files are allowed!"), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async create(
    @User() user: UserEntity,
    @Body() createSmartTableDto: CreateSmartTableDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.debug(`收到用户 ${user.id} 的创建请求`);
    this.logger.debug(`CreateSmartTableDto: ${JSON.stringify(createSmartTableDto)}`);
    
    if (!file) {
      throw new BadRequestException(ErrorMessage.FileRequired);
    }

    // 解码文件名
    const decodedFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
    this.logger.debug(`文件: ${JSON.stringify({ ...file, originalname: decodedFilename })}`);

    try {
      const result = await this.smartTableService.create(user.id, createSmartTableDto, { ...file, originalname: decodedFilename });
      
      // 删除临时文件
      fs.unlinkSync(file.path);
      
      return result;
    } catch (error) {
      // 删除临时文件
      if (file && file.path) {
        fs.unlinkSync(file.path);
      }
      
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.SmartTableTitleAlreadyExists);
      }
      this.logger.error(`Error creating smart table: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw new InternalServerErrorException(error);
    }
  }

  @Get()
  @UseGuards(TwoFactorGuard)
  findAll(@User() user: UserEntity) {
    return this.smartTableService.findAll(user.id);
  }

  @Get(":id")
  @UseGuards(TwoFactorGuard, SmartTableGuard)
  findOne(@SmartTable() smartTable: SmartTableDto) {
    return smartTable;
  }

  @Patch(":id")
  @UseGuards(TwoFactorGuard)
  update(
    @User() user: UserEntity,
    @Param("id") id: string,
    @Body() updateSmartTableDto: UpdateSmartTableDto,
  ) {
    return this.smartTableService.update(user.id, id, updateSmartTableDto);
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard)
  remove(@User() user: UserEntity, @Param("id") id: string) {
    return this.smartTableService.remove(user.id, id);
  }

  @Get(":id/chats")
  @UseGuards(TwoFactorGuard, SmartTableGuard)
  async getChats(@Param("id") id: string) {
    return this.smartTableService.getChats(id);
  }

  @Post(":id/chats")
  @UseGuards(TwoFactorGuard, SmartTableGuard)
  async createChat(@Param("id") id: string, @Body() createChatDto: CreateChatDto) {
    return this.smartTableService.createChat(id, createChatDto);
  }
}
