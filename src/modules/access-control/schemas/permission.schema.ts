import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Base, BaseSchema } from 'src/commons/schemas/abstract.schema';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema()
export class Permission extends Base {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  action: string; // e.g., 'create:user', 'update:booking'

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: false, default: true })
  isActive: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
PermissionSchema.add(BaseSchema);
