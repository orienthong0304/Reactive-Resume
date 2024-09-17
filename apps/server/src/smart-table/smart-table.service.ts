import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { ChatDto, CreateChatDto, CreateSmartTableDto, SmartTableDto, UpdateSmartTableDto } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { PrismaService } from "nestjs-prisma";
import * as XLSX from "xlsx";
import * as fs from 'fs';

import { StorageService } from "@/server/storage/storage.service";

@Injectable()
export class SmartTableService {
  private readonly logger = new Logger(SmartTableService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    userId: string,
    createSmartTableDto: CreateSmartTableDto,
    file: Express.Multer.File,
  ) {
    this.logger.debug(`Creating smart table for user ${userId}`);
    this.logger.debug(`File: ${JSON.stringify(file)}`);

    if (!file) {
      this.logger.error('File is missing');
      throw new BadRequestException(ErrorMessage.FileRequired);
    }

    let jsonData: Record<string, unknown>[];
    try {
      // 检查文件类型
      this.logger.debug(`File mimetype: ${file.mimetype}`);
      if (!file.mimetype.includes("spreadsheetml")) {
        this.logger.error(`Invalid file format: ${file.mimetype}`);
        throw new BadRequestException(ErrorMessage.InvalidFileFormat);
      }

      const fileBuffer = fs.readFileSync(file.path);
      this.logger.debug(`File buffer length: ${fileBuffer.length}`);

      if (fileBuffer.length === 0) {
        this.logger.error('File buffer is empty');
        throw new BadRequestException(ErrorMessage.EmptyExcelFile);
      }

      const workbook = XLSX.read(fileBuffer, { type: "buffer" });

      this.logger.debug(`Workbook: ${JSON.stringify(Object.keys(workbook))}`);
      this.logger.debug(`Workbook sheets: ${JSON.stringify(workbook.SheetNames)}`);

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        this.logger.error('Workbook has no sheets');
        throw new BadRequestException(ErrorMessage.EmptyExcelFile);
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      this.logger.debug(`Worksheet: ${JSON.stringify(Object.keys(worksheet))}`);

      if (!worksheet) {
        this.logger.error('Worksheet is undefined');
        throw new BadRequestException(ErrorMessage.EmptyExcelFile);
      }

      // 获取表格范围
      const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1");
      this.logger.debug(`Sheet range: ${JSON.stringify(range)}`);

      // 处理合并单元格
      const merges = worksheet["!merges"] ?? [];
      for (const merge of merges) {
        const { s, e } = merge;
        for (let row = s.r; row <= e.r; row++) {
          for (let col = s.c; col <= e.c; col++) {
            if (row !== s.r || col !== s.c) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              worksheet[cellAddress] = worksheet[XLSX.utils.encode_cell({ r: s.r, c: s.c })];
            }
          }
        }
      }

      // 提取表头
      const headers: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cellValue = worksheet[cellAddress]?.v;
        headers.push(cellValue !== undefined ? cellValue.toString() : "");
      }

      this.logger.debug(`Headers: ${JSON.stringify(headers)}`);

      // 提取数据
      jsonData = [];
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const rowData: Record<string, unknown> = {};
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const header = headers[col - range.s.c];
          if (header) {
            rowData[header] = worksheet[cellAddress]?.v ?? "";
          }
        }
        if (Object.keys(rowData).length > 0) {
          jsonData.push(rowData);
        }
      }

      this.logger.debug(`Converted JSON data: ${JSON.stringify(jsonData)}`);

      if (!jsonData || jsonData.length === 0) {
        this.logger.error('JSON data is empty');
        throw new BadRequestException(ErrorMessage.EmptyExcelFile);
      }
    } catch (error) {
      this.logger.error(`Error parsing Excel file: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(ErrorMessage.InvalidFileFormat);
    }

    try {
      // 生成唯一的文件名
      const fileName = `${userId}/${Date.now()}-${file.originalname}`;

      // 上传文件到存储服务
      const fileUrl = await this.storageService.uploadFile(
        "smart-tables",
        fileName,
        fs.readFileSync(file.path),
        file.mimetype,
      );

      // 创建SmartTable记录
      const smartTable = await this.prisma.smartTable.create({
        data: {
          userId,
          title: createSmartTableDto.title,
          data: jsonData as Prisma.JsonArray,
          fileUrl,
        },
      });

      return smartTable;
    } catch (error) {
      this.logger.error(`Error creating SmartTable: ${error.message}`);
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(userId: string): Promise<SmartTableDto[]> {
    const smartTables = await this.prisma.smartTable.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return smartTables as SmartTableDto[];
  }

  async findOne(id: string, userId?: string): Promise<SmartTableDto> {
    if (userId) {
      const smartTable = await this.prisma.smartTable.findUniqueOrThrow({
        where: { userId_id: { userId, id } },
      });
      return smartTable as SmartTableDto;
    }

    const smartTable = await this.prisma.smartTable.findUniqueOrThrow({ where: { id } });
    return smartTable as SmartTableDto;
  }

  async update(
    userId: string,
    id: string,
    updateSmartTableDto: UpdateSmartTableDto,
  ): Promise<SmartTableDto> {
    try {
      const updatedSmartTable = await this.prisma.smartTable.update({
        data: {
          title: updateSmartTableDto.title,
          data: updateSmartTableDto.data as Prisma.JsonObject,
        },
        where: { userId_id: { userId, id } },
      });
      return updatedSmartTable as SmartTableDto;
    } catch (error) {
      if (error.code === "P2025") {
        Logger.error(error);
        throw new InternalServerErrorException(error);
      }
      throw error;
    }
  }

  async remove(userId: string, id: string): Promise<SmartTableDto> {
    const deletedSmartTable = await this.prisma.smartTable.delete({
      where: { userId_id: { userId, id } },
    });
    return deletedSmartTable as SmartTableDto;
  }

  // 添加以下方法到 SmartTableService 类中

  async getChats(smartTableId: string): Promise<ChatDto[]> {
    const chats = await this.prisma.chat.findMany({
      where: { smartTableId },
      orderBy: { createdAt: 'asc' },
    });
    return chats as ChatDto[];
  }

  async createChat(smartTableId: string, createChatDto: CreateChatDto): Promise<ChatDto> {
    const chat = await this.prisma.chat.create({
      data: {
        ...createChatDto,
        smartTableId,
      },
    });
    return chat as ChatDto;
  }
}
