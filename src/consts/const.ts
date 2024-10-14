export const MAX_TEXT_LENGTH: number = 60

export const SAVE_DRILLS_LENGTH: number = 8

const isProd = import.meta.env.PROD

export const API_BASE_URL = isProd ? 'https://drill-api-app.iot-arduino.workers.dev/api' : 'http://localhost:8787/api';
// const API_BASE_URL = 'https://drill-api-app.iot-arduino.workers.dev/api'

console.log(isProd)
