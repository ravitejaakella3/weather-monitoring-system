import { Schema, model } from 'mongoose';

const configSchema = new Schema({
    temperatureThreshold: { type: Number, default: 35 },
    consecutiveBreachesRequired: { type: Number, default: 2 }
});

export default model('Config', configSchema);
