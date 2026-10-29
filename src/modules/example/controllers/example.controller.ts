import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExampleService } from '../services';
import { CreateExampleDto, ExampleQueryDto, UpdateExampleDto } from '../dto';
import { DecryptTokenInterceptor } from 'src/interceptors';
import { AdminInterceptor } from 'src/interceptors/admin.interceptor';
import { MongoIdValidationInterceptor } from 'src/interceptors/mongoIdValidation.interceptor';

@ApiTags('Example')
@ApiBearerAuth()
@Controller()
@UseInterceptors(DecryptTokenInterceptor)
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @ApiOperation({ summary: 'Create an example' })
  @ApiResponse({ status: 201, description: 'Example created successfully' })
  create(@Body() dto: CreateExampleDto, @Request() req: any) {
    return this.exampleService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List examples with pagination and search' })
  findAll(@Query() query: ExampleQueryDto) {
    return this.exampleService.findAll(query);
  }

  @Get(':id')
  @UseInterceptors(MongoIdValidationInterceptor)
  @ApiOperation({ summary: 'Get an example by ID' })
  findOne(@Param('id') id: string) {
    return this.exampleService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(MongoIdValidationInterceptor)
  @ApiOperation({ summary: 'Update an example by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateExampleDto) {
    return this.exampleService.update(id, dto);
  }

  @Delete(':id')
  @UseInterceptors(AdminInterceptor, MongoIdValidationInterceptor)
  @ApiOperation({ summary: 'Delete an example by ID (Admin only)' })
  remove(@Param('id') id: string) {
    return this.exampleService.remove(id);
  }
}
