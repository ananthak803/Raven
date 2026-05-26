import { getKafkaConsumer, kafka } from '../config/kafka.js';
import { checkUserOnline } from '../config/redis.js';
import Notification from '../models/notification.model.js';
import { ChannelModel } from '../models/channel.model.js';
import mongoose from 'mongoose';

let kafkaConsumerInstance = null;
let kafkaRunning = false;

export const startKafkaWorker = async () => {
  if (kafkaRunning) return;

  const consumer = getKafkaConsumer();
  kafkaConsumerInstance = consumer;

  try {
    const admin = kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [{ topic: 'chat-messages', numPartitions: 1 }],
      waitForLeaders: true,
    });
    console.log('Kafka Admin verified topics');
    await admin.disconnect();

    await consumer.connect();
    console.log('Kafka Worker Connected');
    kafkaRunning = true;
    await consumer.subscribe({ topic: 'chat-messages', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log(`[Kafka Worker] Processing message from channel: ${payload.channelId}`);

          // Fetch channel members to identify notification recipients
          const channel = await ChannelModel.findById(payload.channelId);
          if (!channel) return;

          // Process for each member except the sender
          const recipients = channel.members.filter(
            (memberId) => memberId.toString() !== payload.sender.toString()
          );

          for (const memberId of recipients) {
            const isOnline = await checkUserOnline(memberId.toString());
            if (!isOnline) {
              console.log(`[Kafka Worker] User ${memberId} is offline. Creating notification.`);

              // Persist a notification since the user is offline
              await Notification.create({
                recipient: memberId,
                sender: payload.sender,
                type: 'NEW_MESSAGE',
                content: payload.content || 'Sent an attachment',
                channelId: payload.channelId,
              });
            } else {
              console.log(`[Kafka Worker] User ${memberId} is online. Skipping offline notification.`);
              // If online, they likely already received the socket event directly
            }
          }
        } catch (error) {
          console.error('[Kafka Worker] Error processing message:', error);
        }
      },
    });
  } catch (error) {
    console.error('Error starting Kafka Worker:', error);
  }
};

export const stopKafkaWorker = async () => {
  try {
    if (!kafkaConsumerInstance) return;
    await kafkaConsumerInstance.disconnect();
  } catch (error) {
    console.error("Kafka Worker stop failed:", error?.message || error);
  } finally {
    kafkaConsumerInstance = null;
    kafkaRunning = false;
  }
};
