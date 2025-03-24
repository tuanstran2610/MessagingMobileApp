const express = require('express');
const router = express.Router();
const { Chat } = require('../models/Chat');
const { User } = require('../models/User');


//Create new box chat
router.post('/chat/new-box-chat', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { participants, isGroupChat, groupName } = req.body;

        if (!participants || participants.length < 2) {
            return res.status(400).json({ message: "At least two participants required" });
        }

        console.log("Participants:", participants, "isGroupChat:", isGroupChat);

        // Ensure participant IDs are sorted for consistent matching
        const sortedParticipants = [...participants].sort();

        // **Check for existing one-on-one chat (if not a group chat)**
        if (!isGroupChat) {
            const existingChat = await Chat.findOne({
                isGroupChat: false,
                participants: sortedParticipants
            });

            if (existingChat) {
                return res.status(200).json({ _id: existingChat._id, message: "Chat already exists" });
            }
        }

        // Create a new chat if it doesn't exist
        const newChat = new Chat({
            participants: sortedParticipants,
            isGroupChat: isGroupChat || false,
            groupName: isGroupChat ? groupName : null,
            lastMessage: null
        });

        const savedChat = await newChat.save();

        // **Update each user's groupChats array if it's a group chat**
        await User.updateMany(
            { _id: { $in: sortedParticipants } },
            { $addToSet: { groupChats: savedChat._id } } // Prevents duplicate entries
        );

        res.status(201).json(savedChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//Get chat
router.get('/chat/get-chats/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { body: { params } } = req
        console.log(params);
        const userId = req.user._id;
        const chats = await Chat.find({ participants: userId })
            .sort({ updatedAt: -1 }) // Sort by latest activity
            .populate("lastMessage")
            .populate("participants", "firstName lastName"); // Include participant details


        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

module.exports = router;