const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      unique: true,
    },
    // Personal Info
    fullName: { type: String, required: true, trim: true },
    fatherOrHusbandName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18, max: 100 },
    gender: {
      type: String,
      required: true,
      enum: ['ஆண் (Male)', 'பெண் (Female)', 'மற்றவர் (Other)'],
    },
    dateOfBirth: { type: Date },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },

    // Contact Info
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    alternatePhone: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    pincode: { type: String, required: true, match: /^\d{6}$/ },

    // Professional
    occupation: { type: String, required: true },
    qualification: { type: String, default: '' },

    // ID Proof
    idType: {
      type: String,
      required: true,
      enum: ['Aadhar Card', 'Voter ID', 'PAN Card', 'Passport', 'Driving License'],
    },
    idNumber: { type: String, required: true },

    // Files
    photoPath: { type: String, default: '' },
    idProofPath: { type: String, default: '' },

    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate member ID before saving
memberSchema.pre('save', async function (next) {
  if (!this.memberId) {
    const count = await mongoose.model('Member').countDocuments();
    this.memberId = `US${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);
