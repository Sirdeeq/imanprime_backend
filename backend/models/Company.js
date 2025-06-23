import mongoose from "mongoose"

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "ImanPrime",
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    about: {
      story: [
        {
          title: {
            type: String,
            required: true,
            trim: true,
          },
          content: {
            type: String,
            required: true,
          },
        },
      ],
      values: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            required: true,
          },
        },
      ],
      vision: {
        type: String,
        default: "",
      },
      mission: {
        type: String,
        default: "",
      },
    },
    team: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        image: {
          type: String,
          default: "",
        },
        position: {
          type: String,
          required: true,
          trim: true,
        },
        phone: {
          type: String,
          trim: true,
          default: "",
        },
        socialLinks: {
          linkedin: { type: String, default: "" },
          twitter: { type: String, default: "" },
          facebook: { type: String, default: "" },
          instagram: { type: String, default: "" },
        },
      },
    ],
    partners: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        logo: {
          type: String,
          default: "",
        },
        website: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
    contacts: {
      addresses: [
        {
          type: {
            type: String,
            enum: ["main", "branch", "office"],
            default: "main",
          },
          address: String,
          city: String,
          state: String,
          zipCode: String,
          country: {
            type: String,
            default: "USA",
          },
        },
      ],
      phoneNumbers: [
        {
          type: {
            type: String,
            enum: ["main", "sales", "support", "emergency"],
            default: "main",
          },
          number: String,
          label: String,
        },
      ],
      emails: [
        {
          type: {
            type: String,
            enum: ["general", "sales", "support", "careers"],
            default: "general",
          },
          email: {
            type: String,
            lowercase: true,
          },
          label: String,
        },
      ],
      workingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String },
      },
    },
    socialMedia: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Company || mongoose.model("Company", companySchema)
