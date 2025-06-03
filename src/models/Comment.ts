import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // добавит createdAt, updatedAt
  }
);

export default mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);
