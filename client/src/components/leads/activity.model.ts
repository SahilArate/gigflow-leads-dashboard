import mongoose, { Schema, Document } from "mongoose";
import { Types } from "mongoose";

export interface IActivity extends Document {
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    oldValue: { type: String },
    newValue: { type: String },
  },
  { timestamps: true }
);

activitySchema.index({ leadId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>("Activity", activitySchema);