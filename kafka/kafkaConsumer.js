const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'fitness-app',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'fitness-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'fitness-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
      });
    },
  });
};

run().catch(console.error);
