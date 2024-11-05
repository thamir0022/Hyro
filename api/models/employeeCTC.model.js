import mongoose from "mongoose";

const EmployeeCTCSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  annualCTC: {
    type: Number,
    required: true,
    default: 0,
  },
  monthlyInHand: {
    type: Number,
    required: true,
    default: 0,
  },
  otherComponents: {
    allowances: {
      housingAllowance: { type: Number},
      transportAllowance: { type: Number},
      mealAllowance: { type: Number},
      // add additional allowances if needed
    },
    bonuses: {
      performanceBonus: { type: Number},
      yearEndBonus: { type: Number},
      // add additional bonuses if needed
    },
    deductions: {
      tax: { type: Number},
      healthInsurance: { type: Number},
      providentFund: { type: Number},
      // add additional deductions if needed
    },
  },
  effectiveDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("EmployeeCTC", EmployeeCTCSchema);
