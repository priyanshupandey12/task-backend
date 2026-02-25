const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/encryption");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
  },
  { timestamps: true }
);


taskSchema.pre("save", async function () {
  if (this.isModified("description") && this.description) {
    this.description = encrypt(this.description);
  }

});


taskSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  if (obj.description) {
    try {
      obj.description = decrypt(obj.description);
    } catch {
      obj.description = ""; 
    }
  }
  return obj;
};


taskSchema.index({ title: "text" });

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;