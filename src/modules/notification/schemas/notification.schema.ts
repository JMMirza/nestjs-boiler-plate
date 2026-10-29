import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Base, BaseSchema } from 'src/commons/schemas/abstract.schema';

export enum NotificationStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export type NotificationDocument = HydratedDocument<Notification>;
@Schema()
export class Notification extends Base {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop([
    {
      user: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
      time: Date,
    },
  ])
  readStatuses: {
    user: MongooseSchema.Types.ObjectId;
    time: number;
  }[] = [];

  @Prop({ required: false })
  action: object[];

  @Prop({
    type: {},
    required: false,
    default: null,
  })
  data: object[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    required: false,
  })
  users: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, default: false })
  isActionDone: boolean;

  @Prop({
    type: String,
    enum: NotificationStatus,
    required: true,
    default: NotificationStatus.PENDING,
  })
  status: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.add(BaseSchema);
