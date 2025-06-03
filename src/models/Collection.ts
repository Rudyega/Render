import mongoose, { Schema, Document } from "mongoose";

export interface ICollection extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  postIds: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const CollectionSchema: Schema<ICollection> = new Schema(
  {
    name: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: false,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Collection ||
  mongoose.model<ICollection>("Collection", CollectionSchema);
