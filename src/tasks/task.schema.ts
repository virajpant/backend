import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  @Prop({ enum: ['pending', 'in-progress', 'completed'], default: 'pending' })
  status: 'pending' | 'in-progress' | 'completed';

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  assignedTo?: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);