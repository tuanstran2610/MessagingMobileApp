import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    messageType: { type: String, enum: ['text', 'image', 'video', 'file'], default: 'text' },
    mediaUrl: { type: String, default: null },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
}, { timestamps: true }); // Auto adds createdAt & updatedAt

// Auto-update lastMessage in Chat after saving a new message
messageSchema.post('save', async function (doc) {
    await mongoose.model('Chat').findByIdAndUpdate(doc.chatId, {
        lastMessage: doc._id,
        updatedAt: Date.now()
    });
});

export const Message = mongoose.model('Message', messageSchema);


