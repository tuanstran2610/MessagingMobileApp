const { Message } = require('./models/Message');
const { Chat } = require('./models/Chat');

module.exports = function configureSocket(io) {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        if (socket.request.user) {
            console.log(`Authenticated user: ${socket.request.user._id}`);
        } else {
            console.log('User is not authenticated.');
        }

        // Join a chat room
        socket.on('joinChat', (chatId) => {
            socket.join(chatId);
            console.log(`User joined chat: ${chatId}`);
        });

        // Send message
        socket.on('sendMessage', async (messageData) => {
            if (!socket.request.user) {
                return console.log('Unauthorized socket message attempt.');
            }

            const { chatId, message, mediaUrl } = messageData;
            const senderId = socket.request.user._id; // Use the authenticated user ID
            console.log(senderId);
            try {
                // Save message to MongoDB
                const newMessage = new Message({
                    chatId,
                    senderId,
                    message,
                    mediaUrl: mediaUrl || null,
                    status: 'sent'
                });

                const savedMessage = await newMessage.save();

                // Update lastMessage in Chat model
                await Chat.findByIdAndUpdate(chatId, { lastMessage: savedMessage._id });

                // Emit message to all users in the chat
                io.to(chatId).emit('receiveMessage', savedMessage);
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};