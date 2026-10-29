import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Base, BaseSchema } from 'src/commons/schemas/abstract.schema';
import { Permission } from './permission.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role extends Base {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Permission.name }], default: [] })
  permissions: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.add(BaseSchema);
