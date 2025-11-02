import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  createdUsers: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
