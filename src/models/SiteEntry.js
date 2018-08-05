import mongoose from "mongoose";

mongoose.Promise = global.Promise;

const siteEntrySchema = new mongoose.Schema({
  baseUrl: String,
  subs: [String]
});

const SiteEntry = mongoose.model("siteEntry", siteEntrySchema, "siteList");

SiteEntry.getSiteEntries = (callback, limit) => {
  SiteEntry.find(callback).limit(limit);
};

export default SiteEntry;
