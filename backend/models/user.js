import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    name: { 
        type: String 
    },
    password: { 
        type: String, 
        select: false 
    },
    countryCode: String,
    phoneNumber: String,
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    // Verification Status
    isEmailVerified: { 
        type: Boolean, 
        default: false 
    },
    otp: String,
    otpExpires: Date,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;

    this.password = await bcrypt.hash(this.password, 12);
    
});
userSchema.methods.correctPassword = async function (cand, userP) {
    return await bcrypt.compare(cand, userP);
};

export default mongoose.model('User', userSchema);