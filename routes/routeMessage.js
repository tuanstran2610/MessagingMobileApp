const express = require('express');
const router = express.Router();
const { Message } = require('../models/Message');

router.post('/chat/send-message', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { chatId, senderId, message, messageType, mediaUrl } = req.body;

        if (!chatId || !senderId || !message) {
            return res.status(400).json({ message: "chatId, senderId, and message are required" });
        }

        const newMessage = new Message({
            chatId,
            senderId,
            message,
            messageType: messageType || 'text',
            mediaUrl: mediaUrl || null,
            status: 'sent'
        });

        const savedMessage = await newMessage.save();

        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/message/:chatId', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { chatId } = req.params;
        const messages = await Message.find({ chatId }).sort({ createdAt: 1 }); // Oldest to newest

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;