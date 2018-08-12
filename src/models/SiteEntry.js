import mongoose from "mongoose";

mongoose.Promise = global.Promise;

const SiteEntrySchema = new mongoose.Schema({
  baseUrl: String,
  subs: [String]
});

SiteEntrySchema.statics.getSiteEntries = (callback, limit) => {
  SiteEntry.find(callback).limit(limit);
};

const SiteEntry = mongoose.model("SiteEntry", SiteEntrySchema, "siteList");

export default SiteEntry;
