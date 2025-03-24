import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    isGroupChat: { type: Boolean, default: false },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    groupName: {
        type: String,
        default: null,
        required: function () { return this.isGroupChat; }
    },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

// Middleware to update User's groupChats when a new group chat is created
chatSchema.post('save', async function (doc) {
    if (doc.isGroupChat) {
        console.log("Group chat saved, updating users...", doc);
        try {
            await mongoose.model('User').updateMany(
                { _id: { $in: doc.participants } },
                { $addToSet: { groupChats: doc._id } }
            );
            console.log("Users updated successfully.");
        } catch (error) {
            console.error("Error updating users' groupChats:", error);
        }
    }
});


export const Chat = mongoose.model('Chat', chatSchema);
