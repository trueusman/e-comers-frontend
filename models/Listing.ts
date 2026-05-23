import mongoose, { Schema, Document, models } from "mongoose";

export interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: "New" | "Used" | "Refurbished";
  location: string;
  images: string[];
  seller: mongoose.Types.ObjectId;
  isFeatured: boolean;
  isActive: boolean;
  views: number;
  phone: string;
}

const ListingSchema = new Schema<IListing>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    category:    { type: String, required: true, enum: ["electronics","vehicles","property","fashion","furniture","books","sports","jobs","other"] },
    condition:   { type: String, required: true, enum: ["New","Used","Refurbished"] },
    location:    { type: String, required: true },
    images:      [{ type: String }],
    seller:      { type: Schema.Types.ObjectId, ref: "User", required: true },
    isFeatured:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    views:       { type: Number, default: 0 },
    phone:       { type: String, default: "" },
  },
  { timestamps: true }
);

ListingSchema.index({ title: "text", description: "text" });

const Listing = models.Listing || mongoose.model<IListing>("Listing", ListingSchema);
export default Listing;
