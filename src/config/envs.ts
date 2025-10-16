import 'dotenv/config'
import envVar from 'env-var'
const { get } = envVar

export const envs = {
  PORT: get('PORT').required().asPortNumber(),
  DB_HOST: get('DB_HOST').required().asString(),
  DB_PORT: get('DB_PORT').required().asPortNumber(),
  DB_DATABASE: get('DB_DATABASE').required().asString(),
  DB_USER: get('DB_USER').required().asString(),
  DB_PASSWORD: get('DB_PASSWORD').required().asString(),

  JWT_SECRET: get('JWT_SECRET').required().asString(),
  BASE_URL: get('BASE_URL').required().asString(),

  CLOUDINARY_CLOUD_NAME: get('CLOUDINARY_CLOUD_NAME').required().asString(),
  CLOUDINARY_API_KEY: get('CLOUDINARY_API_KEY').required().asString(),
  CLOUDINARY_API_SECRET: get('CLOUDINARY_API_SECRET').required().asString(),
}
