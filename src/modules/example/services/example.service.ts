import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Example, ExampleDocument } from '../schemas';
import { CreateExampleDto, ExampleQueryDto, UpdateExampleDto } from '../dto';
import { findAll } from 'src/services';

@Injectable()
export class ExampleService {
  constructor(
    @InjectModel(Example.name)
    private readonly exampleModel: Model<ExampleDocument>,
  ) {}

  async create(dto: CreateExampleDto, userId: string) {
    return this.exampleModel.create({
      ...dto,
      createdBy: new Types.ObjectId(userId),
    });
  }

  async findAll(query: ExampleQueryDto) {
    const { page, limit, search } = query;
    return findAll(
      this.exampleModel,
      limit,
      search,
      page,
      ['name', 'description'],
      {},
      [],
      [],
    );
  }

  async findOne(id: string) {
    const example = await this.exampleModel.findById(id);
    if (!example) throw new NotFoundException(['Example not found']);
    return example;
  }

  async update(id: string, dto: UpdateExampleDto) {
    const example = await this.exampleModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );
    if (!example) throw new NotFoundException(['Example not found']);
    return example;
  }

  async remove(id: string) {
    const example = await this.exampleModel.findById(id);
    if (!example) throw new NotFoundException(['Example not found']);
    await example.deleteOne();
    return { success: true };
  }
}
